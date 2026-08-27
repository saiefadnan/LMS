/**
 * is-instructor-or-admin policy
 */
export default async (policyContext: any, config: any, { strapi }: any) => {
  const user = policyContext.state.user;
  if (!user) return false;

  const roleType =
    user.role?.type ||
    (
      await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id: user.id },
        populate: ['role'],
      })
    )?.role?.type;

  return roleType === 'admin' || roleType === 'instructor' || roleType === 'content_manager';
};
