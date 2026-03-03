import { prisma } from "./prisma";

export interface BibleVerseResult {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
  reference: string;
}

export async function searchBibleVerses(
  query: string,
  limit: number = 5
): Promise<BibleVerseResult[]> {
  // Clean and prepare the search query
  const searchTerms = query
    .toLowerCase()
    .replace(/[^\w\sáéíóúâêîôûãõàèìòùç]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 2)
    .join(" & ");

  if (!searchTerms) {
    return [];
  }

  // Use PostgreSQL full-text search with ts_rank for relevance ordering
  const verses = await prisma.$queryRaw<
    Array<{
      id: string;
      book: string;
      chapter: number;
      verse: number;
      text: string;
      translation: string;
    }>
  >`
    SELECT id, book, chapter, verse, text, translation
    FROM "BibleVerse"
    WHERE to_tsvector('portuguese', text) @@ plainto_tsquery('portuguese', ${query})
    ORDER BY ts_rank(to_tsvector('portuguese', text), plainto_tsquery('portuguese', ${query})) DESC
    LIMIT ${limit}
  `;

  return verses.map((v) => ({
    ...v,
    reference: `${v.book} ${v.chapter}:${v.verse}`,
  }));
}

export async function getVerseByReference(
  book: string,
  chapter: number,
  verse: number,
  translation: string = "NVI"
): Promise<BibleVerseResult | null> {
  const result = await prisma.bibleVerse.findFirst({
    where: {
      book,
      chapter,
      verse,
      translation,
    },
  });

  if (!result) return null;

  return {
    ...result,
    reference: `${result.book} ${result.chapter}:${result.verse}`,
  };
}

export async function getChapter(
  book: string,
  chapter: number,
  translation: string = "NVI"
): Promise<BibleVerseResult[]> {
  const verses = await prisma.bibleVerse.findMany({
    where: {
      book,
      chapter,
      translation,
    },
    orderBy: {
      verse: "asc",
    },
  });

  return verses.map((v) => ({
    ...v,
    reference: `${v.book} ${v.chapter}:${v.verse}`,
  }));
}

export function formatVersesForContext(verses: BibleVerseResult[]): string {
  return verses
    .map((v) => `"${v.text}" (${v.reference})`)
    .join("\n\n");
}
