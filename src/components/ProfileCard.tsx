"use client";

import React from "react";
import Image from "next/image";

interface ProfileCardProps {
  userName?: string | null;
  userEmail?: string | null;
  userImage?: string | null;
  dbUserId?: number | null;
  isSyncing?: boolean;
}

export default function ProfileCard({
  userName,
  userEmail,
  userImage,
  dbUserId,
  isSyncing = false,
}: ProfileCardProps) {
  const initials = userName
    ? userName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "CC";

  return (
    <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden h-full flex flex-col justify-between">
      {/* Background radial highlight */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="space-y-6">
        <div>
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-400">Profile Details</h3>
          <p className="text-[11px] text-zinc-500 mt-1">Your synchronized application credentials</p>
        </div>

        {/* Profile Card Main Info */}
        <div className="flex flex-col items-center text-center p-4 bg-zinc-900/30 border border-zinc-800/60 rounded-xl space-y-3">
          <div className="relative">
            {userImage ? (
              <Image
                src={userImage}
                alt="Profile avatar"
                width={64}
                height={64}
                className="h-16 w-16 rounded-full border border-zinc-700 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500/20 to-violet-600/20 border border-indigo-500/30 text-indigo-300 text-lg font-bold tracking-wider">
                {initials}
              </div>
            )}
            <div className="absolute bottom-0 right-0 h-4.5 w-4.5 rounded-full border-2 border-[#111111] bg-emerald-500 flex items-center justify-center" title="Synced">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>

          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-zinc-200">{userName || "CareerCopilot User"}</h4>
            <p className="text-xs text-zinc-500 truncate max-w-[200px]">{userEmail || "user@careercopilot.ai"}</p>
          </div>
        </div>

        {/* Database & Connection Status */}
        <div className="border-t border-zinc-800/80 pt-4 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-medium">Database ID:</span>
            {dbUserId ? (
              <span className="text-zinc-300 font-mono bg-zinc-900 border border-zinc-800/80 px-2 py-0.5 rounded text-[11px]">
                {dbUserId}
              </span>
            ) : (
              <span className="text-zinc-600 font-mono text-[11px]">Unregistered</span>
            )}
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-medium">Sync Status:</span>
            {isSyncing ? (
              <span className="text-amber-400 font-semibold uppercase tracking-wider text-[9px] bg-amber-950/20 border border-amber-900/30 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-spin border border-t-transparent" />
                Syncing
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[9px] bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Synced
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="text-[10px] text-zinc-600 border-t border-zinc-800/40 pt-4 text-center mt-6">
        Connected via NextAuth OAuth
      </div>
    </div>
  );
}
