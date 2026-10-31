import {
  BolaScanResponse,
  DiscoveredRouteItem,
  ScanHistoryRecord,
  TargetHealthResponse,
  TargetRoutesResponse,
} from '../types/security';

const NESTJS_DIRECT_URL = 'http://localhost:3001';
const NESTJS_PROXY_URL = '';

const HISTORY_STORAGE_KEY = 'SENTINEL_SCAN_HISTORY_V1';
export const TARGET_URL_STORAGE_KEY = 'SENTINEL_TARGET_URL_V1';
export const DEFAULT_TARGET_URL = 'http://127.0.0.1:4000';

export interface ScanApiResult {
  success: boolean;
  data?: BolaScanResponse;
  error?: string;
  statusCode?: number;
  durationMs: number;
}

/**
 * Validate and clean a user-entered target base URL on the client
 */
export function validateClientTargetUrl(rawUrl: string): {
  valid: boolean;
  error?: string;
  normalizedUrl?: string;
} {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { valid: false, error: 'Target URL cannot be empty.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      valid: false,
      error: 'Please enter a valid absolute URL (e.g. http://127.0.0.1:4000).',
    };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      valid: false,
      error: 'Protocol must be http:// or https://.',
    };
  }

  if (parsed.username || parsed.password) {
    return {
      valid: false,
      error: 'Target URL must not contain embedded username or password credentials.',
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === '169.254.169.254' ||
    hostname === 'metadata.google.internal' ||
    hostname.endsWith('.internal')
  ) {
    return {
      valid: false,
      error: 'Link-local or cloud metadata addresses are restricted.',
    };
  }

  // Remove trailing slashes
  const basePath = parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/+$/, '');
  const normalizedUrl = `${parsed.origin}${basePath}`;

  return { valid: true, normalizedUrl };
}

/**
 * Retrieve saved target URL from localStorage, or return default
 */
export function getSavedTargetUrl(): string {
  try {
    const saved = localStorage.getItem(TARGET_URL_STORAGE_KEY);
    if (saved) {
      const validation = validateClientTargetUrl(saved);
      if (validation.valid && validation.normalizedUrl) {
        return validation.normalizedUrl;
      }
    }
  } catch {
    // Ignore storage errors
  }
  return DEFAULT_TARGET_URL;
}

/**
 * Save target URL to localStorage
 */
export function saveTargetUrl(targetUrl: string): void {
  try {
    localStorage.setItem(TARGET_URL_STORAGE_KEY, targetUrl);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Execute BOLA security scan via NestJS API.
 * Calls POST http://localhost:3001/security-tests/bola with { targetUrl }
 * Falls back to Vite proxy if CORS / direct connection fails.
 */
export async function executeBolaScan(targetUrl: string): Promise<ScanApiResult> {
  const startTime = performance.now();
  const payload = JSON.stringify({ targetUrl });

  // Try direct NestJS call first
  try {
    const res = await fetch(`${NESTJS_DIRECT_URL}/security-tests/bola`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    });

    const durationMs = Math.round(performance.now() - startTime);

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      const errorMessage =
        errorBody?.message ||
        `Scanner returned HTTP ${res.status}: ${res.statusText}`;
      return {
        success: false,
        error: Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage,
        statusCode: res.status,
        durationMs,
      };
    }

    const data: BolaScanResponse = await res.json();
    return {
      success: true,
      data,
      durationMs,
    };
  } catch {
    // If direct call had a network / CORS failure, try Vite proxy
    try {
      const proxyRes = await fetch(`${NESTJS_PROXY_URL}/security-tests/bola`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
      });

      const durationMs = Math.round(performance.now() - startTime);

      if (!proxyRes.ok) {
        const errorBody = await proxyRes.json().catch(() => null);
        const errorMessage =
          errorBody?.message ||
          `Scanner returned HTTP ${proxyRes.status}: ${proxyRes.statusText}`;
        return {
          success: false,
          error: Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage,
          statusCode: proxyRes.status,
          durationMs,
        };
      }

      const data: BolaScanResponse = await proxyRes.json();
      return {
        success: true,
        data,
        durationMs,
      };
    } catch {
      const durationMs = Math.round(performance.now() - startTime);
      return {
        success: false,
        error:
          'Unable to reach NestJS scanner at http://localhost:3001. Please make sure the NestJS backend is running on port 3001.',
        durationMs,
      };
    }
  }
}

