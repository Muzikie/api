/**
 * project controller
 */

import { factories } from '@strapi/strapi'
import { parseMultipartData } from '@strapi/utils';
import {
  TOTAL_PROJECT_IMAGES,
  MEX_PROJECT_IMAGE_SIZE,
  MEX_PROJECT_VIDEO_SIZE,
} from '../../../constants/limits';
import { convertByteToBit } from '../../../utils/file';

export default factories.createCoreController('api::project.project', ({ strapi }) => ({
  async update(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    // Fetch the project
    const project = await strapi.entityService.findOne('api::project.project', id, {
      populate: {
        images: true,
        video: true,
        audio: true,
      }
    });

    // Ensure ownership
    if (!project || project.id !== user.id) {
      return ctx.unauthorized('Only the owner is allowed to update a project');
    }

    // Ensure the number and size of images are limited
    const currentPhotoCount = project.images ? project.images.length : 0;

    let entity;
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      // Handle images
      if (files.images) {
        const newImages = Array.isArray(files.images) ? files.images : [files.images];
        const newImagesCount = newImages.length;
        const totalImages = currentPhotoCount + newImagesCount;

        // Check if the total number of photos exceeds the limit
        if (totalImages > TOTAL_PROJECT_IMAGES) {
          return ctx.badRequest(`You can only have a maximum of ${TOTAL_PROJECT_IMAGES} images per project.`);
        }

        // Check the size of each photo
        for (const image of newImages) {
          if (image.size > convertByteToBit(MEX_PROJECT_IMAGE_SIZE)) {
            return ctx.badRequest(`Each image must be smaller than ${MEX_PROJECT_IMAGE_SIZE} MB. The image "${image.name}" is too large.`);
          }
        }

        const uploadedPhotos = await strapi.plugins['upload'].services.upload.upload({
          data: { ...data, refId: id, ref: 'api::project.project', field: 'images' },
          files: newImages,
        });

        data.photos = project.images.concat(uploadedPhotos.map(file => file.id));
      }

      // Handle video
      if (files.video) {
        if (files.video.size > convertByteToBit(MEX_PROJECT_VIDEO_SIZE)) {
          return ctx.badRequest(`The video must be smaller than ${MEX_PROJECT_VIDEO_SIZE} MB.`);
        }

        const video = await strapi.plugins['upload'].services.upload.upload({
          data: { ...data, refId: id, ref: 'api::project.project', field: 'video' },
          files: files.video,
        });

        data.video = video[0].id;
      }

      // Handle audio
      if (files.audio) {
        if (files.audio.size > convertByteToBit(MEX_PROJECT_VIDEO_SIZE)) {
          return ctx.badRequest(`The audio must be smaller than ${MEX_PROJECT_VIDEO_SIZE} MB.`);
        }

        const audio = await strapi.plugins['upload'].services.upload.upload({
          data: { ...data, refId: id, ref: 'api::project.project', field: 'audio' },
          files: files.audio,
        });

        data.audio = audio[0].id;
      }

      entity = await strapi.entityService.update("api::project.project", id, { data });
    } else {
      entity = await strapi.entityService.update("api::project.project", id, ctx.request.body);
    }

    const sanitizedResults = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedResults);
  }
}));
