/**
 * is-admin policy
 * 
 * Ensures the authenticated user has the 'admin' role.
 */
export default async (policyContext: any, config: any, { strapi }: any) => {
  const user = policyContext.state.user;
  
  // If no user is logged in, deny access
  if (!user) {
    return false;
  }

  // Fetch the user with their role populated
  const fullUser = await strapi.entityService.findOne('plugin::users-permissions.user', user.id, {
    populate: ['role'],
  });

  // Check if role type is 'admin'
  if (fullUser?.role?.type === 'admin') {
    return true;
  }

  return false;
};
