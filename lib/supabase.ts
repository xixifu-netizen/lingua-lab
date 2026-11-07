// Supabase 客户端：浏览器端单例
// 注意：使用 anon/publishable key，仅能访问 RLS 允许的本人数据
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error("Supabase 未配置：请设置 NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  if (!_client) {
    _client = createBrowserClient(url, anonKey);
  }
  return _client;
}
