'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 backdrop-blur-md bg-white/60 border-t border-pink-100">
      <div className="max-w-xl mx-auto flex justify-center gap-2">
        <Button
          variant={pathname === '/' ? 'default' : 'outline'}
          asChild
          className={`flex-1 max-w-40 ${
            pathname === '/' 
              ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-lg' 
              : 'bg-white/80 hover:bg-white border-pink-200'
          }`}
        >
          <Link href="/">
            Popular ⭐️
          </Link>
        </Button>
        <Button
          variant={pathname === '/community' ? 'default' : 'outline'}
          asChild
          className={`flex-1 max-w-40 ${
            pathname === '/community'
              ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-lg'
              : 'bg-white/80 hover:bg-white border-pink-200'
          }`}
        >
          <Link href="/community">
            Community 💝
          </Link>
        </Button>
        <Button
          variant={pathname === '/featured' ? 'default' : 'outline'}
          asChild
          className={`flex-1 max-w-40 ${
            pathname === '/featured'
              ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-lg'
              : 'bg-white/80 hover:bg-white border-pink-200'
          }`}
        >
          <Link href="/featured">
            Feature 💖
          </Link>
        </Button>
      </div>
    </div>
  );
} 