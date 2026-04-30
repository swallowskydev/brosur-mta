const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Error: DATABASE_URL environment variable is not set.");
  console.log("Cara menjalankan di Windows PowerShell:");
  console.log("$env:DATABASE_URL=\"postgres://username:password@namaserver.neon.tech/namadatabase?sslmode=require\"");
  console.log("node scripts/migrate-cloud.js");
  process.exit(1);
}

async function migrate() {
  console.log('Menghubungkan ke Cloud PostgreSQL (Neon/Supabase)...');
  
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    
    console.log('Membuat tabel brochures...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS brochures (
        id VARCHAR(255) PRIMARY KEY,
        source VARCHAR(255),
        title VARCHAR(500),
        date VARCHAR(50),
        text TEXT
      );
    `);

    // Hapus data lama agar tidak duplikat jika script dijalankan ulang
    await client.query('TRUNCATE TABLE brochures');

    const dataPath = path.join(process.cwd(), 'public/data/brosur.json');
    console.log('Membaca file JSON dari:', dataPath);
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData);

    console.log(`Menemukan ${data.length} dokumen. Memulai proses import...`);

    // Proses insert dalam batch untuk performa yang lebih baik
    const batchSize = 1000;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      const values = [];
      const queryParams = [];
      let paramIndex = 1;

      batch.forEach((item) => {
        values.push(`($${paramIndex}, $${paramIndex+1}, $${paramIndex+2}, $${paramIndex+3}, $${paramIndex+4})`);
        queryParams.push(item.id, item.source, item.title, item.date, item.text);
        paramIndex += 5;
      });

      const query = `
        INSERT INTO brochures (id, source, title, date, text) 
        VALUES ${values.join(', ')}
      `;

      await client.query(query, queryParams);
      console.log(`Berhasil memasukkan ${Math.min(i + batchSize, data.length)} dari ${data.length} data...`);
    }

    console.log('✅ Migrasi Selesai! Semua data sudah masuk ke Cloud PostgreSQL.');

  } catch (err) {
    console.error('Error saat migrasi:', err);
  } finally {
    await client.end();
  }
}

migrate();
