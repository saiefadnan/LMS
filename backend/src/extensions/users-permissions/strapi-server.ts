export default (plugin: any) => {
  const originalRegister = plugin.controllers.auth.register;

  plugin.controllers.auth.register = async (ctx: any) => {
    // 1. Get the requested role from the body (e.g. 'student', 'instructor')
    const requestedRoleType = ctx.request.body.role || 'student'; // Default to student

    // 2. We don't want people registering as 'admin' or 'content_manager' from the public endpoint!
    if (requestedRoleType === 'admin' || requestedRoleType === 'content_manager') {
      return ctx.badRequest('You cannot register with this role.');
    }

    // 3. Find the role ID from the database using the type
    const role = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: requestedRoleType } });

    if (!role) {
      return ctx.badRequest('Role not found.');
    }

    // 4. Overwrite the role in the request body with the actual role ID so the core controller uses it
    ctx.request.body.role = role.id;

    // 5. Call the original register controller
    await originalRegister(ctx);
  };

  return plugin;
};
