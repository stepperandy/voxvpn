import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Lightbulb, MessageSquare, CheckCircle2, X } from "lucide-react";

export default function SMSAIAssistant({ messages, selectedContact }) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("summarize");
  const [result, setResult] = useState("");

  if (!messages || messages.length === 0) {
    return (
      <div className="w-80 border-l border-gray-800/50 flex flex-col bg-gray-900/30">
        <div className="px-3 py-3 border-b border-gray-800/50">
          <h3 className="font-semibold text-sm">AI Assistant</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-600 p-4">
          <p className="text-xs text-center">Select a conversation to use AI features</p>
        </div>
      </div>
    );
  }

  const conversationText = messages
    .map(m => `${m.direction === "inbound" ? "Customer" : "You"}: ${m.body}`)
    .join("\n");

  const handleSummarize = async () => {
    setLoading(true);
    setActiveTab("summarize");
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Summarize this customer service conversation in 2-3 sentences, highlighting key issues and resolution status:\n\n${conversationText}`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            key_issues: { type: "array", items: { type: "string" } },
            status: { type: "string" }
          }
        }
      });
      setResult(JSON.stringify(res, null, 2));
    } catch (err) {
      setResult("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDraftReply = async () => {
    setLoading(true);
    setActiveTab("draft");
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this customer conversation, draft a professional, concise reply (2-3 sentences) that addresses their latest concern:\n\n${conversationText}`,
      });
      setResult(res);
    } catch (err) {
      setResult("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUp = async () => {
    setLoading(true);
    setActiveTab("followup");
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `For this customer service conversation, suggest 2-3 follow-up actions (e.g., schedule callback, send documentation, escalate). Be specific and actionable:\n\n${conversationText}`,
        response_json_schema: {
          type: "object",
          properties: {
            actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  urgency: { type: "string", enum: ["low", "medium", "high"] },
                  description: { type: "string" }
                }
              }
            }
          }
        }
      });
      setResult(JSON.stringify(res, null, 2));
    } catch (err) {
      setResult("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;
    
    try {
      const parsed = JSON.parse(result);
      
      if (activeTab === "summarize") {
        return (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-1">Summary</p>
              <p className="text-sm text-gray-100">{parsed.summary}</p>
            </div>
            {parsed.key_issues && (
              <div>
                <p className="text-xs text-gray-400 font-semibold mb-1">Key Issues</p>
                <ul className="text-xs text-gray-200 space-y-1">
                  {parsed.key_issues.map((issue, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-cyan-400">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {parsed.status && (
              <div>
                <p className="text-xs text-gray-400 font-semibold mb-1">Status</p>
                <p className="text-sm text-cyan-400">{parsed.status}</p>
              </div>
            )}
          </div>
        );
      }
      
      if (activeTab === "draft") {
        return (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 font-semibold">Suggested Reply</p>
            <div className="bg-gray-800/30 border border-gray-700 rounded p-3 text-sm text-gray-100">
              {result}
            </div>
            <button className="w-full bg-cyan-600 hover:bg-cyan-500 px-2 py-1.5 rounded text-xs font-semibold transition-colors">
              Use This Reply
            </button>
          </div>
        );
      }
      
      if (activeTab === "followup") {
        return (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 font-semibold">Suggested Actions</p>
            {parsed.actions && parsed.actions.length > 0 ? (
              <div className="space-y-2">
                {parsed.actions.map((item, i) => (
                  <div key={i} className="bg-gray-800/30 border border-gray-700 rounded p-2">
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                        item.urgency === "high" ? "bg-red-500" : 
                        item.urgency === "medium" ? "bg-yellow-500" : "bg-green-500"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-100">{item.action}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">{result}</p>
            )}
          </div>
        );
      }
    } catch {
      return <p className="text-sm text-gray-200">{result}</p>;
    }
  };

  return (
    <div className="w-80 border-l border-gray-800/50 flex flex-col bg-gray-900/30">
      {/* Header */}
      <div className="px-3 py-3 border-b border-gray-800/50">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-cyan-400" />
          AI Assistant
        </h3>
        <p className="text-xs text-gray-500 mt-1">{selectedContact}</p>
      </div>

      {/* Action Buttons */}
      <div className="px-3 py-2 border-b border-gray-800/50 space-y-2">
        <button
          onClick={handleSummarize}
          disabled={loading}
          className="w-full px-2 py-2 rounded text-xs font-semibold bg-gray-800 hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
        >
          {loading && activeTab === "summarize" ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Summarizing...
            </>
          ) : (
            <>
              <MessageSquare className="w-3.5 h-3.5" />
              Summarize
            </>
          )}
        </button>
        <button
          onClick={handleDraftReply}
          disabled={loading}
          className="w-full px-2 py-2 rounded text-xs font-semibold bg-gray-800 hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
        >
          {loading && activeTab === "draft" ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Drafting...
            </>
          ) : (
            <>
              <MessageSquare className="w-3.5 h-3.5" />
              Draft Reply
            </>
          )}
        </button>
        <button
          onClick={handleFollowUp}
          disabled={loading}
          className="w-full px-2 py-2 rounded text-xs font-semibold bg-gray-800 hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
        >
          {loading && activeTab === "followup" ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              Follow-up
            </>
          )}
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin mb-2" />
            <p className="text-xs">Processing...</p>
          </div>
        ) : result ? (
          <div className="text-sm">{renderResult()}</div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600 p-2">
            <p className="text-xs text-center">Click an action to analyze the conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}