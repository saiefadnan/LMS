import type { Core } from '@strapi/strapi';

/**
 * Bootstraps the database on startup by creating necessary roles
 * and assigning the correct CRUD permissions.
 */
export const bootstrapRoles = async (strapi: Core.Strapi) => {
  const roleService = strapi.plugin('users-permissions').service('role');
  
  const createRoleIfNotExists = async (name: string, description: string, type: string) => {
    const role = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type }
    });
    
    if (!role) {
      await roleService.createRole({
        name,
        description,
        type,
      });
      strapi.log.info(`Created role: ${name}`);
    }
  };

  await createRoleIfNotExists('Content Manager', 'Platform managers who handle blog posts and curriculum.', 'content_manager');
  await createRoleIfNotExists('Instructor', 'Course creators and teachers.', 'instructor');
  await createRoleIfNotExists('Student', 'Learners who take courses.', 'student');

  // Permission granting helper
  const grantPermissions = async (roleType: string, actions: string[]) => {
    const role = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: roleType },
      populate: ['permissions']
    });

    if (role) {
      for (const action of actions) {
        const hasPermission = role.permissions?.some((p: any) => p.action === action);
        if (!hasPermission) {
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: {
              action,
              role: role.id,
            },
          });
          strapi.log.info(`Granted ${action} to ${roleType}`);
        }
      }
    }
  };

  // Define permission arrays for different roles
  const studentPermissions = [
    // Auth (allow fetching own profile)
    'plugin::users-permissions.user.me',
    // Course
    'api::course.course.find',
    'api::course.course.findOne',
    // Lesson
    'api::lesson.lesson.find',
    'api::lesson.lesson.findOne',
    // Quiz (Read-only for taking the quiz)
    'api::quiz.quiz.find',
    'api::quiz.quiz.findOne',
    // Quiz Results (Students create their own results)
    'api::quiz-result.quiz-result.create',
    'api::quiz-result.quiz-result.find',
    'api::quiz-result.quiz-result.findOne',
    // Blog (Students can read published blogs)
    'api::blog-post.blog-post.find',
    'api::blog-post.blog-post.findOne',
    // Enrollment
    'api::enrollment.enrollment.create',
    'api::enrollment.enrollment.findMyEnrollments',
    // Progress
    'api::progress.progress.create',
    'api::progress.progress.findMyProgress',
  ];

  const instructorPermissions = [
    ...studentPermissions,
    // Course management
    'api::course.course.create',
    'api::course.course.update',
    'api::course.course.delete',
    'api::course.course.findMyCourses',
    'api::course.course.getCourseStudentProgress',
    // Lesson management
    'api::lesson.lesson.create',
    'api::lesson.lesson.update',
    'api::lesson.lesson.delete',
    // Quiz management
    'api::quiz.quiz.create',
    'api::quiz.quiz.update',
    'api::quiz.quiz.delete',
    // Enrollment viewing (Instructors can see enrollments for their courses)
    'api::enrollment.enrollment.find',
    'api::enrollment.enrollment.findOne',
    // Quiz Result management (Instructors can view their students' results)
    'api::quiz-result.quiz-result.find',
  ];

  const contentManagerPermissions = [
    ...instructorPermissions,
    // Blog management
    'api::blog-post.blog-post.create',
    'api::blog-post.blog-post.update',
    'api::blog-post.blog-post.delete',
  ];

  const adminPermissions = [
    ...contentManagerPermissions,
    // Full access to enrollments, progress, and quiz results
    'api::enrollment.enrollment.find',
    'api::enrollment.enrollment.findOne',
    'api::enrollment.enrollment.update',
    'api::enrollment.enrollment.delete',
    'api::progress.progress.find',
    'api::progress.progress.findOne',
    'api::progress.progress.update',
    'api::progress.progress.delete',
    'api::quiz-result.quiz-result.update',
    'api::quiz-result.quiz-result.delete',
    // User management (Plugin Users & Permissions)
    'plugin::users-permissions.user.find',
    'plugin::users-permissions.user.findOne',
    'plugin::users-permissions.user.create',
    'plugin::users-permissions.user.update',
    'plugin::users-permissions.user.destroy',
    'plugin::users-permissions.role.find',
  ];

  const publicPermissions = [
    'api::course.course.find',
    'api::course.course.findOne',
    'api::blog-post.blog-post.find',
    'api::blog-post.blog-post.findOne',
  ];

  await grantPermissions('public', publicPermissions);
  await grantPermissions('student', studentPermissions);
  await grantPermissions('instructor', instructorPermissions);
  await grantPermissions('content_manager', contentManagerPermissions);
  await grantPermissions('admin', adminPermissions);

  strapi.log.info('Bootstrap: LMS roles and permissions verified');
};
