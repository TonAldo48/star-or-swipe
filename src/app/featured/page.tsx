'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Repository, getUserRepositories, updateFeaturedRepository, getFeaturedRepositories } from '@/lib/github';
import { db } from '@/lib/firebase';
import { Avatar } from '@/components/ui/avatar';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

export default function FeaturedPage() {
  const [username, setUsername] = useState('');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [featuredRepos, setFeaturedRepos] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeaturedRepositories();
  }, []);

  async function loadRepositories(username: string) {
    setLoading(true);
    setError(null);
    try {
      const repos = await getUserRepositories(username);
      if (repos.length === 0) {
        setError('No repositories found for this username.');
      }
      setRepositories(repos);
    } catch (error) {
      console.error('Error loading repositories:', error);
      setError('Failed to load repositories. Please check the username and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function loadFeaturedRepositories() {
    try {
      const featured = await getFeaturedRepositories(db);
      setFeaturedRepos(new Set(featured.map(repo => repo.id)));
    } catch (error) {
      console.error('Error loading featured repositories:', error);
    }
  }

  async function toggleFeatured(repository: Repository) {
    const newFeatured = !featuredRepos.has(repository.id);
    try {
      await updateFeaturedRepository(db, repository, newFeatured);
      
      if (newFeatured) {
        setFeaturedRepos(prev => new Set([...prev, repository.id]));
      } else {
        setFeaturedRepos(prev => {
          const next = new Set(prev);
          next.delete(repository.id);
          return next;
        });
      }
    } catch (error) {
      console.error('Error updating featured status:', error);
      setError('Failed to update featured status.');
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (username.trim()) {
      loadRepositories(username.trim());
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-100 via-red-50 to-pink-50 overflow-hidden font-[Quicksand] pb-24">
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-8">
        <div className="w-full text-center space-y-4 mb-8 sm:mb-12">
          <h1 className="font-[Dancing_Script] text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-pink-600 mb-2 drop-shadow-lg">
            Featured Repositories
          </h1>
          <p className="text-pink-500 text-lg sm:text-xl md:text-2xl tracking-wide">
            Feature your favorite repositories!
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter GitHub username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white/90"
              />
              <Button 
                type="submit"
                disabled={loading || !username.trim()}
                className="bg-pink-500 hover:bg-pink-600 text-white"
              >
                {loading ? 'Loading...' : 'Search'}
              </Button>
            </div>
          </form>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>

        {repositories.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {repositories.map((repo) => (
              <Card 
                key={repo.id}
                className={`bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 
                  ${featuredRepos.has(repo.id) ? 'ring-2 ring-pink-400 ring-offset-4 ring-offset-pink-50' : ''}`}
              >
                <CardHeader className="pb-2 sm:pb-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-pink-200 ring-offset-2">
                      <img
                        src={repo.owner.avatar_url}
                        alt={repo.owner.login}
                        className="rounded-full"
                      />
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                        {repo.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500">
                        by {repo.owner.login}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2 sm:pb-4">
                  <p className="text-sm sm:text-base text-gray-600 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
                    {repo.description || 'No description available'}
                  </p>
                  <div className="flex flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4">
                    <span className="text-xs sm:text-sm bg-pink-50 px-2 sm:px-3 py-1 rounded-full border border-pink-200">
                      ⭐ {repo.stargazers_count.toLocaleString()}
                    </span>
                    {repo.language && (
                      <span className="text-xs sm:text-sm bg-pink-50 px-2 sm:px-3 py-1 rounded-full border border-pink-200">
                        {repo.language}
                      </span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-2 sm:pt-4">
                  <div className="flex gap-2 sm:gap-3 w-full">
                    <Button
                      variant={featuredRepos.has(repo.id) ? "default" : "outline"}
                      onClick={() => toggleFeatured(repo)}
                      className={`flex-1 text-sm sm:text-base ${
                        featuredRepos.has(repo.id) 
                          ? 'bg-pink-500 hover:bg-pink-600 text-white' 
                          : 'border-pink-200 hover:border-pink-300'
                      }`}
                    >
                      {featuredRepos.has(repo.id) ? 'Featured 💝' : 'Feature this 💖'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open(repo.html_url, '_blank')}
                      className="px-3 sm:px-4 border-pink-200 hover:border-pink-300"
                    >
                      🔗
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 