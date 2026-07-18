import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, ChevronRight, CheckCircle2, Loader2, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const FunctionDisplay = ({ toolCall }) => {
  const [expanded, setExpanded] = useState(false);
  const name = toolCall?.name || "Function";
  const status = toolCall?.status || "pending";

  const statusConfig = {
    pending: { icon: Clock, color: "text-slate-400", text: "Pending" },
    running: { icon: Loader2, color: "text-slate-500", text: "Running...", spin: true },
    in_progress: { icon: Loader2, color: "text-slate-500", text: "Running...", spin: true },
    completed: { icon: CheckCircle2, color: "text-green-500", text: "Done" },
    success: { icon: CheckCircle2, color: "text-green-500", text: "Done" },
    failed: { icon: AlertCircle, color: "text-red-500", text: "Failed" },
    error: { icon: AlertCircle, color: "text-red-500", text: "Failed" },
  }[status] || { icon: Clock, color: "text-slate-400", text: "" };

  const Icon = statusConfig.icon;
  const formattedName = name.replace(/_/g, " ").toLowerCase();

  return (
    <div className="mt-1.5 text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 hover:border-gray-600 transition-all"
      >
        <Icon className={cn("h-3 w-3", statusConfig.color, statusConfig.spin && "animate-spin")} />
        <span className="text-gray-400">{formattedName}</span>
        {statusConfig.text && <span className="text-gray-600">• {statusConfig.text}</span>}
        {!statusConfig.spin && toolCall.arguments_string && (
          <ChevronRight className={cn("h-3 w-3 text-gray-600 ml-auto transition-transform", expanded && "rotate-90")} />
        )}
      </button>
    </div>
  );
};

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center mt-0.5 flex-shrink-0">
          <Bot className="w-4 h-4 text-cyan-400" />
        </div>
      )}
      <div className={cn("max-w-[85%]", isUser && "flex flex-col items-end")}>
        {message.content && (
          <div className={cn(
            "rounded-2xl px-4 py-2.5",
            isUser
              ? "bg-cyan-500/20 text-cyan-100 border border-cyan-500/30"
              : "bg-gray-800 border border-gray-700 text-gray-100"
          )}>
            {isUser ? (
              <p className="text-sm leading-relaxed">{message.content}</p>
            ) : (
              <ReactMarkdown
                className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                components={{
                  p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
                  ol: ({ children }) => <ol className="my-1 ml-4 list-decimal">{children}</ol>,
                  li: ({ children }) => <li className="my-0.5">{children}</li>,
                  strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                  a: ({ children, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">{children}</a>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}
        {message.tool_calls?.length > 0 && (
          <div className="mt-1 space-y-1">
            {message.tool_calls.map((tc, i) => <FunctionDisplay key={i} toolCall={tc} />)}
          </div>
        )}
      </div>
    </div>
  );
}