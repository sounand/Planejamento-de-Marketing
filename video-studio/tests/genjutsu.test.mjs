import { test } from "node:test";
import assert from "node:assert/strict";
import { GENJUTSU_MODEL, parseGenjutsuInput, genjutsuRequest, estimatedCost } from "../src/generation/genjutsu.ts";

const valid = { videoUrl: "https://example.com/video.mp4", imageUrl: "https://example.com/person.png" };

test("maps exactly the documented Genjutsu endpoint and fields, with optional prompt", () => {
  assert.deepEqual(genjutsuRequest(parseGenjutsuInput(valid)), {
    path: GENJUTSU_MODEL,
    body: { video_url: valid.videoUrl, image_urls: [valid.imageUrl], prompt: "", resolution: "720p" },
  });
});
test("requires both inputs and rejects unknown models and invalid resolutions", () => {
  for (const data of [null, {}, { imageUrl: valid.imageUrl }, { videoUrl: valid.videoUrl }, { ...valid, resolution: "4k" }, { ...valid, model: "kling" }]) assert.throws(() => parseGenjutsuInput(data));
});
test("requires HTTPS URLs without embedded credentials and enforces documented limits", () => {
  for (const url of ["blob:abc", "file:///tmp/video.mp4", "javascript:alert(1)", "http://example.com/video.mp4", "https://user:pass@example.com/v.mp4", "https://example.com/" + "x".repeat(2083)]) assert.throws(() => parseGenjutsuInput({ ...valid, videoUrl: url }));
  assert.throws(() => parseGenjutsuInput({ ...valid, prompt: "x".repeat(10001) }));
  assert.equal(parseGenjutsuInput({ ...valid, prompt: "x".repeat(10000) }).prompt.length, 10000);
});
test("pricing rounds up duration, caps at 30 seconds and uses resolution rates", () => {
  assert.equal(estimatedCost(4.1, "480p"), 5 * .318);
  assert.equal(estimatedCost(8.2, "720p"), 9 * .681);
  assert.equal(estimatedCost(31.5, "1080p"), 30 * 1.632);
  for (const value of [3.9, NaN, Infinity]) assert.throws(() => estimatedCost(value, "720p"));
});
