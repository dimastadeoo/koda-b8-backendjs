# Backend E-Commerce API

Backend untuk aplikasi e-commerce dengan fitur lengkap: autentikasi, profil pengguna, produk, keranjang, checkout, order management, dan admin dashboard.

## 📋 Daftar Isi

- [Teknologi](#-teknologi)
- [Instalasi](#-instalasi)
- [Environment Variables](#-environment-variables)
- [Database Migration](#-database-migration)
- [Menjalankan Server](#️-menjalankan-server)
- [Struktur Folder](#-struktur-folder)
- [API Endpoints](#-api-endpoints)
- [Swagger Documentation](#-swagger-documentation)
- [Fitur Utama](#-fitur-utama)
- [Quick Start](#-quick-start)
- [Author](#-Author)
- [License](#-license)

## 🛠 Teknologi

- **Node.js (ES Modules)**
- **Express.js** — Framework web
- **PostgreSQL** — Database
- **JWT** — Autentikasi
- **Bcrypt** — Password hashing
- **Multer** — File upload
- **Swagger JSDoc** — API documentation
- **CORS** — Cross-Origin Resource Sharing

## 📦 Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd backendjs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env` di root proyek:

```env
BACKEND_HOST=YOUR_HOST_BACKEND
BACKEND_PORT=YOUR_PORT_BACKEND
FRONTEND_URL=YOUR_URL_FRONTEND
DATABASE_URL=postgresql://user:password@localhost:5432/dbname?sslmode=disable

JWT_KEY=your_super_secret_jwt_key


```

## 🗄 Database Migration

Project ini menggunakan **Golang Migrate** untuk database migration.

### Install Golang Migrate

Jika Migrate belum terinstall:

```bash
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

```

Saya menyediakan Makefile untuk mempermudah perintah migration (dengan catatan file .env sudah dikonfigurasi)

### Menjalankan Migration
```bash
make migration-up
```

### Rollback Migration

```bash
make migration-down
```

> **Catatan:** Pastikan PostgreSQL sudah berjalan dan database yang digunakan sudah tersedia sebelum menjalankan migration.

## ▶️ Menjalankan Server

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

Server secara default berjalan pada:

```text
http://localhost:8080
```

## 📁 Struktur Folder

```text
src/
├── config/          # Konfigurasi database
├── controllers/     # Controller functions
├── lib/             # Utility functions (response, JWT, upload)
├── middlewares/     # Auth, admin, error handlers
├── models/          # Database models
├── routes/          # API routes
├── uploads/         # Uploaded files
│   ├── profiles/    # Profile pictures
│   └── products/    # Product images
└── app.js           # Entry point
```

## 🔐 API Endpoints

### Public Routes

Endpoint yang dapat diakses tanpa autentikasi.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register user |
| `POST` | `/auth/login` | Login user |
| `GET` | `/products` | Get all products dengan filter & pagination |
| `GET` | `/products/:id` | Get product detail |
| `GET` | `/products/merks` | Get brands |
| `GET` | `/products/categories` | Get categories |
| `GET` | `/products/:id/reviews` | Get product reviews |

### Protected Routes

Endpoint berikut membutuhkan autentikasi pengguna.

#### Profile

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/profile` | Get user profile |
| `PATCH` | `/profile` | Update profile |
| `PATCH` | `/profile/email` | Update email |
| `PATCH` | `/profile/password` | Update password |
| `PATCH` | `/profile/picture` | Upload profile picture |

#### Cart

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/cart` | Get cart items |
| `POST` | `/cart` | Add item to cart |
| `PATCH` | `/cart/:productId` | Update quantity |
| `DELETE` | `/cart/:productId` | Remove item |
| `PATCH` | `/cart/:productId/status` | Update item status |

#### Address

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/address` | Get addresses |
| `POST` | `/address` | Create address |
| `PATCH` | `/address/:id` | Update address |
| `DELETE` | `/address/:id` | Delete address |
| `PATCH` | `/address/:id/primary` | Set primary address |

#### Wishlist

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/wishlist` | Get wishlist |
| `POST` | `/wishlist` | Add product to wishlist |
| `DELETE` | `/wishlist/:productId` | Remove product from wishlist |

#### Orders

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/orders` | Get user orders |
| `GET` | `/orders/:orderId` | Get order detail |

#### Checkout

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/checkout` | Create order from cart |
| `GET` | `/checkout/payment-methods` | Get payment methods |
| `GET` | `/checkout/shipping-methods` | Get shipping methods |

### 👑 Admin Routes

Endpoint berikut hanya dapat diakses oleh user dengan role **admin**.

#### User Management

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/users` | Get all users |
| `GET` | `/admin/users/:id` | Get user detail |
| `POST` | `/admin/users` | Create user |
| `PATCH` | `/admin/users/:id` | Update user |
| `DELETE` | `/admin/users/:id` | Delete user |
| `GET` | `/admin/roles` | Get roles |

#### Product Management

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/admin/products` | Create product |
| `PATCH` | `/admin/products/:id` | Update product |
| `DELETE` | `/admin/products/:id` | Delete product |
| `POST` | `/admin/products/:id/images` | Add product images |
| `DELETE` | `/admin/products/images/:imageId` | Delete product image |

#### Order Management

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/orders` | Get all orders |
| `PATCH` | `/admin/orders/:orderId/status` | Update order status |

## 📚 Swagger Documentation

API documentation tersedia menggunakan Swagger UI.

Setelah server berjalan, buka:

```text
http://localhost:8080/docs
```

Swagger menyediakan dokumentasi endpoint API dan dapat digunakan untuk melakukan testing request secara langsung.

## ✨ Fitur Utama

### 🔐 Authentication & Authorization

- Register & Login menggunakan JWT
- Role-based access control
- Role: `admin`, `customer`, `staff`
- Password hashing menggunakan Bcrypt
- Protected routes dengan authentication middleware

### 👤 User Profile

- Melihat profile pengguna
- Update nama
- Update gender
- Update tanggal lahir
- Upload profile picture
- Update email
- Update password
- Automatic deletion file profile lama

### 🛍 Product Management

- Melihat daftar produk
- Product detail
- CRUD produk untuk admin
- Multiple product images
- Category management
- Brand management
- Discount system
- Product reviews
- Product rating
- Filtering
- Pagination

### 🛒 Shopping Cart

- Add product ke cart
- Update quantity
- Remove product
- Update item status
- Multiple cart status:
  - `active`
  - `checkout`
  - `sold out`
- Cart tetap tersimpan antar session

### 💳 Checkout & Orders

- Create order dari cart
- Step-by-step checkout
- Pemilihan alamat
- Pemilihan shipping method
- Pemilihan payment method
- Voucher & discount system
- Order status management
- Cancel order
- Restore product stock ketika order dibatalkan
- Resume incomplete checkout

### 👑 Admin Dashboard

- User management
- CRUD users
- Role management
- Product management
- Product image management
- Order management
- Update order status
- Role-based access control

### 📤 File Upload

Mendukung upload file menggunakan **Multer**.

Profile pictures:

```text
uploads/profiles/
```

Product images:

```text
uploads/products/
```

Fitur file upload meliputi:

- Upload profile picture
- Upload multiple product images
- Automatic deletion file lama
- Pemisahan folder berdasarkan jenis file

> ⚠️ **Security:** Untuk environment production, segera ganti password default admin dan gunakan `JWT_KEY` yang kuat serta tidak dibagikan ke publik.

## 🚀 Quick Start

Jika PostgreSQL dan Node.js sudah tersedia:

```bash
# Clone repository
git clone <repository-url>
cd backendjs

# Install dependencies
npm install

# Buat file .env
cp .env.example .env

# Sesuaikan konfigurasi database di .env

# Jalankan migration
make migration-up

# Jalankan development server
npm run dev
```

Kemudian akses:

```text
API:
http://localhost:8080

Swagger:
http://localhost:8080/docs
```

## 👨‍💻 Author
**Dimas Tadeo**

* GitHub: https://github.com/dimastadeoo
* Repository: https://github.com/dimastadeoo/koda-b8-backendjs

## 📄 License

Project ini menggunakan **MIT License**.
