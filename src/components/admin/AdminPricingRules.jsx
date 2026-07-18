import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { DollarSign, Plus, Trash2, Loader2, RefreshCw, TrendingUp } from "lucide-react";

const CATEGORIES = [
  { value: "number_local",      label: "Local DID (monthly)" },
  { value: "number_tollfree",   label: "Toll-Free (monthly)" },
  { value: "number_mobile",     label: "Mobile DID (monthly)" },
  { value: "number_national",   label: "National DID (monthly)" },
  { value: "number_activation", label: "Activation Fee (one-time)" },
  { value: "call_outbound",     label: "Outbound Call (per min)" },
  { value: "call_inbound",      label: "Inbound Call (per min)" },
  { value: "sms_outbound",      label: "Outbound SMS (per msg)" },
  { value: "sms_inbound",       label: "Inbound SMS (per msg)" },
  { value: "esim_data",         label: "eSIM Data Markup" },
  { value: "reseller_discount", label: "Reseller Discount" },
];

const BLANK_RULE = { name: "", category: "number_local", country_code: "*", buy_cost: "", sell_price: "", reseller_price: "", activation_fee: "", billing_increment_secs: 60, profit_margin_pct: 40, is_premium: false, is_blocked: false, notes: "", is_active: true };

function margin(buy, sell) {
  if (!buy || !sell || sell === 0) return null;
  return Math.round((1 - buy / sell) * 100);
}

