export class Octokit {
  rest = {
    repos: {
      get: jest.fn(),
      listBranches: jest.fn(),
      getCommit: jest.fn(),
      listCommits: jest.fn(),
    },
  };
}
