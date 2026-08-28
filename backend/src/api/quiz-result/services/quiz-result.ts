import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::quiz-result.quiz-result', ({ strapi }) => ({
  /**
   * Submit and persist an auto-graded assessment result for a student.
   */
  async submitQuizResult(userId: number, payload: any) {
    const quizId = payload.quiz;
    if (!quizId) {
      throw new Error('Quiz ID is required.');
    }

    const isNumeric = /^\d+$/.test(String(quizId));
    const quiz = await strapi.db.query('api::quiz.quiz').findOne({
      where: isNumeric ? { id: Number(quizId) } : { documentId: String(quizId) },
    });

    if (!quiz) {
      throw new Error('Quiz not found.');
    }

    const result = await strapi.documents('api::quiz-result.quiz-result').create({
      data: {
        score: payload.score,
        totalQuestions: payload.totalQuestions,
        percentage: payload.percentage,
        answers: payload.answers,
        passed: Boolean(payload.passed),
        student: userId,
        quiz: quiz.id,
      },
      populate: {
        quiz: {
          populate: {
            course: true,
          },
        },
        student: {
          fields: ['id', 'username', 'email'],
        },
      },
    });

    return result;
  },

  /**
   * Role-aware retrieval of assessment results.
   * Admins & Managers see all; Instructors see their course results; Students see their own.
   */
  async getQuizResultsForUser(userId: number, roleType: string) {
    let filters: any = {};

    if (roleType === 'admin' || roleType === 'content_manager') {
      filters = {};
    } else if (roleType === 'instructor') {
      filters = {
        quiz: {
          course: {
            instructor: { id: userId },
          },
        },
      };
    } else {
      filters = {
        student: { id: userId },
      };
    }

    return await strapi.documents('api::quiz-result.quiz-result').findMany({
      filters,
      populate: {
        quiz: {
          populate: {
            course: true,
          },
        },
        student: {
          fields: ['id', 'username', 'email'],
        },
      },
      sort: 'createdAt:desc',
    });
  },

  /**
   * Role-authorized single assessment result lookup.
   */
  async getQuizResultById(userId: number, roleType: string, documentId: string) {
    const result = await strapi.documents('api::quiz-result.quiz-result').findOne({
      documentId,
      populate: {
        quiz: {
          populate: {
            course: {
              populate: ['instructor'],
            },
          },
        },
        student: {
          fields: ['id', 'username', 'email'],
        },
      },
    });

    if (!result) {
      return null;
    }

    if (roleType === 'admin' || roleType === 'content_manager') {
      return result;
    }

    if (roleType === 'instructor') {
      if ((result.quiz as any)?.course?.instructor?.id !== userId) {
        throw new Error('FORBIDDEN');
      }
      return result;
    }

    if ((result.student as any)?.id !== userId) {
      throw new Error('FORBIDDEN');
    }

    return result;
  },
}));
