export const GENJUTSU_MODEL = "higgsfield/genjutsu/motion-transfer/v1.0";
export const RESOLUTIONS = ["480p", "720p", "1080p"] as const;
export type Resolution = typeof RESOLUTIONS[number];
export type GenjutsuInput = { videoUrl: string; imageUrl: string; prompt: string; resolution: Resolution };

export function parseGenjutsuInput(value: unknown): GenjutsuInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Envie um vídeo e uma imagem.");
  const data = value as Record<string, unknown>;
  if (data.model !== undefined && data.model !== GENJUTSU_MODEL) throw new Error("Este aplicativo usa somente o Genjutsu.");
  const videoUrl = mediaUrl(data.videoUrl, "vídeo");
  const imageUrl = mediaUrl(data.imageUrl, "imagem");
  const prompt = data.prompt ?? "";
  if (typeof prompt !== "string" || prompt.length > 10000) throw new Error("As instruções devem ter até 10.000 caracteres.");
  const resolution = data.resolution ?? "720p";
  if (!RESOLUTIONS.includes(resolution as Resolution)) throw new Error("Escolha 480p, 720p ou 1080p.");
  return { videoUrl, imageUrl, prompt, resolution: resolution as Resolution };
}

function mediaUrl(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim() || value.trim().length > 2083) throw new Error(`Informe uma URL pública válida para o ${label}.`);
  let url: URL;
  try { url = new URL(value.trim()); } catch { throw new Error(`A URL do ${label} é inválida.`); }
  if (url.protocol !== "https:" || url.username || url.password) throw new Error(`A URL do ${label} deve usar HTTPS e não conter credenciais.`);
  return url.href;
}

export function genjutsuRequest(input: GenjutsuInput) {
  return { path: GENJUTSU_MODEL, body: { video_url: input.videoUrl, image_urls: [input.imageUrl], prompt: input.prompt, resolution: input.resolution } };
}

export function estimatedCost(seconds: number, resolution: Resolution): number {
  if (!Number.isFinite(seconds) || seconds < 4) throw new Error("O vídeo precisa ter pelo menos 4 segundos.");
  return Math.ceil(Math.min(seconds, 30)) * ({ "480p": 0.318, "720p": 0.681, "1080p": 1.632 }[resolution]);
}
