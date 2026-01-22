const BASE_URL = 'https://en.wikipedia.org/w/api.php';

export const wikipediaService = {
  async searchArtist(artistName: string, lang = 'fr') {
    try {
      const url = new URL(`https://${lang}.wikipedia.org/w/api.php`);
      url.searchParams.set('action', 'query');
      url.searchParams.set('list', 'search');
      url.searchParams.set('srsearch', artistName);
      url.searchParams.set('format', 'json');
      url.searchParams.set('origin', '*');

      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        if (data.query?.search?.length > 0) {
          return data.query.search[0].title;
        }
      }
    } catch (error) {
      console.error('Wikipedia search error:', error);
    }
    return null;
  },

  async getSummary(title: string, lang = 'fr') {
    try {
      const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Wikipedia summary error:', error);
    }
    return null;
  },

  async getExtract(title: string, lang = 'fr') {
    const summary = await this.getSummary(title, lang);
    return summary?.extract || null;
  },

  async getArtistImage(artistName: string, lang = 'fr') {
    const title = await this.searchArtist(artistName, lang);
    if (title) {
      const summary = await this.getSummary(title, lang);
      if ((summary?.extract as string | undefined | null)?.includes(artistName)) {
        return summary?.thumbnail?.source || null;
      }
    }
    
    if (lang !== 'en') {
      const enTitle = await this.searchArtist(artistName, 'en');
      if (enTitle) {
        const summary = await this.getSummary(enTitle, 'en');
        if ((summary?.extract as string | undefined | null)?.includes(artistName)) {
          return summary?.thumbnail?.source || null;
        }
      }
    }
    return null;
  },

  async getArtistDescription(artistName: string, lang = 'fr') {
    const title = await this.searchArtist(artistName, lang);
    if (title) {
      const extract = await this.getExtract(title, lang);
      if ((extract as string | undefined | null)?.includes(artistName)) {
        return extract
      }
    }
    // If French fails, try English
    if (lang !== 'en') {
      const enTitle = await this.searchArtist(artistName, 'en');
      if (enTitle) {
        const extract = await this.getExtract(title, 'en');
        if ((extract as string | undefined | null)?.includes(artistName)) {
          return extract
        }
      }
    }
    return null;
  }
};
