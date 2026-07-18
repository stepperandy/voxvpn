import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle, AlertCircle, Play, Settings, Zap, Wrench } from 'lucide-react';

export default function AdminWebhookConfig() {
  const [numberResult, setNumberResult] = useState(null);
  const [appResult, setAppResult] = useState(null);
  const [fixResult, setFixResult] = useState(null);
  const [loadingNumbers, setLoadingNumbers] = useState(false);
  const [loadingApp, setLoadingApp] = useState(false);
  const [loadingFix, setLoadingFix] = useState(false);

  const runBulkNumbers = async () => {
    setLoadingNumbers(true);
    setNumberResult(null);
    try {
      const res = await base44.functions.invoke('bulkConfigureTwilioWebhooksV2', {});
      setNumberResult(res.data);
    } catch (err) {
      setNumberResult({ error: err.message });
    } finally {
      setLoadingNumbers(false);
    }
  };

  const runFixMissingSids = async () => {
    setLoadingFix(true);
    setFixResult(null);
    try {
      const res = await base44.functions.invoke('fixMissingSids', {});
      setFixResult(res.data);
    } catch (err) {
      setFixResult({ error: err.message });
    } finally {
      setLoadingFix(false);
    }
  };

  const runTwimlApp = async () => {
    setLoadingApp(true);
    setAppResult(null);
    try {
      const res = await base44.functions.invoke('bulkConfigureTwimlApp', {});
      setAppResult(res.data);
    } catch (err) {
      setAppResult({ error: err.message });
    } finally {
      setLoadingApp(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1628] text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-cyan-400" />
            Auto-Configure Twilio Webhooks
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Automatically sets webhook URLs for all virtual numbers + TwiML app.</p>
        </div>

        {/* Step 1: TwiML App */}
        <div className="bg-[#0d2137] border border-gray-700 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h2 className="font-semibold text-white">Step 1 — Configure TwiML App (Outbound Calls)</h2>
          </div>
          <p className="text-gray-400 text-sm">
            Sets the TwiML App Voice URL to:<br />
            <code className="text-cyan-300 text-xs bg-gray-800 px-2 py-0.5 rounded">
              .../functions/voiceWebhookOutbound
            </code>
          </p>
          <button
            onClick={runTwimlApp}
            disabled={loadingApp}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-gray-950 font-semibold rounded-lg transition"
          >
            <Play className="w-4 h-4" />
            {loadingApp ? 'Configuring...' : 'Run Now'}
          </button>

          {appResult && (
            <div className={`rounded-lg p-4 text-sm ${appResult.error ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'}`}>
              {appResult.error ? (
                <div className="flex items-start gap-2"><XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>{appResult.error}</span></div>
              ) : (
                <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">TwiML App configured!</p>
                    <p className="text-xs text-gray-400 mt-1">App SID: {appResult.twimlAppSid}</p>
                    <p className="text-xs text-gray-400">URL: {appResult.voiceUrl}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Phone Numbers */}
        <div className="bg-[#0d2137] border border-gray-700 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <h2 className="font-semibold text-white">Step 2 — Bulk Configure All Phone Numbers (Inbound)</h2>
          </div>
          <p className="text-gray-400 text-sm">
            Loops through ALL virtual numbers with a Twilio SID and sets their incoming webhooks:<br />
            <code className="text-cyan-300 text-xs bg-gray-800 px-2 py-0.5 rounded block mt-1">Voice → .../functions/voice-webhook</code>
            <code className="text-cyan-300 text-xs bg-gray-800 px-2 py-0.5 rounded block mt-1">SMS → .../functions/smsIncomingWebhook</code>
          </p>
          <button
            onClick={runBulkNumbers}
            disabled={loadingNumbers}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-gray-950 font-semibold rounded-lg transition"
          >
            <Play className="w-4 h-4" />
            {loadingNumbers ? 'Configuring all numbers...' : 'Run Bulk Configuration'}
          </button>

          {numberResult && (
            <div className={`rounded-lg p-4 text-sm space-y-2 ${numberResult.error ? 'bg-red-500/10 border border-red-500/30' : 'bg-gray-800 border border-gray-700'}`}>
              {numberResult.error ? (
                <div className="flex items-start gap-2 text-red-400"><XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>{numberResult.error}</span></div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="text-center p-2 bg-gray-900 rounded-lg">
                      <p className="text-xl font-bold text-white">{numberResult.total}</p>
                      <p className="text-xs text-gray-400">Total</p>
                    </div>
                    <div className="text-center p-2 bg-emerald-500/10 rounded-lg">
                      <p className="text-xl font-bold text-emerald-400">{numberResult.success}</p>
                      <p className="text-xs text-gray-400">Configured</p>
                    </div>
                    <div className="text-center p-2 bg-yellow-500/10 rounded-lg">
                      <p className="text-xl font-bold text-yellow-400">{numberResult.skipped}</p>
                      <p className="text-xs text-gray-400">Skipped (no SID)</p>
                    </div>
                    <div className="text-center p-2 bg-red-500/10 rounded-lg">
                      <p className="text-xl font-bold text-red-400">{numberResult.failed}</p>
                      <p className="text-xs text-gray-400">Failed</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400">Voice: {numberResult.incomingCallUrl}</p>
                  <p className="text-xs text-gray-400">SMS: {numberResult.smsWebhookUrl}</p>

                  {numberResult.errors?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-red-400 mb-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Errors ({numberResult.errors.length}):
                      </p>
                      <div className="max-h-40 overflow-auto space-y-1">
                        {numberResult.errors.map((e, i) => (
                          <p key={i} className="text-xs text-red-300 bg-red-500/10 px-2 py-1 rounded">{e}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Step 3: Fix Missing SIDs */}
        <div className="bg-[#0d2137] border border-gray-700 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-cyan-400" />
            <h2 className="font-semibold text-white">Step 3 — Fix Numbers Missing Twilio SID</h2>
          </div>
          <p className="text-gray-400 text-sm">
            Finds all virtual numbers with no Twilio SID, looks them up in Twilio by phone number, saves the SID, and configures their webhooks automatically.
          </p>
          <button
            onClick={runFixMissingSids}
            disabled={loadingFix}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-gray-950 font-semibold rounded-lg transition"
          >
            <Wrench className="w-4 h-4" />
            {loadingFix ? 'Fixing...' : 'Fix Missing SIDs'}
          </button>

          {fixResult && (
            <div className={`rounded-lg p-4 text-sm space-y-2 ${fixResult.error ? 'bg-red-500/10 border border-red-500/30' : 'bg-gray-800 border border-gray-700'}`}>
              {fixResult.error ? (
                <div className="flex items-start gap-2 text-red-400"><XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>{fixResult.error}</span></div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="text-center p-2 bg-gray-900 rounded-lg">
                      <p className="text-xl font-bold text-white">{fixResult.total_missing}</p>
                      <p className="text-xs text-gray-400">Missing SID</p>
                    </div>
                    <div className="text-center p-2 bg-emerald-500/10 rounded-lg">
                      <p className="text-xl font-bold text-emerald-400">{fixResult.fixed}</p>
                      <p className="text-xs text-gray-400">Fixed</p>
                    </div>
                    <div className="text-center p-2 bg-yellow-500/10 rounded-lg">
                      <p className="text-xl font-bold text-yellow-400">{fixResult.not_found_in_twilio}</p>
                      <p className="text-xs text-gray-400">Not in Twilio</p>
                    </div>
                    <div className="text-center p-2 bg-red-500/10 rounded-lg">
                      <p className="text-xl font-bold text-red-400">{fixResult.failed}</p>
                      <p className="text-xs text-gray-400">Failed</p>
                    </div>
                  </div>
                  {fixResult.errors?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-red-400 mb-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Errors:
                      </p>
                      <div className="max-h-40 overflow-auto space-y-1">
                        {fixResult.errors.map((e, i) => (
                          <p key={i} className="text-xs text-red-300 bg-red-500/10 px-2 py-1 rounded">{e}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-sm text-yellow-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Auto-runs on new number provisioning</p>
            <p className="text-xs text-yellow-400 mt-1">New numbers are auto-configured when provisioned. Run Step 2 once to catch all existing numbers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}