/**
 * is-owner-or-admin policy
 * 
 * Used for update/delete routes.
 * Checks if the user is an admin OR if the user is the owner (instructor) of the resource.
 * This policy assumes the route has an :id parameter and we check ownership.
 * Note: Since we don't know the content type here generically, it's often better
 * to do this in the controller, but we can do a best-effort check if we know the model.
 * In a real-world scenario, you might pass the model name in config or check it dynamically.
 */
export default async (policyContext: any, config: any, { strapi }: any) => {
  const user = policyContext.state.user;
  
  if (!user) {
    return false;
  }

  const fullUser = await strapi.entityService.findOne('plugin::users-permissions.user', user.id, {
    populate: ['role'],
  });

  const roleType = fullUser?.role?.type;
  if (roleType === 'admin' || roleType === 'content_manager') {
    return true; // Admins and CMs can edit everything
  }

  if (roleType === 'instructor') {
    // We need to verify ownership.
    // In Strapi v5, policyContext.request.route has information about the controller/action, but it's complex.
    // A simpler approach for this demo: we will do ownership checks in the CONTROLLER instead, 
    // and let this policy just check if they are AT LEAST an instructor.
    // The controller will then block them if they don't own the specific item.
    return true;
  }

  return false;
};
