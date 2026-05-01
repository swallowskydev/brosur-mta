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
    // 1. Bersihkan apostrof dari query untuk pencarian yang lebih toleran
    const safeQuery = query.replace(/['’`"]/g, '');

    const dbQuery = `
      WITH matched_sources AS (
        SELECT DISTINCT source
        FROM brochures
        WHERE REPLACE(REPLACE(REPLACE(text, '''', ''), '’', ''), '\`', '') ILIKE $1
        LIMIT 50
      )
      SELECT b.source, MAX(b.title) as title, MAX(b.date) as date,
             STRING_AGG(b.text, ' ' ORDER BY SUBSTRING(b.id FROM '-([0-9]+)$')::INTEGER) as full_text
      FROM brochures b
      JOIN matched_sources ms ON b.source = ms.source
      GROUP BY b.source;
    `;
    
    const values = [`%${safeQuery}%`];
    
    const { rows } = await pool.query(dbQuery, values);
    
    // Helper function to extract a complete sentence snippet
    const getSnippet = (fullText, q, paddingBefore = 150, paddingAfter = 350) => {
      if (!fullText) return '';
      
      const cleanQ = q.replace(/['’`]/g, '');
      const pattern = cleanQ.split('').map(char => char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join("['’`]*");
      const regex = new RegExp(pattern, 'gi');
      const match = regex.exec(fullText);
      
      let index = match ? match.index : -1;
      let matchLength = match ? match[0].length : q.length;
      
      if (index === -1) return fullText.substring(0, paddingBefore + paddingAfter) + '...';
      
      let start = Math.max(0, index - paddingBefore);
      while (start > 0 && !/\s/.test(fullText[start])) {
        start--;
      }
      if (start > 0) start++; 
      
      let end = Math.min(fullText.length, index + matchLength + paddingAfter);
      while (end < fullText.length && !/\s/.test(fullText[end])) {
        end++;
      }
      
      let snippet = fullText.substring(start, end).trim();
      if (start > 0) snippet = '... ' + snippet;
      if (end < fullText.length) snippet = snippet + ' ...';
      
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
