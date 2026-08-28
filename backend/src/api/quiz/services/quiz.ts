import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::quiz.quiz', ({ strapi }) => ({
  /**
   * Create a quiz for a course, ensuring the requester owns the course or is admin/manager.
   */
  async createCourseQuiz(user: any, roleType: string, quizData: any) {
    const courseId = quizData.course;
    if (!courseId) {
      throw new Error('Course ID is required.');
    }

    const isNumeric = /^\d+$/.test(String(courseId));
    const course = await strapi.db.query('api::course.course').findOne({
      where: isNumeric ? { id: Number(courseId) } : { documentId: String(courseId) },
      populate: ['instructor'],
    });

    if (!course) {
      throw new Error('Course not found.');
    }

    // Admin and Content Manager can create for any course; Instructor must own the course
    if (roleType !== 'admin' && roleType !== 'content_manager') {
      if (course.instructor?.id !== user.id) {
        throw new Error('FORBIDDEN_COURSE_OWNER');
      }
    }

    const quiz = await strapi.documents('api::quiz.quiz').create({
      data: {
        title: quizData.title,
        description: quizData.description,
        passingScore: quizData.passingScore || 70,
        questions: quizData.questions || [],
        course: course.id,
      },
      populate: ['course'],
    });

    return quiz;
  },

  /**
   * Update a quiz after verifying permissions.
   */
  async updateCourseQuiz(user: any, roleType: string, idOrDocId: string, updateData: any) {
    if (roleType !== 'admin' && roleType !== 'content_manager') {
      const isNumeric = /^\d+$/.test(String(idOrDocId));
      const quiz = await strapi.db.query('api::quiz.quiz').findOne({
        where: isNumeric ? { id: Number(idOrDocId) } : { documentId: String(idOrDocId) },
        populate: { course: { populate: ['instructor'] } },
      });

      if (!quiz) {
        throw new Error('NOT_FOUND');
      }

      if (quiz.course?.instructor?.id !== user.id) {
        throw new Error('FORBIDDEN_COURSE_OWNER');
      }
    }

    // Don't allow changing the course relation
    const safeData = { ...updateData };
    delete safeData.course;

    const isNumeric = /^\d+$/.test(String(idOrDocId));
    let targetDocId = idOrDocId;
    if (isNumeric) {
      const quiz = await strapi.db.query('api::quiz.quiz').findOne({
        where: { id: Number(idOrDocId) },
      });
      if (!quiz) throw new Error('NOT_FOUND');
      targetDocId = quiz.documentId;
    }

    return await strapi.documents('api::quiz.quiz').update({
      documentId: targetDocId,
      data: safeData,
      populate: ['course'],
    });
  },

  /**
   * Delete a quiz after verifying permissions.
   */
  async deleteCourseQuiz(user: any, roleType: string, idOrDocId: string) {
    const isNumeric = /^\d+$/.test(String(idOrDocId));
    const quiz = await strapi.db.query('api::quiz.quiz').findOne({
      where: isNumeric ? { id: Number(idOrDocId) } : { documentId: String(idOrDocId) },
      populate: { course: { populate: ['instructor'] } },
    });

    if (!quiz) {
      throw new Error('NOT_FOUND');
    }

    if (roleType !== 'admin' && roleType !== 'content_manager') {
      if (quiz.course?.instructor?.id !== user.id) {
        throw new Error('FORBIDDEN_COURSE_OWNER');
      }
    }

    // Delete associated quiz-results first
    await strapi.db.query('api::quiz-result.quiz-result').deleteMany({
      where: { quiz: quiz.id },
    });

    // Delete the quiz
    await strapi.documents('api::quiz.quiz').delete({
      documentId: quiz.documentId,
    });

    return { id: quiz.id, documentId: quiz.documentId };
  },
}));
