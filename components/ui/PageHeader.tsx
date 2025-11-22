'use client';

import React from 'react';
import Image from 'next/image';
import { StatusBar } from '@/components/layout/StatusBar';

interface PageHeaderProps {
  title: string;
  description?: string;
  imageSrc: string;
  imageAlt: string;
  minHeight?: string;
  showStatusBar?: boolean;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  imageSrc,
  imageAlt,
  minHeight = 'min-h-[60vh]',
  showStatusBar = true,
  children
}: PageHeaderProps) {
  return (
    <section className={`relative ${minHeight} flex items-center justify-center overflow-hidden`}>
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
          style={{
            objectPosition: '50% 50%' // Centre both horizontally and vertically
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
          {title}
        </h1>
        
        {showStatusBar && <StatusBar />}
        
        {description && (
          <p className="text-xl md:text-2xl text-white/90 mt-6 max-w-3xl mx-auto">
            {description}
          </p>
        )}
        
        {children}
      </div>
    </section>
  );
}