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
  const getScoreBgColorClass = (score: number, isNull: boolean) => {
    if (isNull) return "bg-zinc-900/10 border-zinc-800";
    if (score >= 80) return "bg-emerald-950/20 border-emerald-900/30";
    if (score >= 65) return "bg-amber-950/20 border-amber-900/30";
    return "bg-red-950/20 border-red-900/30";
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 80) return "#10B981"; // Emerald 500
    if (score >= 65) return "#F59E0B"; // Amber 500
    return "#EF4444"; // Red 500
  };

  const renderScoreGauge = (score: number | null, label: string, desc: string) => {
    const isNull = score === null;
    const value = score !== null ? score : 0;
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className={`p-6 rounded-2xl border ${getScoreBgColorClass(value, isNull)} flex items-center space-x-6`}>
        {/* SVG Circle Gauge */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#27272A"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress Circle */}
            {!isNull && (
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={getScoreRingColor(value)}
                strokeWidth="8"
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
            <span className="text-2xl font-extrabold tracking-tight">
              {!isNull ? `${value}%` : "N/A"}
            </span>
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-1 flex-1">
          <h4 className="text-base font-bold text-zinc-100">{label}</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">{desc}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Card */}
      <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Analysis Completed</span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight mt-1">Target Match Insights</h3>
        </div>

        {onReset && (
          <button
            onClick={onReset}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg text-sm font-medium transition cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
            </svg>
            <span>Scan Another JD</span>
          </button>
        )}
      </div>

      {/* Scores Grid */}
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
        {/* Missing Skills Card */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 flex flex-col h-full">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-1.5 bg-red-950/30 border border-red-900/30 text-red-400 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-zinc-100">Identified Skill Gaps</h4>
          </div>
          
          <p className="text-xs text-zinc-400 mb-4">
            Gemini identified these essential skills mentioned in the job description that appear to be missing or weak in your resume.
          </p>

          <div className="flex-1">
            {missingSkills.length === 0 ? (
              <div className="h-full flex items-center justify-center p-6 border border-dashed border-zinc-800 rounded-xl text-center">
                <div>
                  <svg className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-zinc-300">Perfect alignment!</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">No critical missing skills were detected.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {missingSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 text-xs font-semibold border border-red-950/60 bg-red-950/20 text-red-300 rounded-lg flex items-center space-x-1.5"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recommendations Card */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 flex flex-col h-full">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-1.5 bg-accent/10 border border-accent/20 text-accent rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-zinc-100">Optimization Recommendations</h4>
          </div>

          <p className="text-xs text-zinc-400 mb-4">
            Actionable items to revise your resume content, highlight relevant projects, or adjust phrasing to maximize your matching score.
          </p>

          <div className="flex-1">
            {recommendations.length === 0 ? (
              <div className="h-full flex items-center justify-center p-6 border border-dashed border-zinc-800 rounded-xl text-center">
                <p className="text-sm text-zinc-500">No recommendations generated.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-3 p-3 bg-zinc-900/30 border border-zinc-800/60 rounded-xl">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent border border-accent/20">
                      {index + 1}
                    </span>
                    <span className="text-xs text-zinc-300 leading-relaxed">{rec}</span>
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
