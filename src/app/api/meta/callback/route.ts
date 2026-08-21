import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  exchangeCodeForUserToken,
  exchangeForLongLivedUserToken,
  listManagedPages,
  getInstagramUsername,
} from "@/lib/meta";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error_description") || url.searchParams.get("error");

  const redirectTo = new URL("/configuracion", request.url);

  if (oauthError) {
    redirectTo.searchParams.set("meta_error", oauthError);
    return NextResponse.redirect(redirectTo);
  }

  const cookieStore = await cookies();
  const expectedState = cookieStore.get("meta_oauth_state")?.value;
  cookieStore.delete("meta_oauth_state");

  if (!code || !state || !expectedState || state !== expectedState) {
    redirectTo.searchParams.set("meta_error", "Estado OAuth inválido o expirado. Intenta conectar de nuevo.");
    return NextResponse.redirect(redirectTo);
  }

  try {
    const shortLivedToken = await exchangeCodeForUserToken(code);
    const { access_token: longLivedUserToken, expires_in } = await exchangeForLongLivedUserToken(shortLivedToken);

    const pages = await listManagedPages(longLivedUserToken);
    if (pages.length === 0) {
      redirectTo.searchParams.set(
        "meta_error",
        "Tu cuenta no administra ninguna Página de Facebook. Necesitas una Página conectada a tu Instagram Business."
      );
      return NextResponse.redirect(redirectTo);
    }

    // Preferir una página que ya tenga Instagram Business conectado.
    const page = pages.find((p) => p.instagram_business_account) ?? pages[0];
    const igBusinessId = page.instagram_business_account?.id ?? null;
    const igUsername = igBusinessId ? await getInstagramUsername(igBusinessId, page.access_token) : null;

    await prisma.metaConnection.upsert({
      where: { id: 1 },
      update: {
        pageId: page.id,
        pageName: page.name,
        pageAccessToken: page.access_token,
        tokenExpiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : null,
        instagramBusinessId: igBusinessId,
        instagramUsername: igUsername,
        lastSyncError: null,
      },
      create: {
        id: 1,
        pageId: page.id,
        pageName: page.name,
        pageAccessToken: page.access_token,
        tokenExpiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : null,
        instagramBusinessId: igBusinessId,
        instagramUsername: igUsername,
      },
    });

    redirectTo.searchParams.set("meta_connected", "1");
    return NextResponse.redirect(redirectTo);
  } catch (err) {
    redirectTo.searchParams.set("meta_error", err instanceof Error ? err.message : "Error desconocido");
    return NextResponse.redirect(redirectTo);
  }
}
