import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SEOManager from "../components/marketing/SEOManager";
import SMOManager from "../components/marketing/SMOManager";
import PPCManager from "../components/marketing/PPCManager";
import SitemapManager from "../components/marketing/SitemapManager";
import { TrendingUp, Share2, Zap, Globe } from "lucide-react";

export default function AdminMarketing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Marketing Manager</h1>
          <p className="text-gray-400">Manage SEO, SMO, and PPC campaigns</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard icon={TrendingUp} title="SEO" color="bg-blue-500/10 border-blue-500/30" />
          <StatCard icon={Share2} title="SMO" color="bg-purple-500/10 border-purple-500/30" />
          <StatCard icon={Zap} title="PPC" color="bg-amber-500/10 border-amber-500/30" />
          <StatCard icon={Globe} title="Sitemap" color="bg-green-500/10 border-green-500/30" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="seo" className="bg-slate-800/50 rounded-lg border border-slate-700 backdrop-blur-sm p-6">
          <TabsList className="bg-slate-700/50 border border-slate-600 mb-6">
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> SEO
            </TabsTrigger>
            <TabsTrigger value="smo" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" /> SMO
            </TabsTrigger>
            <TabsTrigger value="ppc" className="flex items-center gap-2">
              <Zap className="w-4 h-4" /> PPC
            </TabsTrigger>
            <TabsTrigger value="sitemap" className="flex items-center gap-2">
              <Globe className="w-4 h-4" /> Sitemap
            </TabsTrigger>
          </TabsList>

          <TabsContent value="seo">
            <SEOManager />
          </TabsContent>

          <TabsContent value="smo">
            <SMOManager />
          </TabsContent>

          <TabsContent value="ppc">
            <PPCManager />
          </TabsContent>

          <TabsContent value="sitemap">
            <SitemapManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, color }) {
  return (
    <div className={`rounded-lg border ${color} p-4 backdrop-blur-sm`}>
      <div className="flex items-center gap-3">
        <Icon className="w-6 h-6 text-white" />
        <div>
          <p className="text-xs text-gray-400">Campaigns</p>
          <p className="text-lg font-semibold text-white">{title}</p>
        </div>
      </div>
    </div>
  );
}