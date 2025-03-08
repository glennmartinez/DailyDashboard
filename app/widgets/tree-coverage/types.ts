// Match Codecov API V2 response format exactly
export interface TreeCoverageWidgetConfig {
  owner: string;
  repo: string;
  branch?: string;
  depth?: number; // Add depth parameter for folder traversal
}

export interface CodecovFolderData {
  name: string;
  full_path: string;
  coverage: number;
  lines: number;
  hits: number;
  partials: number;
  misses: number;
  children?: CodecovFolderData[];
}

export interface TreeCoverageData {
  folderStats: {
    folder: string;
    fullPath: string;
    trackedLines: number;
    coveredLines: number;
    partialLines: number;
    missedLines: number;
    coveragePercentage: number;
    children?: {
      folder: string;
      fullPath: string;
      trackedLines: number;
      coveredLines: number;
      partialLines: number;
      missedLines: number;
      coveragePercentage: number;
    }[];
  }[];
  error?: string;
}
