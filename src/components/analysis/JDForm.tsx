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
    setStatusMessage("Creating analysis session...");

    try {
      // 1. POST /analysis/create
      const createRes = await createAnalysis(userId, resumeId, trimmedJd);
      const analysisId = createRes.id;

      // 2. POST /analysis/run/{analysis_id}
      setStatusMessage("Gemini is analyzing your resume against the JD... (may take 5-10s)");
      await runAnalysis(analysisId);

      // 3. GET /analysis/{analysis_id}
      setStatusMessage("Fetching final analysis report...");
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
    <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between animate-fade-in">
      <div>
        <div className="flex items-center space-x-2.5 mb-3">
          <div className="p-2 bg-accent/10 border border-accent/20 rounded-lg text-accent">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold">Gemini ATS & Skill Gap Scan</h3>
        </div>
        <p className="text-zinc-400 text-sm mb-5">
          Paste the job description of your target role below. CareerCopilot will compare it with your selected resume using Gemini AI to calculate scores and identify critical missing skills.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={jobDescription}
            onChange={(e) => {
              setJobDescription(e.target.value);
              if (error) setError(null);
            }}
            disabled={isLoading}
            placeholder="Paste target job description here..."
            className="w-full min-h-[220px] max-h-[400px] p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl text-sm placeholder-zinc-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition disabled:opacity-60 resize-y"
          />
          <div className="absolute bottom-3 right-3 text-[10px] text-zinc-500 font-mono">
            {jobDescription.trim().length} chars
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/60 text-red-400 text-sm flex items-start space-x-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-4 space-y-3 bg-zinc-900/10 border border-zinc-800/40 rounded-xl">
            <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <span className="text-zinc-200 text-sm font-medium">{statusMessage}</span>
              <p className="text-xs text-zinc-500 mt-1">Please keep this window open while Gemini analyzes</p>
            </div>
          </div>
        ) : (
          <button
            type="submit"
            disabled={!jobDescription.trim()}
            className="w-full py-3 rounded-lg bg-white text-black font-semibold text-sm hover:bg-zinc-200 disabled:opacity-40 disabled:hover:bg-white transition duration-200 cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>Run ATS Analysis</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        )}
      </form>
    </div>
  );
}
