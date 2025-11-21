
import { Show, ShowDetails, Episode } from '../types';
import { getCurrentUser } from './authService';

const getApiKey = async () => {
  const user = await getCurrentUser();
  let key = user?.settings?.tmdbKey || '';
  if (!key && import.meta.env.VITE_API_KEY) {
    const env = import.meta.env.VITE_API_KEY;
    if (env !== 'YOUR_API_KEY' && !env.includes('placeholder') && env.length > 10) {
      key = env;
    }
  }
  return key.trim();
};

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const getImageUrl = (path: string | null, size: 'w500' | 'original' = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1000&auto=format&fit=crop';
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE}/${size}${path}`;
};

const mapTmdbToShow = (data: any): Show => {
  return {
    id: data.id,
    name: data.name || data.original_name,
    overview: data.overview,
    poster_path: data.poster_path,
    backdrop_path: data.backdrop_path,
    vote_average: data.vote_average,
    first_air_date: data.first_air_date || 'Unknown'
  };
};

const fetchFromTmdb = async (endpoint: string, params: Record<string, string> = {}) => {
  const apiKey = await getApiKey();
  if (!apiKey) return null;

  const queryParams = new URLSearchParams({
    api_key: apiKey,
    language: 'en-US',
    include_adult: 'false',
    ...params
  });

  try {
    const res = await fetch(`${BASE_URL}${endpoint}?${queryParams}`);
    if (res.status === 401) {
      console.warn("TMDB API Key is invalid or unauthorized (401).");
      return null;
    }
    if (!res.ok) throw new Error(`TMDB Error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getTrendingShows = async (page = 1): Promise<Show[]> => {
  const data = await fetchFromTmdb('/trending/tv/week', { page: page.toString() });
  return data ? data.results.map(mapTmdbToShow) : [];
};

export const getClassicShows = async (page = 1): Promise<Show[]> => {
  const data = await fetchFromTmdb('/tv/top_rated', { page: page.toString() });
  return data ? data.results.map(mapTmdbToShow) : [];
};

export const getComedyShows = async (page = 1): Promise<Show[]> => {
  const data = await fetchFromTmdb('/discover/tv', { with_genres: '35', sort_by: 'popularity.desc', page: page.toString() });
  return data ? data.results.map(mapTmdbToShow) : [];
};

export const getSciFiShows = async (page = 1): Promise<Show[]> => {
  const data = await fetchFromTmdb('/discover/tv', { with_genres: '10765', sort_by: 'popularity.desc', page: page.toString() });
  return data ? data.results.map(mapTmdbToShow) : [];
};

export const getAllCuratedShows = async (page = 1, sortBy: string = 'popularity.desc', genre?: string): Promise<Show[]> => {
  const params: any = { page: page.toString(), sort_by: sortBy };

  // TMDB Specific Sorts & Filters
  if (sortBy === 'vote_average.desc' || sortBy === 'vote_average.asc') {
    params['vote_count.gte'] = '300'; // Filter junk
  }

  // Genre Mapping (Correct IDs)
  if (genre && genre !== 'all') {
    const genreMap: Record<string, string> = {
      '28': '10759', // Action & Adventure
      '35': '35',    // Comedy
      '18': '18',    // Drama
      '10765': '10765', // Sci-Fi & Fantasy
      '9648': '9648',   // Mystery
      '16': '16',    // Animation
      'anime': '16'  // Anime (using Animation ID, filtering usually happens by origin country if strict, but ID 16 covers it)
    };

    // Split comma separated genres from URL
    const selectedGenres = genre.toLowerCase().split(',');
    const genreIds: string[] = [];

    selectedGenres.forEach(g => {
      // Try direct map or ID pass-through
      const mapped = genreMap[g.trim()] || g.trim();
      if (mapped) genreIds.push(mapped);
    });

    if (genreIds.length > 0) {
      // join with comma for AND logic (must have all selected genres)
      params['with_genres'] = genreIds.join(',');
    }
  }

  const data = await fetchFromTmdb('/discover/tv', params);
  return data ? data.results.map(mapTmdbToShow) : [];
};

export const searchShows = async (query: string): Promise<Show[]> => {
  if (!query) return [];
  const data = await fetchFromTmdb('/search/tv', { query });
  return data ? data.results.map(mapTmdbToShow) : [];
};

export const getShowDetails = async (showId: number, options: { basic?: boolean } = {}): Promise<ShowDetails | null> => {
  const params = options.basic ? {} : { append_to_response: 'credits,external_ids' };
  const data = await fetchFromTmdb(`/tv/${showId}`, params);

  if (!data) return null;

  const nextEpData = data.next_episode_to_air;
  let nextEp: Episode | null = null;

  if (nextEpData) {
    nextEp = {
      id: nextEpData.id,
      name: nextEpData.name,
      overview: nextEpData.overview,
      air_date: nextEpData.air_date,
      episode_number: nextEpData.episode_number,
      season_number: nextEpData.season_number,
      still_path: nextEpData.still_path
    };
  }

  const cast = data.credits?.cast?.slice(0, 10).map((c: any) => ({
    person: {
      name: c.name,
      image: c.profile_path ? { medium: `${IMAGE_BASE}/w185${c.profile_path}` } : null
    },
    character: {
      name: c.character
    }
  })) || [];

  return {
    ...mapTmdbToShow(data),
    number_of_seasons: data.number_of_seasons,
    number_of_episodes: data.number_of_episodes,
    next_episode_to_air: nextEp,
    genres: data.genres || [],
    imdb_id: data.external_ids?.imdb_id,
    cast: cast
  };
};

export const getShowsByIds = async (ids: number[]): Promise<Show[]> => {
  if (ids.length === 0) return [];
  // Use basic: true to avoid fetching credits/external_ids for every item in a list
  const promises = ids.map(id => getShowDetails(id, { basic: true }));
  const results = await Promise.all(promises);
  return results.filter((s): s is ShowDetails => s !== null);
};
