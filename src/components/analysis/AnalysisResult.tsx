"use client";

import React from "react";
import { Analysis } from "@/lib/analysis-api";

interface AnalysisResultProps {
  analysis: Analysis;
  onReset?: () => void;
}

export default function AnalysisResult({ analysis, onReset }: AnalysisResultProps) {
  // Safe JSON Parsing Helper
  const parseJsonArray = (val: string | null | undefined): string[] => {
    if (!val) return [];
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to parse JSON field:", val, e);
      return [];
    }
  };

  const missingSkills = parseJsonArray(analysis.missing_skills);
  const recommendations = parseJsonArray(analysis.recommendations);

  // Score Color Helpers
  const topThreeMissing = missingSkills.slice(0, 3);

  // Score Color Helpers
  const getScoreBgColorClass = (score: number, isNull: boolean) => {
    if (isNull) return "bg-zinc-900/10 border-zinc-800";
    if (score >= 80) return "bg-emerald-950/5 border-emerald-900/15";
    if (score >= 65) return "bg-amber-950/5 border-amber-900/15";
    return "bg-rose-950/5 border-rose-900/15";
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 80) return "#10B981"; // Emerald 500
    if (score >= 65) return "#F59E0B"; // Amber 500
    return "#F43F5E"; // Rose 500
  };

  const renderScoreGauge = (score: number | null, label: string, desc: string) => {
    const isNull = score === null;
    const value = score !== null ? score : 0;
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className={`p-6 rounded-2xl border ${getScoreBgColorClass(value, isNull)} flex items-center space-x-6 relative overflow-hidden shadow-sm`}>
        {/* SVG Circle Gauge */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#18181B"
              strokeWidth="7"
              fill="transparent"
            />
            {/* Progress Circle */}
            {!isNull && (
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={getScoreRingColor(value)}
                strokeWidth="7"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            )}
          </svg>
          {/* Percentage text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black tracking-tight text-white">
              {!isNull ? `${value}%` : "—"}
            </span>
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-1.5 flex-1 relative">
          <h4 className="text-sm font-bold text-zinc-200">{label}</h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">{desc}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Card */}
      <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Analysis Completed</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-zinc-100 mt-1.5">Target Match Insights</h3>
        </div>

        {onReset && (
          <button
            onClick={onReset}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center space-x-2 outline-none focus:ring-1 focus:ring-zinc-700"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
            </svg>
            <span>Scan Another JD</span>
          </button>
        )}
      </div>

      {/* Analysis Summary Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900 to-indigo-950/20 p-6 shadow-xl">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-indigo-500/5 blur-xl" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Executive Summary</span>
            <h4 className="text-base font-extrabold text-zinc-100">Match Overview & Insights</h4>
            <p className="text-[11px] text-zinc-500">A quick snapshot of your alignment with the target job profile.</p>
          </div>
          
          <div className="grid grid-cols-3 gap-6 divide-x divide-zinc-800/80 items-center">
            {/* ATS Metric */}
            <div className="px-4 text-center">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">ATS Fit</span>
              <p className={`text-xl font-black mt-1 ${
                analysis.ats_score !== null && analysis.ats_score >= 80 
                  ? "text-emerald-400" 
                  : analysis.ats_score !== null && analysis.ats_score >= 65 
                    ? "text-amber-400" 
                    : "text-rose-400"
              }`}>
                {analysis.ats_score !== null ? `${analysis.ats_score}%` : "—"}
              </p>
            </div>

            {/* Match Rate Metric */}
            <div className="px-4 text-center">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">JD Match</span>
              <p className={`text-xl font-black mt-1 ${
                analysis.match_score !== null && analysis.match_score >= 80 
                  ? "text-emerald-400" 
                  : analysis.match_score !== null && analysis.match_score >= 65 
                    ? "text-amber-400" 
                    : "text-rose-400"
              }`}>
                {analysis.match_score !== null ? `${analysis.match_score}%` : "—"}
              </p>
            </div>

            {/* Top 3 Missing Skills */}
            <div className="px-4">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block mb-1">Top Gaps</span>
              {topThreeMissing.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {topThreeMissing.map((skill, idx) => (
                    <span key={idx} className="text-[9px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-[10px] text-emerald-400 font-bold">None detected</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section A: Scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderScoreGauge(
          analysis.ats_score,
          "ATS Optimization Score",
          "Calculates formatting alignment, keyword presence, and structural compliance for automated screeners."
        )}
        {renderScoreGauge(
          analysis.match_score,
          "JD Core Match Rate",
          "Reflects direct semantic overlap between your professional experience and the job's core requirements."
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section B: Missing Skills Card */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 flex flex-col h-full shadow-md relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center space-x-2.5 mb-4 relative">
            <div className="p-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-zinc-200">Identified Skill Gaps</h4>
          </div>
          
          <p className="text-xs text-zinc-500 mb-5 relative font-normal">
            Gemini identified these essential skills mentioned in the job description that appear to be missing or weak in your resume.
          </p>

          <div className="flex-1 relative">
            {missingSkills.length === 0 ? (
              <div className="h-full flex items-center justify-center p-6 border border-dashed border-zinc-800 rounded-xl text-center bg-zinc-900/5">
                <div>
                  <svg className="w-7 h-7 text-emerald-500/40 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs font-bold text-zinc-300">Perfect alignment!</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">No critical missing skills were detected.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {missingSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 text-xs font-semibold border border-rose-500/20 bg-rose-500/5 text-rose-300 rounded-xl flex items-center space-x-1.5 hover:bg-rose-500/10 transition-colors"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section C: Recommendations Card */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 flex flex-col h-full shadow-md relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center space-x-2.5 mb-4 relative">
            <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-zinc-200">Optimization Recommendations</h4>
          </div>

          <p className="text-xs text-zinc-500 mb-5 relative font-normal">
            Actionable items to revise your resume content, highlight relevant projects, or adjust phrasing to maximize your matching score.
          </p>

          <div className="flex-1 relative">
            {recommendations.length === 0 ? (
              <div className="h-full flex items-center justify-center p-6 border border-dashed border-zinc-800 rounded-xl text-center bg-zinc-900/5">
                <p className="text-xs text-zinc-500 font-semibold">No recommendations generated.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-3.5 p-4 bg-zinc-900/20 border-l-2 border-indigo-500/85 rounded-r-xl border-y border-r border-zinc-800/80 hover:border-zinc-700/60 transition duration-200">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-[10px] font-extrabold text-indigo-400 border border-indigo-500/20 shadow-sm">
                      {index + 1}
                    </span>
                    <span className="text-xs text-zinc-300 leading-relaxed font-normal">{rec}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
