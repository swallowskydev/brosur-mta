const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Ganti password sesuai dengan yang Anda buat saat install PostgreSQL
const connectionString = 'postgresql://postgres:bismillah@localhost:5432/brosur_mta';

async function migrate() {
  console.log('Menghubungkan ke PostgreSQL...');
  
  // Connect to default 'postgres' database first to create 'brosur_mta'
  const initClient = new Client({
    connectionString: 'postgresql://postgres:bismillah@localhost:5432/postgres'
  });
  
  try {
    await initClient.connect();
    // Check if database exists
    const dbCheck = await initClient.query("SELECT 1 FROM pg_database WHERE datname = 'brosur_mta'");
    if (dbCheck.rows.length === 0) {
      console.log('Membuat database brosur_mta...');
      await initClient.query('CREATE DATABASE brosur_mta');
    }
  } catch (e) {
    console.error('Gagal membuat database:', e.message);
  } finally {
    await initClient.end();
  }

  // Connect to the actual database
  const client = new Client({
    connectionString: connectionString
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

    console.log('✅ Migrasi Selesai! Semua data sudah masuk ke PostgreSQL.');

  } catch (err) {
    console.error('Error saat migrasi:', err);
  } finally {
    await client.end();
  }
}

migrate();
