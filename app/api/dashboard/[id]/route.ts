import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import yaml from "js-yaml";
import { DashboardConfig } from "@/app/types/dashboard";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Fetching dashboard with ID:', params.id);
    
    // Construct the path to the dashboard config file
    const configPath = path.join(
      process.cwd(),
      "app/dashboards-config",
      `${params.id}.yml`
    );

    console.log('Looking for config file at:', configPath);

    // Read and parse the YAML file
    const fileContents = await fs.readFile(configPath, "utf8");
    console.log('Raw file contents:', fileContents);

    const dashboardConfig = yaml.load(fileContents) as DashboardConfig;
    console.log('Parsed dashboard config:', dashboardConfig);

    if (!dashboardConfig) {
      throw new Error("Invalid dashboard configuration");
    }

    // Add the id to the config
    dashboardConfig.id = params.id;

    return NextResponse.json(dashboardConfig);
  } catch (error) {
    console.error("Error loading dashboard:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard configuration" },
      { status: 500 }
    );
  }
}
