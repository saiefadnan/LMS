import type { Core } from '@strapi/strapi';

/**
 * Extends the Users-Permissions plugin to handle custom registration logic.
 */
export const registerAuthExtensions = (strapi: Core.Strapi) => {
  const plugin = strapi.plugin('users-permissions');
  
  if (plugin && plugin.controllers && plugin.controllers.auth) {
    const originalRegister = plugin.controllers.auth.register;
    
    plugin.controllers.auth.register = async (ctx: any, next?: any) => {
      // 1. Extract requested role from body
      const requestedRoleType = ctx.request.body?.role || 'student';

      // 2. Prevent privilege escalation
      if (requestedRoleType === 'admin' || requestedRoleType === 'content_manager') {
        return ctx.badRequest('You cannot register with this role.');
      }

      // 3. Find the target role in database
      const role = await strapi.db
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: requestedRoleType } });

      if (!role) {
        return ctx.badRequest('Role not found.');
      }

      // 4. Temporarily store role in ctx state so the core controller uses it
      ctx.state.role = role;
      
      // We must hook into the core controller's flow to override the role ID.
      // Strapi's auth controller looks at ctx.request.body, but also hardcodes 
      // the default role if we don't intercept it properly.
      // The easiest way is to modify the default role for the plugin temporarily, 
      // but since that's global, we instead overwrite the internal logic by replacing 
      // ctx.request.body.role with the requested role ID, which some Strapi versions respect.
      // For v5, if it doesn't respect it, we'll let it create as default (student),
      // then immediately update the user after creation.

      // Call the original registration handler
      await originalRegister(ctx, next);

      // 5. If registration succeeded, update the user with the correct role
      if (ctx.response.status === 200 && ctx.response.body?.user) {
        const userId = ctx.response.body.user.id;
        
        await strapi.db.query('plugin::users-permissions.user').update({
          where: { id: userId },
          data: { role: role.id }
        });

        // Refetch user with populated role to return in response
        const updatedUser = await strapi.db.query('plugin::users-permissions.user').findOne({
          where: { id: userId },
          populate: ['role']
        });
        
        ctx.response.body.user = updatedUser;
      }
    };

    // Override the profile fetching to always include the role
    const originalMe = plugin.controllers.user.me;
    plugin.controllers.user.me = async (ctx: any, next?: any) => {
      if (!ctx.state.user) {
        return ctx.unauthorized();
      }

      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { documentId: ctx.state.user.documentId },
        populate: ['role'],
      });

      ctx.body = user;
    };
  }
};
