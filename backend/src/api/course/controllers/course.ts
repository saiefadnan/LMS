/**
 * course controller
 * 
 * Extends the default Strapi controller.
 * Auto-sets the instructor relation to the authenticated user on create.
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::course.course', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to create a course.');
    }

    // Remove instructor from body if frontend sent it (Strapi v5 rejects relation keys)
    if (ctx.request.body?.data?.instructor) {
      delete ctx.request.body.data.instructor;
    }

    // Let default Strapi controller handle the create
    const response = await super.create(ctx);

    // Now set the instructor relation via the Document Service (server-side)
    if (response?.data?.documentId) {
      await strapi.documents('api::course.course').update({
        documentId: response.data.documentId,
        data: {
          instructor: user.id,
        },
      });
    }

    return response;
  },

  /**
   * Safe Cascade Delete for Courses
   */
  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in.');
    }

    const { id } = ctx.params;
    const documentId = id;

    // Find course first
    const isNumeric = /^\d+$/.test(String(documentId));
    const course = await strapi.db.query('api::course.course').findOne({
      where: isNumeric ? { $or: [{ documentId }, { id: Number(documentId) }] } : { documentId },
      populate: ['instructor', 'lessons', 'quizzes'],
    });

    if (!course) {
      return ctx.notFound('Course not found');
    }

    const roleType =
      user.role?.type ||
      (
        await strapi.db.query('plugin::users-permissions.user').findOne({
          where: { id: user.id },
          populate: ['role'],
        })
      )?.role?.type;

    const isAuthorized =
      roleType === 'admin' ||
      roleType === 'content_manager' ||
      course.instructor?.id === user.id;

    if (!isAuthorized) {
      return ctx.forbidden('You can only delete your own courses.');
    }

    // Cascade delete related records so PostgreSQL foreign key constraints don't fail
    try {
      // 1. Delete enrollments for this course
      await strapi.db.query('api::enrollment.enrollment').deleteMany({
        where: { course: course.id },
      });

      // 2. Delete lessons and their progresses
      const lessonIds = (course.lessons || []).map((l: any) => l.id);
      if (lessonIds.length > 0) {
        await strapi.db.query('api::progress.progress').deleteMany({
          where: { lesson: { $in: lessonIds } },
        });
        await strapi.db.query('api::lesson.lesson').deleteMany({
          where: { id: { $in: lessonIds } },
        });
      }

      // 3. Delete quizzes and quiz-results
      const quizIds = (course.quizzes || []).map((q: any) => q.id);
      if (quizIds.length > 0) {
        await strapi.db.query('api::quiz-result.quiz-result').deleteMany({
          where: { quiz: { $in: quizIds } },
        });
        await strapi.db.query('api::quiz.quiz').deleteMany({
          where: { id: { $in: quizIds } },
        });
      }

      // 4. Delete the course itself
      await strapi.db.query('api::course.course').delete({
        where: { id: course.id },
      });

      return ctx.send({ data: { id: course.id, documentId: course.documentId } });
    } catch (err: any) {
      strapi.log.error('Failed to delete course:', err);
      return ctx.internalServerError(err.message || 'Failed to delete course');
    }
  },

  /**
   * Custom action: returns courses. For admins and content managers, returns all courses. For instructors, returns own courses.
   */
  async findMyCourses(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    const roleType =
      user.role?.type ||
      (
        await strapi.db.query('plugin::users-permissions.user').findOne({
          where: { id: user.id },
          populate: ['role'],
        })
      )?.role?.type;

    const isGlobalManager = roleType === 'admin' || roleType === 'content_manager';

    const courses = await strapi.db.query('api::course.course').findMany({
      where: isGlobalManager ? {} : { instructor: { id: user.id } },
      populate: ['instructor', 'lessons', 'enrollments'],
      orderBy: { createdAt: 'desc' },
    });

    ctx.body = { data: courses };
  },

  /**
   * Custom action: returns all enrolled students and their detailed lesson & quiz progress for this course.
   */
  async getCourseStudentProgress(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    const { documentId } = ctx.params;
    const course = await strapi.db.query('api::course.course').findOne({
      where: { documentId },
      populate: ['instructor', 'lessons', 'quizzes'],
    });

    if (!course) {
      return ctx.notFound('Course not found');
    }

    const roleType =
      user.role?.type ||
      (
        await strapi.db.query('plugin::users-permissions.user').findOne({
          where: { id: user.id },
          populate: ['role'],
        })
      )?.role?.type;

    const isAuthorized =
      roleType === 'admin' ||
      roleType === 'content_manager' ||
      course.instructor?.id === user.id;

    if (!isAuthorized) {
      return ctx.forbidden('You can only view student progress for your own courses.');
    }

    const page = Math.max(1, parseInt(ctx.query.page as string) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(ctx.query.pageSize as string) || 10));
    const search = ((ctx.query.search as string) || '').trim().toLowerCase();

    // Get all enrollments for this course
    const allEnrollments = await strapi.db.query('api::enrollment.enrollment').findMany({
      where: { course: { documentId } },
      populate: ['student'],
      orderBy: { createdAt: 'desc' },
    });

    let filteredEnrollments = allEnrollments.filter((e: any) => e.student);
    if (search) {
      filteredEnrollments = filteredEnrollments.filter((e: any) =>
        e.student?.username?.toLowerCase().includes(search) ||
        e.student?.email?.toLowerCase().includes(search)
      );
    }

    const total = filteredEnrollments.length;
    const pageCount = Math.ceil(total / pageSize) || 1;
    const offset = (page - 1) * pageSize;
    const paginatedEnrollments = filteredEnrollments.slice(offset, offset + pageSize);

    const lessonIds = (course.lessons || []).map((l: any) => l.id);
    const quizIds = (course.quizzes || []).map((q: any) => q.id);

    // Compute progress for paginated students
    const studentProgressList = await Promise.all(
      paginatedEnrollments.map(async (enrollment: any) => {
        const student = enrollment.student;
        if (!student) return null;

        let completedLessonsCount = 0;
        if (lessonIds.length > 0) {
          const progresses = await strapi.db.query('api::progress.progress').findMany({
            where: {
              student: { id: student.id },
              lesson: { id: { $in: lessonIds } },
              completed: true,
            },
          });
          completedLessonsCount = progresses.length;
        }

        let quizResults: any[] = [];
        if (quizIds.length > 0) {
          quizResults = await strapi.db.query('api::quiz-result.quiz-result').findMany({
            where: {
              student: { id: student.id },
              quiz: { id: { $in: quizIds } },
            },
            populate: ['quiz'],
          });
        }

        const totalLessons = course.lessons?.length || 0;
        const progressPercentage =
          totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

        return {
          student: {
            id: student.id,
            username: student.username,
            email: student.email,
          },
          enrolledAt: enrollment.enrolledAt || enrollment.createdAt,
          completedLessonsCount,
          totalLessons,
          progressPercentage,
          quizResults: quizResults.map((qr: any) => ({
            id: qr.id,
            quizTitle: qr.quiz?.title || 'Quiz',
            score: qr.score,
            totalQuestions: qr.totalQuestions,
            passed: qr.passed,
            percentage: qr.totalQuestions > 0 ? Math.round((qr.score / qr.totalQuestions) * 100) : 0,
          })),
        };
      })
    );

    ctx.body = {
      course: {
        documentId: course.documentId,
        title: course.title,
        totalLessons: course.lessons?.length || 0,
        totalQuizzes: course.quizzes?.length || 0,
      },
      pagination: {
        page,
        pageSize,
        total,
        pageCount,
      },
      students: studentProgressList.filter(Boolean),
    };
  },
}));
