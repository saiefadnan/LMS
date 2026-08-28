import type { Core } from '@strapi/strapi';

/**
 * Demo Data Seeder
 * Populates realistic demo users, courses, lessons, quizzes, blog posts,
 * student enrollments, and quiz results so the platform looks 100% authentic
 * for video walkthroughs and demonstrations.
 */
export async function seedDemoData(strapi: Core.Strapi) {
  try {
    // Check if demo user already exists to prevent duplicate seeding
    const existingDemoUser = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { username: 'daniel_student' },
    });

    if (existingDemoUser) {
      strapi.log.info('Demo seed data already present in database. Skipping demo seeder.');
      return;
    }

    strapi.log.info('Seeding realistic platform demo data for video walkthrough...');

    // 2. Fetch system roles
    const studentRole = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'student' } });
    const instructorRole = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'instructor' } });
    const managerRole = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'content_manager' } });

    if (!studentRole || !instructorRole || !managerRole) {
      strapi.log.warn('Roles missing for demo seeder.');
      return;
    }

    // Helper to create user if username doesn't exist
    const createUser = async (username: string, email: string, roleId: number) => {
      let existing = await strapi.db.query('plugin::users-permissions.user').findOne({ where: { username } });
      if (!existing) {
        existing = await strapi.plugin('users-permissions').service('user').add({
          username,
          email,
          password: 'password123',
          confirmed: true,
          blocked: false,
          role: roleId,
        });
        strapi.log.info(`Created demo user: ${username} (${email})`);
      }
      return existing;
    };

    // Create Demo Users
    const studentDaniel = await createUser('daniel_student', 'daniel@example.com', studentRole.id);
    const studentElena = await createUser('elena_student', 'elena@example.com', studentRole.id);
    const studentMarcus = await createUser('marcus_student', 'marcus@example.com', studentRole.id);
    const instructorRobert = await createUser('prof_robert', 'robert@example.com', instructorRole.id);
    const instructorMaya = await createUser('dr_maya', 'maya@example.com', instructorRole.id);
    const managerAlex = await createUser('editorial_alex', 'alex@example.com', managerRole.id);

    // 3. Create Demo Courses with Lessons & Quizzes

    // Course 1: Data Structures & C Memory Algorithms
    const course1 = await strapi.db.query('api::course.course').create({
      data: {
        title: 'Data Structures & C Memory Algorithms',
        description: 'Master pointers, dynamic memory allocation (malloc/free), linked lists, binary search trees, and time complexity analysis in C.',
        category: 'Programming',
        level: 'Intermediate',
        instructor: instructorRobert.id,
        publishedAt: new Date(),
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      },
    });

    await strapi.db.query('api::lesson.lesson').create({
      data: {
        title: 'Pointers & Memory Address Inspection',
        content: 'Pointers store the memory address of another variable. In C, we use `&` to get the address and `*` to dereference the pointer and access the underlying value.',
        order: 1,
        course: course1.id,
        publishedAt: new Date(),
      },
    });

    await strapi.db.query('api::lesson.lesson').create({
      data: {
        title: 'Dynamic Allocation: malloc, calloc & free',
        content: 'Dynamic memory allocation allows programs to request heap memory at runtime. Always remember to call `free()` to prevent memory leaks!',
        videoUrl: 'https://www.youtube.com/watch?v=zuegQmMdy8M',
        order: 2,
        course: course1.id,
        publishedAt: new Date(),
      },
    });

    await strapi.db.query('api::lesson.lesson').create({
      data: {
        title: 'Binary Search Trees & Traversal',
        content: 'Binary Search Trees (BST) maintain sorted order where left child nodes are smaller than the parent node and right child nodes are larger.',
        order: 3,
        course: course1.id,
        publishedAt: new Date(),
      },
    });

    const quiz1 = await strapi.db.query('api::quiz.quiz').create({
      data: {
        title: 'C Memory & Pointer Assessment',
        course: course1.id,
        questions: [
          {
            id: 'q1',
            text: 'Which C standard library function frees dynamically allocated heap memory?',
            options: ['dealloc()', 'free()', 'delete()', 'release()'],
            correctIndex: 1,
          },
          {
            id: 'q2',
            text: 'What operator is used to obtain the memory address of a variable in C?',
            options: ['*', '&', '->', '%'],
            correctIndex: 1,
          },
          {
            id: 'q3',
            text: 'What is the average time complexity of lookup in a balanced Binary Search Tree?',
            options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
            correctIndex: 2,
          },
        ],
        publishedAt: new Date(),
      },
    });

    // Course 2: Modern Web Architecture with React & Next.js
    const course2 = await strapi.db.query('api::course.course').create({
      data: {
        title: 'Modern Web Architecture with React & Next.js',
        description: 'Build scalable full-stack applications using Next.js App Router, React Server Components, Tailwind CSS, and Zustand state management.',
        category: 'Web Development',
        level: 'Advanced',
        instructor: instructorMaya.id,
        publishedAt: new Date(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
    });

    await strapi.db.query('api::lesson.lesson').create({
      data: {
        title: 'React Server Components vs Client Components',
        content: 'Server Components render exclusively on the server and send zero client JS bundle size. Client Components enable interactive hooks like useState and useEffect.',
        order: 1,
        course: course2.id,
        publishedAt: new Date(),
      },
    });

    await strapi.db.query('api::lesson.lesson').create({
      data: {
        title: 'Global State Management & Optimistic UI Updates',
        content: 'Zustand provides lightweight, un-opinionated state stores. Optimistic updates provide instant user feedback before backend confirmation.',
        videoUrl: 'https://www.youtube.com/watch?v=zuegQmMdy8M',
        order: 2,
        course: course2.id,
        publishedAt: new Date(),
      },
    });

    const quiz2 = await strapi.db.query('api::quiz.quiz').create({
      data: {
        title: 'React & Next.js Architecture Quiz',
        course: course2.id,
        questions: [
          {
            id: 'q1',
            text: 'What directive marks a component as a Client Component in Next.js App Router?',
            options: ['"use client"', '"client side"', '"use react"', '"import client"'],
            correctIndex: 0,
          },
          {
            id: 'q2',
            text: 'Which rendering strategy executes on the server and sends HTML without client JS?',
            options: ['Client Component', 'Server Component', 'Service Worker', 'Shadow DOM'],
            correctIndex: 1,
          },
        ],
        publishedAt: new Date(),
      },
    });

    // Course 3: Database Systems & SQL Performance Tuning
    const course3 = await strapi.db.query('api::course.course').create({
      data: {
        title: 'Database Systems & SQL Performance Tuning',
        description: 'Design relational database schemas, write complex SQL queries, create B-tree indexes, and optimize transaction performance.',
        category: 'Data Science',
        level: 'Intermediate',
        instructor: instructorRobert.id,
        publishedAt: new Date(),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    });

    await strapi.db.query('api::lesson.lesson').create({
      data: {
        title: 'Relational Schema Normalization (1NF to 3NF)',
        content: 'Normalization eliminates data redundancy and guarantees data integrity by splitting tables according to functional dependencies.',
        order: 1,
        course: course3.id,
        publishedAt: new Date(),
      },
    });

    const quiz3 = await strapi.db.query('api::quiz.quiz').create({
      data: {
        title: 'SQL Schema & Indexing Quiz',
        course: course3.id,
        questions: [
          {
            id: 'q1',
            text: 'Which SQL index data structure accelerates equality and range query lookups in PostgreSQL?',
            options: ['B-Tree', 'Linked Array', 'Hash Stack', 'Binary Heap'],
            correctIndex: 0,
          },
        ],
        publishedAt: new Date(),
      },
    });

    // 4. Create Demo Blog Posts
    await strapi.db.query('api::blog-post.blog-post').create({
      data: {
        title: 'Why C Memory Management Still Matters in Modern High-Performance Systems',
        body: 'Even in an era dominated by garbage-collected languages like Python, Java, and JavaScript, understanding manual memory allocation in C remains indispensable for systems engineering, database kernels, and embedded programming.\n\nWhen you allocate memory on the heap using malloc(), the operating system allocates a block of bytes and returns a memory pointer. If you neglect to invoke free(), that block remains reserved until process termination—leading to severe memory leaks.\n\nMastering pointers equips developers with direct insight into hardware architecture, stack frames, and cache locality.',
        coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800',
        status: 'published',
        author: instructorRobert.id,
        publishedAt: new Date(),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    });

    await strapi.db.query('api::blog-post.blog-post').create({
      data: {
        title: 'Top 5 Software Engineering Patterns Every Developer Should Master in 2026',
        body: 'Design patterns represent battle-tested solutions to recurring software architectural challenges.\n\n1. State Management Pattern: Decoupling UI presentation from persistent data stores.\n2. Repository Pattern: Abstracting data layer persistence behind clean interface contracts.\n3. Observer Pattern: Reactive event dispatching between decoupled system components.\n4. Factory Pattern: Encapsulating complex object creation logic.\n5. Middleware Pattern: Intercepting and decorating request processing pipelines.',
        coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800',
        status: 'published',
        author: managerAlex.id,
        publishedAt: new Date(),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    });

    await strapi.db.query('api::blog-post.blog-post').create({
      data: {
        title: 'How Auto-Graded MCQ Assessments Accelerate Technical Knowledge Retention',
        body: 'Immediate assessment feedback is one of the most effective pedagogical strategies in technical computer science education.\n\nWhen students take multiple-choice quizzes immediately following a reading module, active recall mechanisms reinforce neural connections, resulting in up to 40% higher retention compared to passive reading.',
        coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800',
        status: 'published',
        author: instructorMaya.id,
        publishedAt: new Date(),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    });

    // 5. Create Demo Enrollments & Student Quiz Results

    // Student Daniel enrolls in Course 1 & Course 2
    await strapi.db.query('api::enrollment.enrollment').create({
      data: {
        student: studentDaniel.id,
        course: course1.id,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    });

    await strapi.db.query('api::enrollment.enrollment').create({
      data: {
        student: studentDaniel.id,
        course: course2.id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    });

    // Student Elena enrolls in Course 1
    await strapi.db.query('api::enrollment.enrollment').create({
      data: {
        student: studentElena.id,
        course: course1.id,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    });

    // Student Marcus enrolls in Course 3
    await strapi.db.query('api::enrollment.enrollment').create({
      data: {
        student: studentMarcus.id,
        course: course3.id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    });

    // Daniel's Quiz Attempts
    await strapi.db.query('api::quiz-result.quiz-result').create({
      data: {
        student: studentDaniel.id,
        quiz: quiz1.id,
        score: 3,
        totalQuestions: 3,
        passed: true,
        answers: { q1: 1, q2: 1, q3: 2 },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    });

    await strapi.db.query('api::quiz-result.quiz-result').create({
      data: {
        student: studentDaniel.id,
        quiz: quiz2.id,
        score: 2,
        totalQuestions: 2,
        passed: true,
        answers: { q1: 0, q2: 1 },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    });

    // Elena's Quiz Attempt
    await strapi.db.query('api::quiz-result.quiz-result').create({
      data: {
        student: studentElena.id,
        quiz: quiz1.id,
        score: 3,
        totalQuestions: 3,
        passed: true,
        answers: { q1: 1, q2: 1, q3: 2 },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    });

    // Marcus's Quiz Attempt
    await strapi.db.query('api::quiz-result.quiz-result').create({
      data: {
        student: studentMarcus.id,
        quiz: quiz3.id,
        score: 1,
        totalQuestions: 1,
        passed: true,
        answers: { q1: 0 },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    });

    strapi.log.info('Successfully seeded realistic platform demo data for video walkthrough!');
  } catch (err) {
    strapi.log.error('Error in seedDemoData:', err);
  }
}
