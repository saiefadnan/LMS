import type { Core } from '@strapi/strapi';

export default {
  /**
   * Register phase — runs before the app is initialized.
   * Used to extend Strapi's core functionality.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

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

    strapi.log.info('Bootstrap: LMS roles verified');
  },
};
