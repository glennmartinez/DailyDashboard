/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { ProjectData } from "../../types/github";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is not set");
}

export async function POST(request: Request) {
  try {
    const { id, status } = await request.json();

    const mutation = `
      mutation UpdateIssueStatus($id: ID!, $statusFieldId: ID!, $optionId: String!) {
        updateProjectV2ItemFieldValue(
          input: {
            projectId: "PVT_kwHOABQxRM4AXA8N"
            itemId: $id
            fieldId: "PVTSSF_lAHOABQxRM4AXA8NzgJ2aXc"
            value: { 
              singleSelectOptionId: $optionId
            }
          }
        ) {
          projectV2Item {
            id
          }
        }
      }
    `;

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          id,
          statusFieldId: "Status", // You'll need to replace this with your actual field ID
          optionId: status, // You'll need to provide the correct option ID for the status
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(`GitHub API Error: ${data.errors[0].message}`);
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating GitHub issue:", error);
    return NextResponse.json(
      { error: "Failed to update GitHub issue" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const query = `
    query {
      viewer {
        projectV2(number: 7) {
          items(first: 100) {
            nodes {
              id
              fieldValues(first: 8) {
                nodes {
                  ... on ProjectV2ItemFieldSingleSelectValue {
                    name
                    field {
                      ... on ProjectV2SingleSelectField {
                        name
                      }
                    }
                  }
                }
              }
              content {
                ... on Issue {
                  title
                  assignees(first: 10) {
                    nodes {
                      login
                      avatarUrl
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
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.data?.viewer?.projectV2?.items?.nodes) {
      throw new Error("Invalid response structure from GitHub API");
    }
    const items = data.data.viewer.projectV2.items.nodes.map((node: any) => {
      const status = node.fieldValues.nodes.find(
        (field: any) => field?.field?.name === "Status"
      );
      return {
        id: node.id,
        title: node.content?.title || "",
        status: {
          name: status?.name || "No Status",
        },
        assignees: {
          nodes: node.content?.assignees?.nodes || [],
        },
      };
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching GitHub data:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub data" },
      { status: 500 }
    );
  }
}
