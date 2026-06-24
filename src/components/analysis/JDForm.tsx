"use client";

import React, { useState } from "react";
import { createAnalysis, runAnalysis, getAnalysis, Analysis } from "@/lib/analysis-api";

interface JDFormProps {
  userId: number;
  resumeId: number;
  onAnalysisComplete: (analysis: Analysis) => void;
}

export default function JDForm({ userId, resumeId, onAnalysisComplete }: JDFormProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const charCount = jobDescription.trim().length;
  const isJdTooShort = charCount > 0 && charCount < 50;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const trimmedJd = jobDescription.trim();
    if (!trimmedJd) {
      setError("Job description cannot be empty.");
      return;
    }

    if (trimmedJd.length < 50) {
      setError("Please enter a detailed job description (minimum 50 characters) for an accurate analysis.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatusMessage("Initializing analyzer session...");

    try {
      // 1. POST /analysis/create
      const createRes = await createAnalysis(userId, resumeId, trimmedJd);
      const analysisId = createRes.id;

      // 2. POST /analysis/run/{analysis_id}
      setStatusMessage("Gemini is running cross-reference scan... (5-10s)");
      await runAnalysis(analysisId);

      // 3. GET /analysis/{analysis_id}
      setStatusMessage("Retrieving optimization report...");
      const finalAnalysis = await getAnalysis(analysisId);

      setStatusMessage("Success!");
      onAnalysisComplete(finalAnalysis);
    } catch (err: unknown) {
      console.error("Analysis failed:", err);
      const message = err instanceof Error ? err.message : "An unexpected error occurred during Gemini analysis. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
      setStatusMessage("");
    }
  };

  return (
    <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between animate-fade-in">
      {/* Background glow */}
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-zinc-100">ATS Optimizer Workspace</h3>
        </div>
        <p className="text-zinc-500 text-xs mt-2">
          Paste the target job description details below. Gemini AI will cross-reference it against your selected resume to discover skill gaps, compatibility rates, and recruiter recommendations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 relative">
        <div className="relative">
          <textarea
            value={jobDescription}
            onChange={(e) => {
              setJobDescription(e.target.value);
              if (error) setError(null);
            }}
            disabled={isLoading}
            placeholder="Paste target job description description here..."
            className="w-full min-h-[220px] max-h-[400px] p-4 bg-zinc-950/40 border border-zinc-800 rounded-xl text-xs placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200 disabled:opacity-60 resize-y font-normal text-zinc-200 scrollbar-thin"
          />
          <div className={`absolute bottom-3 right-3 text-[9px] font-mono px-2 py-0.5 rounded border transition-colors duration-200 ${
            isJdTooShort 
              ? "text-amber-400 bg-amber-950/20 border-amber-900/30 animate-pulse" 
              : charCount >= 50 
                ? "text-emerald-400 bg-emerald-950/20 border-emerald-900/30" 
                : "text-zinc-600 bg-zinc-900 border-zinc-800/80"
          }`}>
            {charCount} / 50 characters {isJdTooShort && "(Too short)"}
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start space-x-2 animate-fade-in">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-6 bg-indigo-950/5 border border-indigo-900/20 rounded-xl space-y-3 animate-pulse-slow">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-zinc-200">{statusMessage}</span>
              <p className="text-[10px] text-zinc-500">Please keep this window open while Gemini performs analysis.</p>
            </div>
          </div>
        ) : (
          <button
            type="submit"
            disabled={!jobDescription.trim() || isJdTooShort}
            className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs transition duration-200 disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white"
          >
            <span>Run ATS Optimizer Scan</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        )}
      </form>
    </div>
  );
}
