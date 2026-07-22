import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit2, Trash2, Share2, Sparkles, ExternalLink, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SMOPostList from "./SMOPostList";
import SMOSendHistory from "./SMOSendHistory";

const PLATFORMS = ["Facebook", "Instagram", "LinkedIn", "Twitter", "TikTok"];

const SMO_LINKS = [
  { label: "Facebook Business", url: "https://business.facebook.com" },
  { label: "Instagram Creator Studio", url: "https://business.instagram.com" },
  { label: "LinkedIn Campaign Manager", url: "https://www.linkedin.com/campaignmanager" },
  { label: "Twitter/X Ads", url: "https://ads.twitter.com" },
  { label: "TikTok for Business", url: "https://www.tiktok.com/business" },
  { label: "Buffer", url: "https://buffer.com" },
];

export default function SMOManager() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    campaign_name: "",
    platforms: [],
    target_audience: "",
    engagement_goal: 0,
    current_engagement: 0,
    status: "active",
    budget: 0,
    content_calendar: "",
    notes: ""
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  const handleGeneratePosts = async () => {
    setGenerating(true);
    try {
      const response = await base44.functions.invoke('generateSMOPosts', {});
      if (response.data?.success) {
        loadCampaigns();
        return response.data;
      } else {
        alert(response.data?.error || "Generation failed");
        return response.data;
      }
    } catch (e) {
      console.error("Post generation failed", e);
      alert("Post generation failed: " + e.message);
      return null;
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleAIGenerate = async () => {
    setAiLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a professional social media (SMO) campaign for VoxTelefony, a virtual phone number service offering US, UK, Canada and Australia numbers.
      Return: campaign_name, platforms (array from: Facebook, Instagram, LinkedIn, Twitter, TikTok - pick the best 3), target_audience (detailed description), engagement_goal (realistic number), budget (monthly USD), content_calendar (description of weekly posting strategy), notes (detailed social media strategy with content ideas, hashtags, posting frequency).`,
      response_json_schema: {
        type: "object",
        properties: {
          campaign_name: { type: "string" },
          platforms: { type: "array", items: { type: "string" } },
          target_audience: { type: "string" },
          engagement_goal: { type: "number" },
          budget: { type: "number" },
          content_calendar: { type: "string" },
          notes: { type: "string" }
        }
      }
    });
    setFormData(prev => ({ ...prev, ...result, status: "active", current_engagement: 0 }));
    setAiLoading(false);
    setOpenDialog(true);
  };

  const loadCampaigns = async () => {
    setLoading(true);
    const data = await base44.entities.SMOCampaign.list().catch(() => []);
    setCampaigns(data || []);
    setLoading(false);
  };

  const handlePlatformToggle = (platform) => {
    setFormData({
      ...formData,
      platforms: formData.platforms.includes(platform)
        ? formData.platforms.filter((p) => p !== platform)
        : [...formData.platforms, platform]
    });
  };

  const handleSubmit = async () => {
    if (!formData.campaign_name.trim() || formData.platforms.length === 0) return;

    if (editingId) {
      await base44.entities.SMOCampaign.update(editingId, formData);
    } else {
      await base44.entities.SMOCampaign.create(formData);
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
    await base44.entities.SMOCampaign.delete(id);
    loadCampaigns();
  };

  const resetForm = () => {
    setFormData({
      campaign_name: "",
      platforms: [],
      target_audience: "",
      engagement_goal: 0,
      current_engagement: 0,
      status: "active",
      budget: 0,
      content_calendar: "",
      notes: ""
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {SMO_LINKS.map(link => (
          <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-xs text-purple-300 transition-colors">
            <ExternalLink className="w-3 h-3" /> {link.label}
          </a>
        ))}
      </div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Share2 className="w-5 h-5" /> SMO Campaigns
        </h2>
        <div className="flex gap-2">
        <Button onClick={handleAIGenerate} disabled={aiLoading} className="bg-indigo-600 hover:bg-indigo-700">
          {aiLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
          AI Generate
        </Button>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" /> New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">{editingId ? "Edit" : "Create"} SMO Campaign</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Campaign name"
                value={formData.campaign_name}
                onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Platforms</label>
                <div className="space-y-2">
                  {PLATFORMS.map((platform) => (
                    <div key={platform} className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.platforms.includes(platform)}
                        onCheckedChange={() => handlePlatformToggle(platform)}
                      />
                      <label className="text-white text-sm cursor-pointer">{platform}</label>
                    </div>
                  ))}
                </div>
              </div>
              <Input
                placeholder="Target audience description"
                value={formData.target_audience}
                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Input
                type="number"
                placeholder="Engagement goal (likes, shares, comments)"
                value={formData.engagement_goal}
                onChange={(e) => setFormData({ ...formData, engagement_goal: parseInt(e.target.value) })}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Input
                type="number"
                placeholder="Current engagement"
                value={formData.current_engagement}
                onChange={(e) => setFormData({ ...formData, current_engagement: parseInt(e.target.value) })}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Input
                type="number"
                placeholder="Monthly budget (USD)"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Input
                placeholder="Content calendar link/description"
                value={formData.content_calendar}
                onChange={(e) => setFormData({ ...formData, content_calendar: e.target.value })}
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
              <Button onClick={handleSubmit} className="w-full bg-purple-600 hover:bg-purple-700">
                {editingId ? "Update" : "Create"} Campaign
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
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
                  <p className="text-sm text-gray-400 mt-1">Platforms: {campaign.platforms.join(", ") || "None"}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>Target: {campaign.engagement_goal}</span>
                    <span>Current: {campaign.current_engagement}</span>
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

      <div className="mt-8 pt-6 border-t border-slate-700">
        {/* Tab Switcher */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "posts"
                ? "bg-purple-600 text-white"
                : "bg-slate-700/50 text-gray-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" /> Posts
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "history"
                ? "bg-green-600 text-white"
                : "bg-slate-700/50 text-gray-400 hover:text-white"
            }`}
          >
            <Send className="w-4 h-4" /> Send History
          </button>
        </div>

        {activeTab === "posts" ? (
          <SMOPostList onGenerate={handleGeneratePosts} generating={generating} />
        ) : (
          <SMOSendHistory />
        )}
      </div>
    </div>
  );
}