'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { FeaturedRepository, getRandomFeaturedRepositories } from '@/lib/github';
import { db } from '@/lib/firebase';
import { useSwipeable } from 'react-swipeable';
import Link from 'next/link';

export default function CommunityPage() {
  const [repositories, setRepositories] = useState<FeaturedRepository[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    loadRepositories();
  }, []);

  async function loadRepositories() {
    try {
      const repos = await getRandomFeaturedRepositories(db);
      setRepositories(repos);
      setLoading(false);
    } catch (error) {
      console.error('Error loading repositories:', error);
      setLoading(false);
    }
  }

  const visibleRepos = repositories.slice(currentIndex, currentIndex + 3);

  function handleStar() {
    setSwipeDirection('right');
    const repo = repositories[currentIndex];
    if (repo) {
      window.open(repo.html_url, '_blank');
    }
    setTimeout(() => {
      handleNext();
      setSwipeDirection(null);
    }, 200);
  }

  function handleSwipe() {
    setSwipeDirection('left');
    setTimeout(() => {
      handleNext();
      setSwipeDirection(null);
    }, 200);
  }

  function handleNext() {
    if (currentIndex >= repositories.length - 1) {
      loadRepositories();
      setCurrentIndex(0);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
    setOffset(0);
  }

  const handlers = useSwipeable({
    onSwiping: (event) => {
      setIsDragging(true);
      setOffset(event.deltaX);
    },
    onSwipedLeft: () => {
      setIsDragging(false);
      if (Math.abs(offset) > 100) {
        handleSwipe();
      } else {
        setOffset(0);
      }
    },
    onSwipedRight: () => {
      setIsDragging(false);
      if (Math.abs(offset) > 100) {
        handleStar();
      } else {
        setOffset(0);
      }
    },
    trackMouse: true,
    trackTouch: true,
  });

  const getCardStyle = (index: number) => {
    const isTopCard = index === 0;
    const baseScale = 1 - index * 0.05;
    
    if (!isTopCard) {
      const tiltAngle = index === 1 ? -5 : 5;
      return `translateY(-${index * 12}px) translateX(-${index * 4}px) scale(${baseScale}) rotate(${tiltAngle}deg)`;
    }

    if (swipeDirection === 'left') {
      return 'translate-x-[-200%] rotate-[-20deg] opacity-0';
    }
    if (swipeDirection === 'right') {
      return 'translate-x-[200%] rotate-[20deg] opacity-0';
    }
    if (isDragging) {
      const rotate = offset * 0.1;
      return `translateX(${offset}px) rotate(${rotate}deg)`;
    }
    return `translateY(0) scale(${baseScale})`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-pink-100 via-red-50 to-pink-50">
        <div className="text-3xl font-[Dancing_Script] text-pink-600 animate-pulse">
          Finding featured repositories... 💝
        </div>
      </div>
    );
  }

  if (repositories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-100 via-red-50 to-pink-50 p-8">
        <h1 className="font-[Dancing_Script] text-5xl text-pink-600 mb-8">
          Community Picks 💝
        </h1>
        <div className="text-center space-y-6">
          <p className="text-xl text-gray-600">
            No featured repositories yet!
          </p>
          <Button
            variant="outline"
            asChild
            className="bg-white/90 hover:bg-white"
          >
            <Link href="/featured">
              Feature Some Repositories 💖
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-100 via-red-50 to-pink-50 overflow-hidden font-[Quicksand]">
      <div className="absolute top-4 right-4 z-50">
        <div className="flex gap-2">
          <Button
            variant="outline"
            asChild
            className="bg-white/90 hover:bg-white"
          >
            <Link href="/featured">
              Feature More 💝
            </Link>
          </Button>
          <Button
            variant="outline"
            asChild
            className="bg-white/90 hover:bg-white"
          >
            <Link href="/">
              Popular Repos
            </Link>
          </Button>
        </div>
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] opacity-30 animate-spin-slow">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-4 h-4 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                transform: `rotate(${i * 30}deg) translateY(-40vh)`,
              }}
            >
              {i % 2 === 0 ? '💝' : '⭐️'}
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-between min-h-screen p-8 md:p-12 lg:p-24">
        <div className="w-full max-w-4xl mx-auto text-center space-y-4">
          <h1 className="font-[Dancing_Script] text-5xl md:text-6xl lg:text-7xl text-pink-600 mb-2 drop-shadow-lg">
            Community Picks 💝
          </h1>
          <p className="text-pink-500 text-xl md:text-2xl tracking-wide">
            Discover repositories featured by the community!
          </p>
        </div>

        <div className="relative w-full max-w-lg h-[600px] my-8">
          {visibleRepos.map((repo, index) => (
            <div
              key={repo.id}
              {...(index === 0 ? handlers : {})}
              className={`absolute top-0 left-0 w-full ${
                index === 0 ? 'touch-none z-30' : index === 1 ? 'z-20' : 'z-10'
              }`}
            >
              <Card 
                className={`w-full bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-200 
                  ${index === 0 ? 'cursor-grab active:cursor-grabbing' : ''} 
                  border border-pink-200 hover:border-pink-300`}
                style={{
                  transform: getCardStyle(index),
                  opacity: 1 - index * 0.1,
                }}
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-24 w-24 ring-2 ring-pink-200 ring-offset-2">
                      <img
                        src={repo.owner.avatar_url}
                        alt={repo.owner.login}
                        className="rounded-full"
                      />
                    </Avatar>
                  </div>
                  <div className="group relative inline-flex items-center justify-center">
                    <h2 className="text-2xl font-semibold text-gray-800 break-words">
                      {repo.name}
                    </h2>
                    <button 
                      onClick={() => window.open(repo.html_url, '_blank')}
                      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      aria-label="View repository on GitHub"
                    >
                      <span className="text-pink-500 hover:text-pink-600">🔗</span>
                    </button>
                  </div>
                  <p className="font-[Dancing_Script] text-xl text-pink-500">
                    by {repo.owner.login}
                  </p>
                </CardHeader>
                <CardContent className="px-6">
                  <p className="text-gray-600 text-center text-lg">
                    {repo.description || 'No description available'}
                  </p>
                  <div className="mt-6 flex justify-center space-x-4">
                    <span className="text-sm bg-pink-50 px-4 py-2 rounded-full border border-pink-200">
                      ⭐ {repo.stargazers_count.toLocaleString()}
                    </span>
                    {repo.language && (
                      <span className="text-sm bg-pink-50 px-4 py-2 rounded-full border border-pink-200">
                        {repo.language}
                      </span>
                    )}
                  </div>
                </CardContent>
                {index === 0 && (
                  <CardFooter className="flex justify-center space-x-6 pt-6">
                    <Button
                      variant="outline"
                      className="bg-pink-50 hover:bg-pink-100 border-pink-200 hover:border-pink-300 
                        text-base px-10 py-6 rounded-full shadow-sm
                        transition-all duration-200 hover:shadow-md"
                      onClick={handleSwipe}
                    >
                      Skip 💔
                    </Button>
                    <Button
                      className="bg-pink-500 hover:bg-pink-600 text-white 
                        text-base px-10 py-6 rounded-full shadow-sm
                        transition-all duration-200 hover:shadow-md"
                      onClick={handleStar}
                    >
                      View 💖
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          ))}
        </div>

        <div className="font-[Dancing_Script] text-center text-pink-600 text-xl md:text-2xl">
          Swipe right to view ⭐️, left to skip 💔
        </div>
      </div>
    </main>
  );
} 