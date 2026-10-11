import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    generation: Boolean(process.env.HF_CREDENTIALS || process.env.HF_KEY),
    uploads: Boolean(process.env.OPEN_HIGGSFIELD_READ_WRITE_TOKEN),
  }, { headers: { "Cache-Control": "no-store" } });
}
