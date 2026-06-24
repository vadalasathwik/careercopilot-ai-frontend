"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";

interface DashboardNavbarProps {
  userName?: string | null;
  userEmail?: string | null;
  userImage?: string | null;
}

export default function DashboardNavbar({ userName, userEmail, userImage }: DashboardNavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Keyboard accessibility
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
        triggerRef.current?.focus();
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "CC";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-[#0A0A0A]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        
        {/* Left Side: Logo & Page Title */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/10 group-hover:scale-105 transition duration-200">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
              CareerCopilot <span className="text-indigo-400">AI</span>
            </span>
          </Link>

          <div className="h-5 w-[1px] bg-zinc-800" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Dashboard
          </span>
        </div>

        {/* Center Side: Disabled Search Placeholder */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              disabled
              placeholder="Search resumes, analyses... (Coming soon)"
              className="w-full h-9 rounded-xl bg-zinc-900/40 border border-zinc-800 pl-10 pr-4 text-xs placeholder-zinc-600 focus:outline-none opacity-50 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Right Side: User Menu & Avatar */}
        <div className="flex items-center gap-4 relative">
          <button
            ref={triggerRef}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition duration-200 cursor-pointer"
          >
            {userImage ? (
              <Image
                src={userImage}
                alt="Profile picture"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full border border-zinc-700 bg-zinc-800 object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500/20 to-violet-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wider">
                {initials}
              </div>
            )}
            <span className="hidden sm:inline text-xs font-semibold text-zinc-300 pr-1 hover:text-white transition">
              {userName || "User"}
            </span>
            <svg
              className={`hidden sm:inline h-3 w-3 text-zinc-500 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              role="menu"
              aria-orientation="vertical"
              className="absolute right-0 top-11 z-50 w-56 origin-top-right rounded-2xl border border-zinc-800 bg-[#111111] p-2 shadow-2xl ring-1 ring-black/20 focus:outline-none transition duration-150 ease-out transform scale-100 opacity-100"
            >
              {/* User details */}
              <div className="px-3 py-2.5 border-b border-zinc-800/80 mb-1">
                <p className="text-xs font-bold text-zinc-200 truncate">{userName || "CareerCopilot User"}</p>
                <p className="text-[10px] text-zinc-500 truncate mt-0.5">{userEmail || "user@careercopilot.ai"}</p>
              </div>

              {/* Menu items */}
              <div className="space-y-0.5">
                <Link
                  href="/profile"
                  role="menuitem"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-zinc-300 hover:bg-zinc-800/60 hover:text-white transition"
                >
                  <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  View Profile
                </Link>

                <button
                  disabled
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-zinc-600 bg-transparent cursor-not-allowed justify-between"
                >
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </span>
                  <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                    Soon
                  </span>
                </button>

                <div className="h-[1px] bg-zinc-800/80 my-1" />

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                >
                  <svg className="h-4 w-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
