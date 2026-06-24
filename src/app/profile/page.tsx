"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { syncUser } from "@/lib/api";
import DashboardNavbar from "@/components/DashboardNavbar";
import ProfileCard from "@/components/ProfileCard";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [dbUserId, setDbUserId] = useState<number | null>(null);
    const [isSyncing, setIsSyncing] = useState<boolean>(true);
    const [syncError, setSyncError] = useState<string | null>(null);

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

    return (
        <main className="min-h-screen bg-[#0A0A0A] text-white flex flex-col selection:bg-indigo-500 selection:text-white">
            {/* Navbar */}
            <DashboardNavbar
                userName={session?.user?.name}
                userEmail={session?.user?.email}
                userImage={session?.user?.image}
            />

            {/* Profile Workspace */}
            <section className="max-w-md mx-auto px-6 py-12 flex-1 w-full flex flex-col justify-center">
                <div className="space-y-6">
                    <div className="text-center space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-white">Your Profile</h2>
                        <p className="text-zinc-500 text-xs font-normal">Manage your CareerCopilot account integration details</p>
                    </div>
                    
                    <ProfileCard
                        userName={session?.user?.name}
                        userEmail={session?.user?.email}
                        userImage={session?.user?.image}
                        dbUserId={dbUserId}
                        isSyncing={isSyncing}
                    />

                    <div className="flex justify-center">
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="px-4 py-2 border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 outline-none focus:ring-1 focus:ring-zinc-700 cursor-pointer"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}