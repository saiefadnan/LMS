/**
 * is-owner-or-admin policy
 * 
 * Enforces course, lesson, and quiz access control:
 * - Admin & Content Manager: Full access to create, edit, delete ANY course, lesson, or quiz.
 * - Instructor: Can create courses, and can only edit/delete courses/lessons/quizzes belonging to their own courses.
 * - Student & others: Forbidden.
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

  // Admins and Content Managers have global authority over all courses, lessons, and quizzes
  if (roleType === 'admin' || roleType === 'content_manager') {
    return true;
  }

  // Instructors can only manage their own courses, lessons, and quizzes
  if (roleType === 'instructor') {
    const { documentId, id } = policyContext.params || {};
    const targetId = documentId || id;
    const path = policyContext.request?.url || '';

    // If it's a create route without a specific resource ID
    if (!targetId) {
      // If creating a lesson or quiz, verify course ownership
      if (path.includes('/lessons') || path.includes('/quizzes')) {
        const courseId = policyContext.request?.body?.data?.course;
        if (!courseId) return true; // Let validation handle missing course
        const course = await strapi.db.query('api::course.course').findOne({
          where: { $or: [{ documentId: courseId }, { id: courseId }] },
          populate: ['instructor'],
        });
        return course?.instructor?.id === user.id;
      }
      return true;
    }

    // For update / delete on Course
    if (path.includes('/courses')) {
      const course = await strapi.db.query('api::course.course').findOne({
        where: { $or: [{ documentId: targetId }, { id: targetId }] },
        populate: ['instructor'],
      });
      return course?.instructor?.id === user.id;
    }

    // For update / delete on Lesson
    if (path.includes('/lessons')) {
      const lesson = await strapi.db.query('api::lesson.lesson').findOne({
        where: { $or: [{ documentId: targetId }, { id: targetId }] },
        populate: ['course', 'course.instructor'],
      });
      return lesson?.course?.instructor?.id === user.id;
    }

    // For update / delete on Quiz
    if (path.includes('/quizzes')) {
      const quiz = await strapi.db.query('api::quiz.quiz').findOne({
        where: { $or: [{ documentId: targetId }, { id: targetId }] },
        populate: ['course', 'course.instructor'],
      });
      return quiz?.course?.instructor?.id === user.id;
    }

    return true;
  }

  return false;
};
