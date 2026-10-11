import { NextResponse } from "next/server";
import { genjutsuRequest, parseGenjutsuInput } from "@/generation/genjutsu";
import { createPlatformClient, PlatformError } from "@/generation/platform";

export const runtime = "nodejs";

function client() {
  const apiKey = process.env.HF_CREDENTIALS || process.env.HF_KEY;
  if (!apiKey) throw new Error("A chave Higgsfield ainda não foi configurada no servidor.");
  return createPlatformClient({ apiKey, baseUrl: process.env.HF_API_BASE_URL || "https://api.higgsfield.ai" });
}

function errorResponse(error: unknown) {
  if (error instanceof PlatformError) {
    const message = error.status === 401 || error.status === 403
      ? "A Higgsfield recusou a chave ou o acesso. Verifique as credenciais e o saldo da conta."
      : "A Higgsfield não concluiu esta operação. Tente novamente e verifique os arquivos e o saldo da conta.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
  return NextResponse.json({ error: "Não foi possível conectar à Higgsfield. Tente novamente." }, { status: 502 });
}

export async function POST(request: Request) {
  let input;
  try { input = parseGenjutsuInput(await request.json()); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Dados inválidos." }, { status: 400 }); }
  if (!process.env.HF_CREDENTIALS && !process.env.HF_KEY) return NextResponse.json({ error: "Configure a chave Higgsfield no servidor para gerar vídeos." }, { status: 503 });
  try {
    const { path, body } = genjutsuRequest(input);
    return NextResponse.json(await client().submit(path, body), { status: 202 });
  } catch (error) { return errorResponse(error); }
}

export async function GET(request: Request) {
  const requestId = new URL(request.url).searchParams.get("requestId");
  if (!requestId || !/^[a-z0-9_-]{1,100}$/i.test(requestId)) return NextResponse.json({ error: "Identificador de geração inválido." }, { status: 400 });
  if (!process.env.HF_CREDENTIALS && !process.env.HF_KEY) return NextResponse.json({ error: "Configure a chave Higgsfield no servidor para acompanhar a geração." }, { status: 503 });
  try { return NextResponse.json(await client().status(requestId), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return errorResponse(error); }
}
