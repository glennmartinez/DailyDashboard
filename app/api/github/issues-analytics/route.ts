import { NextResponse } from "next/server";
import { subDays, subMonths, parseISO, format, startOfDay } from "date-fns";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is not set");
}

interface GitHubIssue {
  number: number;
  title: string;
  state: string;
  createdAt: string;
  closedAt?: string;
  labels: {
    nodes: {
      name: string;
      color: string;
    }[];
  };
  assignees: {
    nodes: {
      login: string;
      avatarUrl: string;
    }[];
  };
}

function processIssue(
  issue: GitHubIssue,
  labelStats: Map<string, { count: number; color: string }>,
  assigneeStats: Map<string, { count: number; avatarUrl: string }>,
  timelineStats: Map<string, { opened: number; closed: number }>
) {
  // Count by label
  issue.labels.nodes.forEach((label: { name: string; color: string }) => {
    const current = labelStats.get(label.name) || {
      count: 0,
      color: label.color,
    };
    labelStats.set(label.name, { ...current, count: current.count + 1 });
  });

  // Count by assignee
  issue.assignees.nodes.forEach(
    (assignee: { login: string; avatarUrl: string }) => {
      const current = assigneeStats.get(assignee.login) || {
        count: 0,
        avatarUrl: assignee.avatarUrl,
      };
      assigneeStats.set(assignee.login, {
        ...current,
        count: current.count + 1,
      });
    }
  );

  // Timeline stats for creation
  const createdDate = format(startOfDay(parseISO(issue.createdAt)), "yyyy-MM-dd");
  if (timelineStats.has(createdDate)) {
    const timelineStat = timelineStats.get(createdDate);
    timelineStats.set(createdDate, {
      ...timelineStat!,
      opened: timelineStat!.opened + 1,
    });
  }

  // Timeline stats for closure
  if (issue.closedAt) {
    const closedDate = format(startOfDay(parseISO(issue.closedAt)), "yyyy-MM-dd");
    if (timelineStats.has(closedDate)) {
      const timelineStat = timelineStats.get(closedDate);
      timelineStats.set(closedDate, {
        ...timelineStat!,
        closed: timelineStat!.closed + 1,
      });
    }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const timeRange = searchParams.get("timeRange") || "month";

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Owner and repo parameters are required" },
      { status: 400 }
    );
  }

  const since = format(
    startOfDay(
      timeRange === "week"
        ? subDays(new Date(), 7)
        : timeRange === "quarter"
        ? subMonths(new Date(), 3)
        : subMonths(new Date(), 1)
    ),
    "yyyy-MM-dd'T'00:00:00XXX"
  );

  const query = `
    query($owner: String!, $repo: String!, $since: DateTime!) {
      repository(owner: $owner, name: $repo) {
        openIssues: issues(first: 100, states: [OPEN]) {
          totalCount
          nodes {
            number
            title
            state
            createdAt
            labels(first: 10) {
              nodes {
                name
                color
              }
            }
            assignees(first: 5) {
              nodes {
                login
                avatarUrl
              }
            }
          }
        }
        closedIssues: issues(first: 100, states: [CLOSED], filterBy: {since: $since}) {
          totalCount
          nodes {
            number
            title
            state
            createdAt
            closedAt
            labels(first: 10) {
              nodes {
                name
                color
              }
            }
            assignees(first: 5) {
              nodes {
                login
                avatarUrl
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
      since,
    }); // Debug log

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { owner, repo, since },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("GitHub API Error:", errorData);
      throw new Error(`GitHub API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error("GraphQL Errors:", data.errors);
      throw new Error(`GraphQL Error: ${data.errors[0].message}`);
    }

    const openIssues = data.data?.repository?.openIssues?.nodes || [];
    const closedIssues = data.data?.repository?.closedIssues?.nodes || [];
    const totalOpenCount = data.data?.repository?.openIssues?.totalCount || 0;
    const totalClosedCount =
      data.data?.repository?.closedIssues?.totalCount || 0;

    // Process the data into the required format
    const labelStats = new Map();
    const assigneeStats = new Map();
    const timelineStats = new Map();

    // Initialize timeline with dates from the range
    const startDate = new Date(since);
    const endDate = new Date();
    for (
      let date = startDate;
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      timelineStats.set(format(date, "yyyy-MM-dd"), { opened: 0, closed: 0 });
    }

    // Process open issues
    openIssues.forEach((issue) => {
      processIssue(issue, labelStats, assigneeStats, timelineStats);
    });

    // Process closed issues
    closedIssues.forEach((issue) => {
      processIssue(issue, labelStats, assigneeStats, timelineStats);
    });

    const response_data = {
      total: totalOpenCount + totalClosedCount,
      open: totalOpenCount,
      closed: totalClosedCount,
      byLabel: Array.from(labelStats.entries())
        .map(([name, { count, color }]) => ({
          name,
          count,
          color,
        }))
        .sort((a, b) => b.count - a.count),
      byAssignee: Array.from(assigneeStats.entries())
        .map(([login, { count, avatarUrl }]) => ({
          login,
          count,
          avatarUrl,
        }))
        .sort((a, b) => b.count - a.count),
      timeline: Array.from(timelineStats.entries())
        .map(([date, stats]) => ({
          date,
          ...stats,
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };

    return NextResponse.json(response_data);
  } catch (error) {
    console.error("Error fetching GitHub issues data:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub issues data" },
      { status: 500 }
    );
  }
}
