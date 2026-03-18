import { Article, Category } from '../types';
import { NEWS_API_KEY, NEWS_API_BASE } from '../constants/config';

// ── Raw API types ─────────────────────────────────────────────────────────────
interface RawArticle {
  article_id: string;
  title: string | null;
  link: string;
  description: string | null;
  content: string | null;
  pubDate: string | null;
  image_url: string | null;
  source_id: string;
  source_name: string | null;
  category: string[] | null;
  language: string;
}

interface NewsDataResponse {
  status: string;
  totalResults: number;
  results: RawArticle[];
  nextPage?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// ['Technology', 'Business'] → 'technology,business'  (API accepts CSV)
function toCategoryParam(categories: string[]): string | null {
  const valid = categories
    .filter((c) => c !== 'All')
    .map((c) => c.toLowerCase());
  return valid.length > 0 ? valid.join(',') : null;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function trimToWords(text: string, limit = 45): string {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(' ') + '\u2026';
}

function fallbackImage(id: string): string {
  const seed =
    id.split('').reduce((acc, c) => (acc + c.charCodeAt(0)) & 0xffff, 0) % 1000;
  return `https://picsum.photos/seed/${seed}/800/1200`;
}

// ── Transform ─────────────────────────────────────────────────────────────────

function toAppCategory(cats: string[] | null): Category {
  if (cats && cats.length > 0) return capitalize(cats[0]);
  return 'Other';
}

function transform(raw: RawArticle): Article | null {
  // Accept 'en', 'english', or missing — API param already filters language
  if (raw.language && !raw.language.startsWith('en')) {
    console.log(`[NewsAPI] filtered (language="${raw.language}"):`, raw.title);
    return null;
  }
  if (!raw.title) {
    console.log('[NewsAPI] filtered (no title):', raw.article_id);
    return null;
  }

  const rawDesc = raw.description || raw.content || '';
  const summary = trimToWords(stripHtml(rawDesc)) || 'Tap "Read Story" for full details.';

  return {
    id: raw.article_id || raw.link,
    title: stripHtml(raw.title).slice(0, 120),
    summary,
    category: toAppCategory(raw.category),
    imageUrl: raw.image_url || fallbackImage(raw.article_id),
    url: raw.link,
    source: raw.source_name || raw.source_id || 'Unknown',
    publishedAt: raw.pubDate || new Date().toISOString(),
  };
}

// ── Public API ────────────────────────────────────────────────────────────────
export interface FetchNewsResult {
  articles: Article[];
  nextPage: string | undefined;
}

/**
 * Fetch news for one or more categories in a single API call.
 * categories: ['Technology', 'Business'] → ?category=technology,business
 */
export async function fetchNews(
  categories: string[],
  page?: string,
  signal?: AbortSignal,
): Promise<FetchNewsResult> {
  const params = new URLSearchParams({
    apikey: NEWS_API_KEY,
    language: 'en',
    size: '10',
    image: '1'
  });

  const cat = toCategoryParam(categories);
  if (cat) params.set('category', cat);
  if (page) params.set('page', page);

  const url = `${NEWS_API_BASE}?${params}`;

  console.log('[NewsAPI] →', url);
  const t0 = Date.now();

  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (err) {
    console.error('[NewsAPI] ✗ Network error:', err);
    throw err;
  }

  const ms = Date.now() - t0;
  console.log(`[NewsAPI] ← ${response.status} ${response.statusText} (${ms}ms)`);

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.error('[NewsAPI] ✗ Error body:', body);
    throw new Error(`NewsData API error ${response.status}: ${response.statusText}`);
  }

  const data: NewsDataResponse = await response.json();

  if (data.status !== 'success') {
    console.error('[NewsAPI] ✗ API status:', data.status, data);
    throw new Error(`NewsData returned status: ${data.status}`);
  }

  console.log(`[NewsAPI] raw results received: ${data.results.length}`);
  console.log(
    '[NewsAPI] raw list:',
    data.results.map((r) => ({
      id: r.article_id,
      title: r.title?.slice(0, 60),
      language: r.language,
      category: r.category,
      has_image: !!r.image_url,
      has_desc: !!(r.description || r.content),
    })),
  );

  const articles = data.results
    .map(transform)
    .filter((a): a is Article => a !== null);

  console.log(
    `[NewsAPI] ✓ after filter: ${articles.length} kept, ${data.results.length - articles.length} dropped`,
    '| categories:', cat ?? 'all',
    data.nextPage ? `| nextPage: ${data.nextPage}` : '',
  );
  console.log(
    '[NewsAPI] final articles:',
    articles.map((a) => ({ id: a.id, title: a.title.slice(0, 60), category: a.category })),
  );

  return { articles, nextPage: data.nextPage };
}
