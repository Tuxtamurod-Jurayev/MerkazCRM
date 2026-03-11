import { supabase } from "../lib/supabaseClient";

const TABLE_NAME = "crm_snapshots";
const SNAPSHOT_ID = "main";

export const isSupabaseEnabled = Boolean(supabase);

export async function loadRemoteDbSnapshot() {
  if (!supabase) return null;

  const { data, error, status } = await supabase
    .from(TABLE_NAME)
    .select("payload")
    .eq("id", SNAPSHOT_ID)
    .maybeSingle();

  if (error && status !== 406) {
    console.error("Supabase load error:", error.message);
    return null;
  }

  return data?.payload || null;
}

export async function saveRemoteDbSnapshot(payload) {
  if (!supabase) return;

  const { error } = await supabase.from(TABLE_NAME).upsert({
    id: SNAPSHOT_ID,
    payload,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Supabase save error:", error.message);
  }
}
