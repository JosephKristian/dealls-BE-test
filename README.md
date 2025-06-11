
# 🧾 Payroll System - Dealls BE Test (NestJS + Prisma + PostgreSQL)

## 📦 Project Overview

A scalable payroll system built with **NestJS**, **Prisma**, and **PostgreSQL**, implementing employee salary calculation based on attendance, overtime, and reimbursements. Designed for both **employee** and **admin** usage with full audit logging, request tracing, and secure, traceable data changes.

---

## 🚀 Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/JosephKristian/dealls-BE-test.git
cd dealls-BE-test
````

### 2. Use Node.js 20

```bash
nvm use 20
```

### 3. Install Dependencies

```bash
npm install
```


---

### 4. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` dan sesuaikan dengan koneksi database PostgreSQL Anda:

```env
DATABASE_URL="postgresql://<your_db_user>:<your_db_password>@<your_db_host>:<your_db_port>/<your_db_name>?schema=public"
JWT_SECRET=yourSecretKey
```

> ⚠️ Gantilah nilai `DATABASE_URL` sesuai dengan kredensial dan konfigurasi PostgreSQL lokal Anda.

Untuk pengujian, buat file `.env.test` berdasarkan konfigurasi `.env` dan sesuaikan dengan test database Anda.

---

### 5. Run Database Migration

```bash
npx prisma migrate dev
```

### 6. Seed Fake Data

```bash
npm run seed
```

This will create:

* ✅ 100 fake **employees**
* ✅ 1 fake **admin** (credentials will appear in the console)

### 7. Run Development Server

```bash
npm run start:dev
```

---

## 📜 Available Scripts

```json
"scripts": {
  "seed": "ts-node prisma/seed.ts",
  "migrate:test": "dotenv -e .env.test -- prisma migrate deploy",
  "test:user": "cross-env NODE_ENV=test jest test/user/create-user.test.ts",
  "build": "nest build",
  "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:debug": "nest start --debug --watch",
  "start:prod": "node dist/main",
  "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage",
  "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
  "test:e2e": "jest --config ./test/jest-e2e.json"
}
```

---


## 🗂️ Audit Log System

Sistem ini dilengkapi dengan fitur audit log untuk mencatat setiap perubahan data penting dalam sistem, memastikan **transparansi**, **traceability**, dan **keamanan operasional**.

### 🔍 Audit Log Table

Audit log tersimpan dalam tabel `audit_logs`, dengan struktur Prisma model berikut:

```ts
model AuditLog {
  id          String   @id @default(uuid())
  entity      String
  entityId    String   @map("entity_id")
  action      String
  performedBy String?  @map("performed_by")
  ipAddress   String?  @map("ip_address")
  requestId   String?  @map("request_id")
  timestamp   DateTime @default(now())
  oldData     Json?    @map("old_data")
  newData     Json?    @map("new_data")

  @@map("audit_logs")
}
```

### 📌 Fungsi Audit Log

Setiap aksi penting seperti `create`, `update`, atau `delete` terhadap entitas seperti **Payroll**, **Attendance**, **Overtime**, dan **Reimbursement** akan menghasilkan log dengan informasi berikut:

| Field         | Deskripsi                                                      |
| ------------- | -------------------------------------------------------------- |
| `entity`      | Nama entitas (contoh: `Payroll`, `Attendance`)                 |
| `entityId`    | ID dari entitas yang dimodifikasi                              |
| `action`      | Jenis aksi (`CREATE`, `UPDATE`, `DELETE`)                      |
| `performedBy` | User yang melakukan aksi                                       |
| `ipAddress`   | Alamat IP pengakses (jika disediakan)                          |
| `requestId`   | ID unik untuk setiap request (jika middleware-nya diaktifkan)  |
| `timestamp`   | Waktu log dibuat                                               |
| `oldData`     | Snapshot data sebelum perubahan (untuk `UPDATE` atau `DELETE`) |
| `newData`     | Snapshot data setelah perubahan (untuk `CREATE` atau `UPDATE`) |

### 🧠 Manfaat

* 🔎 **Audit Trail**: Lacak siapa yang mengubah data, kapan, dan apa yang berubah.
* 🛡️ **Security**: Membantu dalam investigasi jika terjadi perubahan data yang tidak sah.
* 🔁 **Traceability**: Setiap request bisa dilacak berdasarkan `requestId` dari middleware.


---

## 📬 Postman Collection

The Postman collection for testing the API is available inside the `/postman` folder.

* Import it into Postman to test all endpoints easily.
* Make sure your `.env` file has the correct local API URL and DB connection.

or

https://web.postman.co/workspace/ca6cbfb4-77f6-4403-8b4d-04e8c8ea668f

---

## ✅ Functional Features

### 🔐 Auth

* Register / Login for both roles
* Role-based: **ADMIN** and **EMPLOYEE**

### 🕘 Attendance

* Submit daily attendance (Mon–Fri only)
* One entry per day only

### ⏱️ Overtime

* Submit after working hours
* Max 3 hours/day
* Can be submitted on any day

### 💸 Reimbursements

* Submit amount + description

### 📅 Payroll Period

* Admin sets attendance period
* Can only be run once per period

### 🧾 Payslip

* Employee: view personal payslip
* Admin: view all employee payslips

---

## 🧠 Business Rules

* Salary prorated by **working days attended**
* Overtime paid at **2x hourly rate**
* Reimbursements are added to the total
* Payslip = prorated base + overtime + reimbursements

---

## 🛠️ Tech Stack

* **NestJS** – Modular server-side framework
* **Prisma** – ORM for PostgreSQL
* **PostgreSQL** – Relational DB
* **Jest** – Testing framework
* **Prettier & ESLint** – Code style & linting
* **Typescript**, **ts-node**, **dotenv**, **cross-env**

---

## 📚 Testing

Uses `.env.test` for test configuration.

### Run Tests:
```bash
npm run migrate:test 
```
Attendance Service Test
```bash
npm run migrate:attendance 
```
Overtime Service Test
```bash
npm run migrate:overtime 
```
Reimbursement Service Test
```bash
npm run migrate:reimbursement 
```

```bash
npm run migrate:test 
npm run test:user    # Run a specific unit test
npm run test:auth    # Run a specific unit test
npm run test:e2e     # Run end-to-end tests
```

---

## 📒 Notes

Each record contains:

* `createdAt`, `updatedAt`
* `createdBy`, `updatedBy`
* `isDeleted`, `deletedAt`, `deletedBy` (soft delete)
* Support for `request_id` and `IP logging` (extendable via middleware)
* Highly traceable and auditable

---

## 🧪 Plus Points Implemented

✅ Performance-aware structure
✅ Traceable audit logs (extendable)
✅ Request ID support (extendable)
✅ Modular architecture & testable design

---

## ✨ Author

**Joseph Kristian**
[GitHub Repository](https://github.com/JosephKristian/dealls-BE-test)

---

## 📎 License

MIT License (or as applicable)
