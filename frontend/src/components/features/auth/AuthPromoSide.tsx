'use client';

import React from 'react';

interface AuthPromoSideProps {
  imageSrc: string;
  imageAlt: string;
  badgeText: string;
  badgeBgColor?: string;
  title: string;
  description: string;
}

export function AuthPromoSide({
  imageSrc,
  imageAlt,
  badgeText,
  badgeBgColor = 'bg-brand-500/90',
  title,
  description,
}: AuthPromoSideProps) {
  return (
    <div className="hidden lg:block lg:w-1/2 relative bg-surface-900 dark:bg-surface-800 animate-slide-right overflow-hidden group">
      <img
        src={imageSrc}
        alt={imageAlt}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-surface-950/85 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
        <span
          className={`px-3 py-1 ${badgeBgColor} text-white text-xs font-semibold rounded-full w-fit mb-2 backdrop-blur-xs shadow-xs`}
        >
          {badgeText}
        </span>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-xs text-surface-200 mt-1">{description}</p>
      </div>
    </div>
  );
}
