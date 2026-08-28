'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useCourses } from '@/hooks/queries/useCourses';
import { useBlogPosts } from '@/hooks/queries/useBlog';
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

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const [activeCategory, setActiveCategory] = useState('all');

  const { data: allCourses = [] } = useCourses();
  const { data: allPosts = [] } = useBlogPosts();

  const courses = allCourses.slice(0, 6);
  const posts = allPosts.slice(0, 3);
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
