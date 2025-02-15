'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import Image from 'next/image';

export default function TopNav() {
  const { user, signInWithGithub, signOutUser } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/40 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-end items-center h-12">
          {user ? (
            <div className="flex items-center gap-2 py-2">
              <Image
                src={user.photoURL || ''}
                alt={user.displayName || 'User'}
                width={32}
                height={32}
                className="rounded-full"
              />
              <Button
                variant="ghost"
                size="sm"
                className="text-pink-600 hover:text-pink-700 hover:bg-pink-50/50 h-7 px-2 text-sm"
                onClick={signOutUser}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-pink-600 hover:text-pink-700 hover:bg-pink-50/50 h-7 px-2 text-sm py-2"
              onClick={signInWithGithub}
            >
              Sign in with GitHub
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
} 