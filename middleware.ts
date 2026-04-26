import { NextRequest, NextResponse } from "next/server";

// ── Rate limiting simples em memória ────────────────────────────────────────
// Em produção com múltiplas instâncias, trocar por Upstash Redis.
const rateMap = new Map<string, { count: number; reset: number }>();

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/chat":              { max: 20,  windowMs: 60_000 }, // 20 msgs/min
  "/api/analyze-homework":  { max: 5,   windowMs: 60_000 }, // 5 fotos/min
  "/api/questions":         { max: 30,  windowMs: 60_000 }, // 30 reqs/min
  "/api/trilha":            { max: 10,  windowMs: 60_000 }, // 10 reqs/min
};

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || now > entry.reset) {
    rateMap.set(key, { count: 1, reset: now + windowMs });
    return true; // OK
  }

  entry.count++;
  if (entry.count > max) return false; // bloqueado
  return true;
}

// Limpa entradas expiradas a cada 5 minutos para não vazar memória
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateMap.entries()) {
    if (now > entry.reset) rateMap.delete(key);
  }
}, 5 * 60_000);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Rate limiting nas APIs ───────────────────────────────────────────────
  for (const [route, limit] of Object.entries(LIMITS)) {
    if (pathname.startsWith(route)) {
      const ip = getIp(req);
      const key = `${ip}:${route}`;
      const allowed = checkRateLimit(key, limit.max, limit.windowMs);

      if (!allowed) {
        return new NextResponse(
          JSON.stringify({ error: "Muitas requisições. Aguarde um momento e tente novamente." }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": "60",
            },
          }
        );
      }
      break;
    }
  }

  // ── Bloqueia métodos não permitidos nas APIs ─────────────────────────────
  if (pathname.startsWith("/api/") && !["GET", "POST", "OPTIONS"].includes(req.method)) {
    return new NextResponse(null, { status: 405 });
  }

  // ── Tamanho máximo do body (proteção contra payloads gigantes) ───────────
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > 15 * 1024 * 1024) { // 15 MB
    return new NextResponse(
      JSON.stringify({ error: "Payload muito grande." }),
      { status: 413, headers: { "Content-Type": "application/json" } }
    );
  }

  const res = NextResponse.next();

  // ── Headers de segurança adicionais via middleware ───────────────────────
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "SAMEORIGIN");

  return res;
}

export const config = {
  matcher: [
    "/api/:path*",
  ],
};
