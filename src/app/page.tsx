'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Repository, getRandomRepositories } from '@/lib/github';
import { useSwipeable } from 'react-swipeable';
import { playRandomKissSound, playPopSound, playSwooshSound, markUserInteraction } from '@/lib/audio';
import { useAuth } from '@/lib/auth';
import { Octokit } from 'octokit';
import { fireLoveConfetti } from '@/lib/confetti';
import { addToSwipeHistory, hasBeenSwiped } from '@/lib/swipe-history';

export default function Home() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState(0);
  const { user, signInWithGithub } = useAuth();

  const loadRepositories = useCallback(async () => {
    try {
      const octokit = new Octokit();
      let repos = await getRandomRepositories(octokit);
      // Filter out repositories that have been swiped before
      repos = repos.filter(repo => !hasBeenSwiped(repo.id, user?.uid));
      setRepositories(repos);
      setLoading(false);
    } catch (error) {
      console.error('Error loading repositories:', error);
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadRepositories();
    if (user?.githubAccessToken) {
      // Get user's starred repos when they log in
      const octokit = new Octokit({
        auth: user.githubAccessToken,
      });
      
      const fetchStarredRepos = async () => {
        try {
          const { data: starred } = await octokit.request('GET /user/starred');
        } catch (error) {
          console.error('Error fetching starred repos:', error);
        }
      };

      fetchStarredRepos();
    }
  }, [user, loadRepositories]);

  const visibleRepos = repositories.slice(currentIndex, currentIndex + 3);

  async function handleStar() {
    markUserInteraction();
    if (!user?.githubAccessToken) {
      // If not logged in, show a message or trigger login
      return;
    }

    setSwipeDirection('right');
    const repo = repositories[currentIndex];
    if (repo) {
      try {
        const octokit = new Octokit({
          auth: user.githubAccessToken,
        });

        await octokit.request('PUT /user/starred/{owner}/{repo}', {
          owner: repo.owner.login,
          repo: repo.name,
        });

        playRandomKissSound();
        fireLoveConfetti();
        addToSwipeHistory(repo.id, user.uid);
      } catch (error) {
        console.error('Error starring repository:', error);
      }
    }
    setTimeout(() => {
      handleNext();
      setSwipeDirection(null);
    }, 200);
  }

  function handleSwipe() {
    markUserInteraction();
    setSwipeDirection('left');
    playPopSound();
    const repo = repositories[currentIndex];
    if (repo) {
      addToSwipeHistory(repo.id, user?.uid);
    }
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
      markUserInteraction();
      if (Math.abs(event.deltaX) > 50) {
        playSwooshSound();
      }
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
        if (!user?.githubAccessToken) {
          // If not logged in, trigger login
          signInWithGithub();
          setOffset(0);
          return;
        }
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
          Finding lovely repositories... 💝
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-100 via-red-50 to-pink-50 overflow-hidden font-[Quicksand] pb-24">
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
            Star or Swipe 💝
          </h1>
          <p className="text-pink-500 text-xl md:text-2xl tracking-wide">
            Find your next favorite repository!
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
                      ⭐ {(repo.stargazers_count || 0).toLocaleString()}
                    </span>
                    {repo.language && (
                      <span className="text-sm bg-pink-50 px-4 py-2 rounded-full border border-pink-200">
                        {repo.language}
                      </span>
                    )}
                  </div>
                </CardContent>
                {index === 0 && (
                  <CardFooter className="flex flex-col gap-2 pt-4">
                    <div className="flex justify-center space-x-4 w-full">
                      <Button
                        variant="outline"
                        className="bg-pink-50 hover:bg-pink-100 border-pink-200 hover:border-pink-300 
                          text-base px-8 py-4 rounded-full shadow-sm
                          transition-all duration-200 hover:shadow-md"
                        onClick={handleSwipe}
                      >
                        Skip 💔
                      </Button>
                      <Button
                        className="bg-pink-500 hover:bg-pink-600 text-white 
                          text-base px-8 py-4 rounded-full shadow-sm
                          transition-all duration-200 hover:shadow-md"
                        onClick={handleStar}
                      >
                        Star 💖
                      </Button>
                    </div>
                    <Button
                      variant="link"
                      className="text-pink-500 hover:text-pink-600 h-8 px-2"
                      onClick={() => window.open(repo.html_url, '_blank')}
                    >
                      View on GitHub 🔗
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          ))}
        </div>

        <div className="font-[Dancing_Script] text-center text-pink-600 text-xl md:text-2xl">
          Swipe right to star ⭐️, left to skip 💔
        </div>
      </div>
    </main>
  );
}
