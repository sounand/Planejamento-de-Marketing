import { parseSettings } from "./parse-settings";
import type { ModelEntry } from "./types";
export const MODELS: readonly ModelEntry[] = [{
  id: "genjutsu", label: "Genjutsu", surface: "video",
  roles: { video: 1, reference: 1 },
  settings: { resolution: { type: "enum", values: ["480p", "720p", "1080p"], default: "720p" } },
}];
export function getModel(id: string): ModelEntry {
  const model = MODELS.find(entry => entry.id === id);
  if (!model) throw new Error("Este aplicativo usa somente o Genjutsu.");
  return model;
}
export type { GenerationPlane, MediaItem, MediaRole, ModelEntry, PlatformPaths, Surface } from "./types";
export { parseSettings };
