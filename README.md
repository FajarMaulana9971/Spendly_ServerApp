# Spendly - Expense Tracker Backend

Aplikasi backend untuk mencatat pengeluaran dengan fitur caching dan performa yang optimal.

## 🚀 Fitur

- ✅ CRUD Expense (Create, Read, Update, Delete)
- ✅ Filter berdasarkan kategori dan tanggal
- ✅ Pagination
- ✅ Sorting
- ✅ Statistik per kategori
- ✅ Laporan bulanan
- ✅ Caching dengan Node-Cache
- ✅ Database indexing untuk performa optimal
- ✅ Base Response DTO
- ✅ Clean Architecture (Controller → Service → Repository)

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Caching**: Node-Cache

## 🔧 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Buat file `.env` :

```bash
cp .env
```

Edit `.env` dan sesuaikan dengan konfigurasi database Anda:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/spendly?schema=public"
PORT=3000
NODE_ENV=development
```

### 3. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio
npx prisma studio
```

### 4. Run Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server akan berjalan di `http://localhost:3000`

## 📚 API Documentation

### Base Response Format

Semua response menggunakan format berikut:

**Success:**
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

## 🎯 Performance Optimizations

### 1. Database Indexing
Schema Prisma sudah dilengkapi dengan index untuk:
- `category` - untuk filter berdasarkan kategori
- `spentAt` - untuk filter berdasarkan tanggal
- `createdAt` - untuk sorting
- `category + spentAt` - composite index untuk query kombinasi

### 2. Caching
- GET requests otomatis di-cache selama 5 menit
- Cache otomatis di-invalidate setelah Create, Update, atau Delete
- Menggunakan in-memory cache (Node-Cache)

### 3. Query Optimization
- Pagination untuk menghindari load data berlebihan
- Selective field retrieval
- Batch operations menggunakan Promise.all

## 📝 Notes

- Pastikan PostgreSQL sudah running sebelum menjalankan aplikasi
- Semua amount disimpan dalam integer (dalam satuan terkecil, misal: Rupiah)
- Timezone menggunakan UTC, sesuaikan di client jika perlu
- Cache TTL default adalah 300 detik (5 menit)

## 🤝 Contributing

Silakan buat Pull Request untuk improvement atau bug fixes.

## 📄 License

ISC