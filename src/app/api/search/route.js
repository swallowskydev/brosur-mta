import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { Pool } from 'pg';

// Kita menggunakan Pool agar koneksi database bisa dipakai ulang secara efisien (Connection Pooling)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:bismillah@localhost:5432/brosur_mta',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    // 1. Dapatkan semua source yang memiliki text cocok
    // 2. Gabungkan (STRING_AGG) semua text dari source tersebut yang diurutkan berdasarkan part ID
    // Hal ini mengatasi kalimat yang terpotong karena beda halaman.
    const dbQuery = `
      WITH matched_sources AS (
        SELECT DISTINCT source
        FROM brochures
        WHERE text ILIKE $1
        LIMIT 50
      )
      SELECT b.source, MAX(b.title) as title, MAX(b.date) as date,
             STRING_AGG(b.text, ' ' ORDER BY SUBSTRING(b.id FROM '-([0-9]+)$')::INTEGER) as full_text
      FROM brochures b
      JOIN matched_sources ms ON b.source = ms.source
      GROUP BY b.source;
    `;
    
    const values = [`%${query}%`];
    
    const { rows } = await pool.query(dbQuery, values);
    
    // Helper function to extract a complete sentence snippet
    const getSnippet = (fullText, q, maxSentences = 2, maxLength = 500) => {
      if (!fullText) return '';
      const lowerText = fullText.toLowerCase();
      const lowerQuery = q.toLowerCase();
      let index = lowerText.indexOf(lowerQuery);
      
      if (index === -1) return fullText.substring(0, maxLength) + '...';
      
      let start = index;
      while (start > 0 && fullText[start] !== '.' && fullText[start] !== '?' && fullText[start] !== '!' && fullText[start] !== '\n') {
        start--;
      }
      if (start > 0) start++; 
      
      let end = index + q.length;
      let sentencesFound = 0;
      while (end < fullText.length && sentencesFound < maxSentences) {
        if (fullText[end] === '.' || fullText[end] === '?' || fullText[end] === '!' || fullText[end] === '\n') {
          sentencesFound++;
        }
        end++;
      }
      
      let snippet = fullText.substring(start, end).trim();
      
      if (snippet.length > maxLength) {
        let truncateEnd = maxLength;
        while (truncateEnd > 0 && !/\s/.test(snippet[truncateEnd])) {
          truncateEnd--;
        }
        if (truncateEnd === 0) truncateEnd = maxLength;
        snippet = snippet.substring(0, truncateEnd) + ' ...';
      }
      
      return snippet;
    };

    // Format the response and add snippets
    const formattedRows = rows.map(row => ({
      id: row.source,
      title: row.title,
      date: row.date,
      source: row.source,
      text: getSnippet(row.full_text, query)
    }));
    
    return NextResponse.json(formattedRows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada database.' },
      { status: 500 }
    );
  }
}
