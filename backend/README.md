# Loan Web Application - Backend

Backend API for the Loan Web Application with MySQL database and Mobile Money integration.

## 🚀 Features

- ✅ User Authentication (Register, Login, JWT)
- ✅ Email Verification with OTP
- ✅ Secure Password Hashing (bcrypt)
- ✅ Profile Management
- ✅ Role-based Access Control (User/Admin)
- ✅ Rate Limiting & Security (Helmet, CORS)
- ✅ MySQL Database with Connection Pool
- 🔄 Loan Management (Coming Soon)
- 🔄 Payment Integration (Coming Soon)

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## 🛠️ Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

Create a MySQL database and run the schema:

```bash
mysql -u root -p < config/database.sql
```

Or manually:
- Open MySQL Workbench or command line
- Run the SQL script in `config/database.sql`

### 3. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=loan_app_db
DB_PORT=3306

JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### 4. Start the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000`

## 📡 API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/verify-email` | Verify email with OTP | Yes |
| POST | `/api/auth/resend-otp` | Resend OTP | Yes |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/update-profile` | Update profile | Yes |
| PUT | `/api/auth/change-password` | Change password | Yes |
| POST | `/api/auth/refresh-token` | Refresh access token | No |
| POST | `/api/auth/logout` | Logout user | Yes |

### Example Requests

#### Register User
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "firstName": "Lucy",
  "lastName": "Bentum",
  "email": "lucy@example.com",
  "phone": "+233501234567",
  "password": "SecurePass123",
  "dateOfBirth": "2000-01-01",
  "address": "Accra, Ghana"
}
```

#### Login User
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "lucy@example.com",
  "password": "SecurePass123"
}
```

#### Verify Email
```bash
POST http://localhost:5000/api/auth/verify-email
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "otp": "123456"
}
```

## 🗄️ Database Schema

### Users Table
- `id` - Primary key
- `first_name` - User's first name
- `last_name` - User's last name
- `email` - Unique email address
- `phone` - Unique phone number
- `password_hash` - Hashed password
- `role` - User role (user/admin)
- `status` - Account status (active/suspended/inactive)
- `is_email_verified` - Email verification status
- `is_phone_verified` - Phone verification status
- Timestamps and other metadata

### Loans Table (Ready for implementation)
- Loan details, status, amounts, etc.

### Payments Table (Ready for implementation)
- Payment records, mobile money transactions

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT authentication
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Helmet.js security headers
- ✅ Input validation
- ✅ SQL injection prevention (parameterized queries)

## 📧 Email Configuration

For Gmail:
1. Enable 2-factor authentication
2. Generate an app password
3. Use the app password in `EMAIL_PASSWORD`

## 🧪 Testing

Test the API health:
```bash
curl http://localhost:5000/api/health
```

## 📝 Project Structure

```
backend/
├── config/
│   ├── database.js          # MySQL connection
│   └── database.sql         # Database schema
├── controllers/
│   └── authController.js    # Auth logic
├── middleware/
│   └── auth.js              # JWT middleware
├── routes/
│   └── authRoutes.js        # Auth routes
├── utils/
│   ├── emailService.js      # Email utilities
│   ├── generateOTP.js       # OTP generation
│   └── jwtToken.js          # JWT utilities
├── .env.example             # Environment template
├── .gitignore               # Git ignore file
├── package.json             # Dependencies
├── server.js                # Entry point
└── README.md                # Documentation
```

## 👨‍💻 Author

**Lucy Bentum**  
Department of Computer Science and Engineering  
University of Mines and Technology  
Final Year Project - 2025

## 📄 License

MIT License

## 🤝 Contributing

This is a final year project. For suggestions or improvements, please contact the author.

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Note:** This is an academic project for educational purposes. For production use, additional security measures and testing are recommended.

