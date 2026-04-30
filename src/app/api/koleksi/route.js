import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres:bismillah@localhost:5432/brosur_mta',
});

export async function GET() {
  try {
    // Mengambil daftar unik PDF (sumber) beserta tanggal dan judulnya
    const dbQuery = `
      SELECT source, MAX(date) as date, MAX(title) as title 
      FROM brochures 
      GROUP BY source 
      ORDER BY date DESC
    `;
    
    const { rows } = await pool.query(dbQuery);
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada database.' },
      { status: 500 }
    );
  }
}
