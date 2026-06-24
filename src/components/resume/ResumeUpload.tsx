"use client";

import React, { useState, useRef } from "react";
import { uploadResume } from "@/lib/resume-api";

interface ResumeUploadProps {
    userId: number;
    onUploadSuccess: () => void;
}

const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_EXTENSIONS = [".pdf", ".docx"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ResumeUpload({ userId, onUploadSuccess }: ResumeUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Validate type and size
    const validateFile = (selectedFile: File): boolean => {
        const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();
        
        const isValidType = 
            ALLOWED_MIME_TYPES.includes(selectedFile.type) || 
            ALLOWED_EXTENSIONS.includes(fileExtension);
            
        if (!isValidType) {
            setError("Unsupported file type. Only PDF and DOCX files are allowed.");
            return false;
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            setError("File size exceeds 5MB. Please choose a smaller file.");
            return false;
        }

        setError(null);
        return true;
    };

    // Drag handlers
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (validateFile(droppedFile)) {
                setFile(droppedFile);
                setSuccess(false);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (validateFile(selectedFile)) {
                setFile(selectedFile);
                setSuccess(false);
            }
        }
    };

    const onButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            await uploadResume(userId, file);
            setSuccess(true);
            setIsUploading(false);
            setFile(null);
            onUploadSuccess();
        } catch (err: any) {
            setIsUploading(false);
            setError(err.message || "Something went wrong during upload. Please try again.");
        }
    };

    return (
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 h-full flex flex-col justify-between shadow-xl relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="mb-6 relative">
                <h3 className="text-lg font-bold tracking-tight text-zinc-100">Upload Resume</h3>
                <p className="text-zinc-500 text-xs mt-1">
                    Upload your PDF or DOCX file (5MB max size)
                </p>
            </div>

            <div className="space-y-4 flex-1 flex flex-col justify-center">
                {/* Drag and Drop Zone */}
                <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={!isUploading && !success ? onButtonClick : undefined}
                    className={`border border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                        dragActive
                            ? "border-indigo-500 bg-indigo-500/5 shadow-[0_0_15px_-3px_rgba(79,70,229,0.1)]"
                            : "border-zinc-800 hover:border-zinc-700/80 hover:bg-zinc-900/10 bg-zinc-900/5"
                    } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        aria-label="Upload resume file"
                        accept=".pdf,.docx"
                        onChange={handleChange}
                        disabled={isUploading}
                    />

                    {/* SVG Icon */}
                    <div className={`p-3 bg-zinc-900 border border-zinc-800/80 rounded-xl mb-3 transition-colors ${dragActive ? "border-indigo-500/50 text-indigo-400" : "text-zinc-400"}`}>
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                    </div>

                    <p className="text-xs font-semibold text-zinc-300 text-center">
                        {file ? file.name : "Drag & drop your resume here, or"}
                    </p>
                    {!file && (
                        <p className="text-[10px] text-zinc-500 mt-1.5 text-center">
                            Supports PDF, DOCX (Max 5MB)
                        </p>
                    )}
                    
                    {file && (
                        <p className="text-[10px] text-indigo-400 mt-2 font-mono bg-indigo-950/20 border border-indigo-900/30 px-2 py-0.5 rounded-full">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                    )}
                </div>

                {/* Uploading loading state */}
                {isUploading && (
                    <div className="flex items-center justify-center space-x-2 py-1">
                        <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-zinc-400 font-medium">Uploading resume...</span>
                    </div>
                )}

                {/* Feedback Messages */}
                {error && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start space-x-2 animate-fade-in">
                        <svg
                            className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start space-x-2 animate-fade-in">
                        <svg
                            className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span>Resume uploaded successfully!</span>
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex gap-3">
                {!file ? (
                    <button
                        type="button"
                        onClick={onButtonClick}
                        disabled={isUploading}
                        className="w-full py-2.5 rounded-xl border border-zinc-800 text-zinc-300 font-semibold text-xs hover:bg-zinc-900 hover:border-zinc-700/80 transition duration-200 cursor-pointer text-center focus:ring-1 focus:ring-zinc-700 outline-none"
                    >
                        Browse File
                    </button>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={() => {
                                setFile(null);
                                setError(null);
                                setSuccess(false);
                            }}
                            disabled={isUploading}
                            className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 font-semibold text-xs hover:bg-zinc-900 hover:text-zinc-200 transition duration-200 cursor-pointer outline-none"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="flex-1 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs transition duration-200 disabled:opacity-50 cursor-pointer outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white"
                        >
                            {isUploading ? "Uploading..." : "Upload File"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
