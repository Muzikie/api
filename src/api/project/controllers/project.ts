/**
 * project controller
 */

import { factories } from '@strapi/strapi';
import { parseMultipartData } from '@strapi/utils';
import {
  TOTAL_PROJECT_IMAGES,
  MEX_PROJECT_IMAGE_SIZE,
  MEX_PROJECT_VIDEO_SIZE,
} from '../../../constants/limits';
import { convertByteToBit } from '../../../utils/file';

const anchor = require('@coral-xyz/anchor');
const { AnchorProvider } = require('@coral-xyz/anchor');
const { Keypair, Connection, PublicKey } = require('@solana/web3.js');
const { SystemProgram } = anchor.web3;
import idl from "./crowdfunding.json";
import { Crowdfunding } from "./crowdfunding"

// Set up the provider
const walletSecretKey = Uint8Array.from([11, 72, 89, 34, 108, 200, 52, 103, 110, 33, 166, 195, 151, 200, 41, 185, 98, 95, 166, 222, 231, 166, 237, 126, 150, 104, 237, 38, 163, 46, 101, 243, 70, 161, 208, 249, 217, 56, 15, 127, 110, 39, 222, 168, 186, 98, 154, 226, 203, 90, 126, 195, 79, 163, 191, 178, 141, 86, 159, 204, 105, 147, 104, 83]);
const walletKeypair = Keypair.fromSecretKey(walletSecretKey);

// 1. Create a connection to the local Solana cluster
const localnetConnection = new Connection('http://localhost:8899', 'confirmed');

// 2. Set up the provider using the connection and wallet
const provider = new AnchorProvider(localnetConnection, new anchor.Wallet(walletKeypair), {
  preflightCommitment: 'confirmed',
});
const programId = new PublicKey(idl.address);
const program = new anchor.Program(idl, provider);

const extractProfile = (profiles, userId) => {
  const profile = profiles.find(item => item.users_permissions_user.id === userId);
  if (profile) {
    return {
      first_name: profile.first_name,
      last_name: profile.last_name,
      user_id: userId,
      profile_id: profile.id,
    };
  }
};

