const R2_BASE = 'https://pub-a911d0797db04b879a41ba8f0cdf2db6.r2.dev';

export async function onRequest({ request, params, waitUntil }) {
  const cache = caches.default;
  const cacheKey = new Request(request.url, { method: 'GET' });

  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const path = Array.isArray(params.path) ? params.path.join('/') : params.path;
  const upstream = await fetch(`${R2_BASE}/${path}`);

  if (!upstream.ok) {
    return new Response('Not Found', { status: 404 });
  }

  const response = new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });

  waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}
