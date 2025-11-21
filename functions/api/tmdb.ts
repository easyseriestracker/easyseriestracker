// Cloudflare Function - TMDB API Proxy
// This proxies requests to TMDB to avoid client-side blocking

export async function onRequest(context: any) {
    const { request, env } = context;

    // Get the endpoint and query params from the request
    const url = new URL(request.url);
    const endpoint = url.searchParams.get('endpoint');

    if (!endpoint) {
        return new Response(JSON.stringify({ error: 'Missing endpoint parameter' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Get API key from environment variable
    const apiKey = env.VITE_API_KEY;
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API key not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Build TMDB URL with all query params
    const tmdbUrl = new URL(`https://api.themoviedb.org/3${endpoint}`);

    // Copy all query params except 'endpoint'
    url.searchParams.forEach((value, key) => {
        if (key !== 'endpoint') {
            tmdbUrl.searchParams.set(key, value);
        }
    });

    // Add API key
    tmdbUrl.searchParams.set('api_key', apiKey);

    try {
        // Fetch from TMDB
        const response = await fetch(tmdbUrl.toString());
        const data = await response.json();

        // Return with CORS headers
        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch from TMDB' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
