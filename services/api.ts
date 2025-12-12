type UserDoc = { _id: string; handle?: string; address?: string; createdAt?: string; xp?: number; level?: number; avatarUrl?: string; estimatedCost?: string; walletConnectedAt?: string; category?: string };
type UsersResponse = { items: UserDoc[]; total: number };

let usersCache: { key: string; data: UserDoc[]; ts: number } | null = null;
const CACHE_TTL_MS = 30_000;
const API_BASE = (() => {
  const envBase = (import.meta as any).env?.VITE_API_BASE;
  if (typeof envBase === "string") return envBase; // empty string means use proxy
  return "";
})();

function apiUrl(path: string): string {
  if (!API_BASE) return path; // use Vite proxy in dev
  return `${API_BASE}${path}`;
}
const API_TOKEN = (import.meta as any).env?.VITE_API_TOKEN || undefined;

export async function getUser(address: string): Promise<UserDoc | null> {
  const users = await getUsers({ q: address, limit: 1 });
  return users.find(u => u.address?.toLowerCase() === address.toLowerCase()) || null;
}

export async function getUsers(opts: { limit?: number; offset?: number; sort?: string; order?: "asc" | "desc"; q?: string; token?: string; force?: boolean } = {}): Promise<UserDoc[]> {
  const { limit = 100, offset = 0, sort = "xp", order = "desc", q, token = API_TOKEN, force = false } = opts;
  const now = Date.now();
  const key = JSON.stringify({ limit, offset, sort, order, q });
  if (!force && usersCache && usersCache.key === key && now - usersCache.ts < CACHE_TTL_MS) {
    return usersCache.data;
  }
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset), sort, order, ...(q ? { q } : {}) });
  const res = await fetch(apiUrl(`/api/v1/users?${params.toString()}`), {
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
  const data = (await res.json()) as UsersResponse;
  usersCache = { key, data: data.items, ts: now };
  return data.items;
}

export async function upsertWallet(opts: { address: string; handle?: string; avatarUrl?: string; category?: string; estimatedCost?: string; token?: string }): Promise<UserDoc> {
  const token = opts.token ?? API_TOKEN;
  const body = JSON.stringify({ address: opts.address, handle: opts.handle, avatarUrl: opts.avatarUrl, category: opts.category, estimatedCost: opts.estimatedCost });
  const headers = token ? { "content-type": "application/json", authorization: `Bearer ${token}` } : { "content-type": "application/json" };
  const bases = (API_BASE
    ? [API_BASE, `http://${typeof window !== "undefined" ? window.location.hostname : "127.0.0.1"}:4000`, "http://127.0.0.1:4000", "http://localhost:4000"]
    : ["", "http://localhost:4000", "http://127.0.0.1:4000"]
  ).filter((b) => b !== null && b !== undefined);
  let lastError: any = null;
  for (const base of bases) {
    try {
      const url = base ? `${base}/api/v1/users/wallet` : apiUrl(`/api/v1/users/wallet`);
      const res = await fetch(url, { method: "POST", headers, body });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        lastError = new Error(`Failed to upsert wallet: ${res.status}${text ? ` ${text}` : ""}`);
        continue;
      }
      return (await res.json()) as any;
    } catch (e: any) {
      lastError = e;
      continue;
    }
  }
  throw new Error(lastError?.message || "Failed to upsert wallet");
}

type QuestDoc = { id: string; slug: string; title: string; description?: string; xpReward?: number; progress?: number; status?: string; category?: string; audienceCategory?: string; day?: number };
type QuestsResponse = { items: QuestDoc[]; total: number };
let questsCache: { key: string; data: QuestDoc[]; ts: number } | null = null;

export async function getQuests(opts: { limit?: number; offset?: number; address?: string; status?: string; force?: boolean } = {}): Promise<QuestDoc[]> {
  const { limit = 50, offset = 0, address, status = "active", force = false } = opts;
  const now = Date.now();
  const key = JSON.stringify({ limit, offset, address, status });
  // Reduce cache TTL to avoid stale state on reload after completion, or ignore if forced
  if (!force && questsCache && questsCache.key === key && now - questsCache.ts < 5000) {
    return questsCache.data;
  }
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset), status, ...(address ? { address } : {}) });
  const res = await fetch(apiUrl(`/api/v1/quests?${params.toString()}`));
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch quests: ${res.status}${text ? ` ${text}` : ""}`);
  }
  const data = (await res.json()) as QuestsResponse;
  questsCache = { key, data: data.items, ts: now };
  return data.items;
}

export async function joinQuest(opts: { address: string; slug: string }): Promise<{ status: string; progress: number }> {
  const res = await fetch(apiUrl(`/api/v1/participations/join`), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ address: opts.address, slug: opts.slug }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to join quest: ${res.status}${text ? ` ${text}` : ""}`);
  }
  const data = await res.json();
  return { status: data.status || "joined", progress: data.progress || 0 };
}

export async function completeQuest(opts: { address: string; slug: string }): Promise<{ status: string; xp: number; awarded: boolean }> {
  const res = await fetch(apiUrl(`/api/v1/participations/complete`), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ address: opts.address, slug: opts.slug }),
  });
  // Invalidate cache
  questsCache = null;
  
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to complete quest: ${res.status}${text ? ` ${text}` : ""}`);
  }
  return await res.json();
}
