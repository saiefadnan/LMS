/**
 * is-instructor-or-admin policy
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
  if (roleType === 'admin' || roleType === 'instructor') {
    return true;
  }

  return false;
};
