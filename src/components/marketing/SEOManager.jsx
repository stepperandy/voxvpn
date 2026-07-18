import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2, TrendingUp, Sparkles, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SEO_LINKS = [
  { label: "Google Search Console", url: "https://search.google.com/search-console" },
  { label: "Bing Webmaster Tools", url: "https://www.bing.com/webmasters" },
  { label: "Google Keyword Planner", url: "https://ads.google.com/home/tools/keyword-planner/" },
  { label: "Ahrefs", url: "https://ahrefs.com" },
  { label: "SEMrush", url: "https://www.semrush.com" },
];

export default function SEOManager() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    campaign_name: "",
    plan: "all",
    target_keywords: [],
    current_ranking: "",
    target_ranking: "",
    status: "active",
    url: "",
    budget: 0,
    notes: ""
  });
  const [keywordInput, setKeywordInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const handleAIGenerate = async () => {
    setAiLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a professional SEO campaign for a virtual phone number service called VoxTelefony that offers US, UK, Canada and Australia virtual numbers.
      Return a complete SEO campaign with: campaign_name, target_keywords (array of 6 high-value keywords), current_ranking (e.g. "Not ranked"), target_ranking (e.g. "Top 10"), url (use "https://voxtelefony.com"), budget (monthly USD number), notes (detailed SEO strategy description including on-page, off-page and technical SEO recommendations).`,
      response_json_schema: {
        type: "object",
        properties: {
          campaign_name: { type: "string" },
          target_keywords: { type: "array", items: { type: "string" } },
          current_ranking: { type: "string" },
          target_ranking: { type: "string" },
          url: { type: "string" },
          budget: { type: "number" },
          notes: { type: "string" }
        }
      }
    });
    setFormData(prev => ({ ...prev, ...result, status: "active" }));
    setAiLoading(false);
    setOpenDialog(true);
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    const data = await base44.entities.SEOCampaign.list().catch(() => []);
    setCampaigns(data || []);
    setLoading(false);
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim()) {
      setFormData({
        ...formData,
        target_keywords: [...formData.target_keywords, keywordInput.trim()]
      });
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (index) => {
    setFormData({
      ...formData,
      target_keywords: formData.target_keywords.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async () => {
    if (!formData.campaign_name.trim()) return;

    if (editingId) {
      await base44.entities.SEOCampaign.update(editingId, formData);
    } else {
      await base44.entities.SEOCampaign.create(formData);
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
    await base44.entities.SEOCampaign.delete(id);
    loadCampaigns();
  };

  const resetForm = () => {
    setFormData({
      campaign_name: "",
      plan: "all",
      target_keywords: [],
      current_ranking: "",
      target_ranking: "",
      status: "active",
      url: "",
      budget: 0,
      notes: ""
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {SEO_LINKS.map(link => (
          <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs text-blue-300 transition-colors">
            <ExternalLink className="w-3 h-3" /> {link.label}
          </a>
        ))}
      </div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5" /> SEO Campaigns
        </h2>
        <div className="flex gap-2">
        <Button onClick={handleAIGenerate} disabled={aiLoading} className="bg-indigo-600 hover:bg-indigo-700">
          {aiLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
          AI Generate
        </Button>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">{editingId ? "Edit" : "Create"} SEO Campaign</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Campaign name"
                value={formData.campaign_name}
                onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
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
                  {formData.target_keywords.map((kw, i) => (
                    <span key={i} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {kw}
                      <button onClick={() => handleRemoveKeyword(i)} className="hover:text-blue-100">×</button>
                    </span>
                  ))}
                </div>
              </div>
              <Input
                placeholder="Current ranking"
                value={formData.current_ranking}
                onChange={(e) => setFormData({ ...formData, current_ranking: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Input
                placeholder="Target ranking"
                value={formData.target_ranking}
                onChange={(e) => setFormData({ ...formData, target_ranking: e.target.value })}
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
              <Input
                placeholder="Target URL"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Input
                type="number"
                placeholder="Monthly budget (USD)"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
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
              <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700">
                {editingId ? "Update" : "Create"} Campaign
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
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
                  <p className="text-sm text-gray-400 mt-1">Keywords: {campaign.target_keywords.join(", ") || "None"}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>Plan: {campaign.plan === "us" ? "US" : campaign.plan === "canada" ? "Canada" : campaign.plan === "uk" ? "UK" : campaign.plan === "australia" ? "Australia" : "All"}</span>
                    <span>Current: {campaign.current_ranking || "-"}</span>
                    <span>Target: {campaign.target_ranking || "-"}</span>
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