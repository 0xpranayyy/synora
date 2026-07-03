import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const RATE_LIMIT_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<title>Too many requests — Synora</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body { background:#0b0d13; color:#f0f1f7; font-family:system-ui,sans-serif;
    display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; }
  .card { max-width:420px; text-align:center; padding:2.5rem; }
  h1 { font-size:1.25rem; margin:0 0 .5rem; }
  p { color:#9da1b7; font-size:.9rem; line-height:1.6; }
</style></head>
<body><div class="card">
  <h1>Too many requests</h1>
  <p>You're refreshing faster than Polymarket's live data can keep up. Please wait a moment and try again.</p>
</div></body></html>`;

export async function proxy(request: NextRequest) {
  const ip = getClientIp(request);
  const { success, limit, remaining, reset } = await checkRateLimit(ip);

  if (!success) {
    const isApi = request.nextUrl.pathname.startsWith("/api/");
    const headers = {
      "X-RateLimit-Limit": String(limit),
      "X-RateLimit-Remaining": String(remaining),
      "X-RateLimit-Reset": String(reset),
    };

    if (isApi) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down and try again shortly." },
        { status: 429, headers }
      );
    }

    return new NextResponse(RATE_LIMIT_HTML, {
      status: 429,
      headers: { ...headers, "content-type": "text/html; charset=utf-8" },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|brand/).*)",
  ],
};
