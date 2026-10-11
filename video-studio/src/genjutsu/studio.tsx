"use client";

import { useEffect, useRef, useState } from "react";
import { uploadMedia } from "@/generation/upload";
import { estimatedCost, RESOLUTIONS, type Resolution } from "@/generation/genjutsu";

type Media = { url: string; preview: string; name: string; file?: File; duration?: number };
type Run = { id: string; status: string; createdAt: number; resolution: Resolution; prompt: string; videoUrl?: string; error?: string };
type Config = { generation: boolean; uploads: boolean };
const HISTORY = "nand.genjutsu.history.v1";
const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 3 }).format(value);
const statusLabel: Record<string, string> = { queued: "Na fila", in_progress: "Gerando vídeo", completed: "Concluído", failed: "Falhou", nsfw: "Bloqueado pelo provedor", canceled: "Cancelado", paused: "Acompanhamento pausado" };
const pending = (status: string) => status === "queued" || status === "in_progress";

export function GenjutsuStudio() {
  const [config, setConfig] = useState<Config | null>(null);
  const [video, setVideo] = useState<Media | null>(null);
  const [image, setImage] = useState<Media | null>(null);
  const [prompt, setPrompt] = useState("");
  const [resolution, setResolution] = useState<Resolution>("720p");
  const [runs, setRuns] = useState<Run[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(true);
  const runsRef = useRef(runs);
  runsRef.current = runs;

  useEffect(() => {
    alive.current = true;
    const controller = new AbortController();
    fetch("/api/config", { signal: controller.signal }).then(r => r.json()).then(setConfig).catch(() => { if (!controller.signal.aborted) setError("Não foi possível verificar a configuração do servidor."); });
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(HISTORY) || "[]");
      if (Array.isArray(stored)) setRuns(stored.filter((r): r is Run => typeof r?.id === "string" && typeof r?.createdAt === "number" && RESOLUTIONS.includes(r?.resolution)).slice(0, 30));
    } catch { /* An unavailable browser store does not stop generation. */ }
    setLoaded(true);
    return () => { alive.current = false; controller.abort(); };
  }, []);

  useEffect(() => {
    if (loaded) try { localStorage.setItem(HISTORY, JSON.stringify(runs.slice(0, 30))); } catch { /* Storage may be full or unavailable. */ }
  }, [runs, loaded]);

  useEffect(() => () => { if (video?.preview.startsWith("blob:")) URL.revokeObjectURL(video.preview); }, [video?.preview]);
  useEffect(() => () => { if (image?.preview.startsWith("blob:")) URL.revokeObjectURL(image.preview); }, [image?.preview]);

  useEffect(() => {
    if (!loaded || !config?.generation) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      const active = runsRef.current.filter(r => pending(r.status));
      await Promise.all(active.map(async run => {
        if (Date.now() - run.createdAt > 10 * 60_000) {
          setRuns(current => current.map(r => r.id === run.id ? { ...r, status: "paused", error: "A geração ainda pode estar em andamento. Retome o acompanhamento sem criar uma nova cobrança." } : r));
          return;
        }
        try {
          const response = await fetch("/api/generation?requestId=" + encodeURIComponent(run.id), { signal: controller.signal });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Falha ao consultar a geração.");
          if (controller.signal.aborted) return;
          setRuns(current => current.map(r => r.id === run.id ? {
            ...r, status: data.status,
            ...(data.video?.url ? { videoUrl: data.video.url } : {}),
            error: data.status === "failed" ? "O provedor não conseguiu gerar este vídeo." : data.status === "nsfw" ? "O provedor bloqueou os arquivos enviados." : data.status === "completed" && !data.video?.url ? "O provedor não retornou um arquivo de vídeo." : undefined,
          } : r));
        } catch (caught) {
          if (!controller.signal.aborted) setRuns(current => current.map(r => r.id === run.id ? { ...r, status: "paused", error: caught instanceof Error ? caught.message : "Falha na conexão." } : r));
        }
      }));
      if (!controller.signal.aborted) timer = setTimeout(() => void poll(), 4000);
    }
    void poll();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [loaded, config]);

  async function selectFile(kind: "video" | "image", file: File | undefined) {
    if (!file) return;
    setError(null);
    const types = kind === "video" ? ["video/mp4"] : ["image/jpeg", "image/png", "image/webp"];
    if (!types.includes(file.type)) { setError(kind === "video" ? "Escolha um vídeo MP4." : "Escolha uma imagem JPG, PNG ou WebP."); return; }
    const preview = URL.createObjectURL(file);
    let duration: number | undefined;
    try {
      if (kind === "video") {
        duration = await videoDuration(preview);
        estimatedCost(duration, resolution);
      }
      const media = { url: "", preview, name: file.name, file, duration };
      (kind === "video" ? setVideo : setImage)(media);
    } catch (caught) { URL.revokeObjectURL(preview); setError(caught instanceof Error ? caught.message : "Não foi possível abrir o vídeo."); }
  }

  async function generate(event: React.FormEvent) {
    event.preventDefault();
    if (busy || !video || !image) return;
    setBusy(true); setError(null);
    try {
      if (!config?.generation) throw new Error("Configure a chave Higgsfield no servidor para gerar vídeos.");
      if ((video.file || image.file) && !config.uploads) throw new Error("Configure o Vercel Blob no servidor para enviar arquivos, ou use URLs públicas.");
      const [videoUrl, imageUrl] = await Promise.all([video.file ? uploadMedia(video.file).then(r => r.url) : video.url, image.file ? uploadMedia(image.file).then(r => r.url) : image.url]);
      if (!alive.current) return;
      setVideo(current => current === video ? { ...video, url: videoUrl, file: undefined } : current);
      setImage(current => current === image ? { ...image, url: imageUrl, file: undefined } : current);
      const response = await fetch("/api/generation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ videoUrl, imageUrl, prompt, resolution }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível iniciar a geração.");
      if (alive.current) setRuns(current => [{ id: data.requestId, status: "queued", createdAt: Date.now(), resolution, prompt }, ...current].slice(0, 30));
    } catch (caught) { if (alive.current) setError(caught instanceof Error ? caught.message : "Falha ao gerar o vídeo."); }
    finally { if (alive.current) setBusy(false); }
  }

  const cost = video?.duration ? estimatedCost(video.duration, resolution) : null;
  const unavailable = !config?.generation || Boolean((video?.file || image?.file) && !config?.uploads);
  const disabled = busy || !video || !image || unavailable;
  return (
    <main className="studio">
      <header className="studio-top"><a className="brand" href="/"><span className="brand-mark">N</span><span>Nand <strong>Motion</strong></span></a><span className={"connection " + (config?.generation ? "ready" : "")}>{config === null ? "Verificando servidor" : config.generation ? "Chave configurada" : "Configuração pendente"}</span></header>
      <section className="intro"><span className="eyebrow">ESTÚDIO DE VÍDEO · GENJUTSU</span><h1>Um novo visual.<br/><span>O mesmo movimento.</span></h1><p>Transforme personagens, ambientes ou estilos com uma imagem de referência, preservando os movimentos e o ritmo do vídeo original.</p></section>
      {config && (!config.generation || !config.uploads) && <aside className="setup-note" role="status">{!config.generation ? "A chave Higgsfield precisa ser configurada no servidor para iniciar gerações. " : ""}{!config.uploads ? "O envio de arquivos depende do armazenamento Vercel Blob. Você também pode usar URLs públicas." : ""}</aside>}
      <div className="workspace">
        <form className="editor" onSubmit={generate}>
          <div className="section-heading"><h2>Prepare sua transformação</h2><span className="model-tag">Genjutsu</span></div>
          <div className="input-grid">
            <MediaCard kind="video" title="Vídeo de referência" subtitle="MP4 · mínimo de 4 segundos" media={video} disabled={busy} onFile={file => void selectFile("video", file)} onUrl={url => { setVideo(url ? { url, preview: url, name: "Vídeo por URL" } : null); setError(null); }} onRemove={() => setVideo(null)} />
            <MediaCard kind="image" title="Imagem de substituição" subtitle="JPG, PNG ou WebP · uma imagem" media={image} disabled={busy} onFile={file => void selectFile("image", file)} onUrl={url => { setImage(url ? { url, preview: url, name: "Imagem por URL" } : null); setError(null); }} onRemove={() => setImage(null)} />
          </div>
          {video?.duration && video.duration > 30 && <p className="hint">Seu vídeo tem {video.duration.toFixed(1)}s. O Genjutsu usará os primeiros 30 segundos.</p>}
          <label className="field-label" htmlFor="prompt">Instruções <span>opcional</span></label>
          <textarea id="prompt" placeholder="Ex.: substitua o personagem pela pessoa da imagem e mantenha o ambiente original." value={prompt} maxLength={10000} disabled={busy} onChange={e => setPrompt(e.target.value)} rows={3}/>
          <div className="options"><div><label className="field-label" htmlFor="resolution">Resolução de saída</label><select id="resolution" value={resolution} disabled={busy} onChange={e => setResolution(e.target.value as Resolution)}>{RESOLUTIONS.map(r => <option key={r}>{r}</option>)}</select></div><div className="cost"><span>Custo estimado</span><strong>{cost === null ? money(({ "480p": .318, "720p": .681, "1080p": 1.632 })[resolution]) + " / segundo" : money(cost)}</strong><small>Em USD, antes de descontos. Duração arredondada para cima.</small></div></div>
          {error && <p className="error" role="alert">{error}</p>}
          <button className="generate" disabled={disabled} type="submit">{busy ? "Enviando e iniciando…" : "Gerar vídeo"}<span aria-hidden><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 18 18 6M6 6h12v12"/></svg></span></button>
          <p className="hint">Cada geração usa o saldo da sua conta Higgsfield. Vídeos acima de 30s são cortados pelo modelo. Arquivos enviados ficam disponíveis por URL pública para o processamento.</p>
        </form>
        <section className="results" aria-label="Seus vídeos"><div className="section-heading"><h2>Seus vídeos</h2><span className="count">{runs.length}</span></div>{runs.length === 0 ? <div className="empty"><div className="empty-icon" aria-hidden><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="m8 5 11 7-11 7Z"/></svg></div><h3>Sua próxima criação começa aqui</h3><p>Adicione um vídeo e uma imagem. O resultado aparecerá neste espaço.</p><span>01 · Referência &nbsp; 02 · Imagem &nbsp; 03 · Transformação</span></div> : <div className="run-list">{runs.map(run => <article className="run" key={run.id}><div className="run-meta"><span className={pending(run.status) ? "running" : ""}>{statusLabel[run.status] || "Aguardando provedor"}</span><span>{run.resolution}</span></div>{run.videoUrl ? <><video src={run.videoUrl} controls playsInline preload="metadata"/><a href={run.videoUrl} target="_blank" rel="noopener noreferrer" download>Salvar vídeo ↗</a></> : <div className="run-placeholder">{pending(run.status) ? <><span className="spinner"/>O Genjutsu está trabalhando…</> : run.error || statusLabel[run.status]}</div>}{run.error && run.videoUrl && <p className="error">{run.error}</p>}{run.status === "paused" && <button type="button" className="resume" onClick={() => setRuns(current => current.map(r => r.id === run.id ? { ...r, status: "queued", createdAt: Date.now(), error: undefined } : r))}>Retomar acompanhamento</button>}<p className="run-prompt">{run.prompt || "Transformação com imagem de referência"}</p></article>)}</div>}</section>
      </div>
      <footer><span>Baseado em <a href="https://github.com/wide-trace/open-higgsfield" target="_blank" rel="noopener noreferrer">OpenHiggsfield</a> · Geração pelo Genjutsu, da Higgsfield.</span><span>Histórico salvo neste navegador.</span></footer>
    </main>
  );
}

