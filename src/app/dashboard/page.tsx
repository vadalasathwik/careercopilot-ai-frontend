"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { syncUser } from "@/lib/api";
import ResumeUpload from "@/components/resume/ResumeUpload";
import ResumeList from "@/components/resume/ResumeList";
import JDForm from "@/components/analysis/JDForm";
import AnalysisResult from "@/components/analysis/AnalysisResult";
import DashboardNavbar from "@/components/DashboardNavbar";
import ProfileCard from "@/components/ProfileCard";
import { Resume } from "@/lib/resume-api";
import { Analysis } from "@/lib/analysis-api";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [dbUserId, setDbUserId] = useState<number | null>(null);
    const [isSyncing, setIsSyncing] = useState<boolean>(true);
    const [syncError, setSyncError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
    const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
    const [analysisResult, setAnalysisResult] = useState<Analysis | null>(null);
    const [resumeCount, setResumeCount] = useState<number>(0);

    const createOrSyncUser = useCallback(async () => {
        if (!session?.user?.email) return;

        setIsSyncing(true);
        setSyncError(null);
        try {
            const result = await syncUser({
                name: session.user.name || "",
                email: session.user.email || "",
                image: session.user.image,
            });

            if (!result) {
                throw new Error("No response received from user synchronization API.");
            }
            if (!result.user || typeof result.user.id !== "number") {
                throw new Error("Malformed backend response: 'user.id' is missing or invalid.");
            }
            setDbUserId(result.user.id);
        } catch (error: unknown) {
            console.error("User Sync Error:", error);
            const message = error instanceof Error ? error.message : "Failed to synchronize user account details.";
            setSyncError(message);
        } finally {
            setIsSyncing(false);
        }
    }, [session]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }

        if (status === "authenticated" && session?.user?.email) {
            createOrSyncUser();
        }
    }, [status, session, router, createOrSyncUser]);

    const handleUploadSuccess = () => {
        setRefreshTrigger((prev) => prev + 1);
    };

    const handleSelectResume = (resume: Resume) => {
        setSelectedResume(resume);
        setAnalysisResult(null); // Clear previous results when selecting a new resume
    };

    // NextAuth loading
    if (status === "loading") {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-zinc-500 text-xs font-semibold">Loading Session...</p>
                </div>
            </main>
        );
    }

    // Backend User Synchronization loading
    if (isSyncing && status === "authenticated") {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-zinc-500 text-xs font-semibold">Syncing with backend database...</p>
                </div>
            </main>
        );
    }

    // Backend User Synchronization error
    if (syncError && status === "authenticated") {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
                <div className="max-w-md w-full mx-4 p-6 bg-[#111111] border border-zinc-800 rounded-2xl text-center space-y-6">
                    <div className="inline-flex p-3 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-base font-bold text-zinc-200">Database Sync Error</h3>
                        <p className="text-xs text-zinc-500">{syncError}</p>
                    </div>
                    <button
                        onClick={createOrSyncUser}
                        className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs transition duration-200 cursor-pointer outline-none"
                    >
                        Retry Connection
                    </button>
                </div>
            </main>
        );
    }

    const renderKpiRing = (score: number | null, label: string, description: string) => {
        const isNull = score === null;
        const value = score !== null ? score : 0;
        const radius = 30;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (value / 100) * circumference;

        return (
            <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 flex items-center justify-between shadow-xl relative overflow-hidden group hover:border-zinc-700/80 transition-all duration-200 min-h-[110px]">
                <div className="absolute -top-12 -left-12 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="space-y-1.5 relative z-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{label}</span>
                    <p className="text-3xl font-black text-white tracking-tight">{!isNull ? `${value}%` : "—"}</p>
                    <span className="text-[10px] text-zinc-650 font-medium block">{description}</span>
                </div>

                {!isNull ? (
                    <div className="relative w-16 h-16 flex-shrink-0 z-10">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r={radius} stroke="#18181B" strokeWidth="5" fill="transparent" />
                            <circle
                                cx="40"
                                cy="40"
                                r={radius}
                                stroke={value >= 80 ? "#10B981" : value >= 65 ? "#F59E0B" : "#F43F5E"}
                                strokeWidth="5"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                    </div>
                ) : (
                    <div className="h-12 w-12 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex items-center justify-center text-zinc-700 z-10">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                        </svg>
                    </div>
                )}
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-[#0A0A0A] text-white flex flex-col selection:bg-indigo-500 selection:text-white">
            {/* Navbar */}
            <DashboardNavbar
                userName={session?.user?.name}
                userEmail={session?.user?.email}
                userImage={session?.user?.image}
            />

            {/* Content */}
            <section className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-6">


                {/* Metrics KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderKpiRing(analysisResult?.ats_score ?? null, "ATS Score", "Automated compatibility alignment")}
                    {renderKpiRing(analysisResult?.match_score ?? null, "JD Match Score", "Semantic overlap with requirements")}

                    {/* Resume Count Card */}
                    <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 flex items-center justify-between shadow-xl relative overflow-hidden group hover:border-zinc-700/80 transition-all duration-200 min-h-[110px]">
                        <div className="absolute -top-12 -left-12 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                        <div className="space-y-1.5 relative z-10">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Resumes Uploaded</span>
                            <p className="text-3xl font-black text-white tracking-tight">{resumeCount}</p>
                            <span className="text-[10px] text-zinc-650 font-medium block">Total documents in library</span>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex items-center justify-center text-zinc-550 z-10">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Workspace Columns (Left 3/4) */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Resume Upload Card */}
                            {dbUserId && (
                                <ResumeUpload
                                    userId={dbUserId}
                                    onUploadSuccess={handleUploadSuccess}
                                />
                            )}

                            {/* Resume List Card */}
                            {dbUserId && (
                                <ResumeList
                                    userId={dbUserId}
                                    refreshTrigger={refreshTrigger}
                                    selectedResumeId={selectedResume?.id}
                                    onSelectResume={handleSelectResume}
                                    onCountChange={(count) => setResumeCount(count)}
                                />
                            )}
                        </div>

                        {/* ATS & Skill Gap Analysis Flow */}
                        {dbUserId && (
                            <div className="space-y-6">
                                {!selectedResume ? (
                                    <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-10 text-center text-zinc-500 border-dashed relative overflow-hidden shadow-md">
                                        <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                                        <svg className="w-10 h-10 mx-auto mb-3 text-zinc-600 animate-pulse-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                        </svg>
                                        <h3 className="text-sm font-bold text-zinc-300">ATS Optimization & Skill Gap Scan</h3>
                                        <p className="text-[10px] text-zinc-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
                                            Select an uploaded resume from the library above to paste a target Job Description and trigger Gemini AI analysis.
                                        </p>
                                    </div>
                                ) : !analysisResult ? (
                                    <JDForm
                                        userId={dbUserId}
                                        resumeId={selectedResume.id}
                                        onAnalysisComplete={(result) => setAnalysisResult(result)}
                                    />
                                ) : (
                                    <AnalysisResult
                                        analysis={analysisResult}
                                        onReset={() => setAnalysisResult(null)}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column Profile Card (1/4) */}
                    <div className="lg:col-span-1">
                        <ProfileCard
                            userName={session?.user?.name}
                            userEmail={session?.user?.email}
                            userImage={session?.user?.image}
                            dbUserId={dbUserId}
                            isSyncing={isSyncing}
                        />
                    </div>
                </div>
            </section>
        </main>
    );
}