import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Zap, Loader2, BarChart3 } from 'lucide-react';

export default function SpeedTestWidget() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState(null);

  const runTest = async () => {
    setTesting(true);
    try {
      const res = await base44.functions.invoke('runSpeedTest', {});
      setResults(res.data?.results);
    } catch (err) {
      console.error('Speed test failed:', err);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-4 rounded-lg border border-white/10 bg-white/3 space-y-4">
      <h3 className="text-white font-bold flex items-center gap-2">
        <BarChart3 size={16} /> Speed Test
      </h3>

      {results ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-slate-500 text-xs">Latency</p>
            <p className="text-white font-bold text-lg">{results.latency_ms}ms</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-slate-500 text-xs">Jitter</p>
            <p className="text-white font-bold text-lg">{results.jitter_ms}ms</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-slate-500 text-xs">Download</p>
            <p className="text-white font-bold text-lg">{results.download_mbps}Mbps</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-slate-500 text-xs">Upload</p>
            <p className="text-white font-bold text-lg">{results.upload_mbps}Mbps</p>
          </div>
        </div>
      ) : (
        <p className="text-slate-500 text-sm">Run a speed test to see your connection quality</p>
      )}

      <Button
        onClick={runTest}
        disabled={testing}
        className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
      >
        {testing ? (
          <><Loader2 size={14} className="animate-spin" /> Testing...</>
        ) : (
          <><Zap size={14} /> Run Speed Test</>
        )}
      </Button>
    </div>
  );
}