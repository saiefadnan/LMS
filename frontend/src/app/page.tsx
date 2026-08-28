'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { LandingHero } from '@/components/features/landing/LandingHero';
import { FeaturedCoursesSection } from '@/components/features/landing/FeaturedCoursesSection';
import { AboutSection } from '@/components/features/landing/AboutSection';
import { CommunityStatsSection } from '@/components/features/landing/CommunityStatsSection';
import { InstructorsSection } from '@/components/features/landing/InstructorsSection';
import { TestimonialsSection } from '@/components/features/landing/TestimonialsSection';
import { LatestNewsSection } from '@/components/features/landing/LatestNewsSection';
import { CallToActionBanner } from '@/components/features/landing/CallToActionBanner';
import { getCourses, getBlogPosts } from '@/lib/api';
import { type Course, type BlogPost } from '@/types';

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

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col font-sans transition-colors duration-150">
      <Navbar />
      <LandingHero user={user} />
      <FeaturedCoursesSection
        courses={courses}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        categories={categories}
      />
      <AboutSection />
      <CommunityStatsSection />
      <InstructorsSection />
      <TestimonialsSection />
      <LatestNewsSection posts={posts} />
      <CallToActionBanner />
      <Footer />
    </div>
  );
}
