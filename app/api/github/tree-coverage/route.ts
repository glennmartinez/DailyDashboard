import { NextResponse } from "next/server";
import { CodecovFolderData } from "../../../widgets/tree-coverage/types";

const CODECOV_TOKEN = process.env.CODECOV_TOKEN;

if (!CODECOV_TOKEN) {
  throw new Error("CODECOV_TOKEN environment variable is not set");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const branch = searchParams.get("branch") || "main";
  const depth = searchParams.get("depth") || "2";

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Owner and repo parameters are required" },
      { status: 400 }
    );
  }

  try {
    const treeResponse = await fetch(
      `https://api.codecov.io/api/v2/github/${owner}/repos/${repo}/report/tree?branch=${branch}&depth=${depth}`,
      {
        headers: {
          Authorization: `Bearer ${CODECOV_TOKEN}`,
          Accept: "application/json",
        },
      }
    );

    if (!treeResponse.ok) {
      const errorText = await treeResponse.text();
      console.error("Codecov API Error:", {
        status: treeResponse.status,
        statusText: treeResponse.statusText,
        error: errorText,
      });

      switch (treeResponse.status) {
        case 401:
          return NextResponse.json(
            { error: "Unauthorized: Please check your Codecov token" },
            { status: 401 }
          );
        case 404:
          return NextResponse.json(
            { error: "Repository not found or not tracked by Codecov" },
            { status: 404 }
          );
        case 429:
          return NextResponse.json(
            { error: "Rate limit exceeded. Please try again later" },
            { status: 429 }
          );
        default:
          throw new Error(
            `Codecov API request failed: ${treeResponse.statusText}`
          );
      }
    }

    const treeData = await treeResponse.json();

    // Transform the tree data into our expected format
    const transformFolder = (folder: CodecovFolderData) => ({
      folder: folder.name,
      fullPath: folder.full_path,
      trackedLines: folder.lines,
      coveredLines: folder.hits,
      partialLines: folder.partials,
      missedLines: folder.misses,
      coveragePercentage: folder.coverage,
      ...(folder.children && {
        children: folder.children.map(transformFolder),
      }),
    });

    const folderStats = treeData.map(transformFolder);

    // Sort by coverage percentage descending at each level
    const sortByCoverage = (stats: ReturnType<typeof transformFolder>[]) => {
      stats.sort((a, b) => b.coveragePercentage - a.coveragePercentage);
      stats.forEach((stat) => {
        if (stat.children) {
          sortByCoverage(stat.children);
        }
      });
      return stats;
    };

    return NextResponse.json({
      folderStats: sortByCoverage(folderStats),
    });
  } catch (error) {
    console.error("Error fetching coverage data:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch coverage data",
      },
      { status: 500 }
    );
  }
}
