"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
        Loading Dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Navbar */}
      <header className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="font-semibold text-lg">
            CareerCopilot AI
          </h1>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-4 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-900 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-2">
            Welcome, {session?.user?.name}
          </h2>

          <p className="text-zinc-400">
            Analyze your resume against real job descriptions.
          </p>
        </div>

        {/* Profile Card */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6">
            <h3 className="font-medium mb-4">Profile</h3>

            <div className="space-y-2 text-sm text-zinc-400">
              <p>Name: {session?.user?.name}</p>
              <p>Email: {session?.user?.email}</p>
            </div>
          </div>

          <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6">
            <h3 className="font-medium mb-4">Analyses</h3>

            <p className="text-4xl font-bold">0</p>

            <p className="text-zinc-500 mt-2">
              Completed analyses
            </p>
          </div>

          <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6">
            <h3 className="font-medium mb-4">ATS Average</h3>

            <p className="text-4xl font-bold">--</p>

            <p className="text-zinc-500 mt-2">
              No data available
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-3">
              Upload Resume
            </h3>

            <p className="text-zinc-400 mb-5">
              Upload PDF or DOCX resume.
            </p>

            <button className="px-4 py-2 rounded-lg bg-white text-black font-medium">
              Upload Resume
            </button>
          </div>

          <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-3">
              Job Description
            </h3>

            <p className="text-zinc-400 mb-5">
              Paste or upload a job description.
            </p>

            <button className="px-4 py-2 rounded-lg bg-white text-black font-medium">
              Add Job Description
            </button>
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="mt-10 bg-[#111111] border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4">
            Recent Analyses
          </h3>

          <p className="text-zinc-500">
            No analyses available yet.
          </p>
        </div>
      </section>
    </main>
  );
}