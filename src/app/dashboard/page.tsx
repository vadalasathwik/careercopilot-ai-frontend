"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { syncUser } from "@/lib/api";
import ResumeUpload from "@/components/resume/ResumeUpload";
import ResumeList from "@/components/resume/ResumeList";
import Image from "next/image";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [dbUserId, setDbUserId] = useState<number | null>(null);
    const [isSyncing, setIsSyncing] = useState<boolean>(true);
    const [syncError, setSyncError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

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
        } catch (error: any) {
            console.error("User Sync Error:", error);
            setSyncError(error.message || "Failed to synchronize user account details.");
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
                                />
                            )}
                        </div>

                        {/* Future Features Card */}
                        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold">Future Capabilities</h3>
                                <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-accent border border-accent/30 bg-accent/5 rounded-full uppercase">
                                    Coming Soon
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl space-y-2">
                                    <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg w-fit text-zinc-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-sm font-medium text-zinc-300">JD Upload</h4>
                                    <p className="text-xs text-zinc-500">
                                        Upload or paste complete target job descriptions.
                                    </p>
                                </div>

                                <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl space-y-2">
                                    <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg w-fit text-zinc-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-sm font-medium text-zinc-300">ATS Analysis</h4>
                                    <p className="text-xs text-zinc-500">
                                        Analyze formatting and scan-friendliness.
                                    </p>
                                </div>

                                <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl space-y-2">
                                    <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg w-fit text-zinc-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                        </svg>
                                    </div>
                                    <h4 className="text-sm font-medium text-zinc-300">Skill Gap Analysis</h4>
                                    <p className="text-xs text-zinc-500">
                                        Get concrete recommendations of skills to learn.
                                    </p>
                                </div>
                            </div>
                        </div>
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