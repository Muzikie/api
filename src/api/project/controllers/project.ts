/**
 * project controller
 */

import { factories } from '@strapi/strapi'
import { parseMultipartData } from '@strapi/utils';
import { TOTAL_PROJECT_IMAGES, MEX_PROJECT_IMAGE_SIZE } from '../../../constants/limits';

export default factories.createCoreController('api::project.project', ({ strapi }) => ({
  async update(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    // Fetch the project
    const project = await strapi.services.project.findOne({ id });

    // Ensure ownership
    if (!project || project.user_id !== user.id) {
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
          return ctx.badRequest(`You can only have a maximum of 5 images per project.`);
        }

        // Check the size of each photo
        for (const photo of newImages) {
          if (photo.size > MEX_PROJECT_IMAGE_SIZE) {
            return ctx.badRequest(`Each image must be smaller than 2 MB. The image "${photo.name}" is too large.`);
          }
        }

        const uploadedPhotos = await strapi.plugins['upload'].services.upload.upload({
          data: { ...data, refId: id, ref: 'project', field: 'photos' },
          files: newImages,
        });

        data.photos = project.photos.concat(uploadedPhotos.map(file => file.id));
      }

      // Handle video
      if (files.video) {
        if (files.video.size > MEX_PROJECT_IMAGE_SIZE) {
          return ctx.badRequest(`The video must be smaller than 2 MB.`);
        }

        const video = await strapi.plugins['upload'].services.upload.upload({
          data: { ...data, refId: id, ref: 'project', field: 'video' },
          files: files.video,
        });

        data.video = video[0].id;
      }

      entity = await strapi.services.project.update({ id }, data);
    } else {
      entity = await strapi.services.project.update({ id }, ctx.request.body);
    }

    const sanitizedResults = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedResults);
  }
}));
