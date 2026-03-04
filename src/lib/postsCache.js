import { supabase } from "./supabaseClient";

const DEFAULT_TTL_MS = 2 * 60 * 1000;
const cache = new Map();
const inflight = new Map();

function normalizeTypes(types) {
  return [...types].sort().join(",");
}

function getCacheKey(kind, params) {
  return `${kind}:${JSON.stringify(params)}`;
}

async function withCache(key, fetcher, ttlMs = DEFAULT_TTL_MS) {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  if (inflight.has(key)) {
    return inflight.get(key);
  }

  const request = (async () => {
    try {
      const value = await fetcher();
      cache.set(key, { value, expiresAt: now + ttlMs });
      return value;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, request);
  return request;
}

export async function getPublishedPostsByTypes(types) {
  const normalized = normalizeTypes(types);
  const key = getCacheKey("posts_by_types", { types: normalized });

  return withCache(key, async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .in("type", types)
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return [];
    }
    return data || [];
  });
}

export async function getPublishedPostById(id, allowedTypes) {
  const normalized = normalizeTypes(allowedTypes);
  const key = getCacheKey("post_by_id", { id, types: normalized });

  return withCache(key, async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .eq("published", true)
      .in("type", allowedTypes)
      .single();

    if (error) {
      console.error(error);
      return null;
    }
    return data || null;
  });
}

export function clearPostsCache() {
  cache.clear();
  inflight.clear();
}
