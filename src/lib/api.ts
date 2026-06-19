const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error(
        "NEXT_PUBLIC_API_URL environment variable is not defined"
    );
}

export async function syncUser(user: {
    name: string;
    email: string;
    image?: string | null;
}) {
    const response = await fetch(
        `${API_URL}/auth/google`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: user.name,
                email: user.email,
                image_url: user.image,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data?.detail ||
            "Failed to synchronize user"
        );
    }

    return data;
}