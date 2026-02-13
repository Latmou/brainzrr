
export const invidiousService = {
  search: async (query: string) => {
    const invidiousUrl = process.env.INVIDIOUS_URL || 'http://127.0.0.1:3010';
    const response = await fetch(`${invidiousUrl}/api/v1/search?q=${encodeURIComponent(query + ' -"full album"')}`);
    
    if (!response.ok) {
      throw new Error(`Invidious search failed: ${response.statusText}`);
    }

    const results = await response.json();

    if (!results || results.length === 0) {
       throw new Error('No results found on Invidious');
    }

    const video = results.find((r: any) => r.type === 'video');
    if (!video) {
        throw new Error('No video found in Invidious results');
    }

    return {
      title: video.title,
      url: `https://www.youtube.com/watch?v=${video.videoId}`,
      videoId: video.videoId
    };
  },
}
