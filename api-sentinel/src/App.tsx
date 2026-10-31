import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TargetConfigSection } from './components/TargetConfigSection';
import { TargetAppCard } from './components/TargetAppCard';
import { StatsOverview } from './components/StatsOverview';
import { ScanningOverlay } from './components/ScanningOverlay';
import { DiscoveredEndpointsTable } from './components/DiscoveredEndpointsTable';
import { TestResultsTable } from './components/TestResultsTable';
import { VulnerabilityFindings } from './components/VulnerabilityFindings';
import { FindingDetailModal } from './components/FindingDetailModal';
import { EmptyState } from './components/EmptyState';
import { ErrorAlert } from './components/ErrorAlert';
import { ScanHistoryView } from './components/ScanHistoryView';
import {
  BolaScanResponse,
  DiscoveredRouteItem,
  Finding,
  NavTab,
  ScanHistoryRecord,
  ScanResultItem,
  TargetStatus,
} from './types/security';
import {
  executeBolaScan,
  pingTargetHealth,
  fetchTargetDiscoveredRoutes,
  getScanHistory,
  saveScanToHistory,
  clearScanHistory,
  getSavedTargetUrl,
  saveTargetUrl,
  validateClientTargetUrl,
} from './services/api';
import { Network, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [scanData, setScanData] = useState<BolaScanResponse | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanDurationMs, setScanDurationMs] = useState<number | undefined>(undefined);
  const [lastScanTimestamp, setLastScanTimestamp] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [errorStatusCode, setErrorStatusCode] = useState<number | undefined>(undefined);

  // User-configurable target URL state (default from localStorage or fallback)
  const [targetUrl, setTargetUrl] = useState<string>(() => getSavedTargetUrl());

  // Target application status
  const [targetStatus, setTargetStatus] = useState<TargetStatus>({
    online: false,
    checking: true,
    targetUrl: getSavedTargetUrl(),
  });
  const [discoveredRoutes, setDiscoveredRoutes] = useState<DiscoveredRouteItem[]>([]);

  // Selected finding for inspector modal
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [selectedResult, setSelectedResult] = useState<ScanResultItem | null>(null);

  // Filter for table navigation
  const [filterEndpoint, setFilterEndpoint] = useState<string>('');

  // Scan History
  const [history, setHistory] = useState<ScanHistoryRecord[]>(() => getScanHistory());

  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Connection test function for target application
  const testTarget = useCallback(async (urlToTest: string) => {
    const cleaned = urlToTest.trim().replace(/\/+$/, '');
    setTargetStatus((prev) => ({
      ...prev,
      targetUrl: cleaned,
      checking: true,
      error: undefined,
    }));

    const health = await pingTargetHealth(cleaned);

    if (health.online) {
      const routeRes = await fetchTargetDiscoveredRoutes(cleaned);
      let routes: DiscoveredRouteItem[] = [];
      let missingDetails: string | undefined = undefined;

      if (routeRes.success && routeRes.routes) {
        routes = routeRes.routes;
        if (routes.length === 0) {
          missingDetails = 'Target exposes /__security/routes, but returned 0 routes.';
        }
      } else {
        missingDetails =
          routeRes.error ||
          'Route discovery endpoint GET /__security/routes not found or did not return valid routes.';
      }

      setDiscoveredRoutes(routes);
      setTargetStatus({
        online: true,
        checking: false,
        targetUrl: cleaned,
        latencyMs: health.latencyMs,
        serviceName: health.service,
        lastChecked: new Date().toISOString(),
        routesDiscoveredCount: routes.length,
        missingDetails,
      });
    } else {
      setDiscoveredRoutes([]);
      setTargetStatus({
        online: false,
        checking: false,
        targetUrl: cleaned,
        error: health.error || `Cannot reach target at ${cleaned}`,
        lastChecked: new Date().toISOString(),
      });
    }
  }, []);

  // Initial connection test on mount using saved target URL
  useEffect(() => {
    let ignore = false;
    async function initTarget() {
      const current = getSavedTargetUrl();
      const health = await pingTargetHealth(current);
      if (!ignore) {
        if (health.online) {
          const routeRes = await fetchTargetDiscoveredRoutes(current);
          const routes = routeRes.success && routeRes.routes ? routeRes.routes : [];
          setDiscoveredRoutes(routes);
          setTargetStatus({
            online: true,
            checking: false,
            targetUrl: current,
            latencyMs: health.latencyMs,
            serviceName: health.service,
            lastChecked: new Date().toISOString(),
            routesDiscoveredCount: routes.length,
          });
        } else {
          setTargetStatus({
            online: false,
            checking: false,
            targetUrl: current,
            error: health.error,
            lastChecked: new Date().toISOString(),
          });
        }
      }
    }
    initTarget();
    return () => {
      ignore = true;
    };
  }, []);

  // Handler for connecting to a new target URL
  const handleConnectTarget = (newUrl: string) => {
    const validation = validateClientTargetUrl(newUrl);
    if (!validation.valid || !validation.normalizedUrl) {
      setError(validation.error || 'Invalid target URL format.');
      return;
    }

    const normalized = validation.normalizedUrl;
    setTargetUrl(normalized);
    saveTargetUrl(normalized);
    setError(null);
    setErrorStatusCode(undefined);
    testTarget(normalized);
  };

  // Handler for testing connection to currently selected target
  const handleTestConnection = () => {
    testTarget(targetUrl);
  };

  // Execute BOLA scan with user-configured targetUrl
  const handleRunScan = async () => {
    if (!targetStatus.online) {
      setError(
        `Cannot scan offline target "${targetUrl}". Please verify the target server is running and click "Test Connection".`
      );
      return;
    }

    setIsScanning(true);
    setError(null);
    setErrorStatusCode(undefined);

    try {
      const result = await executeBolaScan(targetUrl);

      if (result.success && result.data) {
        setScanData(result.data);
        setScanDurationMs(result.durationMs);
        const timestamp = new Date().toISOString();
        setLastScanTimestamp(timestamp);

        // Update discovered routes if not present
        if (discoveredRoutes.length === 0 && result.data.results) {
          const derived = Array.from(
            new Set(
              result.data.results.map((r) => {
                if (r.endpoint.includes('/vulnerable/bookings/')) {
                  return '/vulnerable/bookings/:id';
                }
                if (r.endpoint.includes('/secure/bookings/')) {
                  return '/secure/bookings/:id';
                }
                return r.endpoint;
              })
            )
          ).map((path) => ({
            method: 'GET',
            path,
            resourceType: 'booking',
            ownershipField: 'userId',
            sampleIds: ['booking-101', 'booking-202'],
          }));
          setDiscoveredRoutes(derived);
        }

        // Save scan result to history with active targetUrl
        const newRecord = saveScanToHistory(result.data, result.durationMs, targetUrl);
        setHistory((prev) => [newRecord, ...prev].slice(0, 20));
      } else {
        setError(result.error || 'Security scan failed to complete.');
        setErrorStatusCode(result.statusCode);
      }
    } catch (err: any) {
      setError(err?.message || 'Unexpected error occurred while running security scan.');
    } finally {
      setIsScanning(false);
    }
  };

  // Open finding inspector
  const handleSelectFinding = (finding: Finding, result?: ScanResultItem) => {
    setSelectedFinding(finding);
    setSelectedResult(result || null);
  };

  // Filter test results by specific endpoint from Discovered Endpoints table
  const handleFilterByEndpoint = (endpoint: string) => {
    setFilterEndpoint(endpoint);
    setCurrentTab('scans');
  };

  // Load past scan from history
  const handleLoadPastScan = (pastScan: BolaScanResponse) => {
    setScanData(pastScan);
    if (pastScan.targetUrl) {
      setTargetUrl(pastScan.targetUrl);
    }
    setCurrentTab('overview');
  };

  const handleClearHistory = () => {
    clearScanHistory();
    setHistory([]);
  };

  const totalFindings = scanData?.totalFindings ?? 0;
  const totalRoutes = scanData?.discoveredRoutes ?? discoveredRoutes.length;
  const totalTests = scanData?.totalTests ?? 0;

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-200 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Scanning Radar Overlay */}
      <ScanningOverlay isScanning={isScanning} targetUrl={targetUrl} />

      {/* Finding Inspector Modal */}
      <FindingDetailModal
        finding={selectedFinding}
        result={selectedResult}
        onClose={() => {
          setSelectedFinding(null);
          setSelectedResult(null);
        }}
      />

      <div className="flex-1 flex flex-row">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            currentTab={currentTab}
            onSelectTab={(tab) => {
              setCurrentTab(tab);
              if (tab !== 'scans') setFilterEndpoint('');
            }}
            targetStatus={targetStatus}
            totalFindings={totalFindings}
            totalRoutes={totalRoutes}
            totalTests={totalTests}
            historyCount={history.length}
            isScanning={isScanning}
            onRunScan={handleRunScan}
          />
        </div>

        {/* Mobile Sidebar Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative z-50">
              <Sidebar
                currentTab={currentTab}
                onSelectTab={(tab) => {
                  setCurrentTab(tab);
                  setIsMobileMenuOpen(false);
                  if (tab !== 'scans') setFilterEndpoint('');
                }}
                targetStatus={targetStatus}
                totalFindings={totalFindings}
                totalRoutes={totalRoutes}
                totalTests={totalTests}
                historyCount={history.length}
                isScanning={isScanning}
                onRunScan={() => {
                  setIsMobileMenuOpen(false);
                  handleRunScan();
                }}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          <Header
            onRunScan={handleRunScan}
            isScanning={isScanning}
            targetStatus={targetStatus}
            onRefreshTarget={handleTestConnection}
            lastScanTime={lastScanTimestamp}
            isPassed={scanData?.passed}
            hasScanRun={scanData !== null}
            totalFindings={totalFindings}
            onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {/* TARGET CONFIGURATION SECTION AT THE TOP OF THE DASHBOARD */}
            <TargetConfigSection
              targetStatus={targetStatus}
              onConnectTarget={handleConnectTarget}
              onTestConnection={handleTestConnection}
              onRunScan={handleRunScan}
              isScanning={isScanning}
              discoveredRoutes={discoveredRoutes}
            />

            {/* Error banner if present */}
            {error && (
              <ErrorAlert
                error={error}
                statusCode={errorStatusCode}
                onRetry={handleRunScan}
                isRetrying={isScanning}
              />
            )}

            {/* Target Missing Endpoints Notice */}
            {targetStatus.online && targetStatus.missingDetails && (
              <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 text-xs font-mono text-amber-200 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300 block mb-0.5">
                    Target Route Discovery Warning:
                  </span>
                  <span>{targetStatus.missingDetails}</span>
                  <p className="text-[11px] text-amber-400/80 mt-1">
                    The BOLA scanner requires the target to implement <code className="text-amber-200">GET /__security/routes</code> returning routes with <code className="text-amber-200">resourceType: "booking"</code>.
                  </p>
                </div>
              </div>
            )}

            {/* State 1: Empty state before first scan */}
            {!scanData && !isScanning && !error && (
              <EmptyState
                onRunScan={handleRunScan}
                isScanning={isScanning}
                targetStatus={targetStatus}
              />
            )}

            {/* State 2: Dynamic Scan Content when results are loaded */}
            {scanData && (
              <>
                {/* TAB 1: OVERVIEW */}
                {currentTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Stats KPI Overview */}
                    <StatsOverview
                      scanData={scanData}
                      durationMs={scanDurationMs}
                    />

                    {/* Prominent Findings Section (Red Cards) */}
                    {scanData.findings.length > 0 && (
                      <VulnerabilityFindings
                        findings={scanData.findings}
                        results={scanData.results}
                        onSelectFinding={handleSelectFinding}
                      />
                    )}

                    {/* Discovered Endpoints Table */}
                    <DiscoveredEndpointsTable
                      routes={discoveredRoutes}
                      scanResults={scanData.results}
                      onFilterByEndpoint={handleFilterByEndpoint}
                    />

                    {/* Test Results Table Preview */}
                    <TestResultsTable
                      results={scanData.results}
                      onSelectFinding={handleSelectFinding}
                      initialFilterEndpoint={filterEndpoint}
                    />

                    {/* Target Application Specifications Card */}
                    <TargetAppCard
                      targetStatus={targetStatus}
                      onRefresh={handleTestConnection}
                      discoveredRoutes={discoveredRoutes}
                      onOpenDiscoveryTab={() => setCurrentTab('discovery')}
                    />
                  </div>
                )}

                {/* TAB 2: API DISCOVERY */}
                {currentTab === 'discovery' && (
                  <div className="space-y-6">
                    <DiscoveredEndpointsTable
                      routes={discoveredRoutes}
                      scanResults={scanData.results}
                      onFilterByEndpoint={handleFilterByEndpoint}
                    />

                    <div className="p-4 rounded-xl bg-[#0c1324] border border-slate-800 text-xs font-mono text-slate-300">
                      <div className="flex items-center gap-2 font-bold text-cyan-400 mb-2">
                        <Network className="w-4 h-4" />
                        <span>Route Discovery Mechanics</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        The security scanner probes <code className="text-cyan-300">GET /__security/routes</code> on your connected target (<code className="text-cyan-300">{targetStatus.targetUrl}</code>) to automatically obtain the API attack surface. Each route item specifies its HTTP method, resource type, expected authorization ownership field, and sample identifiers used for test generation.
                      </p>
                    </div>

                    <TargetAppCard
                      targetStatus={targetStatus}
                      onRefresh={handleTestConnection}
                      discoveredRoutes={discoveredRoutes}
                    />
                  </div>
                )}

                {/* TAB 3: SECURITY SCANS */}
                {currentTab === 'scans' && (
                  <div className="space-y-6">
                    <TestResultsTable
                      results={scanData.results}
                      onSelectFinding={handleSelectFinding}
                      initialFilterEndpoint={filterEndpoint}
                    />
                  </div>
                )}

                {/* TAB 4: VULNERABILITY FINDINGS */}
                {currentTab === 'findings' && (
                  <div className="space-y-6">
                    <VulnerabilityFindings
                      findings={scanData.findings}
                      results={scanData.results}
                      onSelectFinding={handleSelectFinding}
                    />
                  </div>
                )}

                {/* TAB 5: SCAN HISTORY */}
                {currentTab === 'history' && (
                  <div className="space-y-6">
                    <ScanHistoryView
                      history={history}
                      onLoadScan={handleLoadPastScan}
                      onClearHistory={handleClearHistory}
                    />
                  </div>
                )}
              </>
            )}

            {/* If no scanData yet but user navigated to history tab */}
            {!scanData && currentTab === 'history' && (
              <ScanHistoryView
                history={history}
                onLoadScan={handleLoadPastScan}
                onClearHistory={handleClearHistory}
              />
            )}
          </main>

          {/* Footer Bar */}
          <footer className="border-t border-slate-800/80 bg-[#070b14] py-4 px-6 text-xs text-slate-400 font-mono flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Sentinel BOLA Scanner Dashboard</span>
              <span>•</span>
              <span className="text-slate-400">OWASP API Security Benchmark</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400 text-[11px]">
              <span>NestJS API: :3001</span>
              <span className="truncate max-w-[200px]">Target: {targetStatus.targetUrl}</span>
              <span className="text-cyan-400 font-bold">API1:2023 Enforced</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
