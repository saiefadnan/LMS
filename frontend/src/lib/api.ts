/**
 * API helper for communicating with the Strapi backend.
 * 
 * All requests go through this module so we have one place to:
 * - Set the base URL
 * - Attach the JWT token from localStorage
 * - Handle errors consistently
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

/**
 * Generic fetch wrapper for Strapi API calls.
 * Automatically attaches JWT if available.
 */
export async function fetchAPI(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Attach JWT token if it exists in localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('jwt');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, mergedOptions);

  // If the response is not ok, throw an error with the message from Strapi
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData?.error?.message || `API error: ${response.status}`;
    throw new Error(message);
  }

  // Some endpoints (like DELETE) may return no content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// ─── Auth helpers ───────────────────────────────────────────────

export async function loginUser(identifier: string, password: string) {
  const data = await fetchAPI('/api/auth/local', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });

  // Store the JWT in localStorage
  if (data.jwt) {
    localStorage.setItem('jwt', data.jwt);
  }

  return data;
}

export async function registerUser(
  username: string,
  email: string,
  password: string,
  role: string = 'student'
) {
  const data = await fetchAPI('/api/auth/local/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password, role }),
  });

  // Store the JWT in localStorage
  if (data.jwt) {
    localStorage.setItem('jwt', data.jwt);
  }

  return data;
}

export async function getMe() {
  return fetchAPI('/api/users/me?populate=role');
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jwt');
  }
}

// ─── Course helpers ─────────────────────────────────────────────

export async function getCourses(query: string = '') {
  return fetchAPI(`/api/courses?populate=*${query ? `&${query}` : ''}`);
}

export async function getCourse(documentId: string) {
  return fetchAPI(`/api/courses/${documentId}?populate=*`);
}

export async function createCourse(data: any) {
  return fetchAPI('/api/courses', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

export async function updateCourse(documentId: string, data: any) {
  return fetchAPI(`/api/courses/${documentId}`, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
}

export async function deleteCourse(documentId: string) {
  return fetchAPI(`/api/courses/${documentId}`, {
    method: 'DELETE',
  });
}

// ─── Lesson helpers ─────────────────────────────────────────────

export async function getLessons(courseDocumentId: string) {
  return fetchAPI(
    `/api/lessons?filters[course][documentId][$eq]=${courseDocumentId}&populate=*&sort=order:asc`
  );
}

export async function getLesson(documentId: string) {
  return fetchAPI(`/api/lessons/${documentId}?populate=*`);
}

export async function createLesson(data: any) {
  return fetchAPI('/api/lessons', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

export async function updateLesson(documentId: string, data: any) {
  return fetchAPI(`/api/lessons/${documentId}`, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
}

export async function deleteLesson(documentId: string) {
  return fetchAPI(`/api/lessons/${documentId}`, {
    method: 'DELETE',
  });
}

// ─── Enrollment helpers ─────────────────────────────────────────

export async function enrollInCourse(courseId: number) {
  return fetchAPI('/api/enrollments', {
    method: 'POST',
    body: JSON.stringify({ data: { course: courseId } }),
  });
}

export async function getMyEnrollments() {
  return fetchAPI('/api/enrollments?populate=course&filters[student][id][$eq]=me');
}

// ─── Progress helpers ───────────────────────────────────────────

export async function markLessonComplete(lessonId: number, courseId: number) {
  return fetchAPI('/api/progresses', {
    method: 'POST',
    body: JSON.stringify({
      data: { lesson: lessonId, course: courseId, completed: true },
    }),
  });
}

export async function getMyProgress(courseDocumentId: string) {
  return fetchAPI(
    `/api/progresses?filters[course][documentId][$eq]=${courseDocumentId}&filters[student][id][$eq]=me&populate=lesson`
  );
}

// ─── Quiz helpers ───────────────────────────────────────────────

export async function getQuiz(documentId: string) {
  return fetchAPI(`/api/quizzes/${documentId}?populate=*`);
}

export async function submitQuizResult(data: any) {
  return fetchAPI('/api/quiz-results', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

// ─── Blog helpers ───────────────────────────────────────────────

export async function getBlogPosts(query: string = '') {
  return fetchAPI(`/api/blog-posts?populate=*&sort=publishedAt:desc${query ? `&${query}` : ''}`);
}

export async function getBlogPost(documentId: string) {
  return fetchAPI(`/api/blog-posts/${documentId}?populate=*`);
}

export async function createBlogPost(data: any) {
  return fetchAPI('/api/blog-posts', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

export async function updateBlogPost(documentId: string, data: any) {
  return fetchAPI(`/api/blog-posts/${documentId}`, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
}

// ─── Admin helpers ──────────────────────────────────────────────

export async function getAllUsers() {
  return fetchAPI('/api/users?populate=role');
}

export async function updateUserRole(userId: number, roleId: number) {
  return fetchAPI(`/api/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ role: roleId }),
  });
}