export default factories.createCoreController(
  'api::project.project',
  ({ strapi }) => {
    // Helper function to upload files
    const uploadFiles = async (
      files,
      id,
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

      const uploadedFiles = await strapi.plugins[
        'upload'
      ].services.upload.upload({
        data: { refId: id, ref: ref, field: field },
        files: newFiles,
      });

      return uploadedFiles.map((file) => file.id);
    };

    return {
      // GET
      async feed(ctx) {
        const { page = 1, pageSize = 20, filter } = ctx.query; // pagination and filter parameters

        try {
          const projects = await strapi.entityService.findMany(
            'api::project.project',
            {
              sort: [{ createdAt: 'desc' }, { reaction_count: 'desc' }],
              populate: {
                users_permissions_user: true,
                images: true,
              },
              limit: pageSize,
              offset: (page - 1) * pageSize,
            }
          );

          // Fetch exclusive content data
          const exclusiveContents = await strapi.entityService.findMany(
            'api::exclusive-content.exclusive-content',
            {
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
              limit: pageSize,
              offset: (page - 1) * pageSize,
            },
          );


          const users = [
            ...projects.map(item => item.users_permissions_user.id),
            ...exclusiveContents.map(item => item.project.users_permissions_user.id),
          ];
          const uniqueUsers = users.filter((id: string, index: number) => users.indexOf(id) === index);

          const profiles = await strapi.entityService.findMany(
            'api::profile.profile',
            {
              filters: {
                users_permissions_user: {
                  id: {
                    $in: uniqueUsers
                  }
                }
              },
              populate: {
                users_permissions_user: true
              }
            }
          );

          // Map the data to the correct format
          const mappedProjects = projects.map((project) => ({
            type: 'project',
            id: project.id,
            name: project.name,
            summary: project.summary,
            description: project.description,
            project_type: project.project_type,
            planned_release_date: project.planned_release_date,
            soft_goal: project.soft_goal,
            deadline: project.deadline,
            hard_goal: project.hard_goal,
            owner: extractProfile(profiles, project.users_permissions_user.id),
            images: project.images,
            reaction_count: project.reaction_count,
            createdAt: project.createdAt,
          }));

          const mappedExclusiveContents = exclusiveContents.map((content) => ({
            type: 'exclusive_content',
            id: content.id,
            title: content.title,
            media: content.media,
            description: content.description,
            project: {
              name: content.project.name,
              id: content.project.id,
            },
            owner: extractProfile(profiles, content.project.users_permissions_user.id),
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
          const paginatedData = mergedData.slice(
            (page - 1) * pageSize,
            page * pageSize,
          );

          // Return the response
          return ctx.send({
            data: paginatedData,
            pagination: {
              page: parseInt(page, 10),
              pageSize: parseInt(pageSize, 10),
              total: mergedData.length,
            },
          });
        } catch (err) {
          ctx.throw(500, err);
        }
      },
      // PUT
      async update(ctx) {
        const { id } = ctx.params;
        const user = ctx.state.user;

        // Fetch the project
        const project = await strapi.entityService.findOne(
          'api::project.project',
          id,
          {
            populate: {
              images: true,
              video: true,
              audio: true,
              users_permissions_user: true,
            },
          },
        );

        // Ensure ownership
        if (!project || project.users_permissions_user.id !== user.id) {
          return ctx.unauthorized(
            'Only the owner is allowed to update a project',
          );
        }

        const currentPhotoCount = project.images ? project.images.length : 0;

        let entity;
        if (ctx.is('multipart')) {
          const { data, files } = parseMultipartData(ctx);

          try {
            // Handle images
            if (files.images) {
              const newImagesCount = Array.isArray(files.images)
                ? files.images.length
                : 1;
              const totalImages = currentPhotoCount + newImagesCount;

              // Check if the total number of photos exceeds the limit
              if (totalImages > TOTAL_PROJECT_IMAGES) {
                return ctx.badRequest(
                  `You can only have a maximum of ${TOTAL_PROJECT_IMAGES} images per project.`,
                );
              }

              const uploadedImageIds = await uploadFiles(
                files.images,
                id,
                'api::project.project',
                'images',
                MEX_PROJECT_IMAGE_SIZE,
                'image',
              );
              data.images = project.images.concat(uploadedImageIds);
            }

            // Handle video
            if (files.video) {
              const uploadedVideoId = await uploadFiles(
                files.video,
                id,
                'api::project.project',
                'video',
                MEX_PROJECT_VIDEO_SIZE,
                'video',
              );
              data.video = uploadedVideoId[0]; // Since it's a single video
            }

            // Handle audio
            if (files.audio) {
              const uploadedAudioId = await uploadFiles(
                files.audio,
                id,
                'api::project.project',
                'audio',
                MEX_PROJECT_VIDEO_SIZE,
                'audio',
              );
              data.audio = uploadedAudioId[0]; // Since it's a single audio file
            }

            entity = await strapi.entityService.update(
              'api::project.project',
              id,
              { data },
            );
          } catch (error) {
            return ctx.badRequest(error.message);
          }
        } else {
          entity = await strapi.entityService.update(
            'api::project.project',
            id,
            ctx.request.body,
          );
        }

        const sanitizedResults = await this.sanitizeOutput(entity, ctx);
        return this.transformResponse(sanitizedResults);
      },

      // POST
      async create(ctx) {
        const { user } = ctx.state;

        try {
          const { data } = ctx.is('multipart')
            ? parseMultipartData(ctx)
            : ctx.request.body;

          if ('current_funding' in data || 'reaction_count' in data) {
            throw new Error(
              'current_funding and reaction_count fields are not allowed in the create request.',
            );
          }

          const now = new Date();
          //ctx.request.body.data.users_permissions_user = user.Id;
          ctx.request.body.data.users_permissions_user = 41;
          ctx.request.body.data.createdAt = now;
          ctx.request.body.data.updatedAt = now;
          ctx.request.body.data.publishedAt = now;

          // Proceed with creating the the project
          const result = await super.create(ctx);
          // find user's sk to sign and send TX to solana program
          const wallet = await strapi.entityService.findMany(
            'api::wallet.wallet',
            {
              filters: {
                users_permissions_user: ctx.request.body.data.users_permissions_user,
              },
            }
          );

          if (wallet.length) {
            // TODO: Call the Smart Contract method here to register the project on the blockchain
            // and if not created, revert the centralized project creation.
            console.log(`wallet is ${wallet}`);
            // Generate a new keypair for the project
            const projectKeypair = Keypair.genera
            // Extract the campaign info to send to Solana
            const projectTitle = data.title;
            const projectDescription = data.description;
            const goalAmount = data.goal_amount;

            try {
              // Transaction: Create a project campaign on Solana
              await program.rpc.initProject(
                projectTitle,
                projectDescription,
                new anchor.BN(goalAmount),
                {
                  accounts: {
                    projectAccount: projectKeypair.publicKey,
                    owner: wallet[0].public_key, // Assuming the wallet has the user's Solana address
                    systemProgram: SystemProgram.programId,
                  },
                  signers: [projectKeypair, walletKeypair],
                }
              );

              console.log('Project campaign successfully created on the blockchain');
            } catch (blockchainError) {
              // If the smart contract interaction was unsuccessful, delete the recently created project in Strapi
              await strapi.entityService.delete('api::project.project', result.data.id);
              throw new Error(`Blockchain transaction failed. Error: ${blockchainError.message}`);
            }

            // If the Smart contract interaction was unsuccessful, we have to delete the recently created
            // Project using result.data.id
            // throw new Error(`Error transaction: ${result.data.id}`);
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
