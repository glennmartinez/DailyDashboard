# GLabs Dashboard

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:4000](http://localhost:4000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Screenshots

### Dashboard Overview

![Dashboard Overview](/public/assets/images/main-dashboard.png)

### Dashboard home

![Widget Config](/public/assets/images/dash-home.png)

## Dashboard System Architecture

This project implements a flexible dashboard system that supports dynamic widget configuration and layout management. The system is built with a modular architecture that separates concerns between dashboard management, widget registration, and configuration handling.

For detailed information about the system's architecture, including class diagrams and component relationships, please refer to our [Architecture Documentation](docs/ARCHITECTURE.md).

## Widget Configuration

### Dashboard Layout System

The dashboard uses a 12-column grid system with flexible row heights:

- Each row's width is divided into 12 units
- Widget widths are specified in units from 1-12
- Row heights are specified in units where each unit = 8.33vh
- Minimum widget height is 150px

### Creating a Dashboard Configuration

1. Create a new YAML file in `/app/dashboards-config/`
2. Basic structure:

```yaml
name: "Dashboard Name"
description: "Dashboard Description"
rows:
  - height: 4 # 33.32vh (4 * 8.33)
    widgets:
      - type: "widget-type"
        width: 6 # Half width (6/12 columns)
        config:
          # Widget-specific configuration
```

### Available Widgets

1. **Sprint Widget**

   ```yaml
   type: "sprint"
   width: 6
   config:
     owner: "username"
     repos: ["repo-name"]
     projectNumber: 7
   ```

2. **Milestone Widget**

   ```yaml
   type: "milestone"
   width: 4
   config:
     owner: "username"
     repo: "repo-name"
   ```

3. **Motivational Widget**
   ```yaml
   type: "motivational"
   width: 2
   ```

### Widget Size Guidelines

- Small widgets: 2-3 units wide
- Medium widgets: 4-6 units wide
- Large widgets: 8-12 units wide
- Each row must total exactly 12 units
- Recommended row heights:
  - Compact rows: 3 units (25vh)
  - Standard rows: 4 units (33vh)
  - Large rows: 6 units (50vh)

### Environment Setup

1. Create a `.env.local` file in the root directory
2. Add your GitHub token:
   ```
   GITHUB_TOKEN='your-github-token'
   ```

### Adding New Widgets

1. Create widget component in `/app/widgets/`
2. Register widget in `widgets-registry.ts`
3. Add widget type to configuration schema
4. Update widget types in `types/dashboard.ts`

### Validation Rules

- Widget widths must sum to 12 per row
- Individual widget width: 1-12 units
- Row height: 1-12 units
- Maximum rows per dashboard: 6

## Learn More
