import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { DashboardConfig } from "@/app/types/dashboard";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const params = await context.params;
  const { id } = params;

  try {
    // Read the dashboard YAML file
    const filePath = path.join(
      process.cwd(),
      `app/dashboards-config/${id}.yml`
    );

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return new NextResponse(
        JSON.stringify({ message: "Dashboard not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const fileContents = fs.readFileSync(filePath, "utf8");
    const config = yaml.load(fileContents) as DashboardConfig;

    if (!config) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid dashboard configuration" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Add the id to the config
    config.id = id;

    return new NextResponse(JSON.stringify(config), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error loading dashboard:", error);
    return new NextResponse(
      JSON.stringify({ message: "Failed to load dashboard" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
