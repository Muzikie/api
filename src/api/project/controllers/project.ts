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

export default factories.createCoreController('api::project.project', ({ strapi }) => {

  // Helper function to upload files
  const uploadFiles = async (files, id, ref, field, maxSize, allowedFileTypes) => {
    if (!files) return [];

    const newFiles = Array.isArray(files) ? files : [files];

    // Check the size of each file
    for (const file of newFiles) {
      if (file.size > convertByteToBit(maxSize)) {
        throw new Error(`Each ${allowedFileTypes} file must be smaller than ${maxSize} MB. The file "${file.name}" is too large.`);
      }
    }

    const uploadedFiles = await strapi.plugins['upload'].services.upload.upload({
      data: { refId: id, ref: ref, field: field },
      files: newFiles,
    });

    return uploadedFiles.map(file => file.id);
  };

  return {
    // PUT
    async update(ctx) {
      const { id } = ctx.params;
      const user = ctx.state.user;

      // Fetch the project
      const project = await strapi.entityService.findOne('api::project.project', id, {
        populate: {
          images: true,
          video: true,
          audio: true,
          users_permissions_user: true,
        }
      });

      // Ensure ownership
      if (!project || project.users_permissions_user.id !== user.id) {
        return ctx.unauthorized('Only the owner is allowed to update a project');
      }

      const currentPhotoCount = project.images ? project.images.length : 0;

      let entity;
      if (ctx.is('multipart')) {
        const { data, files } = parseMultipartData(ctx);

        try {
          // Handle images
          if (files.images) {
            const newImagesCount = Array.isArray(files.images) ? files.images.length : 1;
            const totalImages = currentPhotoCount + newImagesCount;

            // Check if the total number of photos exceeds the limit
            if (totalImages > TOTAL_PROJECT_IMAGES) {
              return ctx.badRequest(`You can only have a maximum of ${TOTAL_PROJECT_IMAGES} images per project.`);
            }

            const uploadedImageIds = await uploadFiles(files.images, id, 'api::project.project', 'images', MEX_PROJECT_IMAGE_SIZE, 'image');
            data.images = project.images.concat(uploadedImageIds);
          }

          // Handle video
          if (files.video) {
            const uploadedVideoId = await uploadFiles(files.video, id, 'api::project.project', 'video', MEX_PROJECT_VIDEO_SIZE, 'video');
            data.video = uploadedVideoId[0]; // Since it's a single video
          }

          // Handle audio
          if (files.audio) {
            const uploadedAudioId = await uploadFiles(files.audio, id, 'api::project.project', 'audio', MEX_PROJECT_VIDEO_SIZE, 'audio');
            data.audio = uploadedAudioId[0]; // Since it's a single audio file
          }

          entity = await strapi.entityService.update("api::project.project", id, { data });
        } catch (error) {
          return ctx.badRequest(error.message);
        }
      } else {
        entity = await strapi.entityService.update("api::project.project", id, ctx.request.body);
      }

      const sanitizedResults = await this.sanitizeOutput(entity, ctx);
      return this.transformResponse(sanitizedResults);
    },

    // POST
    async create(ctx) {
      const { user } = ctx.state;
  
      try {
        const project = await strapi.entityService.create(
          'api::project.project',
          {
            data: {
              user_id: user.id,
              ...ctx.request.body,
            },
          });
  
        // TODO: Call the Smart Contract method here to register the project on the blockchain
  
        const sanitizedEntity = await this.sanitizeOutput(project, ctx);
        return this.transformResponse(sanitizedEntity);
      } catch (err) {
        ctx.throw(500, err);
      }
    }
  };
});

