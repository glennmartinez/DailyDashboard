import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json({ error: "No filename provided" }, { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), "app/dashboards-config", filename);
    const fileContents = await fs.readFile(filePath, "utf8");
    
    return new NextResponse(fileContents, {
      headers: {
        "Content-Type": "text/yaml",
      },
    });
  } catch (error) {
    console.error(`Error reading dashboard config: ${error}`);
    return NextResponse.json(
      { error: "Failed to load dashboard configuration" },
      { status: 500 }
    );
  }
}