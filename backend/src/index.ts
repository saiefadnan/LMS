import type { Core } from '@strapi/strapi';

export default {
  /**
   * Register phase — runs before the app is initialized.
   * Used to extend Strapi's core functionality.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
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
        const role = await strapi
          .query('plugin::users-permissions.role')
          .findOne({ where: { type: requestedRoleType } });

        if (!role) {
          return ctx.badRequest(`Role '${requestedRoleType}' not found.`);
        }

        // 4. Remove 'role' from body so Strapi v5 strict parameter validator doesn't reject it
        if (ctx.request.body) {
          delete ctx.request.body.role;
        }

        // 5. Call original register controller
        await originalRegister(ctx, next);

        // 6. If user was created, update their role to the requested role
        if (ctx.body && ctx.body.user) {
          const userId = ctx.body.user.id;

          await strapi.query('plugin::users-permissions.user').update({
            where: { id: userId },
            data: { role: role.id },
          });

          // Fetch full user with populated role
          const updatedUser = await strapi.query('plugin::users-permissions.user').findOne({
            where: { id: userId },
            populate: ['role'],
          });

          const userSchema = strapi.getModel('plugin::users-permissions.user');
          const sanitizedUser = await strapi.contentAPI.sanitize.output(
            updatedUser,
            userSchema,
            { auth: ctx.state.auth }
          );

          ctx.body.user = sanitizedUser;
          strapi.log.info(`Assigned role '${requestedRoleType}' to registered user: ${ctx.body.user.username}`);
        }
      };
    }

    if (plugin && plugin.controllers && plugin.controllers.user) {
      plugin.controllers.user.me = async (ctx: any) => {
        const authUser = ctx.state.user;
        if (!authUser) {
          return ctx.unauthorized();
        }

        const user = await strapi.query('plugin::users-permissions.user').findOne({
          where: { id: authUser.id },
          populate: ['role'],
        });

        if (!user) {
          return ctx.notFound();
        }

        const userSchema = strapi.getModel('plugin::users-permissions.user');
        const sanitizedUser: any = await strapi.contentAPI.sanitize.output(
          user,
          userSchema,
          { auth: ctx.state.auth }
        );

        if (user.role) {
          sanitizedUser.role = {
            id: user.role.id,
            name: user.role.name,
            type: user.role.type,
            description: user.role.description,
          };
        }

        ctx.body = sanitizedUser;
      };
    }
  },

  /**
   * Bootstrap phase — runs before the app starts serving requests.
   * 
   * We use this to ensure our 4 custom roles exist in the database.
   * This runs on every server start, but only creates roles that don't
   * already exist (idempotent — safe to run multiple times).
   * 
   * WHY HERE: Strapi's Users & Permissions plugin comes with 2 default
   * roles (Authenticated, Public). We need 4 specific roles for our LMS:
   * admin, content_manager, instructor, student. Creating them in bootstrap
   * means they're guaranteed to exist before any user registers.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Define the roles our LMS needs
    const rolesToCreate = [
      {
        name: 'Admin',
        description: 'Full platform control — manages users, courses, and all content',
        type: 'admin',
      },
      {
        name: 'Content Manager',
        description: 'Creates and manages courses, lessons, quizzes, and blog posts',
        type: 'content_manager',
      },
      {
        name: 'Instructor',
        description: 'Manages their own courses, lessons, and quizzes',
        type: 'instructor',
      },
      {
        name: 'Student',
        description: 'Enrolls in courses, views lessons, takes quizzes',
        type: 'student',
      },
    ];

    // For each role, check if it already exists. If not, create it.
    for (const role of rolesToCreate) {
      const existingRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: role.type } });

      if (!existingRole) {
        await strapi.query('plugin::users-permissions.role').create({
          data: {
            name: role.name,
            type: role.type,
            description: role.description,
          },
        });
        strapi.log.info(`Created role: ${role.name}`);
      }
    }

    // Grant permissions for our custom endpoints to the roles
    const grantPermissions = async (roleType: string, actions: string[]) => {
      const role = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: roleType }, populate: ['permissions'] });
      if (!role) return;

      for (const action of actions) {
        const hasPerm = role.permissions?.find((p: any) => p.action === action);
        if (!hasPerm) {
          await strapi.query('plugin::users-permissions.permission').create({
            data: {
              action,
              role: role.id,
            },
          });
          strapi.log.info(`Granted ${action} to ${roleType}`);
        }
      }
    };

    await grantPermissions('instructor', [
      'api::course.course.findMyCourses',
      'api::enrollment.enrollment.findMyEnrollments',
      'api::progress.progress.findMyProgress'
    ]);
    await grantPermissions('admin', [
      'api::course.course.findMyCourses',
      'api::enrollment.enrollment.findMyEnrollments',
      'api::progress.progress.findMyProgress'
    ]);
    await grantPermissions('student', [
      'api::enrollment.enrollment.findMyEnrollments',
      'api::progress.progress.findMyProgress'
    ]);

    strapi.log.info('Bootstrap: LMS roles verified');
  },
};
