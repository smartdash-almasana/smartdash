import { NextRequest, NextResponse } from "next/server";
import { generateState, generateCodeVerifier, generateCodeChallenge } from "@/lib/meli-auth";

export async function GET(req: NextRequest) {
    const appId = process.env.MELI_APP_ID;
    const redirectUri = process.env.MELI_REDIRECT_URI;

    if (!appId || !redirectUri) {
        return NextResponse.json(
            { error: "Internal Server Error: Missing app configuration" },
            { status: 500 }
        );
    }

    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    const authUrl = new URL("https://auth.mercadolibre.com.ar/authorization");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", appId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("code_challenge", codeChallenge);
    authUrl.searchParams.set("code_challenge_method", "S256");

    const response = NextResponse.redirect(authUrl.toString());

    // Guardar PKCE y state en cookies seguras
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        maxAge: 600, // 10 minutos
    };

    response.cookies.set("meli_auth_state", state, cookieOptions);
    response.cookies.set("meli_code_verifier", codeVerifier, cookieOptions);

    return response;
}
