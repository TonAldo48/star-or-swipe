'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  // Don't show navigation on the home page as it has its own
  if (pathname === '/') return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-pink-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link 
            href="/"
            className="font-[Dancing_Script] text-2xl text-pink-600 hover:text-pink-700 transition-colors"
          >
            Star or Swipe 💝
          </Link>

          <div className="flex items-center gap-4">
            {pathname !== '/community' && (
              <Button
                variant="outline"
                asChild
                className="bg-white/90 hover:bg-white"
              >
                <Link href="/community">
                  Community Picks 💝
                </Link>
              </Button>
            )}
            {pathname !== '/featured' && (
              <Button
                variant="outline"
                asChild
                className="bg-white/90 hover:bg-white"
              >
                <Link href="/featured">
                  Manage Featured 💖
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 