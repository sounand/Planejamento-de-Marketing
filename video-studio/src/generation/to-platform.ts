import type { GenerationPlane } from "./catalog/types";
import { genjutsuRequest, parseGenjutsuInput } from "./genjutsu";

export function toPlatform(plane: GenerationPlane) {
  if (plane.model !== "genjutsu") throw new Error("Este aplicativo usa somente o Genjutsu.");
  return genjutsuRequest(parseGenjutsuInput({
    videoUrl: plane.media.video?.[0]?.url,
    imageUrl: plane.media.reference?.[0]?.url,
    prompt: plane.prompt.text,
    resolution: plane.settings.resolution,
  }));
}
