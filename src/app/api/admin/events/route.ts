import { currentAdminSession } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await currentAdminSession();
  // HTTP 204 tells EventSource to stop reconnecting after session expiry.
  if (!session)
    return new Response(null, {
      status: 204,
      headers: { "Cache-Control": "no-store" },
    });
  if (request.headers.get("sec-fetch-site") === "cross-site")
    return new Response(null, { status: 403 });
  const token = process.env.ADMIN_API_TOKEN;
  if (!token) return new Response(null, { status: 503 });
  const base = (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000/api/v1"
  ).replace(/\/$/, "");
  const abort = new AbortController();
  const disconnect = () => abort.abort();
  request.signal.addEventListener("abort", disconnect, { once: true });
  if (request.signal.aborted) abort.abort();
  const handshake = setTimeout(disconnect, 10000);
  const expiry = setTimeout(
    disconnect,
    Math.max(0, session.expiresAt - Date.now()),
  );
  function cleanup() {
    clearTimeout(handshake);
    clearTimeout(expiry);
    request.signal.removeEventListener("abort", disconnect);
    abort.abort();
  }
  let upstream: Response;
  try {
    upstream = await fetch(`${base}/leads/events`, {
      headers: {
        Accept: "text/event-stream",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      redirect: "error",
      signal: abort.signal,
    });
  } catch {
    cleanup();
    return new Response(null, { status: 503 });
  }
  clearTimeout(handshake);
  if (
    !upstream.ok ||
    !upstream.body ||
    !upstream.headers.get("content-type")?.startsWith("text/event-stream")
  ) {
    cleanup();
    return new Response(null, { status: 503 });
  }
  const reader = upstream.body.getReader();
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (cancelled) return;
        if (done) {
          cleanup();
          controller.close();
          return;
        }
        controller.enqueue(value);
      } catch {
        cleanup();
        if (!cancelled) controller.close();
      }
    },
    cancel() {
      cancelled = true;
      cleanup();
      return reader.cancel().catch(() => {});
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
