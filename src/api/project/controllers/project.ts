/**
 * project controller
 */

import { factories } from '@strapi/strapi'
import {
  TOTAL_PROJECT_IMAGES,
  MEX_PROJECT_IMAGE_SIZE,
  MEX_PROJECT_VIDEO_SIZE,
} from '../../../constants/limits';
import { convertByteToBit } from '../../../utils/file';
import { ProjectStatus } from '../../../../types/collections';

const extractProfile = (profiles, userId) => {
  const profile = profiles.find(
    (item) => item.users_permissions_user.id === userId,
  );
  if (profile) {
    return {
      first_name: profile.first_name,
      last_name: profile.last_name,
      user_id: userId,
      profile_id: profile.id,
      avatar: profile.avatar,
    };
  }
};

const getUniqueUsers = (projects, exclusiveContents) => {
  const users = [
    ...projects.map((item) => item.users_permissions_user?.id),
    ...exclusiveContents.map(
      (item) => item.project?.users_permissions_user?.id,
    ),
  ];

  return users.filter(
    (id: string, index: number) => users.indexOf(id) === index,
  );
};

const mergeEntities = (projects, exclusiveContents, profiles, start, limit, page) => {
  const mappedProjects = projects.map((project) => ({
    type: 'project',
    id: project.id,
    documentId: project.documentId,
    name: project.name,
    summary: project.summary,
    description: project.description,
    project_type: project.project_type,
    planned_release_date: project.planned_release_date,
    soft_goal: project.soft_goal,
    deadline: project.deadline,
    hard_goal: project.hard_goal,
    owner: extractProfile(profiles, project?.users_permissions_user?.id),
    images: project.images,
    reaction_count: project.reaction_count,
    createdAt: project.createdAt,
  }));

  const mappedExclusiveContents = exclusiveContents.map((content) => ({
    type: 'exclusive_content',
    id: content.id,
    documentId: content.documentId,
    title: content.title,
    media: content.media,
    description: content.description,
    project: content.project,
    owner: extractProfile(
      profiles,
      content.project?.users_permissions_user?.id,
    ),
    reaction_count: content.reaction_count,
    accessible_tiers: content.accessible_tiers,
    createdAt: content.createdAt,
  }));

  // Merge and sort the data by date and reaction count
  const mergedData = [
    ...mappedProjects,
    ...mappedExclusiveContents,
  ].sort((a, b) => {
    // Sort by date first
    if (a.createdAt > b.createdAt) return -1;
    if (a.createdAt < b.createdAt) return 1;
    // Sort by reaction_count then
    if (a.reaction_count > b.reaction_count) return -1;
    if (a.reaction_count < b.reaction_count) return 1;
    return 0;
  });

  // Paginate the merged data
  const data = mergedData.slice(
    start,
    Number(page) * limit,
  );

  return {
    data,
    total: mergedData.length,
  }
};

