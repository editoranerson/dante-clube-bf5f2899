import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { MAIN_SUPABASE_ANON_KEY, MAIN_SUPABASE_URL } from "./main-supabase-config";

let client: SupabaseClient | undefined;

/**
 * Auth client for associates (main Universo Dante site accounts).
 * PKCE keeps email-confirmation / recovery redirects (?code=) from being picked up
 * by the club's own Lovable Cloud client, which uses the implicit hash flow.
 */
export function getMainSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(MAIN_SUPABASE_URL, MAIN_SUPABASE_ANON_KEY, {
      auth: {
        storageKey: "dante-clube-associado",
        flowType: "pkce",
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}

export function translateAuthError(message: string | undefined): string {
  const m = (message ?? "").toLowerCase();
  if (m.includes("invalid login")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed"))
    return "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Este e-mail já tem conta no Universo Dante. Use a aba Login.";
  if (m.includes("password should be") || m.includes("at least"))
    return "A senha precisa ter pelo menos 6 caracteres.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.";
  if (m.includes("same password") || m.includes("different from the old"))
    return "A nova senha precisa ser diferente da atual.";
  if (m.includes("current password"))
    return "Informe sua senha atual corretamente.";
  if (m.includes("failed to fetch") || m.includes("network"))
    return "Sem conexão no momento. Verifique sua internet.";
  return "Não foi possível concluir agora. Tente novamente.";
}
