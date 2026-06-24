"use client";

import React, { useState, useEffect } from "react";
import { getUserResumes, Resume } from "@/lib/resume-api";

interface ResumeListProps {
    userId: number;
    refreshTrigger: number;
    selectedResumeId?: number | null;
    onSelectResume?: (resume: Resume) => void;
    onCountChange?: (count: number) => void;
}

export default function ResumeList({ 
    userId, 
    refreshTrigger, 
    selectedResumeId, 
    onSelectResume,
    onCountChange
}: ResumeListProps) {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchResumes = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getUserResumes(userId);
            // Sort by created_at descending (latest first)
            const sortedData = data.sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            setResumes(sortedData);
            onCountChange?.(sortedData.length);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to retrieve resumes. Please check your backend connection.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchResumes();
        }
    }, [userId, refreshTrigger]);

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 h-full flex flex-col shadow-xl relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-center mb-6 relative">
                <div>
                    <h3 className="text-lg font-bold tracking-tight text-zinc-100">Uploaded Resumes</h3>
                    <p className="text-zinc-500 text-xs mt-1">Select a resume to start analysis</p>
                </div>
                <button
                    onClick={fetchResumes}
                    disabled={isLoading}
                    className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800 transition text-zinc-400 hover:text-white disabled:opacity-50 cursor-pointer outline-none focus:ring-1 focus:ring-zinc-700"
                    title="Refresh list"
                >
                    <svg
                        className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5"
                        />
                    </svg>
                </button>
            </div>

            {/* Content area */}
            <div className="flex-1 flex flex-col justify-center relative">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-3">
                        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-zinc-500 text-xs font-medium">Fetching resumes...</span>
                    </div>
                ) : error ? (
                    <div className="py-8 px-4 text-center space-y-4">
                        <div className="inline-flex p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400">
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <p className="text-xs text-zinc-400 max-w-sm mx-auto">{error}</p>
                        <button
                            onClick={fetchResumes}
                            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-semibold rounded-xl transition duration-200 cursor-pointer"
                        >
                            Retry
                        </button>
                    </div>
                ) : resumes.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/5">
                        <svg
                            className="w-10 h-10 mx-auto mb-3 text-zinc-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <p className="text-xs font-bold text-zinc-400">No resumes uploaded yet.</p>
                        <p className="text-[10px] text-zinc-600 mt-1">Upload a resume to get started</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                        {resumes.map((resume) => {
                            const isPdf = resume.file_name.toLowerCase().endsWith(".pdf");
                            const isSelected = selectedResumeId === resume.id;
                            return (
                                <div
                                    key={resume.id}
                                    onClick={() => onSelectResume?.(resume)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            onSelectResume?.(resume);
                                        }
                                    }}
                                    tabIndex={0}
                                    role="button"
                                    aria-selected={isSelected}
                                    className={`flex items-center justify-between p-4 rounded-xl transition duration-200 border cursor-pointer outline-none focus:ring-1 focus:ring-indigo-500/50 ${
                                        isSelected
                                            ? "border-indigo-500 bg-indigo-500/5 shadow-[0_0_15px_-3px_rgba(79,70,229,0.15)]"
                                            : "bg-zinc-900/30 border-zinc-800/80 hover:border-zinc-700/80 hover:bg-zinc-900/40"
                                    }`}
                                >
                                    <div className="flex items-center space-x-3.5 min-w-0 flex-1 mr-4">
                                        {onSelectResume && (
                                            <div className="flex-shrink-0">
                                                {isSelected ? (
                                                    <div className="w-5 h-5 rounded-full bg-indigo-500 border border-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full border border-zinc-800 hover:border-zinc-700 bg-zinc-950 transition-colors" />
                                                )}
                                            </div>
                                        )}
                                        <div className={`p-2 rounded-xl flex-shrink-0 border ${
                                            isPdf 
                                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                                                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                        }`}>
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-xs font-bold text-zinc-200 truncate" title={resume.file_name}>
                                                {resume.file_name}
                                            </h4>
                                            <p className="text-[10px] text-zinc-500 mt-1 font-medium">
                                                {formatDate(resume.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href={resume.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/30 text-[10px] font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition duration-200 flex-shrink-0 flex items-center space-x-1 outline-none focus:ring-1 focus:ring-zinc-700"
                                    >
                                        <span>View</span>
                                        <svg
                                            className="w-3 h-3"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                            />
                                        </svg>
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
