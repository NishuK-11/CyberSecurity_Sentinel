export interface Finding {
  title: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  evidence: string;
  remediation: string;
}

export interface ScanResultItem {
  testName: string;
  endpoint: string;
  testedIdentity: string;
  resource: string;
  expectedStatuses: number[];
  actualStatus: number;
  returnedOwner: string | null;
  vulnerabilityDetected: boolean;
  passed: boolean;
  finding: Finding | null;
}

export interface BolaScanResponse {
  scanType: string;
  targetUrl?: string;
  discoveredRoutes: number;
  identifiedResources: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalFindings: number;
  passed: boolean;
  findings: Finding[];
  results: ScanResultItem[];
}

export interface DiscoveredRouteItem {
  method: string;
  path: string;
  resourceType: string;
  ownershipField: string;
  sampleIds: string[];
}

export interface TargetRoutesResponse {
  routes: DiscoveredRouteItem[];
}

export interface TargetHealthResponse {
  status: string;
  service: string;
}

export interface TargetStatus {
  online: boolean;
  checking: boolean;
  targetUrl: string;
  serviceName?: string;
  latencyMs?: number;
  error?: string;
  lastChecked?: string;
  routesDiscoveredCount?: number;
  missingDetails?: string;
}

export interface ScanHistoryRecord {
  id: string;
  timestamp: string;
  durationMs: number;
  targetUrl?: string;
  data: BolaScanResponse;
}

export type NavTab = 'overview' | 'discovery' | 'scans' | 'findings' | 'history';
