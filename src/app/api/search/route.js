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
    // Menggunakan ILIKE untuk pencarian Case-Insensitive
    // % digunakan sebagai wildcard agar kata bisa dicari di tengah kalimat
    const dbQuery = `
      SELECT id, title, text, date, source 
      FROM brochures 
      WHERE text ILIKE $1
      LIMIT 50;
    `;
    
    const values = [`%${query}%`];
    
    const { rows } = await pool.query(dbQuery, values);
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    // Fallback error response
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada database.' },
      { status: 500 }
    );
  }
}
