"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/dashboard");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-zinc-400">Loading...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-6">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <Link
                        href="/"
                        className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-[#111111] p-8 shadow-2xl">
                    <div className="mb-8">
                        <div className="mb-6 text-sm font-medium tracking-wide text-zinc-500 uppercase">
                            CareerCopilot AI
                        </div>

                        <h1 className="text-3xl font-bold text-white mb-2">
                            Welcome Back
                        </h1>

                        <p className="text-zinc-400">
                            Sign in with Google to continue to your dashboard and start analyzing resumes against job descriptions.
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            signIn("google", {
                                callbackUrl: "/dashboard",
                            })
                        }
                        className="w-full rounded-xl bg-white px-4 py-3 font-medium text-black transition-all hover:bg-zinc-200 active:scale-[0.98]"
                    >
                        Continue with Google
                    </button>

                    <p className="mt-6 text-center text-xs text-zinc-500">
                        By continuing, you agree to use CareerCopilot AI for resume and job analysis.
                    </p>
                </div>
            </div>
        </main>
    );
}