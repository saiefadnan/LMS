'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Footer } from '@/components/ui/Footer';
import { getCourses, getBlogPosts } from '@/lib/api';
import { type Course, type BlogPost } from '@/types';
import {
  BookOpen,
  GraduationCap,
  Award,
  Users,
  Star,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Globe,
  Clock,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const [courses, setCourses] = useState<Course[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    async function loadLandingData() {
      try {
        const [coursesRes, blogRes] = await Promise.all([
          getCourses().catch(() => ({ data: [] })),
          getBlogPosts().catch(() => ({ data: [] })),
        ]);
        setCourses((coursesRes.data || []).slice(0, 6));
        setPosts((blogRes.data || []).slice(0, 3));
      } catch (err) {
        console.error('Failed to load landing data:', err);
      }
    }
    loadLandingData();
  }, []);

  const categories = ['all', 'programming', 'web development', 'data science'];

  const filteredCourses = courses.filter((c) => {
    if (activeCategory === 'all') return true;
    return (c.category || '').toLowerCase().includes(activeCategory);
  });

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col font-sans transition-colors duration-150">
      {/* 1. Header / Navbar */}
      <nav className="bg-white/90 dark:bg-surface-900/90 backdrop-blur-md border-b border-surface-200 dark:border-surface-800 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Logo size="md" href="/" />
              <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
                <Link
                  href="/courses"
                  className="text-surface-600 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Browse Catalog
                </Link>
                <Link
                  href="/blog"
                  className="text-surface-600 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Blog & News
                </Link>
                <a
                  href="#about"
                  className="text-surface-600 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Why LearnHub
                </a>
                <a
                  href="#instructors"
                  className="text-surface-600 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Instructors
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <ThemeToggle size="sm" />
              {user ? (
                <Link href="/dashboard">
                  <Button variant="primary" size="sm" className="cursor-pointer font-bold">
                    Dashboard →
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="hidden sm:block">
                    <Button variant="ghost" size="sm" className="cursor-pointer">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm" className="cursor-pointer font-bold">
                      Get Started Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-900 text-brand-700 dark:text-brand-300 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>Next-Gen Engineering & Tech Education</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-surface-900 dark:text-surface-50 tracking-tight leading-[1.15]">
                Education that <br className="hidden sm:inline" />
                prepares you for <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-teal-500 to-amber-500">
                  what's next.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-surface-600 dark:text-surface-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Build real-world software engineering, computer science, and technical skills with industry experts through interactive curriculum and auto-graded assessments.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link href="/courses">
                  <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12 gap-2 cursor-pointer font-bold shadow-md">
                    <span>Explore Catalog</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                {!user && (
                  <Link href="/register">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 h-12 cursor-pointer">
                      Join For Free
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Right Hero Image Panel with Floating Stats Badge */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border border-surface-200 dark:border-surface-800 bg-surface-900 group">
                <img
                  src="/login_student_realistic.jpg"
                  alt="Student learning on laptop in university library"
                  className="w-full h-[420px] sm:h-[480px] object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Floating Success Rate Badge */}
                <div className="absolute top-6 left-6 bg-white/95 dark:bg-surface-900/95 backdrop-blur-md border border-surface-200 dark:border-surface-700 p-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce [animation-duration:3s]">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-lg">
                    ★
                  </div>
                  <div>
                    <span className="text-lg font-black text-surface-900 dark:text-surface-50">98%</span>
                    <p className="text-[11px] font-bold text-surface-500 dark:text-surface-400">Course Pass Rate</p>
                  </div>
                </div>

                {/* Floating Certificate Badge Bottom */}
                <div className="absolute bottom-6 right-6 bg-white/95 dark:bg-surface-900/95 backdrop-blur-md border border-surface-200 dark:border-surface-700 p-3.5 rounded-2xl shadow-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-surface-900 dark:text-surface-50">Verified Certificates</span>
                    <p className="text-[11px] text-surface-500 dark:text-surface-400">Shareable & Career Ready</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Value Proposition Feature Cards Below Hero */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-xs space-y-3 group hover:border-brand-300 dark:hover:border-brand-700 transition-all">
              <span className="text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest">01. Quality</span>
              <h3 className="text-lg font-bold text-surface-900 dark:text-surface-50 group-hover:text-brand-600 transition-colors">
                Expert-Led Curriculum
              </h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                Handcrafted lessons designed by active software architects, systems engineers, and senior educators.
              </p>
            </div>

            <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-xs space-y-3 group hover:border-brand-300 dark:hover:border-brand-700 transition-all">
              <span className="text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest">02. Flexibility</span>
              <h3 className="text-lg font-bold text-surface-900 dark:text-surface-50 group-hover:text-brand-600 transition-colors">
                Self-Paced Learning
              </h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                Access interactive lesson readers, code walkthroughs, and auto-graded MCQ quizzes 24/7 on any device.
              </p>
            </div>

            <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-xs space-y-3 group hover:border-brand-300 dark:hover:border-brand-700 transition-all">
              <span className="text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest">03. Outcome</span>
              <h3 className="text-lg font-bold text-surface-900 dark:text-surface-50 group-hover:text-brand-600 transition-colors">
                Verified Credentials
              </h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                Earn recognized course certificates and track your detailed progress across lessons and assessments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Popular Course Catalog Section */}
      <section className="py-16 bg-white dark:bg-surface-900 border-y border-surface-200 dark:border-surface-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Explore Programs</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-surface-900 dark:text-surface-50 tracking-tight">
              Find your perfect program
            </h2>
            <p className="text-sm text-surface-500 dark:text-surface-400">
              Browse top-rated technical courses across computer science, web development, and algorithms.
            </p>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
                  }`}
                >
                  {cat === 'all' ? 'All Courses' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-surface-50 dark:bg-surface-950 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                >
                  <div className="relative aspect-video bg-surface-200 dark:bg-surface-800 overflow-hidden">
                    <img
                      src={
                        typeof course.thumbnail === 'string'
                          ? course.thumbnail
                          : (course.thumbnail as any)?.url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800'
                      }
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-surface-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize">
                      {course.level || 'Beginner'}
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs text-surface-500 dark:text-surface-400 mb-2">
                        <span className="capitalize font-semibold text-brand-600 dark:text-brand-400">{course.category || 'Engineering'}</span>
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>4.9</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-surface-900 dark:text-surface-100 text-lg group-hover:text-brand-600 dark:hover:text-brand-400 transition-colors line-clamp-2">
                        {course.title}
                      </h3>

                      <p className="text-xs text-surface-500 dark:text-surface-400 mt-2 line-clamp-2 leading-relaxed">
                        {course.description || 'Learn essential concepts, master practical skills, and build projects.'}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-surface-200 dark:border-surface-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-surface-500 dark:text-surface-400 font-medium">
                        <BookOpen className="w-4 h-4 text-surface-400" />
                        <span>{course.lessons?.length || 0} Lessons</span>
                      </div>

                      <Link href={`/courses/${course.documentId}`}>
                        <Button size="sm" variant="secondary" className="gap-1 text-xs cursor-pointer font-semibold">
                          <span>Enroll Now</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              /* Fallback Static Cards if database is loading/empty */
              [
                { title: 'Data Structures & C Algorithms', level: 'Beginner', category: 'Programming', lessons: 8 },
                { title: 'Full-Stack Web Development with React', level: 'Intermediate', category: 'Web Dev', lessons: 12 },
                { title: 'Database Architecture & SQL Queries', level: 'Advanced', category: 'Data Science', lessons: 10 },
              ].map((c, i) => (
                <div key={i} className="bg-surface-50 dark:bg-surface-950 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-xs p-6 space-y-4">
                  <span className="text-xs font-bold text-brand-600 uppercase">{c.category}</span>
                  <h3 className="font-bold text-surface-900 dark:text-surface-100 text-lg">{c.title}</h3>
                  <p className="text-xs text-surface-500 dark:text-surface-400">Master fundamental skills with guided interactive modules.</p>
                  <Link href="/courses">
                    <Button size="sm" variant="secondary" className="w-full">Explore Course</Button>
                  </Link>
                </div>
              ))
            )}
          </div>

          <div className="mt-12 text-center">
            <Link href="/courses">
              <Button size="lg" variant="outline" className="px-8 font-bold cursor-pointer gap-2">
                <span>Browse All Courses ({courses.length}+)</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. "Ways We Can Help" / About Us Section */}
      <section id="about" className="py-20 bg-surface-50 dark:bg-surface-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Image */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-3xl overflow-hidden border border-surface-200 dark:border-surface-800 shadow-xl bg-surface-900">
                <img
                  src="/register_graduation_realistic.jpg"
                  alt="Graduate celebrating on campus"
                  className="w-full h-[400px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-emerald-600 text-white p-4 rounded-2xl shadow-xl hidden sm:flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 shrink-0" />
                <div>
                  <p className="text-sm font-bold">100% Accredited</p>
                  <p className="text-[11px] text-emerald-100">Industry Recognized</p>
                </div>
              </div>
            </div>

            {/* Right Benefits List */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">About LearnHub</span>
              <h2 className="text-3xl sm:text-4xl font-black text-surface-900 dark:text-surface-50 tracking-tight">
                Ways we can help you succeed
              </h2>
              <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
                Whether you're starting your engineering career, switching industries, or mastering new tech stacks, LearnHub provides structured pathways designed for real outcomes.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3 p-4 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 shadow-2xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-surface-900 dark:text-surface-100 text-sm">Personalized Learning Dashboard</h4>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">Track your lesson completion rates, resume interrupted modules, and review quiz scores in real-time.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 shadow-2xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-surface-900 dark:text-surface-100 text-sm">Interactive Auto-Graded Assessments</h4>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">Test your understanding with instant multiple-choice quizzes that evaluate your concept mastery.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 shadow-2xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-surface-900 dark:text-surface-100 text-sm">Role-Based Multi-Dashboard Access</h4>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">Seamless workflows for Students, Instructors, Content Managers, and System Admins.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/courses">
                  <Button size="lg" className="px-8 font-bold cursor-pointer gap-2">
                    <span>Explore Platform</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Building A Lifelong Community Stats Banner */}
      <section className="py-16 bg-gradient-to-r from-brand-700 via-brand-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-10">
            Building a lifelong learning community
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="space-y-1">
              <span className="text-4xl sm:text-5xl font-black">1.5M+</span>
              <p className="text-xs sm:text-sm font-semibold text-brand-100 uppercase tracking-wider">Active Students Worldwide</p>
            </div>

            <div className="space-y-1">
              <span className="text-4xl sm:text-5xl font-black">98%</span>
              <p className="text-xs sm:text-sm font-semibold text-brand-100 uppercase tracking-wider">Completion & Pass Rate</p>
            </div>

            <div className="space-y-1">
              <span className="text-4xl sm:text-5xl font-black">350+</span>
              <p className="text-xs sm:text-sm font-semibold text-brand-100 uppercase tracking-wider">Expert Instructors</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Meet Our Experts / Instructors Section */}
      <section id="instructors" className="py-20 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Instructors</span>
            <h2 className="text-3xl font-extrabold text-surface-900 dark:text-surface-50 tracking-tight">
              Meet our experts
            </h2>
            <p className="text-sm text-surface-500 dark:text-surface-400">
              Learn directly from accomplished computer science faculty and software leaders.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface-50 dark:bg-surface-950 p-5 rounded-2xl border border-surface-200 dark:border-surface-800 text-center space-y-3 group hover:border-brand-300 dark:hover:border-brand-700 transition-all">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-2 border-brand-500 shadow-md">
                <img src="/instructor_1_realistic.jpg" alt="Dr. Robert Chen" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div>
                <h4 className="font-bold text-surface-900 dark:text-surface-100 text-base">Dr. Robert Chen</h4>
                <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold">Algorithms & Systems Lead</p>
              </div>
            </div>

            <div className="bg-surface-50 dark:bg-surface-950 p-5 rounded-2xl border border-surface-200 dark:border-surface-800 text-center space-y-3 group hover:border-brand-300 dark:hover:border-brand-700 transition-all">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-2 border-brand-500 shadow-md">
                <img src="/instructor_2_realistic.jpg" alt="Maya Lin" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div>
                <h4 className="font-bold text-surface-900 dark:text-surface-100 text-base">Maya Lin</h4>
                <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold">Full-Stack Architect</p>
              </div>
            </div>

            <div className="bg-surface-50 dark:bg-surface-950 p-5 rounded-2xl border border-surface-200 dark:border-surface-800 text-center space-y-3 group hover:border-brand-300 dark:hover:border-brand-700 transition-all">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-2 border-brand-500 shadow-md">
                <img src="/student_graduation_hero.jpg" alt="Alex Vance" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div>
                <h4 className="font-bold text-surface-900 dark:text-surface-100 text-base">Alex Vance</h4>
                <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold">Database & Backend Specialist</p>
              </div>
            </div>

            <div className="bg-surface-50 dark:bg-surface-950 p-5 rounded-2xl border border-surface-200 dark:border-surface-800 text-center space-y-3 group hover:border-brand-300 dark:hover:border-brand-700 transition-all">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-2 border-brand-500 shadow-md">
                <img src="/lms_hero_illustration.jpg" alt="Sarah Jenkins" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div>
                <h4 className="font-bold text-surface-900 dark:text-surface-100 text-base">Sarah Jenkins</h4>
                <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold">UI/UX Product Director</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Student Testimonials Section */}
      <section className="py-20 bg-surface-50 dark:bg-surface-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl font-extrabold text-surface-900 dark:text-surface-50 tracking-tight">
              What our students say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-xs space-y-4">
              <div className="flex text-amber-500 gap-1 text-sm">
                ★★★★★
              </div>
              <p className="text-xs text-surface-600 dark:text-surface-300 leading-relaxed italic">
                "LearnHub helped me master C pointers and memory allocation within 2 weeks! The auto-graded quizzes ensured I actually understood the concepts."
              </p>
              <div className="pt-2 flex items-center gap-3 border-t border-surface-100 dark:border-surface-800">
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                  D
                </div>
                <div>
                  <p className="font-bold text-surface-900 dark:text-surface-100 text-xs">Daniel K.</p>
                  <p className="text-[10px] text-surface-400">Software Engineer Student</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-xs space-y-4">
              <div className="flex text-amber-500 gap-1 text-sm">
                ★★★★★
              </div>
              <p className="text-xs text-surface-600 dark:text-surface-300 leading-relaxed italic">
                "As an instructor, creating lessons and adding MCQ quizzes was so smooth. Being able to track student completion rates in real-time is fantastic!"
              </p>
              <div className="pt-2 flex items-center gap-3 border-t border-surface-100 dark:border-surface-800">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                  E
                </div>
                <div>
                  <p className="font-bold text-surface-900 dark:text-surface-100 text-xs">Elena R.</p>
                  <p className="text-[10px] text-surface-400">Computer Science Educator</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-xs space-y-4">
              <div className="flex text-amber-500 gap-1 text-sm">
                ★★★★★
              </div>
              <p className="text-xs text-surface-600 dark:text-surface-300 leading-relaxed italic">
                "The dark theme and sleek dashboard interface make studying late at night super comfortable. Highly recommended!"
              </p>
              <div className="pt-2 flex items-center gap-3 border-t border-surface-100 dark:border-surface-800">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center">
                  M
                </div>
                <div>
                  <p className="font-bold text-surface-900 dark:text-surface-100 text-xs">Marcus T.</p>
                  <p className="text-[10px] text-surface-400">Full-Stack Learner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Latest News & Blog Section */}
      <section className="py-20 bg-white dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Publications</span>
              <h2 className="text-3xl font-extrabold text-surface-900 dark:text-surface-50 tracking-tight mt-1">
                Stay updated with our news and blog
              </h2>
            </div>
            <Link href="/blog">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold cursor-pointer">
                <span>View All Articles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-surface-50 dark:bg-surface-950 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                >
                  <div className="relative aspect-video bg-surface-200 dark:bg-surface-800 overflow-hidden">
                    <img
                      src={
                        typeof post.coverImage === 'string'
                          ? post.coverImage
                          : (post.coverImage as any)?.url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800'
                      }
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-surface-400 mb-2">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="text-brand-600 font-semibold">{post.author?.username || 'Editorial'}</span>
                      </div>
                      <h3 className="font-bold text-surface-900 dark:text-surface-100 text-base group-hover:text-brand-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </div>

                    <Link href={`/blog/${post.documentId}`}>
                      <span className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1 group-hover:underline">
                        Read Article →
                      </span>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              [
                { title: 'Why C Memory Management Still Matters in Modern Systems', date: '8/27/2026' },
                { title: 'Top 5 Tech Skills to Learn for 2026 Career Growth', date: '8/26/2026' },
                { title: 'How Auto-Graded MCQ Quizzes Boost Knowledge Retention', date: '8/25/2026' },
              ].map((b, i) => (
                <div key={i} className="bg-surface-50 dark:bg-surface-950 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 space-y-3">
                  <span className="text-[11px] text-surface-400">{b.date}</span>
                  <h3 className="font-bold text-surface-900 dark:text-surface-100 text-sm">{b.title}</h3>
                  <Link href="/blog">
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400">Read Article →</span>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 9. Final Conversion CTA Callout */}
      <section className="py-16 bg-gradient-to-r from-brand-600 via-teal-600 to-brand-700 dark:from-brand-900 dark:via-brand-800 dark:to-brand-900 text-white relative overflow-hidden transition-colors border-y border-brand-500/20 dark:border-brand-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white dark:text-surface-50">
            Finding Your Right Course Today
          </h2>
          <p className="text-brand-100 dark:text-surface-300 text-sm max-w-xl mx-auto leading-relaxed font-medium">
            Join thousands of learners and instructors advancing engineering skills on LearnHub LMS.
          </p>
          <div>
            <Link href="/courses">
              <Button size="lg" variant="outline" className="px-8 font-extrabold text-base h-12 cursor-pointer shadow-md bg-white text-surface-900 hover:bg-surface-50 dark:bg-brand-600 dark:text-white dark:hover:bg-brand-500 border border-surface-200 dark:border-brand-500">
                Get Started Now →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <Footer />
    </div>
  );
}
