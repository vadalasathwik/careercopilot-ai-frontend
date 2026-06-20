"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { syncUser } from "@/lib/api";
import ResumeUpload from "@/components/resume/ResumeUpload";
import ResumeList from "@/components/resume/ResumeList";
import JDForm from "@/components/analysis/JDForm";
import AnalysisResult from "@/components/analysis/AnalysisResult";
import { Resume } from "@/lib/resume-api";
import { Analysis } from "@/lib/analysis-api";
import Image from "next/image";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [dbUserId, setDbUserId] = useState<number | null>(null);
    const [isSyncing, setIsSyncing] = useState<boolean>(true);
    const [syncError, setSyncError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
    const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
    const [analysisResult, setAnalysisResult] = useState<Analysis | null>(null);

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
                    <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                    <p className="text-zinc-400 text-sm">Loading Session...</p>
                </div>
            </main>
        );
    }

    // Backend User Synchronization loading
    if (isSyncing && status === "authenticated") {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                    <p className="text-zinc-400 text-sm">Syncing with backend database...</p>
                </div>
            </main>
        );
    }

    // Backend User Synchronization error
    if (syncError && status === "authenticated") {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
                <div className="max-w-md w-full mx-4 p-6 bg-[#111111] border border-zinc-800 rounded-2xl text-center space-y-6">
                    <div className="inline-flex p-3 bg-red-950/20 border border-red-900/40 rounded-full text-red-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Database Sync Error</h3>
                        <p className="text-sm text-zinc-400">{syncError}</p>
                    </div>
                    <button
                        onClick={createOrSyncUser}
                        className="w-full py-2.5 rounded-lg bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition duration-200 cursor-pointer"
                    >
                        Retry Connection
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
            {/* Navbar */}
            <header className="border-b border-zinc-800 bg-[#0A0A0A]">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <h1 className="font-semibold text-lg tracking-tight">
                        CareerCopilot AI
                    </h1>

                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="px-4 py-2 rounded-lg border border-zinc-800 text-sm font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white transition cursor-pointer"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Content */}
            <section className="max-w-7xl mx-auto px-6 py-10 flex-1 w-full space-y-8">
                {/* Welcome Card */}
                <div className="relative overflow-hidden bg-[#111111] border border-zinc-800 rounded-2xl p-6 md:p-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-accent">Dashboard</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                            Welcome back, {session?.user?.name || "User"}
                        </h2>
                        <p className="text-zinc-400 text-sm md:text-base max-w-2xl">
                            Upload your resume, add target job descriptions, and use Gemini 2.5 Flash to automatically discover skill gaps and optimize your match rate.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left & Middle Columns (Resume Flow) */}
                    <div className="lg:col-span-2 space-y-6">
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
                                />
                            )}
                        </div>

                        {/* ATS & Skill Gap Analysis Flow */}
                        {dbUserId && (
                            <div className="space-y-6">
                                {!selectedResume ? (
                                    <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500 border-dashed">
                                        <svg className="w-12 h-12 mx-auto mb-3 text-zinc-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                        </svg>
                                        <h3 className="text-base font-semibold text-zinc-300">ATS Optimization & Skill Gap Scan</h3>
                                        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                                            Select an uploaded resume from the list above to paste a target Job Description and trigger Gemini AI analysis.
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

                    {/* Right Column (Profile Card) */}
                    <div className="space-y-6">
                        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6">
                            <h3 className="font-semibold mb-4 text-zinc-200">Profile Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    {session?.user?.image ? (
                                        <Image
                                            src={session.user.image}
                                            alt="Profile"
                                            width={40}
                                            height={40}
                                            className="w-10 h-10 rounded-full border border-zinc-800"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-semibold uppercase text-sm">
                                            {session?.user?.name ? session.user.name.substring(0, 2) : "CC"}
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-zinc-300 truncate">
                                            {session?.user?.name}
                                        </p>
                                        <p className="text-xs text-zinc-500 truncate">
                                            {session?.user?.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t border-zinc-800 pt-4 space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-zinc-500">Database ID:</span>
                                        <span className="text-zinc-400 font-mono">{dbUserId}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-zinc-500">Status:</span>
                                        <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[10px] bg-emerald-950/20 border border-emerald-900/30 px-1.5 py-0.5 rounded">
                                            Synced
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}