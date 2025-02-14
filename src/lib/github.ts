import { Octokit } from 'octokit';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  language: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export async function getRandomRepositories(count: number = 10): Promise<Repository[]> {
  const octokit = new Octokit();

  try {
    // Get popular repositories
    const { data } = await octokit.request('GET /search/repositories', {
      q: 'stars:>1000',
      sort: 'stars',
      order: 'desc',
      per_page: 100,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (!data.items) {
      throw new Error('No repositories found');
    }

    // Convert GitHub API response to our Repository type
    const popularRepos = data.items.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description ?? '',
      html_url: repo.html_url,
      stargazers_count: repo.stargazers_count,
      language: repo.language ?? '',
      owner: {
        login: repo.owner?.login ?? '',
        avatar_url: repo.owner?.avatar_url ?? '',
      },
    }));
    
    // Shuffle and slice
    const shuffled = popularRepos.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return [];
  }
}

export async function getUserRepositories(username: string): Promise<Repository[]> {
  const octokit = new Octokit();

  try {
    const { data } = await octokit.request('GET /users/{username}/repos', {
      username,
      sort: 'updated',
      per_page: 100,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    return data.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description ?? '',
      html_url: repo.html_url,
      stargazers_count: repo.stargazers_count ?? 0,
      language: repo.language ?? '',
      owner: {
        login: repo.owner?.login ?? '',
        avatar_url: repo.owner?.avatar_url ?? '',
      },
    }));
  } catch (error) {
    console.error('Error fetching user repositories:', error);
    return [];
  }
}

export interface FeaturedRepository extends Repository {
  featured: boolean;
  featuredAt: string;
}

export async function getFeaturedRepositories(db: any): Promise<FeaturedRepository[]> {
  try {
    const featuredReposRef = collection(db, 'featuredRepositories');
    const snapshot = await getDocs(featuredReposRef);
    return snapshot.docs.map(doc => doc.data() as FeaturedRepository);
  } catch (error) {
    console.error('Error fetching featured repositories:', error);
    return [];
  }
}

export async function updateFeaturedRepository(
  db: any,
  repository: Repository,
  featured: boolean
): Promise<void> {
  try {
    const featuredReposRef = collection(db, 'featuredRepositories');
    const repoDoc = doc(featuredReposRef, `${repository.id}`);

    if (featured) {
      await setDoc(repoDoc, {
        ...repository,
        featured: true,
        featuredAt: new Date().toISOString(),
      });
    } else {
      await deleteDoc(repoDoc);
    }
  } catch (error) {
    console.error('Error updating featured repository:', error);
    throw error;
  }
}

export async function getRandomFeaturedRepositories(db: any, count: number = 10): Promise<FeaturedRepository[]> {
  try {
    const featured = await getFeaturedRepositories(db);
    
    // Shuffle and slice
    const shuffled = featured.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  } catch (error) {
    console.error('Error fetching random featured repositories:', error);
    return [];
  }
} 