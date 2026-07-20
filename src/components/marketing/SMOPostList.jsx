import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Trash2, Calendar, Sparkles, RefreshCw, Filter, ImageIcon, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PLATFORM_COLORS = {
  Facebook: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Instagram: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  LinkedIn: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  Twitter: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  TikTok: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

const STATUS_COLORS = {
  draft: "bg-gray-500/20 text-gray-300",
  scheduled: "bg-amber-500/20 text-amber-300",
  posted: "bg-green-500/20 text-green-300",
  archived: "bg-red-500/20 text-red-300",
};

export default function SMOPostList({ onGenerate, generating }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [previewPost, setPreviewPost] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const data = await base44.entities.SMOPost.list('-created_date', 100).catch(() => []);
    setPosts(data || []);
    setLoading(false);
  };

  const handleCopy = async (post) => {
    const hashtagsText = post.hashtags?.length ? "\n\n" + post.hashtags.map(h => `#${h}`).join(" ") : "";
    const ctaText = post.cta ? `\n\n${post.cta}` : "";
    const fullText = `${post.content}${hashtagsText}${ctaText}`;
    await navigator.clipboard.writeText(fullText);
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStatusChange = async (postId, newStatus) => {
    await base44.entities.SMOPost.update(postId, { status: newStatus });
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: newStatus } : p));
  };

  const handleDelete = async (id) => {
    await base44.entities.SMOPost.delete(id);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const handleGenerateImage = async (post) => {
    if (!post.image_prompt) return;
    try {
      const result = await base44.integrations.Core.GenerateImage({ prompt: post.image_prompt });
      await base44.entities.SMOPost.update(post.id, { notes: (post.notes || "") + `\n\n[Image URL: ${result.url}]` });
      window.open(result.url, "_blank");
    } catch (e) {
      console.error("Image generation failed", e);
    }
  };

  const filteredPosts = posts.filter(p => {
    if (platformFilter !== "all" && p.platform !== platformFilter) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" /> AI-Generated Posts
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[130px] h-8 bg-slate-700 border-slate-600 text-white text-xs">
              <Filter className="w-3 h-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="all">All Platforms</SelectItem>
              {Object.keys(PLATFORM_COLORS).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[110px] h-8 bg-slate-700 border-slate-600 text-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="posted">Posted</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadPosts} variant="ghost" size="sm" className="h-8 text-xs">
            <RefreshCw className="w-3 h-3 mr-1" /> Refresh
          </Button>
          <Button onClick={onGenerate} disabled={generating} size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700 text-xs">
            {generating ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
            Auto-Generate Posts
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-slate-700">
          <Sparkles className="w-10 h-10 text-purple-400/50 mx-auto mb-3" />
          <p className="text-gray-400 mb-2">No posts generated yet.</p>
          <p className="text-gray-500 text-sm">Click "Auto-Generate Posts" to let AI create platform-optimized content from your active campaigns.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <AnimatePresence>
            {filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 space-y-3 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${PLATFORM_COLORS[post.platform] || "bg-gray-500/20 text-gray-300"}`}>
                      {post.platform}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">{post.post_type}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[post.status] || "bg-gray-500/20 text-gray-300"}`}>
                    {post.status}
                  </span>
                </div>

                <p className="text-sm text-gray-200 line-clamp-3">{post.content}</p>

                {post.hashtags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.hashtags.slice(0, 5).map((tag, i) => (
                      <span key={i} className="text-xs text-purple-300">#{tag}</span>
                    ))}
                    {post.hashtags.length > 5 && <span className="text-xs text-gray-500">+{post.hashtags.length - 5}</span>}
                  </div>
                )}

                {post.cta && (
                  <p className="text-xs text-cyan-300 italic">→ {post.cta}</p>
                )}

                {post.scheduled_date && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                )}

                {post.campaign_name && (
                  <p className="text-xs text-gray-600">Campaign: {post.campaign_name}</p>
                )}

                <div className="flex items-center gap-1 pt-2 border-t border-slate-700">
                  <Button onClick={() => handleCopy(post)} variant="ghost" size="sm" className="h-7 text-xs hover:text-cyan-300">
                    {copiedId === post.id ? <><Check className="w-3 h-3 mr-1" /> Copied</> : <><Copy className="w-3 h-3 mr-1" /> Copy</>}
                  </Button>
                  {post.image_prompt && (
                    <Button onClick={() => handleGenerateImage(post)} variant="ghost" size="sm" className="h-7 text-xs hover:text-purple-300">
                      <ImageIcon className="w-3 h-3 mr-1" /> Image
                    </Button>
                  )}
                  <Button onClick={() => setPreviewPost(post)} variant="ghost" size="sm" className="h-7 text-xs">
                    Preview
                  </Button>
                  <Select value={post.status} onValueChange={(v) => handleStatusChange(post.id, v)}>
                    <SelectTrigger className="ml-auto w-[100px] h-7 bg-slate-700 border-slate-600 text-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="posted">Posted</SelectItem>
                      <SelectItem value="archived">Archive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => handleDelete(post.id)} variant="ghost" size="sm" className="h-7 text-xs hover:text-red-400">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Full Preview Dialog */}
      <Dialog open={!!previewPost} onOpenChange={(v) => !v && setPreviewPost(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {previewPost && (
                <>
                  <span className={`px-2 py-0.5 rounded text-xs border ${PLATFORM_COLORS[previewPost.platform] || ""}`}>
                    {previewPost.platform}
                  </span>
                  <span className="text-sm font-normal text-gray-400 capitalize">{previewPost.post_type}</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {previewPost && (
            <div className="space-y-3">
              <p className="text-white text-sm whitespace-pre-wrap">{previewPost.content}</p>
              {previewPost.hashtags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {previewPost.hashtags.map((tag, i) => (
                    <span key={i} className="text-xs text-purple-300">#{tag}</span>
                  ))}
                </div>
              )}
              {previewPost.cta && (
                <p className="text-sm text-cyan-300 font-medium">{previewPost.cta}</p>
              )}
              {previewPost.image_prompt && (
                <div className="bg-slate-900/50 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Image Generation Prompt:</p>
                  <p className="text-xs text-gray-400">{previewPost.image_prompt}</p>
                </div>
              )}
              <Button onClick={() => handleCopy(previewPost)} className="w-full bg-purple-600 hover:bg-purple-700">
                <Copy className="w-4 h-4 mr-2" /> Copy Full Post
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}