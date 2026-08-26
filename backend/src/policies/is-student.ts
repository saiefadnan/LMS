/**
 * is-student policy
 */
export default async (policyContext: any, config: any, { strapi }: any) => {
  const user = policyContext.state.user;
  
  if (!user) {
    return false;
  }

  const fullUser = await strapi.entityService.findOne('plugin::users-permissions.user', user.id, {
    populate: ['role'],
  });

  if (fullUser?.role?.type === 'student') {
    return true;
  }

  return false;
};
