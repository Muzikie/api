/**
 * contribution controller
 */

import { factories } from "@strapi/strapi";
import { ProjectStatus } from "../../../../types/collections";

export default factories.createCoreController(
  "api::contribution.contribution",
  ({ strapi }) => ({
    async create(ctx) {
      const tierDocs = strapi.documents(
        "api::contribution-tier.contribution-tier"
      );
      const contributionDocs = strapi.documents(
        "api::contribution.contribution"
      );
      const projectDocs = strapi.documents("api::project.project");

      const { user } = ctx.state;
      const { contribution_tier } = ctx.request.body.data;
      let contributionId;
      let project;

      try {
        // Find the contribution tier and associated project
        const tier = await tierDocs.findOne({
          documentId: contribution_tier, // @todo get by id
          populate: { project: true },
        });

        if (!tier) {
          return ctx.badRequest("Contribution tier not found");
        }

        // Check if the project exists
        project = tier.project;
        if (!project) {
          return ctx.badRequest("Project not found");
        }

        // Create the contribution
        const contribution = await contributionDocs.create({
          data: {
            amount: tier.amount,
            contribution_tier: tier.id,
            project: project.id,
            users_permissions_user: user.id,
          },
        });

        contributionId = contribution.documentId;

        // Update the project's current_funding
        const current_funding =
          BigInt(project.current_funding) + BigInt(tier.amount);
        let project_status = project.project_status;
        if (current_funding >= BigInt(project.hard_goal)) {
          project_status = ProjectStatus.SoldOut;
        } else if (current_funding >= BigInt(project.soft_goal)) {
          project_status = ProjectStatus.Successful;
        }
        await projectDocs.update({
          documentId: project.documentId,
          data: {
            current_funding: current_funding.toString(),
            project_status,
          },
        });

        // Return the created contribution
        const sanitizedEntity = await this.sanitizeOutput(contribution, ctx);
        // before returning the value, make sure to update the Solana project too
        return this.transformResponse(sanitizedEntity);
      } catch (err) {
        await contributionDocs.delete({
          documentId: contributionId,
        });
        await projectDocs.update({
          documentId: project.documentId,
          data: {
            current_funding: project.current_funding,
            project_status: project.project_status,
          },
        });
        ctx.throw(500, err);
      }
    },

    async getOverview(ctx) {
      const { user } = ctx.state;
      const contributionDocs = strapi.db.query(
        "api::contribution.contribution"
      );

      try {
        const contributions = await contributionDocs.findMany({
          where: {
            users_permissions_user: user.id,
          },
          populate: {
            contribution_tier: {
              populate: { project: true },
            },
          },
        });

        if (!contributions.length) {
          return ctx.send({
            total_contributions_amount: "0",
            total_contributions_count: 0,
            unique_projects_count: 0,
            latest_contribution_at: null,
            top_contributed_project: null,
            average_contribution_amount: "0",
          });
        }

        let totalAmount = BigInt(0);
        const projectAmounts = new Map();
        let latestDate = null;

        contributions.forEach((contribution) => {
          const amount = BigInt(contribution.amount);
          totalAmount += amount;

          const projectId = contribution.contribution_tier?.project?.id;
          if (projectId) {
            const current = projectAmounts.get(projectId) || {
              total: BigInt(0),
              project: contribution.contribution_tier.project,
            };
            current.total += amount;
            projectAmounts.set(projectId, current);
          }

          const createdAt = new Date(contribution.createdAt);
          if (!latestDate || createdAt > latestDate) {
            latestDate = createdAt;
          }
        });

        // Identify project with max contribution
        const topProject = [...projectAmounts.values()].reduce((prev, curr) =>
          curr.total > prev.total ? curr : prev
        );

        const averageAmount = totalAmount / BigInt(contributions.length);

        return ctx.send({
          total_contributions_amount: totalAmount.toString(),
          total_contributions_count: contributions.length,
          unique_projects_count: projectAmounts.size,
          latest_contribution_at: latestDate,
          top_contributed_project: {
            id: topProject.project.id,
            name: topProject.project.name,
            total_amount: topProject.total.toString(),
          },
          average_contribution_amount: averageAmount.toString(),
        });
      } catch (err) {
        strapi.log.error("Error getting user contribution overview", err);
        ctx.throw(500, "Failed to load contribution overview");
      }
    },
  })
);
