import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Archive, RefreshCw, Loader2, Phone, RotateCcw } from "lucide-react";

export default function AdminNumberArchive() {
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => { loadArchives(); }, []);

  const loadArchives = async () => {
    setLoading(true);
    try {
      const data = await base44.asServiceRole.entities.NumberArchive.list("-archived_at", 500);
      setArchives(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleReclaim = async (archive) => {
    if (!confirm("Allow " + archive.original_user_email + " to reclaim " + archive.phone_number + "?")) return;
    try {
      await base44.asServiceRole.entities.NumberArchive.update(archive.id, {
        status: "reclaimed",
        reclaimed_at: new Date().toISOString(),
      });
      alert("Number marked as reclaimed. It can now be re-assigned to the user upon checkout.");
      await loadArchives();
    } catch (err) {
      alert("Failed: " + err.message);
    }
  };

  const filtered = filter === "all" ? archives : archives.filter(a => a.status === filter);

  const statusColors = {
    archived: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    reclaimed: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    released: "text-red-400 bg-red-500/10 border-red-500/30",
    expired: "text-gray-500 bg-gray-500/10 border-gray-500/30",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Archive className="w-5 h-5 text-cyan-400" /> Number Archive
          <span className="text-sm text-gray-500 font-normal">({archives.length} records)</span>
        </h2>
        <button onClick={loadArchives} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", "archived", "reclaimed", "released", "expired"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={"px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors " + (filter === f ? "bg-cyan-500 text-gray-950" : "bg-white/5 text-gray-400 hover:text-white")}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-cyan-400 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Archive className="w-10 h-10 mx-auto mb-3" />
          <p>No archived numbers found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider py-3 px-3">Phone Number</th>
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider py-3 px-3">Original Owner</th>
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider py-3 px-3">Country</th>
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider py-3 px-3">Archived At</th>
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider py-3 px-3">Reclaim Eligible</th>
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider py-3 px-3">Status</th>
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider py-3 px-3">Reason</th>
                <th className="text-xs text-gray-500 uppercase tracking-wider py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-white font-mono">{a.phone_number}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-gray-400 text-xs">{a.original_user_email || "—"}</td>
                  <td className="py-2.5 px-3 text-gray-400">{a.country_code || "—"}</td>
                  <td className="py-2.5 px-3 text-gray-400 text-xs">{a.archived_at ? new Date(a.archived_at).toLocaleDateString() : "—"}</td>
                  <td className="py-2.5 px-3 text-gray-400 text-xs">{a.reclaim_eligible_at ? new Date(a.reclaim_eligible_at).toLocaleDateString() : "—"}</td>
                  <td className="py-2.5 px-3">
                    <span className={"text-xs font-semibold px-2 py-0.5 rounded border " + (statusColors[a.status] || statusColors.expired)}>
                      {a.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-400 text-xs">{a.reason || "—"}</td>
                  <td className="py-2.5 px-3">
                    {a.status === "archived" && (
                      <button onClick={() => handleReclaim(a)} className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs font-semibold">
                        <RotateCcw className="w-3.5 h-3.5" /> Reclaim
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}