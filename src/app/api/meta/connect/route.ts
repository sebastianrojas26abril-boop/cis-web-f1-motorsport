import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { buildAuthorizeUrl, META_APP_ID, META_REDIRECT_URI } from "@/lib/meta";

export async function GET(request: Request) {
  if (!META_APP_ID || !META_REDIRECT_URI) {
    const url = new URL("/configuracion", request.url);
    url.searchParams.set("meta_error", "Faltan META_APP_ID / META_REDIRECT_URI en las variables de entorno");
    return NextResponse.redirect(url);
  }

  const state = randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("meta_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return NextResponse.redirect(buildAuthorizeUrl(state));
}
