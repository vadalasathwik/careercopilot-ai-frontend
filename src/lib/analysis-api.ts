const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL environment variable is not defined");
}

export interface Analysis {
  id: number;
  user_id: number;
  resume_id: number;
  job_description: string;
  ats_score: number | null;
  match_score: number | null;
  missing_skills: string | null; // Stored as a serialized JSON string in the DB
  recommendations: string | null; // Stored as a serialized JSON string in the DB
  created_at: string;
}

export interface AnalysisCreateResponse {
  id: number;
}

/**
 * Creates a new analysis record in the backend database.
 */
export async function createAnalysis(
  userId: number,
  resumeId: number,
  jobDescription: string
): Promise<AnalysisCreateResponse> {
  const response = await fetch(`${API_URL}/analysis/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
      resume_id: resumeId,
      job_description: jobDescription,
    }),
  });

  if (!response.ok) {
    const errorData: { detail?: string } = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to initialize analysis session.");
  }

  return response.json();
}

/**
 * Triggers the Gemini analysis for the created analysis ID.
 */
export async function runAnalysis(analysisId: number): Promise<Analysis> {
  const response = await fetch(`${API_URL}/analysis/run/${analysisId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData: { detail?: string } = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to execute Gemini analysis.");
  }

  return response.json();
}

/**
 * Retrieves the full analysis record by its ID.
 */
export async function getAnalysis(analysisId: number): Promise<Analysis> {
  const response = await fetch(`${API_URL}/analysis/${analysisId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData: { detail?: string } = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to fetch analysis details.");
  }

  return response.json();
}
