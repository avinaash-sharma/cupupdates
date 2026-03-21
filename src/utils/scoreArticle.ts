import { Article } from '../types';

interface ScoreBreakdown {
  total: number;
  recency: number;
  category: number;
  titleQuality: number;
  hasImage: number;
  breaking: number;
}

function compute(article: Article, userCategories: string[]): ScoreBreakdown {
  // ── Recency (0–40) ────────────────────────────────────────────────────
  const ageHours = (Date.now() - new Date(article.publishedAt).getTime()) / 3_600_000;
  let recency = 0;
  if (ageHours < 1)        recency = 40;
  else if (ageHours < 6)   recency = 32;
  else if (ageHours < 24)  recency = 20;
  else if (ageHours < 72)  recency = 8;

  // ── Category preference (0–30) ───────────────────────────────────────
  const lowerPrefs = userCategories.map((c) => c.toLowerCase());
  const category = lowerPrefs.includes(article.category.toLowerCase()) ? 30 : 0;

  // ── Title quality (0–20) ─────────────────────────────────────────────
  const words = article.title.trim().split(/\s+/).length;
  let titleQuality = 0;
  if (words >= 8 && words <= 16)       titleQuality = 20;
  else if (words >= 5 || words <= 20)  titleQuality = 12;
  else if (words >= 3)                 titleQuality = 4;

  // ── Has real image (0–10) ────────────────────────────────────────────
  const hasImage =
    article.imageUrl && !article.imageUrl.includes('picsum.photos') ? 10 : 0;

  // ── Breaking news bonus (+10) ────────────────────────────────────────
  const breaking = article.isBreaking ? 10 : 0;

  return {
    recency,
    category,
    titleQuality,
    hasImage,
    breaking,
    total: recency + category + titleQuality + hasImage + breaking,
  };
}

export function scoreArticle(article: Article, userCategories: string[]): number {
  return compute(article, userCategories).total;
}

export function logScores(articles: Article[], userCategories: string[]): void {
  const rows = articles.map((a, i) => {
    const b = compute(a, userCategories);
    return {
      rank: i + 1,
      score: b.total,
      recency: b.recency,
      category: b.category,
      title: b.titleQuality,
      image: b.hasImage,
      breaking: b.breaking,
      headline: a.title.slice(0, 55),
    };
  });

  console.log('[Score] ranked articles:');
  console.table(rows);
}
