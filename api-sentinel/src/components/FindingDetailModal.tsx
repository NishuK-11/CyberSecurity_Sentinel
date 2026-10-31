import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Terminal,
  Wrench,
  Check,
  Copy,
  AlertTriangle,
  Code2,
  FileCheck2,
  FileX2,
  User,
  Database,
} from 'lucide-react';
import { Finding, ScanResultItem } from '../types/security';

interface FindingDetailModalProps {
  finding: Finding | null;
  result?: ScanResultItem | null;
  onClose: () => void;
}

export const FindingDetailModal: React.FC<FindingDetailModalProps> = ({
  finding,
  result,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!finding) return null;

  const endpoint = result?.endpoint || '/vulnerable/bookings/:id';
  const testedIdentity = result?.testedIdentity || 'user-b';
  const resource = result?.resource || 'booking-101';
  const returnedOwner = result?.returnedOwner || 'user-a';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      `[SECURITY FINDING - BOLA]\nTitle: ${finding.title}\nSeverity: ${finding.severity}\nEndpoint: ${endpoint}\nEvidence: ${finding.evidence}\nRemediation: ${finding.remediation}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060a14]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#0a1020] border border-rose-500/40 rounded-3xl shadow-[0_0_50px_rgba(244,63,94,0.25)] overflow-hidden my-8 relative flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-800/90 bg-gradient-to-r from-rose-950/40 via-[#180e1c] to-[#0a1020] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-900 text-rose-200 border border-rose-500/60">
                  {finding.severity || 'HIGH'} SEVERITY
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-900 text-cyan-300 border border-slate-700">
                  OWASP API1:2023
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 font-sans tracking-tight mt-1">
                {finding.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-100 flex items-center justify-center border border-slate-700/80 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* Affected Target Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Vulnerable Endpoint
              </span>
              <span className="font-bold text-rose-300 text-xs truncate block">
                {endpoint}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Attacking Identity
              </span>
              <span className="font-bold text-cyan-300 text-xs flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                {testedIdentity} (Non-owner)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Target Resource
              </span>
              <span className="font-bold text-amber-300 text-xs flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                {resource} (Owner: {returnedOwner})
              </span>
            </div>
          </div>

          {/* Evidence Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Audit Evidence & Proof of Concept
              </h4>
              <button
                onClick={copyToClipboard}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Evidence</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-[#050812] border border-rose-900/60 rounded-xl p-4 font-mono text-xs text-rose-200/90 leading-relaxed shadow-inner">
              <p className="font-bold text-rose-300 mb-1">
                Scanner Detected Unauthorized Access:
              </p>
              <p>{finding.evidence}</p>
            </div>
          </div>

          {/* Technical Vulnerability Breakdown */}
          <div className="bg-[#0c1426] border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
            <h4 className="font-mono font-bold uppercase tracking-wider text-slate-200 text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              What is Broken Object Level Authorization (BOLA)?
            </h4>
            <p className="text-slate-300 leading-relaxed">
              BOLA (formerly known as Insecure Direct Object Reference or IDOR) occurs when an API application accepts an object identifier from an authenticated user and fails to validate whether the requester is authorized to access or modify that specific object instance.
            </p>
            <p className="text-slate-400 leading-relaxed">
              In this demo application, <code className="text-cyan-300 font-mono">{testedIdentity}</code> provided a valid authentication token, but requested a booking (<code className="text-amber-300 font-mono">{resource}</code>) owned by <code className="text-rose-300 font-mono">{returnedOwner}</code>. The server returned HTTP 200 with the full booking payload instead of rejecting with HTTP 403 Forbidden.
            </p>
          </div>

          {/* Remediation Guide */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Remediation Action & Code Fix
            </h4>
            <div className="bg-[#091124] border border-cyan-500/30 rounded-xl p-4 text-xs text-slate-300">
              <p className="font-medium text-slate-100 mb-2">
                {finding.remediation}
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs">
                <li>Extract the authenticated identity from the session or JWT token (e.g. <code className="text-cyan-300">req.user.id</code>).</li>
                <li>Compare the authenticated user ID with the resource's owner field before returning the payload.</li>
                <li>If the identity does not match and the user lacks admin privileges, reject immediately with <code className="text-rose-300 font-mono">403 Forbidden</code>.</li>
              </ul>
            </div>
          </div>

          {/* Vulnerable vs Secure Code Comparison */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              Code Diff: Vulnerable vs Secure Implementation
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              {/* Vulnerable Snippet */}
              <div className="bg-[#120a10] border border-rose-900/70 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[11px] pb-1 border-b border-rose-900/50">
                  <FileX2 className="w-3.5 h-3.5" />
                  Vulnerable: /vulnerable/bookings/:id
                </div>
                <pre className="text-rose-200/90 overflow-x-auto text-[11px] leading-tight">
{`app.get('/vulnerable/bookings/:id',
  authenticate, (req, res) => {
  const booking = bookings.find(
    b => b.id === req.params.id
  );
  if (!booking) {
    return res.status(404).json(...);
  }

  // BUG: Missing ownership verification!
  return res.json(booking);
});`}
                </pre>
              </div>

              {/* Secure Snippet */}
              <div className="bg-[#081514] border border-emerald-900/70 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] pb-1 border-b border-emerald-900/50">
                  <FileCheck2 className="w-3.5 h-3.5" />
                  Secure: /secure/bookings/:id
                </div>
                <pre className="text-emerald-200/90 overflow-x-auto text-[11px] leading-tight">
{`app.get('/secure/bookings/:id',
  authenticate, (req, res) => {
  const booking = bookings.find(
    b => b.id === req.params.id
  );
  if (!booking) {
    return res.status(404).json(...);
  }

  // FIX: Enforce ownership check
  if (booking.userId !== req.user.id) {
    return res.status(403).json({
      message: 'Forbidden'
    });
  }
  return res.json(booking);
});`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#080d1a] flex items-center justify-between shrink-0 font-mono text-xs">
          <span className="text-slate-400">
            Remediation Priority: <strong className="text-rose-400 font-bold">P1 - Critical Hotfix</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