/**
 * Check health of the user-configured target application.
 * Accepts user's targetUrl and tests ${targetUrl}/health
 */
export async function pingTargetHealth(targetUrl: string): Promise<{
  online: boolean;
  service?: string;
  latencyMs?: number;
  error?: string;
}> {
  const start = performance.now();
  const cleanedTarget = targetUrl.trim().replace(/\/+$/, '');

  try {
    const res = await fetch(`${cleanedTarget}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(4000),
    });

    const latencyMs = Math.round(performance.now() - start);

    if (res.ok) {
      const data: TargetHealthResponse = await res.json().catch(() => ({ status: 'ok', service: 'custom-target' }));
      return {
        online: true,
        service: data.service || 'custom-target',
        latencyMs,
      };
    }

    return {
      online: false,
      error: `HTTP ${res.status}: Target health endpoint responded with error`,
      latencyMs,
    };
  } catch {
    // If testing the default demo target, fallback to Vite proxy /target-health if direct fetch blocked by CORS
    if (cleanedTarget === DEFAULT_TARGET_URL) {
      try {
        const res = await fetch(`/target-health`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000),
        });

        const latencyMs = Math.round(performance.now() - start);

        if (res.ok) {
          const data: TargetHealthResponse = await res.json();
          return {
            online: true,
            service: data.service || 'demo-target',
            latencyMs,
          };
        }
      } catch {
        // Continue to error return
      }
    }

    return {
      online: false,
      error: `Cannot connect to target at ${cleanedTarget}. Ensure the target server is active and reachable.`,
    };
  }
}

/**
 * Fetch discovered routes directly from target route discovery endpoint: GET /__security/routes
 * Accepts user's targetUrl and tests ${targetUrl}/__security/routes
 */
export async function fetchTargetDiscoveredRoutes(targetUrl: string): Promise<{
  success: boolean;
  routes?: DiscoveredRouteItem[];
  error?: string;
}> {
  const cleanedTarget = targetUrl.trim().replace(/\/+$/, '');

  try {
    const res = await fetch(`${cleanedTarget}/__security/routes`, {
      method: 'GET',
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data: TargetRoutesResponse = await res.json();
      return {
        success: true,
        routes: data.routes || [],
      };
    }

    return {
      success: false,
      error: `Target route inventory responded with HTTP ${res.status}. Expected GET /__security/routes.`,
    };
  } catch {
    // Fallback for default demo target if browser blocked
    if (cleanedTarget === DEFAULT_TARGET_URL) {
      try {
        const res = await fetch(`/__security/routes`, {
          method: 'GET',
          signal: AbortSignal.timeout(4000),
        });
        if (res.ok) {
          const data: TargetRoutesResponse = await res.json();
          return {
            success: true,
            routes: data.routes || [],
          };
        }
      } catch {
        // Fallback failed
      }
    }

    return {
      success: false,
      error: `Could not reach ${cleanedTarget}/__security/routes. Verify the target exposes this inventory endpoint.`,
    };
  }
}

/**
 * Save scan result to local history
 */
export function saveScanToHistory(
  scanData: BolaScanResponse,
  durationMs: number,
  targetUrl?: string
): ScanHistoryRecord {
  const record: ScanHistoryRecord = {
    id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    durationMs,
    targetUrl: targetUrl || scanData.targetUrl,
    data: scanData,
  };

  try {
    const existing = getScanHistory();
    const updated = [record, ...existing].slice(0, 20); // Keep last 20 scans
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save scan to localStorage:', err);
  }

  return record;
}

/**
 * Retrieve scan history from local storage
 */
export function getScanHistory(): ScanHistoryRecord[] {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as ScanHistoryRecord[];
  } catch (err) {
    console.error('Failed to parse scan history:', err);
    return [];
  }
}

/**
 * Clear scan history from local storage
 */
export function clearScanHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear scan history:', err);
  }
}
