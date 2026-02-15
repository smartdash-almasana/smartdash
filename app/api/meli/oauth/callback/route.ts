import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");

    // Recuperar cookies seguras establecidas en /start
    const storedState = req.cookies.get("meli_auth_state")?.value;
    const codeVerifier = req.cookies.get("meli_code_verifier")?.value;

    const appId = process.env.MELI_APP_ID;
    const clientSecret = process.env.MELI_CLIENT_SECRET;
    const redirectUri = process.env.MELI_REDIRECT_URI;

    if (!code || !state) {
        return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
    }

    // Validación de State (CSRF)
    if (!storedState || state !== storedState) {
        return NextResponse.json({ error: "Invalid state or session expired" }, { status: 400 });
    }

    if (!appId || !clientSecret || !redirectUri) {
        return NextResponse.json(
            { error: "Missing Server Configuration (MELI_APP_ID / MELI_CLIENT_SECRET / MELI_REDIRECT_URI)" },
            { status: 500 }
        );
    }

    // Intercambio de Code por Token (incluyendo PKCE code_verifier)
    const body = new URLSearchParams();
    body.set("grant_type", "authorization_code");
    body.set("client_id", appId);
    body.set("client_secret", clientSecret);
    body.set("code", code);
    body.set("redirect_uri", redirectUri);
    if (codeVerifier) {
        body.set("code_verifier", codeVerifier);
    }

    try {
        const tokenRes = await fetch("https://api.mercadolibre.com/oauth/token", {
            method: "POST",
            headers: {
                accept: "application/json",
                "content-type": "application/x-www-form-urlencoded",
            },
            body: body.toString(),
            cache: "no-store",
        });

        const tokenJson = await tokenRes.json();

        if (!tokenRes.ok) {
            console.error("[OAUTH] Token exchange failed:", tokenJson);
            return NextResponse.json(
                { error: "Token exchange failed", details: tokenJson },
                { status: tokenRes.status }
            );
        }

        if (!tokenJson.refresh_token) {
            console.error("[OAUTH] Missing refresh_token in ML response:", tokenJson);
            return NextResponse.json(
                { error: "Mercado Libre didn't provide a refresh_token. Check app settings.", details: tokenJson },
                { status: 500 }
            );
        }

        // Persistencia en Supabase
        const expiresAt = tokenJson.expires_in
            ? new Date(Date.now() + tokenJson.expires_in * 1000).toISOString()
            : null;

        const { error: upsertError } = await supabaseAdmin
            .from("meli_oauth_tokens")
            .upsert(
                {
                    user_id: String(tokenJson.user_id),
                    access_token: tokenJson.access_token,
                    refresh_token: tokenJson.refresh_token,
                    scope: tokenJson.scope,
                    token_type: tokenJson.token_type,
                    expires_at: expiresAt,
                    raw: tokenJson,
                    updated_at: new Date().toISOString()
                },
                { onConflict: "user_id" }
            );

        if (upsertError) {
            console.error("[OAUTH] DB Persist error:", upsertError);
            return NextResponse.json({ error: "Failed to persist tokens", details: upsertError }, { status: 500 });
        }

        // Limpieza de cookies y redirección exitosa
        const response = NextResponse.redirect(new URL("/?auth_success=true", req.url));
        response.cookies.delete("meli_auth_state");
        response.cookies.delete("meli_code_verifier");

        return response;

    } catch (error: any) {
        console.error("[OAUTH] Unexpected error:", error);
        return NextResponse.json({ error: "Unexpected error during OAuth", details: error.message }, { status: 500 });
    }
}
