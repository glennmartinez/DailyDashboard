/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
/**
 * @swagger
 * /api/dashboard/widgets:
 *   get:
 *     summary: Get widget definitions
 *     description: Retrieve the widget definitions from the widgets.yml file.
 *     responses:
 *       200:
 *         description: Widget definitions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 * */
export async function GET() {
  try {
    // Read the widgets.yml file
    const filePath = path.join(
      process.cwd(),
      "app/dashboards-config/widgets.yml"
    );
    const fileContents = fs.readFileSync(filePath, "utf8");

    // Parse YAML content
    const data = yaml.load(fileContents) as { widgets: Record<string, any> };

    if (!data || !data.widgets) {
      return NextResponse.json(
        { error: "Invalid widget definitions format" },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error loading widget definitions:", error);
    return NextResponse.json(
      { error: "Failed to load widget definitions" },
      { status: 500 }
    );
  }
}
