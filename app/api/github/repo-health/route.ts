import { NextResponse } from "next/server";
import { subDays, format } from "date-fns";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const CODECOV_TOKEN = process.env.CODECOV_TOKEN;

if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is not set");
}

if (!CODECOV_TOKEN) {
  throw new Error("CODECOV_TOKEN environment variable is not set");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const branch = searchParams.get("branch") || "main";

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Owner and repo parameters are required" },
      { status: 400 }
    );
  }

  const query = `
    query($owner: String!, $repo: String!, $branch: String!) {
      repository(owner: $owner, name: $repo) {
        ref(qualifiedName: $branch) {
          target {
            ... on Commit {
              history(first: 30) {
                nodes {
                  committedDate
                  statusCheckRollup {
                    state
                    contexts(first: 100) {
                      nodes {
                        ... on CheckRun {
                          name
                          status
                          conclusion
                          startedAt
                          completedAt
                          url
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    console.log("Sending GraphQL request with variables:", {
      owner,
      repo,
      branch,
    });

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { owner, repo, branch },
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error("GraphQL Errors:", data.errors);
      const errorMessage = data.errors.map((e) => e.message).join(", ");
      return NextResponse.json(
        { error: `GitHub API Error: ${errorMessage}` },
        { status: 500 }
      );
    }

    const repoData = data.data.repository;
    const commits = repoData.ref.target.history.nodes;

    // Process commit history for activity data
    const commitActivity = [];

    for (let i = 0; i < 7; i++) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd");
      const count = commits.filter(
        (commit) =>
          format(new Date(commit.committedDate), "yyyy-MM-dd") === date
      ).length;
      commitActivity.unshift({ date, count });
    }

    // Process workflow runs and test data
    const checkRuns = commits
      .flatMap((commit) => commit.statusCheckRollup?.contexts.nodes || [])
      .filter(
        (run) => run && run.name && run.name.toLowerCase().includes("test")
      );

    const totalTests = checkRuns.length;
    const passedTests = checkRuns.filter(
      (run) => run.conclusion === "SUCCESS"
    ).length;
    const failedTests = totalTests - passedTests;

    // Verify Codecov API access and fetch repository data
    console.log(`Fetching Codecov repository data...`);
    const codecovResponse = await fetch(
      `https://api.codecov.io/api/v2/github/${owner}/repos/${repo}`,
      {
        headers: {
          Authorization: `Bearer ${CODECOV_TOKEN}`,
          Accept: "application/json",
        },
      }
    );

    if (!codecovResponse.ok) {
      const errorText = await codecovResponse.text();
      console.error("Codecov API Error Response:", errorText);
      console.error("Status:", codecovResponse.status);
      console.error(
        "Full URL:",
        `https://api.codecov.io/api/v2/github/${owner}/repos/${repo}`
      );
      throw new Error(`Codecov API request failed: ${codecovResponse}`);
    }

    const codecovData = await codecovResponse.json();

    // Use the actual coverage data from the Codecov response
    const coveragePercentage = codecovData.totals.coverage;
    const totalFiles = codecovData.totals.files;
    const totalLines = codecovData.totals.lines;
    const coveredLines = codecovData.totals.hits;
    const uncoveredLines = codecovData.totals.misses;

    // Create trend data from the repository coverage
    const coverageTrend = Array.from({ length: 7 }, (_, i) => ({
      date: format(subDays(new Date(), 6 - i), "yyyy-MM-dd"),
      percentage: coveragePercentage,
    }));

    const response_data = {
      commitActivity,
      coverage: {
        percentage: coveragePercentage,
        totalFiles,
        totalLines,
        coveredLines,
        uncoveredLines,
        totalTests,
        passedTests,
        failedTests,
        trend: coverageTrend,
      },
      recentWorkflowRuns: checkRuns
        .filter((run) => run && run.status)
        .map((run) => ({
          name: run.name,
          status: run.status,
          conclusion: run.conclusion,
          url: run.url,
          createdAt: run.startedAt,
        }))
        .slice(0, 5),
    };

    return NextResponse.json(response_data);
  } catch (error) {
    console.error("Error fetching repository health data:", error);
    return NextResponse.json(
      { error: "Failed to fetch repository health data" },
      { status: 500 }
    );
  }
}
