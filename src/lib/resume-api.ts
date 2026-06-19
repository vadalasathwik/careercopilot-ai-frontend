const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL environment variable is not defined");
}

export interface Resume {
    id: number;
    user_id: number;
    file_name: string;
    file_url: string;
    created_at: string;
}

/**
 * Uploads a resume file for a specific PostgreSQL user ID.
 * @param userId - The database user ID
 * @param file - The PDF or DOCX file to upload
 */
export async function uploadResume(userId: number, file: File): Promise<Resume> {
    const formData = new FormData();
    formData.append("user_id", userId.toString());
    formData.append("file", file);

    const response = await fetch(`${API_URL}/resume/upload`, {
        method: "POST",
        body: formData,
        // Content-Type is set automatically by the browser with correct boundary for FormData
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to upload resume");
    }

    return response.json();
}

/**
 * Fetches all resumes for a specific PostgreSQL user ID.
 * @param userId - The database user ID
 */
export async function getUserResumes(userId: number): Promise<Resume[]> {
    const response = await fetch(`${API_URL}/resume/${userId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to fetch resumes");
    }

    return response.json();
}
