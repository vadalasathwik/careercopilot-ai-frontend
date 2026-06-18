const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

    return response.json();
}