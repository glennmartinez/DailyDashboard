const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export const githubService = {
  async fetchProjectItems(): Promise<ProjectData> {
    // Implement GitHub API call here
    // This is a mock implementation
    return {
      items: [
        {
          id: '1',
          title: 'Implement new feature',
          status: { name: 'In Progress' },
          assignees: {
            nodes: [
              {
                login: 'user1',
                avatarUrl: 'https://github.com/user1.png'
              }
            ]
          }
        }
      ]
    };
  }
}; 