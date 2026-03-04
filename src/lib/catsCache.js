import { supabase } from "./supabaseClient";

const DEFAULT_TTL_MS = 2 * 60 * 1000;
const cache = new Map();
const inflight = new Map();

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

const CAT_SELECT =
  "id,name,birth_date,sex,description_es,description_cat,status,sterilized,image_path,published";

export async function getPublishedCats() {
  const key = getCacheKey("cats_list", { published: true });

  return withCache(key, async () => {
    const { data, error } = await supabase
      .from("cats")
      .select(CAT_SELECT)
      .eq("published", true)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      return [];
    }
    return data || [];
  });
}

export async function getPublishedCatById(id) {
  const key = getCacheKey("cat_by_id", { id, published: true });

  return withCache(key, async () => {
    const { data, error } = await supabase
      .from("cats")
      .select(CAT_SELECT)
      .eq("id", id)
      .eq("published", true)
      .maybeSingle();

    if (error) {
      console.error(error);
      return null;
    }
    return data || null;
  });
}

export function clearCatsCache() {
  cache.clear();
  inflight.clear();
}
