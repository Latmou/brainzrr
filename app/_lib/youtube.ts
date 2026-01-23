import {YtDlp} from "ytdlp-nodejs";
import {NextResponse} from "next/server";

export const youtubeService = {
  search: async (query: string) => {
    const youtubeSearch = `ytsearch1:${query} -"full album"`;

    const ytdlp = new YtDlp();
    const info = await ytdlp.getInfoAsync(youtubeSearch) as any;

    if (!info || !info.entries || info.entries.length === 0) {
      return NextResponse.json({ error: 'No stream found' }, { status: 404 });
    }

    const {title, url} = info.entries[0];
    console.log('[YT SEARCH]:', youtubeSearch, {title, url})

    return info.entries[0]
  },
  stream: (url: string) => {
    const ytdlp = new YtDlp();
    return ytdlp.stream(url, {
      format: {
        filter: 'audioonly',
        quality: 0 // highest quality
      }
    });
  }
}