/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is not set");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectNumber = searchParams.get("projectNumber");

  if (!projectNumber) {
    return NextResponse.json(
      { error: "Project number is required" },
      { status: 400 }
    );
  }

  const query = `
    query {
  viewer {
    projectV2(number: ${projectNumber}) {
      items(first: 100) {
        nodes {
          id
          fieldValues(first: 8) {
            nodes {
              ... on ProjectV2ItemFieldSingleSelectValue {
                name # The value of the field (e.g., "Done", "P0", "S")
                field {
                  ... on ProjectV2SingleSelectField {
                    name # The name of the field (e.g., "Status", "Priority", "Size")
                  }
                }
              }
              ... on ProjectV2ItemFieldTextValue {
                text # The value of the text field
                field {
                  ... on ProjectV2FieldCommon {
                    name # The name of the field
                  }
                }
              }
              ... on ProjectV2ItemFieldNumberValue {
                number # The value of the number field
                field {
                  ... on ProjectV2FieldCommon {
                    name # The name of the field
                  }
                }
              }
              ... on ProjectV2ItemFieldDateValue {
                date # The value of the date field
                field {
                  ... on ProjectV2FieldCommon {
                    name # The name of the field
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
    const items = data.data.viewer.projectV2.items.nodes
      .map((node: any) => {
        const status = node.fieldValues.nodes.find(
          (field: any) => field?.field?.name === "Status"
        );
        const priority = node.fieldValues.nodes.find(
          (field: any) => field?.field?.name === "Priority"
        );
        const size = node.fieldValues.nodes.find(
          (field: any) => field?.field?.name === "Size"
        );
        return {
          id: node.id,
          title: node.content?.title || "",
          status: {
            name: status?.name || "No Status",
          },
          priority: {
            name: priority?.name || "No Priority",
          },
          size: {
            name: size?.name || "No Size",
          },
          assignees: {
            nodes: node.content?.assignees?.nodes || [],
          },
        };
      })
      .filter((item) => !["Done", "Todo"].includes(item.status.name));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching GitHub data:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub data" },
      { status: 500 }
    );
  }
}
