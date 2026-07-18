import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2, Zap, Sparkles, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PLATFORMS = ["Google Ads", "Facebook Ads", "LinkedIn Ads", "Bing Ads"];

const PPC_LINKS = [
  { label: "Google Ads", url: "https://ads.google.com" },
  { label: "Microsoft/Bing Ads", url: "https://ads.microsoft.com" },
  { label: "Facebook Ads Manager", url: "https://www.facebook.com/adsmanager" },
  { label: "LinkedIn Ads", url: "https://www.linkedin.com/campaignmanager" },
  { label: "Google Analytics", url: "https://analytics.google.com" },
];

export default function PPCManager() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    campaign_name: "",
    plan: "all",
    platform: "",
    ad_group: "",
    keywords: [],
    daily_budget: 0,
    status: "active",
    impressions: 0,
    clicks: 0,
    conversions: 0,
    ctr: 0,
    roi: 0,
    notes: ""
  });
  const [keywordInput, setKeywordInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const handleAIGenerate = async () => {
    setAiLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a professional PPC (Pay-Per-Click) campaign for VoxTelefony, a virtual phone number service offering US, UK, Canada and Australia virtual numbers at affordable prices.
      Return: campaign_name, platform (one of: "Google Ads", "Facebook Ads", "LinkedIn Ads", "Bing Ads" - pick best), ad_group (specific ad group name), keywords (array of 8 high-converting PPC keywords with commercial intent), daily_budget (realistic USD number), notes (detailed ad copy suggestions, targeting strategy, bid strategy, and conversion optimization tips).`,
      response_json_schema: {
        type: "object",
        properties: {
          campaign_name: { type: "string" },
          platform: { type: "string" },
          ad_group: { type: "string" },
          keywords: { type: "array", items: { type: "string" } },
          daily_budget: { type: "number" },
          notes: { type: "string" }
        }
      }
    });
    setFormData(prev => ({ ...prev, ...result, status: "active", impressions: 0, clicks: 0, conversions: 0, ctr: 0, roi: 0 }));
    setAiLoading(false);
    setOpenDialog(true);
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    const data = await base44.entities.PPCCampaign.list().catch(() => []);
    setCampaigns(data || []);
    setLoading(false);
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim()) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keywordInput.trim()]
      });
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (index) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async () => {
    if (!formData.campaign_name.trim() || !formData.platform) return;

    if (editingId) {
      await base44.entities.PPCCampaign.update(editingId, formData);
    } else {
      await base44.entities.PPCCampaign.create(formData);
    }

    loadCampaigns();
    setOpenDialog(false);
    resetForm();
  };

  const handleEdit = (campaign) => {
    setFormData(campaign);
    setEditingId(campaign.id);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    await base44.entities.PPCCampaign.delete(id);
    loadCampaigns();
  };

  const resetForm = () => {
    setFormData({
      campaign_name: "",
      plan: "all",
      platform: "",
      ad_group: "",
      keywords: [],
      daily_budget: 0,
      status: "active",
      impressions: 0,
      clicks: 0,
      conversions: 0,
      ctr: 0,
      roi: 0,
      notes: ""
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {PPC_LINKS.map(link => (
          <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-xs text-amber-300 transition-colors">
            <ExternalLink className="w-3 h-3" /> {link.label}
          </a>
        ))}
      </div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5" /> PPC Campaigns
        </h2>
        <div className="flex gap-2">
        <Button onClick={handleAIGenerate} disabled={aiLoading} className="bg-indigo-600 hover:bg-indigo-700">
          {aiLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
          AI Generate
        </Button>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="bg-amber-600 hover:bg-amber-700">
              <Plus className="w-4 h-4 mr-2" /> New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">{editingId ? "Edit" : "Create"} PPC Campaign</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Campaign name"
                value={formData.campaign_name}
                onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Select value={formData.plan || "all"} onValueChange={(v) => setFormData({ ...formData, plan: v })}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Target plan" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="us">US Virtual Number</SelectItem>
                  <SelectItem value="canada">Canada Virtual Number</SelectItem>
                  <SelectItem value="uk">UK Virtual Number</SelectItem>
                  <SelectItem value="australia">Australia Virtual Number</SelectItem>
                </SelectContent>
              </Select>
              <Select value={formData.platform} onValueChange={(v) => setFormData({ ...formData, platform: v })}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Ad group"
                value={formData.ad_group}
                onChange={(e) => setFormData({ ...formData, ad_group: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Keywords</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add keyword"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddKeyword()}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Button onClick={handleAddKeyword} className="bg-slate-600 hover:bg-slate-500">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((kw, i) => (
                    <span key={i} className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {kw}
                      <button onClick={() => handleRemoveKeyword(i)} className="hover:text-amber-100">×</button>
                    </span>
                  ))}
                </div>
              </div>
              <Input
                type="number"
                placeholder="Daily budget (USD)"
                value={formData.daily_budget}
                onChange={(e) => setFormData({ ...formData, daily_budget: parseFloat(e.target.value) })}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Input
                type="number"
                placeholder="Impressions"
                value={formData.impressions}
                onChange={(e) => setFormData({ ...formData, impressions: parseInt(e.target.value) })}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Input
                type="number"
                placeholder="Clicks"
                value={formData.clicks}
                onChange={(e) => setFormData({ ...formData, clicks: parseInt(e.target.value) })}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Input
                type="number"
                placeholder="Conversions"
                value={formData.conversions}
                onChange={(e) => setFormData({ ...formData, conversions: parseInt(e.target.value) })}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Input
                type="number"
                step="0.01"
                placeholder="CTR (%)"
                value={formData.ctr}
                onChange={(e) => setFormData({ ...formData, ctr: parseFloat(e.target.value) })}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Input
                type="number"
                step="0.01"
                placeholder="ROI (%)"
                value={formData.roi}
                onChange={(e) => setFormData({ ...formData, roi: parseFloat(e.target.value) })}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Button onClick={handleSubmit} className="w-full bg-amber-600 hover:bg-amber-700">
                {editingId ? "Update" : "Create"} Campaign
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
      ) : campaigns.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No campaigns yet. Create one to get started!</p>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {campaigns.map((campaign) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 flex items-center justify-between hover:bg-slate-700/70 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{campaign.campaign_name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{campaign.platform} • {campaign.ad_group} • Plan: {campaign.plan === "us" ? "US" : campaign.plan === "canada" ? "Canada" : campaign.plan === "uk" ? "UK" : campaign.plan === "australia" ? "Australia" : "All"}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>Daily: ${campaign.daily_budget}</span>
                    <span>Impressions: {campaign.impressions}</span>
                    <span>Clicks: {campaign.clicks}</span>
                    <span>CTR: {campaign.ctr.toFixed(2)}%</span>
                    <span>ROI: {campaign.roi.toFixed(2)}%</span>
                    <span className={`px-2 py-1 rounded ${campaign.status === "active" ? "bg-green-500/20 text-green-300" : campaign.status === "paused" ? "bg-amber-500/20 text-amber-300" : "bg-gray-500/20 text-gray-300"}`}>
                      {campaign.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleEdit(campaign)} variant="ghost" size="icon">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => handleDelete(campaign.id)} variant="ghost" size="icon" className="hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}