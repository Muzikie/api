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
          populate: ['avatar'],
        });
        const [wallet] = await walletDocs.findMany({
          filters: { users_permissions_user: user.id },
        });
    
        if (!profile) {
          return ctx.notFound('Profile not found');
        }
        if (!wallet) {
          return ctx.notFound('Wallet not found');
        }
    
        return {
          ...profile,
          profileId: profile.documentId,
          id: user.id,
          address: wallet.address,
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
      }
    }
  }
);
