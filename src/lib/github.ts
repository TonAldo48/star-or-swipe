import { Octokit } from 'octokit';
import { collection, getDocs, doc, setDoc, deleteDoc, Firestore } from 'firebase/firestore';
import { getRandomItems } from '@/lib/utils';

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

export interface FeaturedRepository extends Repository {
  featured: boolean;
  featuredAt: string;
}

export async function getRandomRepositories(octokit: Octokit, count: number = 10): Promise<Repository[]> {
  try {
    const { data } = await octokit.request('GET /search/repositories', {
      q: 'stars:>1000',
      sort: 'stars',
      order: 'desc',
      per_page: 100,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    return getRandomItems(data.items as Repository[], count);
  } catch (error) {
    console.error('Error fetching random repositories:', error);
    throw error;
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

export async function getFeaturedRepositories(octokit: Octokit, count: number = 10): Promise<Repository[]> {
  try {
    const { data } = await octokit.request('GET /search/repositories', {
      q: 'stars:>10000',
      sort: 'stars',
      order: 'desc',
      per_page: count,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    return data.items as Repository[];
  } catch (error) {
    console.error('Error fetching featured repositories:', error);
    throw error;
  }
}

export async function updateFeaturedRepository(
  db: Firestore,
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

export async function getRandomFeaturedRepositories(db: Firestore): Promise<FeaturedRepository[]> {
  try {
    const featuredReposRef = collection(db, 'featuredRepositories');
    const snapshot = await getDocs(featuredReposRef);
    const repos = snapshot.docs.map(doc => doc.data() as FeaturedRepository);
    return getRandomItems(repos, 10);
  } catch (error) {
    console.error('Error fetching random featured repositories:', error);
    return [];
  }
}

export async function starRepository(octokit: Octokit, owner: string, repo: string): Promise<void> {
  try {
    await octokit.request('PUT /user/starred/{owner}/{repo}', {
      owner,
      repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
  } catch (error) {
    console.error('Error starring repository:', error);
    throw error;
  }
}

export async function unstarRepository(octokit: Octokit, owner: string, repo: string): Promise<void> {
  try {
    await octokit.request('DELETE /user/starred/{owner}/{repo}', {
      owner,
      repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
  } catch (error) {
    console.error('Error unstarring repository:', error);
    throw error;
  }
} 