export default factories.createCoreController(
  'api::project.project',
  ({ strapi }) => {
    const contentDocs = strapi.documents('api::exclusive-content.exclusive-content');
    const profileDocs = strapi.documents('api::profile.profile');
    const projectDocs = strapi.documents('api::project.project');
    const walletDocs = strapi.documents('api::wallet.wallet');

    // Helper function to upload files
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
      // GET
      async feed(ctx) {
        const { page = 1, pageSize = 20 } = ctx.query;
        const limit = Number(pageSize)
        const start = (Number(page) - 1) * limit

        try {
          const projects = await projectDocs.findMany({
            sort: [{ createdAt: 'desc' }, { reaction_count: 'desc' }],
            populate: {
              users_permissions_user: true,
              images: true,
            },
            limit,
            start,
          });
          const exclusiveContents = await contentDocs.findMany({
            sort: [{ createdAt: 'desc' }, { reaction_count: 'desc' }],
            populate: {
              project: {
                populate: {
                  users_permissions_user: true,
                },
              },
              media: true,
              accessible_tiers: true,
            },
            limit,
            start,
          });
          const profiles = await profileDocs.findMany({
            filters: {
              users_permissions_user: {
                id: {
                  $in: getUniqueUsers(projects, exclusiveContents),
                },
              },
            },
            populate: {
              users_permissions_user: true,
              avatar: true,
            },
          });

          // Paginate the merged data
          const { data, total } = mergeEntities(projects, exclusiveContents, profiles, start, limit, page)

          // Return the response
          return ctx.send({
            data,
            pagination: {
              page: Number(page),
              pageSize: limit,
              total,
            },
          });
        } catch (err) {
          ctx.throw(500, err);
        }
      },

      // PUT
      async update(ctx) {
        const { id: documentId } = ctx.params;
        const user = ctx.state.user;
        let originalStatus = ProjectStatus.Draft;

        try {
          // Fetch the project
          const project = await projectDocs.findOne({
            documentId,
            populate: {
              images: true,
              video: true,
              audio: true,
              users_permissions_user: true,
            },
          });
          originalStatus = project.project_status as ProjectStatus;

          // Ensure ownership
          if (!project || project.users_permissions_user?.id !== user.id) {
            return ctx.unauthorized(
              'Only the owner is allowed to update a project',
            );
          }

          const currentPhotoCount = project.images ? project.images.length : 0;

          let entity;
          // Multipart
          if (ctx.is('multipart')) {
            const { files, body: data } = ctx.request;

            try {
              // Handle images
              if (files['files.images']) {
                const newImagesCount = Array.isArray(files['files.images'])
                  ? files['files.images'].length
                  : 1;
                const totalImages = currentPhotoCount + newImagesCount;

                // Check if the total number of photos exceeds the limit
                if (totalImages > TOTAL_PROJECT_IMAGES) {
                  return ctx.badRequest(
                    `You can only have a maximum of ${TOTAL_PROJECT_IMAGES} images per project.`,
                  );
                }

                const uploadedImageIds = await uploadFiles(
                  files['files.images'],
                  project.id,
                  'api::project.project',
                  'images',
                  MEX_PROJECT_IMAGE_SIZE,
                  'image',
                );
                data.images =( project.images || []).concat(uploadedImageIds);
              }

              // Handle video
              if (files['files.video']) {
                const uploadedVideoId = await uploadFiles(
                  files['files.video'],
                  documentId,
                  'api::project.project',
                  'video',
                  MEX_PROJECT_VIDEO_SIZE,
                  'video',
                );
                data.video = uploadedVideoId[0]; // Since it's a single video
              }

              // Handle audio
              if (files['files.audio']) {
                const uploadedAudioId = await uploadFiles(
                  files['files.audio'],
                  documentId,
                  'api::project.project',
                  'audio',
                  MEX_PROJECT_VIDEO_SIZE,
                  'audio',
                );
                data.audio = uploadedAudioId[0]; // Since it's a single audio file
              }

              entity = await projectDocs.update({
                documentId,
                data,
              });
              await projectDocs.publish({ documentId });
            } catch (error) {
              return ctx.badRequest(error.message);
            }

            // JSON Content
          } else {
            entity = await projectDocs.update({
              documentId,
              ...ctx.request.body,
            });
            await projectDocs.publish({ documentId });

            if (ctx.request.body.data.project_status === ProjectStatus.Published || ctx.request.body.data.project_status === ProjectStatus.Withdrawn) {
              const wallet = await walletDocs.findMany({
                filters: {
                  users_permissions_user: user.id,
                },
              });

              if (wallet.length === 1) {
                // @todo Inform the blockchain app

                if (ctx.request.body.data.project_status === ProjectStatus.Published) {
                  // @todo Sign and send
                } else if (ctx.request.body.data.project_status === ProjectStatus.Withdrawn) {
                  // @todo Sign and send
                }
              } else {
                // @todo ridi
                throw new Error('Could not find associated wallet');
              }
            }
          }

          const sanitizedResults = await this.sanitizeOutput(entity, ctx);
          return this.transformResponse(sanitizedResults);
        } catch (err) {
          await projectDocs.update({
            documentId,
            data: { project_status: originalStatus },
          });
          ctx.throw(500, err);
        }
      },

      // POST
      async create(ctx) {
        const { user } = ctx.state;

        try {
          const { body: data } = ctx.request

          if ('current_funding' in data || 'reaction_count' in data) {
            throw new Error(
              'current_funding and reaction_count fields are not allowed in the create request.',
            );
          }

          // Proceed with creating the the project
          const result = await super.create(ctx);
          // find user's sk to sign and send TX to solana program
          const wallet = await walletDocs.findMany({
            filters: {
              users_permissions_user: user.id,
            },
          });

          if (wallet.length === 1) {
            try {
              // @todo Inform the blockchain app
              console.log(
                'Project campaign successfully created on the blockchain',
              );
            } catch (blockchainError) {
              // If the smart contract interaction was unsuccessful, delete the recently created project in Strapi
              await projectDocs.delete({
                documentId: result.data.id,
              });
              throw new Error(
                `Blockchain transaction failed. Error: ${blockchainError.message}`,
              );
            }
          } else {
            throw new Error('Wallet not found');
          }
          return result;
        } catch (err) {
          // const id = err.message.split('Error transaction:')[1]
          ctx.throw(500, err);
        }
      },
    };
  },
);
