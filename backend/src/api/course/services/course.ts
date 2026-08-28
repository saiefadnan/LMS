import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::course.course', ({ strapi }) => ({
  /**
   * Create course with auto-assigned instructor.
   */
  async createCourse(user: any, courseData: any) {
    const safeData = { ...courseData };
    delete safeData.instructor;

    const course = await strapi.documents('api::course.course').create({
      data: {
        ...safeData,
        instructor: user.id,
      },
      populate: ['instructor'],
    });

    return course;
  },

  /**
   * Safe Cascade Delete for Courses, clearing enrollments, progresses, lessons, quiz-results, quizzes, and course.
   */
  async cascadeDeleteCourse(user: any, roleType: string, idOrDocId: string) {
    const isNumeric = /^\d+$/.test(String(idOrDocId));
    const course = await strapi.db.query('api::course.course').findOne({
      where: isNumeric ? { $or: [{ documentId: String(idOrDocId) }, { id: Number(idOrDocId) }] } : { documentId: String(idOrDocId) },
      populate: ['instructor', 'lessons', 'quizzes'],
    });

    if (!course) {
      throw new Error('NOT_FOUND');
    }

    const isAuthorized =
      roleType === 'admin' ||
      roleType === 'content_manager' ||
      course.instructor?.id === user.id;

    if (!isAuthorized) {
      throw new Error('FORBIDDEN_COURSE_OWNER');
    }

    // 1. Delete enrollments for this course
    await strapi.db.query('api::enrollment.enrollment').deleteMany({
      where: { course: course.id },
    });

    // 2. Delete lessons and their student progresses
    const lessonIds = (course.lessons || []).map((l: any) => l.id);
    if (lessonIds.length > 0) {
      await strapi.db.query('api::progress.progress').deleteMany({
        where: { lesson: { $in: lessonIds } },
      });
      await strapi.db.query('api::lesson.lesson').deleteMany({
        where: { id: { $in: lessonIds } },
      });
    }

    // 3. Delete quizzes and their student quiz-results
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

    return { id: course.id, documentId: course.documentId };
  },

  /**
   * Fetch courses for instructor or all courses for managers/admins.
   */
  async getMyCourses(user: any, roleType: string) {
    const isGlobalManager = roleType === 'admin' || roleType === 'content_manager';

    return await strapi.db.query('api::course.course').findMany({
      where: isGlobalManager ? {} : { instructor: { id: user.id } },
      populate: ['instructor', 'lessons', 'enrollments'],
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Fetch student roster and calculated progress percentages for a specific course.
   */
  async getCourseStudentProgress(user: any, roleType: string, documentId: string, query: any = {}) {
    const course = await strapi.db.query('api::course.course').findOne({
      where: { documentId },
      populate: ['instructor', 'lessons', 'quizzes'],
    });

    if (!course) {
      throw new Error('NOT_FOUND');
    }

    const isAuthorized =
      roleType === 'admin' ||
      roleType === 'content_manager' ||
      course.instructor?.id === user.id;

    if (!isAuthorized) {
      throw new Error('FORBIDDEN_COURSE_OWNER');
    }

    const page = Math.max(1, parseInt(query.page as string) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize as string) || 10));
    const search = ((query.search as string) || '').trim().toLowerCase();

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

    return {
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
