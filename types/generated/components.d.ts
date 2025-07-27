import type { Schema, Struct } from '@strapi/strapi';

export interface SocialSocial extends Struct.ComponentSchema {
  collectionName: 'components_social_socials';
  info: {
    displayName: 'social';
  };
  attributes: {
    platform: Schema.Attribute.Enumeration<['instagram', 'twitter', 'tiktok']> &
      Schema.Attribute.Required;
    username: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'social.social': SocialSocial;
    }
  }
}
