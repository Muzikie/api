import type { Schema, Attribute } from '@strapi/strapi';

export interface ContributionTierContributionTier extends Schema.Component {
  collectionName: 'components_contribution_tier_contribution_tiers';
  info: {
    displayName: 'ContributionTier';
    icon: 'chartPie';
  };
  attributes: {
    title: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    description: Attribute.Text &
      Attribute.SetMinMaxLength<{
        minLength: 20;
      }>;
    amount: Attribute.Integer & Attribute.Required;
    rewards: Attribute.Text & Attribute.Required;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'contribution-tier.contribution-tier': ContributionTierContributionTier;
    }
  }
}
