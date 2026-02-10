// Supabase Edge Function: public-signup-trial
// Public endpoint (verify_jwt=false). Creates trial user + placeholder salao + records comercial control.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";
import { z } from "https://esm.sh/zod@3.25.76";

const schema = z.object({
  nome_estabelecimento: z.string().trim().min(1).max(200),
  endereco: z.string().trim().min(1).max(500),
  telefone: z.string().trim().min(1).max(50),
  nome_proprietario: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
  device_fingerprint: z.string().trim().min(8).max(500).optional(),
});

type Payload = z.infer<typeof schema>;

function onlyDigits(s: string) {
  return (s || "").replace(/\D+/g, "");
}

function normalizePhoneBR(phone: string) {
  // deixa só dígitos; você pode exigir 10/11 no zod se quiser
  return onlyDigits(phone);
}

function normalizeText(s: string) {
  return (s || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/\s+/g, " ");
}

function normalizeAddress(addr: string) {
  // aqui você decide o quão "duro" quer ser
  return normalizeText(addr).replace(/[.,#-]/g, " ");
}

async function sha256Hex(input: string) {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function getClientIp(req: Request) {
  const xff = req.headers.get("x-forwarded-for") || "";
  // pega o primeiro IP
  return xff.split(",")[0].trim() || "unknown";
}

function json(resBody: unknown, init: ResponseInit, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify(resBody), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
      ...(init.headers ?? {}),
    },
  });
}

function buildCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function zodErrorMessage(error: z.ZodError) {
  const first = error.issues?.[0];
  if (!first) return "Dados inválidos";

  // Keep PT-BR, human friendly.
  if (first.path?.[0] === "password") {
    return "Senha deve ter no mínimo 8 caracteres";
  }
  if (first.path?.[0] === "email") {
    return "Informe um email válido";
  }
  return first.message || "Dados inválidos";
}

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ success: false, error: "Método não permitido" }, { status: 405 }, corsHeaders);
  }

  try {
    const body = (await req.json()) as unknown;
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return json(
        { success: false, error: zodErrorMessage(parsed.error) },
        { status: 400 },
        corsHeaders,
      );
    }

    const payload: Payload = parsed.data;

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return json(
        { success: false, error: "Configuração do servidor ausente" },
        { status: 500 },
        corsHeaders,
      );
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    // 1) Create auth user
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      // NÃO auto-confirmar: obriga confirmação de email
    });

    if (createErr) {
      const msg = (createErr.message || "").toLowerCase();
      if (
        msg.includes("already") ||
        msg.includes("registered") ||
        msg.includes("exists") ||
        msg.includes("duplicate")
      ) {
        return json({ success: false, error: "Email já cadastrado" }, { status: 409 }, corsHeaders);
      }

      return json({ success: false, error: "Erro interno do servidor" }, { status: 500 }, corsHeaders);
    }

    const userId = created.user?.id;
    if (!userId) {
      return json({ success: false, error: "Erro interno do servidor" }, { status: 500 }, corsHeaders);
    }

    // --- Anti-fraude (trial duro) ---
    const ip = getClientIp(req);
    const phoneNorm = normalizePhoneBR(payload.telefone);
    const addressNorm = normalizeAddress(payload.endereco);
    const nameNorm = normalizeText(payload.nome_proprietario);
    const fpNorm = payload.device_fingerprint ? normalizeText(payload.device_fingerprint) : "";

    // hashes (não guardamos PII puro)
    const ipHash = await sha256Hex(ip);
    const phoneHash = await sha256Hex(phoneNorm);
    const addressHash = await sha256Hex(addressNorm);
    const nameHash = await sha256Hex(nameNorm);
    const fpHash = fpNorm ? await sha256Hex(fpNorm) : null;

    // lista de locks que você quer aplicar (trial = duro)
    const locks: Array<{ lock_type: string; lock_hash: string }> = [
      { lock_type: "phone", lock_hash: phoneHash },
      { lock_type: "address", lock_hash: addressHash },
      { lock_type: "name", lock_hash: nameHash },
      { lock_type: "ip", lock_hash: ipHash },
    ];
    if (fpHash) locks.push({ lock_type: "fingerprint", lock_hash: fpHash });

    // tenta criar locks; se já existir -> bloqueia trial
    for (const l of locks) {
      const { error: lockErr } = await admin
        .from("trial_locks")
        .insert(l);

      if (lockErr) {
        // conflito de unique -> já teve trial com esse dado
        // Postgres error 23505 geralmente aparece na msg; vamos tratar genericamente
        const msg = (lockErr.message || "").toLowerCase();
        if (msg.includes("duplicate") || msg.includes("unique") || msg.includes("23505")) {
          await admin.auth.admin.deleteUser(userId);
          return json(
            { success: false, error: "Teste grátis já utilizado para alguns dos dados informados." },
            { status: 409 },
            corsHeaders
          );
        }

        return json({ success: false, error: "Erro interno do servidor" }, { status: 500 }, corsHeaders);
      }
    }

    // 2) Create placeholder salao
    const salaoNome = payload.nome_estabelecimento.trim();
    const { data: salaoRow, error: salaoErr } = await admin
      .from("saloes")
      .insert({
        nome: salaoNome,
        telefone: payload.telefone,
        endereco: payload.endereco,
        created_by_user_id: userId,
      })
      .select("id")
      .single();

    if (salaoErr || !salaoRow?.id) {
      return json({ success: false, error: "Erro interno do servidor" }, { status: 500 }, corsHeaders);
    }

    const salaoId = salaoRow.id as string;

    // 3) Ensure user_roles (no duplicates)
    const { error: roleErr } = await admin.from("user_roles").upsert(
      {
        user_id: userId,
        role: "admin",
        salao_id: salaoId,
      },
      {
        onConflict: "user_id,salao_id,role",
      },
    );

    if (roleErr) {
      return json({ success: false, error: "Erro interno do servidor" }, { status: 500 }, corsHeaders);
    }

    // 4) Trial dates
    const now = new Date();
    const trialFim = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // 5) Upsert comercial control
    const { error: cadastroErr } = await admin.from("cadastros_estabelecimento").upsert(
      {
        user_id: userId,
        nome_estabelecimento: payload.nome_estabelecimento,
        endereco: payload.endereco,
        telefone: payload.telefone,
        nome_proprietario: payload.nome_proprietario,
        email: payload.email,
        plano_atual: "profissional",
        status: "trial",
        trial_inicio: now.toISOString(),
        trial_fim: trialFim.toISOString(),
        acesso_ate: trialFim.toISOString(),
      },
      {
        onConflict: "user_id",
      },
    );

    if (cadastroErr) {
      return json({ success: false, error: "Erro interno do servidor" }, { status: 500 }, corsHeaders);
    }

    return json({ success: true, user_id: userId, salao_id: salaoId }, { status: 200 }, corsHeaders);
  } catch (_e) {
    return json({ success: false, error: "Erro interno do servidor" }, { status: 500 }, buildCorsHeaders(req));
  }
});