export default function AdminPricingRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [saving, setSaving] = useState(null);
  const [newRule, setNewRule] = useState(BLANK_RULE);
  const [filterCat, setFilterCat] = useState("all");

  useEffect(() => { loadRules(); }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      const data = await base44.asServiceRole.entities.PricingRule.list("-created_date", 500);
      setRules(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const seedDefaults = async () => {
    setSeeding(true);
    try {
      const res = await base44.functions.invoke("pricingEngine", { action: "seed" });
      alert(res.data?.message || `Seeded ${res.data?.created} rules`);
      await loadRules();
    } catch (err) { alert("Seed failed: " + err.message); }
    finally { setSeeding(false); }
  };

  const updateRule = async (id, field, value) => {
    const parsed = ["buy_cost", "sell_price", "reseller_price", "activation_fee"].includes(field)
      ? (value === "" ? null : parseFloat(value))
      : value;
    setRules(prev => prev.map(r => r.id === id ? { ...r, [field]: parsed } : r));
    setSaving(id + field);
    await base44.asServiceRole.entities.PricingRule.update(id, { [field]: parsed });
    setSaving(null);
  };

  const deleteRule = async (id) => {
    if (!confirm("Delete this rule?")) return;
    await base44.asServiceRole.entities.PricingRule.delete(id);
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const addRule = async () => {
    if (!newRule.name || !newRule.category || !newRule.country_code) return alert("Fill in name, category and country.");
    const payload = {
      ...newRule,
      buy_cost: newRule.buy_cost !== "" ? parseFloat(newRule.buy_cost) : 0,
      sell_price: parseFloat(newRule.sell_price) || 0,
      reseller_price: newRule.reseller_price !== "" ? parseFloat(newRule.reseller_price) : null,
      activation_fee: newRule.activation_fee !== "" ? parseFloat(newRule.activation_fee) : 0,
      billing_increment_secs: newRule.billing_increment_secs || 60,
      profit_margin_pct: newRule.profit_margin_pct || 40,
      is_premium: newRule.is_premium || false,
      is_blocked: newRule.is_blocked || false,
    };
    const created = await base44.asServiceRole.entities.PricingRule.create(payload);
    setRules(prev => [created, ...prev]);
    setNewRule(BLANK_RULE);
  };

  const filtered = filterCat === "all" ? rules : rules.filter(r => r.category === filterCat);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-cyan-400" /> Pricing Rules
          <span className="text-sm text-gray-500 font-normal">({rules.length} rules)</span>
        </h2>
        <div className="flex gap-2">
          <button onClick={loadRules} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          {rules.length === 0 && (
            <button onClick={seedDefaults} disabled={seeding}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-gray-950 rounded-lg text-sm font-bold transition-colors">
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
              Seed Defaults
            </button>
          )}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterCat("all")}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${filterCat === "all" ? "bg-cyan-500 text-gray-950" : "bg-white/5 text-gray-400 hover:text-white"}`}>
          All
        </button>
        {CATEGORIES.map(c => (
          <button key={c.value} onClick={() => setFilterCat(c.value)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${filterCat === c.value ? "bg-cyan-500 text-gray-950" : "bg-white/5 text-gray-400 hover:text-white"}`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Add Rule */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Add Rule</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input value={newRule.name} onChange={e => setNewRule(r => ({...r, name: e.target.value}))}
            placeholder="Rule name" className="bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 col-span-2 md:col-span-1" />
          <select value={newRule.category} onChange={e => setNewRule(r => ({...r, category: e.target.value}))}
            className="bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500">
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <input value={newRule.country_code} onChange={e => setNewRule(r => ({...r, country_code: e.target.value}))}
            placeholder="Country (* = all)" className="bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 uppercase" />
          <input type="number" step="0.0001" value={newRule.buy_cost} onChange={e => setNewRule(r => ({...r, buy_cost: e.target.value}))}
            placeholder="Buy cost $" className="bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
          <input type="number" step="0.0001" value={newRule.sell_price} onChange={e => setNewRule(r => ({...r, sell_price: e.target.value}))}
            placeholder="Sell price $" className="bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
          <input type="number" step="0.0001" value={newRule.reseller_price} onChange={e => setNewRule(r => ({...r, reseller_price: e.target.value}))}
            placeholder="Reseller price $" className="bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
          <button onClick={addRule} className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 rounded-lg px-4 py-2 font-bold text-sm transition-colors">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-cyan-400 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-3">No pricing rules yet.</p>
          <button onClick={seedDefaults} disabled={seeding}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 rounded-lg font-bold text-sm">
            Seed Default Prices
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {["Name", "Category", "Country", "Buy Cost", "Sell Price", "Reseller", "Margin", "Increment", "Premium", "Blocked", "Active", ""].map(h => (
                  <th key={h} className="text-left text-xs text-gray-500 uppercase tracking-wider py-3 px-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(rule => {
                const mgn = margin(rule.buy_cost, rule.sell_price);
                return (
                  <tr key={rule.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-3">
                      <input value={rule.name || ""} onChange={e => updateRule(rule.id, 'name', e.target.value)}
                        className="bg-transparent text-white text-sm focus:outline-none focus:bg-gray-900/50 rounded px-1 w-32" />
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-xs text-cyan-400 font-mono">{rule.category}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <input value={rule.country_code || ""} onChange={e => updateRule(rule.id, 'country_code', e.target.value.toUpperCase())}
                        className="bg-transparent text-white text-sm focus:outline-none focus:bg-gray-900/50 rounded px-1 w-10 uppercase" />
                    </td>
                    {/* Buy cost */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600 text-xs">$</span>
                        <input type="number" step="0.0001" value={rule.buy_cost ?? ""} onChange={e => updateRule(rule.id, 'buy_cost', e.target.value)}
                          className="bg-transparent text-red-300 text-sm focus:outline-none focus:bg-gray-900/50 rounded px-1 w-16" />
                      </div>
                    </td>
                    {/* Sell price */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600 text-xs">$</span>
                        <input type="number" step="0.0001" value={rule.sell_price ?? ""} onChange={e => updateRule(rule.id, 'sell_price', e.target.value)}
                          className="bg-transparent text-emerald-300 text-sm focus:outline-none focus:bg-gray-900/50 rounded px-1 w-16" />
                        {saving === rule.id + 'sell_price' && <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />}
                      </div>
                    </td>
                    {/* Reseller price */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600 text-xs">$</span>
                        <input type="number" step="0.0001" value={rule.reseller_price ?? ""} onChange={e => updateRule(rule.id, 'reseller_price', e.target.value)}
                          className="bg-transparent text-yellow-300 text-sm focus:outline-none focus:bg-gray-900/50 rounded px-1 w-16" />
                      </div>
                    </td>
                    {/* Margin */}
                    <td className="py-2.5 px-3">
                      {mgn !== null ? (
                        <span className={`text-xs font-bold ${mgn >= 50 ? 'text-emerald-400' : mgn >= 25 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {mgn}%
                        </span>
                      ) : <span className="text-gray-700">—</span>}
                    </td>
                    {/* Billing increment */}
                    <td className="py-2.5 px-3">
                      <input type="number" step="1" value={rule.billing_increment_secs ?? 60} onChange={e => updateRule(rule.id, 'billing_increment_secs', e.target.value)}
                        className="bg-transparent text-gray-300 text-sm focus:outline-none focus:bg-gray-900/50 rounded px-1 w-10" />
                    </td>
                    {/* Premium */}
                    <td className="py-2.5 px-3">
                      <button onClick={() => updateRule(rule.id, 'is_premium', !rule.is_premium)}
                        className={"w-9 h-5 rounded-full transition-colors relative " + (rule.is_premium ? 'bg-yellow-500' : 'bg-gray-700')}>
                        <div className={"absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform " + (rule.is_premium ? 'translate-x-4' : 'translate-x-0.5')} />
                      </button>
                    </td>
                    {/* Blocked */}
                    <td className="py-2.5 px-3">
                      <button onClick={() => updateRule(rule.id, 'is_blocked', !rule.is_blocked)}
                        className={"w-9 h-5 rounded-full transition-colors relative " + (rule.is_blocked ? 'bg-red-500' : 'bg-gray-700')}>
                        <div className={"absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform " + (rule.is_blocked ? 'translate-x-4' : 'translate-x-0.5')} />
                      </button>
                    </td>
                    {/* Active toggle */}
                    <td className="py-2.5 px-3">
                      <button onClick={() => updateRule(rule.id, 'is_active', !rule.is_active)}
                        className={`w-9 h-5 rounded-full transition-colors relative ${rule.is_active ? 'bg-emerald-500' : 'bg-gray-700'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${rule.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </td>
                    <td className="py-2.5 px-3">
                      <button onClick={() => deleteRule(rule.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}