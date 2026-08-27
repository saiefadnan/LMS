import type { Core } from '@strapi/strapi';

/**
 * Bootstraps the database on startup by creating necessary roles
 * and assigning the correct CRUD permissions aligned with the Permission Matrix.
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

  // Permission syncing helper (grants desired actions and removes disallowed ones)
  const syncPermissions = async (roleType: string, allowedActions: string[]) => {
    const role = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: roleType },
      populate: ['permissions']
    });

    if (role) {
      const currentPermissions = role.permissions || [];
      const currentActionMap = new Map<string, number>();
      currentPermissions.forEach((p: any) => currentActionMap.set(p.action, p.id));

      // Grant missing permissions
      for (const action of allowedActions) {
        if (!currentActionMap.has(action)) {
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: {
              action,
              role: role.id,
            },
          });
          strapi.log.info(`Granted ${action} to ${roleType}`);
        }
      }

      // Revoke disallowed permissions (especially enrollment / quiz / progress create for non-students)
      for (const [action, permId] of currentActionMap.entries()) {
        if (!allowedActions.includes(action)) {
          await strapi.db.query('plugin::users-permissions.permission').delete({
            where: { id: permId },
          });
          strapi.log.info(`Revoked ${action} from ${roleType}`);
        }
      }
    }
  };

  // 1. Student Permissions (Can only view public courses/blogs, enroll in courses, mark progress, take quizzes)
  const studentPermissions = [
    'plugin::users-permissions.user.me',
    'api::course.course.find',
    'api::course.course.findOne',
    'api::lesson.lesson.find',
    'api::lesson.lesson.findOne',
    'api::quiz.quiz.find',
    'api::quiz.quiz.findOne',
    'api::quiz-result.quiz-result.create',
    'api::quiz-result.quiz-result.find',
    'api::quiz-result.quiz-result.findOne',
    'api::blog-post.blog-post.find',
    'api::blog-post.blog-post.findOne',
    'api::enrollment.enrollment.create',
    'api::enrollment.enrollment.findMyEnrollments',
    'api::progress.progress.create',
    'api::progress.progress.findMyProgress',
  ];

  // 2. Instructor Permissions (Can create, edit, delete own courses, lessons, quizzes, view student progress; NO blog management, NO enrollment, NO quiz taking)
  const instructorPermissions = [
    'plugin::users-permissions.user.me',
    'api::course.course.find',
    'api::course.course.findOne',
    'api::course.course.create',
    'api::course.course.update',
    'api::course.course.delete',
    'api::course.course.findMyCourses',
    'api::course.course.getCourseStudentProgress',
    'api::lesson.lesson.find',
    'api::lesson.lesson.findOne',
    'api::lesson.lesson.create',
    'api::lesson.lesson.update',
    'api::lesson.lesson.delete',
    'api::quiz.quiz.find',
    'api::quiz.quiz.findOne',
    'api::quiz.quiz.create',
    'api::quiz.quiz.update',
    'api::quiz.quiz.delete',
    'api::blog-post.blog-post.find',
    'api::blog-post.blog-post.findOne',
    'api::enrollment.enrollment.find',
    'api::enrollment.enrollment.findOne',
    'api::quiz-result.quiz-result.find',
    'api::quiz-result.quiz-result.findOne',
  ];

  // 3. Content Manager Permissions (Can manage ANY course, lessons, quizzes, blog posts, view progress; NO user management, NO enrollment, NO quiz taking)
  const contentManagerPermissions = [
    'plugin::users-permissions.user.me',
    'api::course.course.find',
    'api::course.course.findOne',
    'api::course.course.create',
    'api::course.course.update',
    'api::course.course.delete',
    'api::course.course.findMyCourses',
    'api::course.course.getCourseStudentProgress',
    'api::lesson.lesson.find',
    'api::lesson.lesson.findOne',
    'api::lesson.lesson.create',
    'api::lesson.lesson.update',
    'api::lesson.lesson.delete',
    'api::quiz.quiz.find',
    'api::quiz.quiz.findOne',
    'api::quiz.quiz.create',
    'api::quiz.quiz.update',
    'api::quiz.quiz.delete',
    'api::blog-post.blog-post.find',
    'api::blog-post.blog-post.findOne',
    'api::blog-post.blog-post.create',
    'api::blog-post.blog-post.update',
    'api::blog-post.blog-post.delete',
    'api::enrollment.enrollment.find',
    'api::enrollment.enrollment.findOne',
    'api::quiz-result.quiz-result.find',
    'api::quiz-result.quiz-result.findOne',
  ];

  // 4. Admin Permissions (Full management of users, courses, lessons, quizzes, blogs, progress, enrollments; NO student enrollment/quiz taking)
  const adminPermissions = [
    ...contentManagerPermissions,
    'plugin::users-permissions.user.find',
    'plugin::users-permissions.user.findOne',
    'plugin::users-permissions.user.create',
    'plugin::users-permissions.user.update',
    'plugin::users-permissions.user.destroy',
    'plugin::users-permissions.role.find',
    'api::enrollment.enrollment.update',
    'api::enrollment.enrollment.delete',
    'api::progress.progress.find',
    'api::progress.progress.findOne',
    'api::progress.progress.update',
    'api::progress.progress.delete',
    'api::quiz-result.quiz-result.update',
    'api::quiz-result.quiz-result.delete',
  ];

  // 5. Public Permissions
  const publicPermissions = [
    'plugin::users-permissions.auth.callback',
    'plugin::users-permissions.auth.register',
    'plugin::users-permissions.auth.connect',
    'plugin::users-permissions.auth.emailConfirmation',
    'plugin::users-permissions.auth.forgotPassword',
    'plugin::users-permissions.auth.resetPassword',
    'plugin::users-permissions.auth.sendEmailConfirmation',
    'api::course.course.find',
    'api::course.course.findOne',
    'api::blog-post.blog-post.find',
    'api::blog-post.blog-post.findOne',
  ];

  await syncPermissions('public', publicPermissions);
  await syncPermissions('student', studentPermissions);
  await syncPermissions('instructor', instructorPermissions);
  await syncPermissions('content_manager', contentManagerPermissions);
  await syncPermissions('admin', adminPermissions);

  strapi.log.info('Bootstrap: LMS roles and permissions verified & synchronized');
};
