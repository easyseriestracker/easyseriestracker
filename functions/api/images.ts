// Cloudflare Function - TMDB Image Proxy
// This proxies image requests to TMDB to avoid client-side blocking

export async function onRequest(context: any) {
    const { request } = context;

    const url = new URL(request.url);
    const imagePath = url.searchParams.get('path');
    const size = url.searchParams.get('size') || 'w500';

    if (!imagePath) {
        return new Response('Missing image path', { status: 400 });
    }

    try {
        // Fetch image from TMDB
        const imageUrl = `https://image.tmdb.org/t/p/${size}${imagePath}`;
        const response = await fetch(imageUrl);

        if (!response.ok) {
            return new Response('Image not found', { status: 404 });
        }

        // Return image with proper headers
        const imageData = await response.arrayBuffer();

        return new Response(imageData, {
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
                'Access-Control-Allow-Origin': '*',
            }
        });
    } catch (error) {
        return new Response('Failed to fetch image', { status: 500 });
    }
}
