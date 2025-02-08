/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is not set");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Owner and repo parameters are required" },
      { status: 400 }
    );
  }

  const query = `
    query GetMilestones($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        milestones(first: 10, states: OPEN) {
          nodes {
            title
            dueOn
            progressPercentage
            description
            state
            issues(first: 0) {
              totalCount
            }
            closedIssues: issues(states: CLOSED) {
              totalCount
            }
            openIssues: issues(states: OPEN) {
              totalCount
            }
          }
        }
      }
    }
  `;

  const variables = {
    owner,
    repo,
  };

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }), // Added variables here
    });

    if (!response.ok) {
      throw new Error(`GitHub API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.data?.repository?.milestones?.nodes) {
      throw new Error("Invalid response structure from GitHub API");
    }

    const milestones = data.data.repository.milestones.nodes.map(
      (milestone: any) => ({
        title: milestone.title,
        dueOn: milestone.dueOn,
        progressPercentage: milestone.progressPercentage,
        description: milestone.description,
        state: milestone.state,
        issuesOpen: milestone.openIssues.totalCount,
        issuesClosed: milestone.closedIssues.totalCount,
      })
    );

    return NextResponse.json({ milestones });
  } catch (error) {
    console.error("Error fetching GitHub milestone data:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub milestone data" },
      { status: 500 }
    );
  }
}