function MediaCard({ kind, title, subtitle, media, disabled, onFile, onUrl, onRemove }: { kind: "video" | "image"; title: string; subtitle: string; media: Media | null; disabled: boolean; onFile: (file: File | undefined) => void; onUrl: (url: string) => void; onRemove: () => void }) {
  const [urlMode, setUrlMode] = useState(false);
  const [value, setValue] = useState("");
  const [urlError, setUrlError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  function applyUrl() {
    try {
      const url = new URL(value.trim());
      if (url.protocol !== "https:" || url.username || url.password || url.href.length > 2083) throw new Error();
      onUrl(url.href); setUrlError(""); setUrlMode(false);
    } catch { setUrlError("Use uma URL pública HTTPS válida."); }
  }
  return <div className="media-card"><div className="media-title"><span className="step">{kind === "video" ? "01" : "02"}</span><h3>{title}</h3></div><input ref={fileInput} type="file" aria-label={title} accept={kind === "video" ? "video/mp4" : "image/jpeg,image/png,image/webp"} hidden disabled={disabled} onChange={e => { onFile(e.target.files?.[0]); e.target.value = ""; }}/>{media ? <div className="media-preview">{kind === "video" ? <video src={media.preview} controls playsInline preload="metadata" onError={() => setUrlError("Não foi possível pré-visualizar este vídeo. Verifique se a URL é pública.")}/> : <img src={media.preview} alt="Imagem de substituição" onError={() => setUrlError("Não foi possível pré-visualizar esta imagem. Verifique se a URL é pública.")}/>}<div className="media-caption"><span>{media.name}</span><button type="button" disabled={disabled} onClick={() => { onRemove(); setUrlError(""); }} aria-label={"Remover " + title.toLowerCase()}>×</button></div></div> : <button type="button" className="upload-area" disabled={disabled} onClick={() => fileInput.current?.click()}><span className="upload-icon" aria-hidden>{kind === "video" ? "▷" : "▧"}</span><strong>Escolher {kind === "video" ? "vídeo" : "imagem"}</strong><span>{subtitle}</span></button>}<button type="button" className="url-toggle" disabled={disabled} onClick={() => { setUrlMode(!urlMode); setUrlError(""); }}>Usar URL pública {urlMode ? "−" : "+"}</button>{urlMode && <div className="url-row"><label className="sr-only" htmlFor={kind + "-url"}>URL {kind === "video" ? "do vídeo" : "da imagem"}</label><input id={kind + "-url"} type="url" placeholder="https://…" value={value} disabled={disabled} onChange={e => setValue(e.target.value)}/><button type="button" disabled={disabled} onClick={applyUrl}>Aplicar</button></div>}{urlError && <p className="error" role="alert">{urlError}</p>}</div>;
}

function videoDuration(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const element = document.createElement("video");
    const timer = setTimeout(() => finish(undefined), 10000);
    function finish(duration: number | undefined) {
      clearTimeout(timer); element.onloadedmetadata = null; element.onerror = null; element.removeAttribute("src"); element.load();
      if (duration !== undefined && Number.isFinite(duration)) resolve(duration); else reject(new Error("Não foi possível ler a duração do MP4."));
    }
    element.preload = "metadata";
    element.onloadedmetadata = () => finish(element.duration);
    element.onerror = () => finish(undefined);
    element.src = url;
  });
}
