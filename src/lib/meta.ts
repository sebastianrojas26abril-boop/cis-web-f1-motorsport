// Integración con la Graph API de Meta (Instagram Business + Facebook Page).
// Todo lo que toca credenciales/tokens vive acá — nada de esto se expone al cliente.

const GRAPH_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

export const META_APP_ID = process.env.META_APP_ID;
export const META_APP_SECRET = process.env.META_APP_SECRET;
export const META_REDIRECT_URI = process.env.META_REDIRECT_URI;

export const META_OAUTH_SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_metadata",
  "instagram_basic",
  "instagram_manage_insights",
].join(",");

class MetaApiError extends Error {}

async function graphGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${GRAPH_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new MetaApiError(json.error?.message ?? `Graph API error (${res.status}) on ${path}`);
  }
  return json as T;
}

export function buildAuthorizeUrl(state: string) {
  const url = new URL("https://www.facebook.com/v21.0/dialog/oauth");
  url.searchParams.set("client_id", META_APP_ID ?? "");
  url.searchParams.set("redirect_uri", META_REDIRECT_URI ?? "");
  url.searchParams.set("state", state);
  url.searchParams.set("scope", META_OAUTH_SCOPES);
  url.searchParams.set("response_type", "code");
  return url.toString();
}

export async function exchangeCodeForUserToken(code: string) {
  const data = await graphGet<{ access_token: string; expires_in?: number }>("/oauth/access_token", {
    client_id: META_APP_ID ?? "",
    client_secret: META_APP_SECRET ?? "",
    redirect_uri: META_REDIRECT_URI ?? "",
    code,
  });
  return data.access_token;
}

export async function exchangeForLongLivedUserToken(shortLivedToken: string) {
  const data = await graphGet<{ access_token: string; expires_in?: number }>("/oauth/access_token", {
    grant_type: "fb_exchange_token",
    client_id: META_APP_ID ?? "",
    client_secret: META_APP_SECRET ?? "",
    fb_exchange_token: shortLivedToken,
  });
  return data;
}

type FacebookPage = {
  id: string;
  name: string;
  access_token: string; // page access token, inherits long lifetime from the long-lived user token
  instagram_business_account?: { id: string };
};

export async function listManagedPages(userAccessToken: string) {
  const data = await graphGet<{ data: FacebookPage[] }>("/me/accounts", {
    fields: "id,name,access_token,instagram_business_account",
    access_token: userAccessToken,
  });
  return data.data;
}

export async function getInstagramUsername(igBusinessId: string, pageAccessToken: string) {
  const data = await graphGet<{ username?: string }>(`/${igBusinessId}`, {
    fields: "username",
    access_token: pageAccessToken,
  });
  return data.username ?? null;
}

// --- Resolver un permalink pegado por el usuario al ID interno del post ---

export async function resolveInstagramMediaId(
  igBusinessId: string,
  pageAccessToken: string,
  permalinkUrl: string
) {
  let after: string | undefined;
  for (let page = 0; page < 10; page++) {
    const data = await graphGet<{
      data: { id: string; permalink: string }[];
      paging?: { cursors?: { after?: string }; next?: string };
    }>(`/${igBusinessId}/media`, {
      fields: "id,permalink",
      limit: "50",
      access_token: pageAccessToken,
      ...(after ? { after } : {}),
    });
    const match = data.data.find((m) => normalizeUrl(m.permalink) === normalizeUrl(permalinkUrl));
    if (match) return match.id;
    after = data.paging?.cursors?.after;
    if (!after) break;
  }
  return null;
}

export async function resolveFacebookPostId(pageId: string, pageAccessToken: string, permalinkUrl: string) {
  let after: string | undefined;
  for (let page = 0; page < 10; page++) {
    const data = await graphGet<{
      data: { id: string; permalink_url: string }[];
      paging?: { cursors?: { after?: string } };
    }>(`/${pageId}/posts`, {
      fields: "id,permalink_url",
      limit: "50",
      access_token: pageAccessToken,
      ...(after ? { after } : {}),
    });
    const match = data.data.find((p) => normalizeUrl(p.permalink_url) === normalizeUrl(permalinkUrl));
    if (match) return match.id;
    after = data.paging?.cursors?.after;
    if (!after) break;
  }
  return null;
}

function normalizeUrl(url: string) {
  return url.replace(/\/+$/, "").replace(/^https?:\/\/(www\.)?/, "").toLowerCase();
}

// --- Insights ---

export type MetaInsightsResult = {
  views: number | null;
  reach: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
};

export async function fetchInstagramInsights(
  mediaId: string,
  pageAccessToken: string
): Promise<MetaInsightsResult> {
  // impressions fue reemplazada por "views" en media recientes; se piden ambas
  // y se usa la que responda. likes/comments vienen del objeto media directamente.
  const [insights, media] = await Promise.all([
    graphGet<{ data: { name: string; values: { value: number }[] }[] }>(`/${mediaId}/insights`, {
      metric: "reach,saved,shares,views",
      access_token: pageAccessToken,
    }).catch(() => ({ data: [] as { name: string; values: { value: number }[] }[] })),
    graphGet<{ like_count?: number; comments_count?: number }>(`/${mediaId}`, {
      fields: "like_count,comments_count",
      access_token: pageAccessToken,
    }),
  ]);

  const metric = (name: string) => insights.data.find((m) => m.name === name)?.values?.[0]?.value ?? null;

  return {
    views: metric("views"),
    reach: metric("reach"),
    likes: media.like_count ?? null,
    comments: media.comments_count ?? null,
    shares: metric("shares"),
    saves: metric("saved"),
  };
}

type FacebookPostFields = {
  shares?: { count: number };
  comments?: { summary: { total_count: number } };
  reactions?: { summary: { total_count: number } };
};

export async function fetchFacebookInsights(
  postId: string,
  pageAccessToken: string
): Promise<MetaInsightsResult> {
  const [insights, post] = await Promise.all([
    graphGet<{ data: { name: string; values: { value: number }[] }[] }>(`/${postId}/insights`, {
      metric: "post_impressions,post_reactions_like_total",
      access_token: pageAccessToken,
    }).catch(() => ({ data: [] as { name: string; values: { value: number }[] }[] })),
    graphGet<FacebookPostFields>(`/${postId}`, {
      fields: "shares,comments.summary(true),reactions.summary(true)",
      access_token: pageAccessToken,
    }).catch((): FacebookPostFields => ({})),
  ]);

  const metric = (name: string) => insights.data.find((m) => m.name === name)?.values?.[0]?.value ?? null;

  return {
    views: metric("post_impressions"),
    reach: metric("post_impressions"),
    likes: post.reactions?.summary?.total_count ?? null,
    comments: post.comments?.summary?.total_count ?? null,
    shares: post.shares?.count ?? null,
    saves: null,
  };
}
