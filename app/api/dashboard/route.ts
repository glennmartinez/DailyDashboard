/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { join } from "path";
import { promises as fs } from "fs";
import yaml from "js-yaml";
import { DashboardConfig } from "../../types/dashboard";

const CONFIG_PATH = join(process.cwd(), "app/dashboards-config");

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      // Load specific dashboard
      const dashboardPath = join(CONFIG_PATH, `${id}.yml`);
      const fileContent = await fs.readFile(dashboardPath, "utf8");
      const parsed = yaml.load(fileContent) as DashboardConfig | null;
      return NextResponse.json({
        dashboard:
          parsed && typeof parsed === "object" ? { ...parsed, id } : { id },
      });
    } else {
      // Load all dashboards
      const files = await fs.readdir(CONFIG_PATH);
      const dashboardFiles = files.filter(
        (file) => file.endsWith(".yml") || file.endsWith(".yaml")
      );

      const dashboards = await Promise.all(
        dashboardFiles.map(async (file) => {
          if (file === "widgets.yml") return null; // Skip widgets definition file
          const content = await fs.readFile(join(CONFIG_PATH, file), "utf8");
          const parsed = yaml.load(content) as DashboardConfig | null;
          if (!parsed || typeof parsed !== "object") return null;
          const id = file.replace(/\.(yaml|yml)$/, "");
          return { ...parsed, id };
        })
      );

      return NextResponse.json({ dashboards: dashboards.filter(Boolean) });
    }
  } catch (error) {
    console.error("Error loading dashboard(s):", error);
    return NextResponse.json(
      { error: "Failed to load dashboard(s)" },
      { status: 500 }
    );
  }
}

export async function GET_WIDGETS() {
  try {
    const widgetsPath = join(CONFIG_PATH, "widgets.yml");
    const fileContent = await fs.readFile(widgetsPath, "utf8");
    const parsed = yaml.load(fileContent) as { widgets: Record<string, any> };

    if (!parsed || !parsed.widgets) {
      throw new Error("Invalid widget definitions file structure");
    }

    return NextResponse.json({ widgets: parsed.widgets });
  } catch (error) {
    console.error("Error loading widget definitions:", error);
    return NextResponse.json(
      { error: "Failed to load widget definitions" },
      { status: 500 }
    );
  }
}
