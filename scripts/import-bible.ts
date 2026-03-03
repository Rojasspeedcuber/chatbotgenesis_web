import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

interface BibleBook {
  name: string;
  chapters: {
    [chapter: string]: {
      [verse: string]: string;
    };
  };
}

interface BibleData {
  books: BibleBook[];
}

async function importBible(filePath: string, translation: string = "NVI") {
  console.log(`Reading Bible data from ${filePath}...`);

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    console.log("\nTo import the NVI Bible:");
    console.log("1. Download or create a JSON file with the Bible verses");
    console.log("2. Run: npx ts-node scripts/import-bible.ts path/to/bible.json");
    console.log("\nExpected JSON format:");
    console.log(`{
  "books": [
    {
      "name": "Gênesis",
      "chapters": {
        "1": {
          "1": "No princípio Deus criou os céus e a terra.",
          "2": "Era a terra sem forma e vazia..."
        }
      }
    }
  ]
}`);
    process.exit(1);
  }

  const data: BibleData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  console.log(`Found ${data.books.length} books in the Bible data`);

  let totalVerses = 0;
  const batchSize = 500;
  const verses: BibleVerse[] = [];

  for (const book of data.books) {
    for (const [chapterNum, chapter] of Object.entries(book.chapters)) {
      for (const [verseNum, text] of Object.entries(chapter)) {
        verses.push({
          book: book.name,
          chapter: parseInt(chapterNum),
          verse: parseInt(verseNum),
          text: text,
        });
        totalVerses++;
      }
    }
  }

  console.log(`Total verses to import: ${totalVerses}`);

  // Import in batches
  for (let i = 0; i < verses.length; i += batchSize) {
    const batch = verses.slice(i, i + batchSize);
    await prisma.bibleVerse.createMany({
      data: batch.map((v) => ({
        ...v,
        translation,
      })),
      skipDuplicates: true,
    });

    const progress = Math.min(i + batchSize, verses.length);
    console.log(`Imported ${progress}/${totalVerses} verses (${Math.round((progress / totalVerses) * 100)}%)`);
  }

  console.log("\nImport complete!");

  // Verify count
  const count = await prisma.bibleVerse.count({
    where: { translation },
  });
  console.log(`Total verses in database for ${translation}: ${count}`);
}

// Get file path from command line arguments
const args = process.argv.slice(2);
const filePath = args[0] || path.join(__dirname, "..", "data", "nvi.json");
const translation = args[1] || "NVI";

importBible(filePath, translation)
  .catch((e) => {
    console.error("Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
