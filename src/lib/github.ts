import { Octokit } from 'octokit';

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

export async function getRandomRepositories(accessToken?: string | null, count: number = 10): Promise<Repository[]> {
  const octokit = new Octokit({
    auth: accessToken,
  });

  try {
    const response = await octokit.request('GET /search/repositories', {
      q: 'stars:>1000',
      sort: 'stars',
      order: 'desc',
      per_page: 100,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (!response.data.items) {
      throw new Error('No repositories found');
    }

    const repos = response.data.items;
    const shuffled = repos.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return [];
  }
}

export async function starRepository(accessToken: string, owner: string, repo: string): Promise<boolean> {
  const octokit = new Octokit({
    auth: accessToken,
  });

  try {
    await octokit.request('PUT /user/starred/{owner}/{repo}', {
      owner,
      repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    return true;
  } catch (error) {
    console.error('Error starring repository:', error);
    return false;
  }
} 