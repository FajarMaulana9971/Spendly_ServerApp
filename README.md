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

### Endpoints

#### 1. Create Expense
```
POST /api/expenses
```

**Request Body:**
```json
{
  "title": "Makan siang",
  "amount": 50000,
  "category": "Food",
  "note": "Makan di restoran",
  "spentAt": "2024-02-13T12:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "id": 999,
    "title": "Makan siang",
    "amount": 50000,
    "category": "Food",
    "note": "Makan di restoran",
    "spentAt": "2024-02-13T12:00:00.000Z",
    "createdAt": "2024-02-13T12:00:00.000Z",
    "updatedAt": "2024-02-13T12:00:00.000Z"
  }
}
```

#### 2. Get All Expenses
```
GET /api/expenses?page=1&limit=10&category=Food&sortBy=spentAt&sortOrder=desc
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `category` (optional)
- `startDate` (optional) - Format: YYYY-MM-DD
- `endDate` (optional) - Format: YYYY-MM-DD
- `sortBy` (default: spentAt) - Options: spentAt, amount, createdAt
- `sortOrder` (default: desc) - Options: asc, desc

**Response:**
```json
{
  "success": true,
  "data": {
    "expenses": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

#### 3. Get Expense by ID
```
GET /api/expenses/:id
```

#### 4. Update Expense
```
PUT /api/expenses/:id
```

**Request Body:** (semua field optional)
```json
{
  "title": "Updated title",
  "amount": 75000,
  "category": "Transport",
  "note": "Updated note",
  "spentAt": "2024-02-14T12:00:00Z"
}
```

#### 5. Delete Expense
```
DELETE /api/expenses/:id
```

#### 6. Get Category Statistics
```
GET /api/expenses/stats/category
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "category": "Food",
      "totalAmount": 500000,
      "count": 10
    },
    {
      "category": "Transport",
      "totalAmount": 300000,
      "count": 15
    }
  ]
}
```

#### 7. Get Monthly Report
```
GET /api/expenses/stats/monthly/:year/:month
```

**Example:** `GET /api/expenses/stats/monthly/2024/2`

**Response:**
```json
{
  "success": true,
  "data": {
    "expenses": [...],
    "totalAmount": 1500000,
    "totalCount": 45
  }
}
```

#### 8. Health Check
```
GET /health
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

## 🧪 Testing API

Gunakan tools seperti Postman, Insomnia, atau cURL:

```bash
# Create expense
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Expense",
    "amount": 100000,
    "category": "Test",
    "spentAt": "2024-02-13T12:00:00Z"
  }'

# Get all expenses
curl http://localhost:3000/api/expenses?page=1&limit=10

# Get expense by ID
curl http://localhost:3000/api/expenses/{id}
```

## 📝 Notes

- Pastikan PostgreSQL sudah running sebelum menjalankan aplikasi
- Semua amount disimpan dalam integer (dalam satuan terkecil, misal: Rupiah)
- Timezone menggunakan UTC, sesuaikan di client jika perlu
- Cache TTL default adalah 300 detik (5 menit)

## 🤝 Contributing

Silakan buat Pull Request untuk improvement atau bug fixes.

## 📄 License

ISC