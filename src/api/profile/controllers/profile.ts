/**
 * profile controller
 */

import { factories } from '@strapi/strapi'
import { convertByteToBit } from '../../../utils/file';
import { MEX_PROJECT_IMAGE_SIZE } from '../../../constants/limits';

export default factories.createCoreController(
  'api::profile.profile',
  ({ strapi }) => {
    const profileDocs = strapi.documents('api::profile.profile');
    const walletDocs = strapi.documents('api::wallet.wallet');

    const uploadFiles = async (
      files,
      refId,
      ref,
      field,
      maxSize,
      allowedFileTypes,
    ) => {
      if (!files) return [];

      const newFiles = Array.isArray(files) ? files : [files];

      // Check the size of each file
      for (const file of newFiles) {
        if (file.size > convertByteToBit(maxSize)) {
          throw new Error(
            `Each ${allowedFileTypes} file must be smaller than ${maxSize} MB. The file "${file.name}" is too large.`,
          );
        }
      }

      const uploadedFiles = await strapi
        .plugins['upload']
        .services.upload.upload({
          data: { refId, ref, field },
          files: newFiles,
        });

      return uploadedFiles.map((file) => file.id);
    };

    return {
      async findOne(ctx) {
        const user = ctx.state.user;
        if (!user) {
          return ctx.unauthorized();
        }
    
        const [profile] = await profileDocs.findMany({
          filters: { users_permissions_user: user.id },
          populate: ['avatar', 'socials'],
        });
        const [wallet] = await walletDocs.findMany({
          filters: { users_permissions_user: user.id },
        });
    
        if (!profile) {
          return ctx.notFound('Profile not found');
        }

        return {
          ...profile,
          profileId: profile.documentId,
          id: user.id,
          address: wallet?.address,
        };
      },

      async update(ctx) {
        let entity;
        const { files, body } = ctx.request;
        const { id: documentId } = ctx.params;
        const user = ctx.state.user;
        const data = typeof body.data === 'string' ?  JSON.parse(body.data) : body.data;

        try {
          const profile = await profileDocs.findOne({
            documentId,
            populate: {
              avatar: true,
              users_permissions_user: true,
            },
          });

          if (!profile || profile.users_permissions_user?.id !== user.id) {
            return ctx.unauthorized();
          }

          if (ctx.is('multipart') && files && files['files.avatar']) {
            const uploadedImageIds = await uploadFiles(
              files['files.avatar'],
              profile.id,
              'api::profile.profile',
              'avatar',
              MEX_PROJECT_IMAGE_SIZE,
              'image',
            );

            data.avatar = uploadedImageIds[0];
          }

          entity = await profileDocs.update({
            documentId,
            data,
          });
          // await profileDocs.publish({ documentId });

          const sanitizedResults = await this.sanitizeOutput(entity, ctx);
          return this.transformResponse(sanitizedResults);
        } catch (err) {
          ctx.throw(500, err);
        }
      },

      async activity(ctx) {
        const projectDocs = strapi.documents('api::project.project');
        const contributionDocs = strapi.documents('api::contribution.contribution');
        const reactionDocs = strapi.documents('api::reaction.reaction');
        const userId = ctx.params.id;

        // Get user's projects
        const projects = await projectDocs.findMany({
          filters: {
            users_permissions_user: userId
          },
          populate: {
            reactions: { populate: ['users_permissions_user'] },
            contribution_tiers: {
              populate: {
                contributions: {
                  populate: ['users_permissions_user']
                }
              }
            }
          }
        });

        // Get contributions made by user
        const contributions = await contributionDocs.findMany({
          filters: {
            users_permissions_user: userId
          },
          populate: {
            contribution_tier: {
              populate: {
                project: {
                  populate: {
                    users_permissions_user: true,
                    reactions: { populate: ['users_permissions_user'] },
                    contribution_tiers: {
                      populate: {
                        contributions: {
                          populate: ['users_permissions_user']
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        });

        // Get user's own reactions
        const userReactions = await reactionDocs.findMany({
          filters: {
            users_permissions_user: userId
          }
        });

        // Build reach from created projects
        const reachedFromCreated = new Set();
        for (const project of projects) {
          // Reactions
          for (const reaction of project.reactions || []) {
            const uid = reaction.users_permissions_user?.id;
            if (uid && uid !== userId) {
              reachedFromCreated.add(uid);
            }
          }
          // Contributions
          for (const tier of project.contribution_tiers || []) {
            for (const contrib of tier.contributions || []) {
              const uid = contrib.users_permissions_user?.id;
              if (uid && uid !== userId) {
                reachedFromCreated.add(uid);
              }
            }
          }
        }

        // Build reach from contributed projects
        const reachedFromContributed = new Set();
        for (const contrib of contributions) {
          const project = contrib.contribution_tier?.project;
          if (!project) continue;

          // Project creator
          const creatorId = project.users_permissions_user?.id;
          if (creatorId && creatorId !== userId) {
            reachedFromContributed.add(creatorId);
          }

          // Reactions
          for (const reaction of project.reactions || []) {
            const uid = reaction.users_permissions_user?.id;
            if (uid && uid !== userId) {
              reachedFromContributed.add(uid);
            }
          }

          // Other contributors
          for (const tier of project.contribution_tiers || []) {
            for (const other of tier.contributions || []) {
              const uid = other.users_permissions_user?.id;
              if (uid && uid !== userId) {
                reachedFromContributed.add(uid);
              }
            }
          }
        }

        const totalReach = new Set([...reachedFromCreated, ...reachedFromContributed]);

        ctx.body = {
          userId,
          likesCount: userReactions.length,
          projectsCount: projects.length,
          reachCount: totalReach.size
        };
      }
    }
  }
);
