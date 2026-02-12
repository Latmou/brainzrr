
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
  
  stream: async (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0];
    if (!videoId) throw new Error('Invalid YouTube URL');

    const invidiousUrl = process.env.INVIDIOUS_URL || 'http://127.0.0.1:3010';
    const response = await fetch(`${invidiousUrl}/api/v1/videos/${videoId}`);
    
    if (!response.ok) {
      throw new Error(`Invidious video info failed: ${response.statusText}`);
    }

    const videoInfo = await response.json();
    const audioFormat = videoInfo.adaptiveFormats
      .filter((f: any) => f.type.startsWith('audio/'))
      .sort((a: any, b: any) => parseInt(b.bitrate) - parseInt(a.bitrate))[0];

    if (!audioFormat || !audioFormat.url) {
      throw new Error('No audio format found');
    }

    const audioResponse = await fetch(audioFormat.url);
    if (!audioResponse.ok) {
      throw new Error(`Failed to fetch audio stream: ${audioResponse.statusText}`);
    }

    return audioResponse.body; // Web ReadableStream
  }
}
