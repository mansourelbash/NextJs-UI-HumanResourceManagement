# HRMS Backend API

This is the backend API for the Human Resource Management System with face recognition capabilities.

## Features

- 🔐 JWT Authentication & Authorization
- 👥 Employee Management
- 📊 Face Recognition Integration
- ⏰ Attendance Tracking
- 💼 Contract Management
- 📈 Dashboard Analytics
- 🗄️ PostgreSQL Database with Prisma ORM

## Tech Stack

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **File Upload**: Multer for face images
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/hrms_db"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Other configurations...
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run generate

# Run database migrations
npm run migrate

# Seed the database with sample data
npm run seed
```

### 4. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

The API will be available at `http://localhost:7025`

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - Register new user (Admin only)
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - Logout
- `PUT /api/v1/auth/update-account` - Update user account

### Employees
- `GET /api/v1/employees` - Get all employees
- `GET /api/v1/employees/:id` - Get employee by ID
- `POST /api/v1/employees` - Create employee (Admin only)
- `PUT /api/v1/employees/:id` - Update employee (Admin only)
- `DELETE /api/v1/employees/:id` - Delete employee (Admin only)
- `GET /api/v1/employees/get-all-labeled` - Get all labeled faces
- `GET /api/v1/employees/:id/employee-images` - Get employee face images
- `POST /api/v1/employees/regis-face/:id` - Register face
- `PUT /api/v1/employees/update-regis-face/:id` - Update face registration

### Work Shifts & Attendance
- `POST /api/v1/work-shifts/check-in-out/:employeeId` - Check in/out
- `GET /api/v1/work-shifts/attendance/:employeeId` - Get attendance records
- `GET /api/v1/work-shifts/calendar/:employeeId` - Get calendar data
- `POST /api/v1/work-shifts/work-plan` - Create work plan
- `GET /api/v1/work-shifts/work-plans/:employeeId` - Get work plans
- `PUT /api/v1/work-shifts/work-plan/:id/status` - Update work plan status
- `GET /api/v1/work-shifts/dashboard-stats` - Get dashboard statistics

## Database Schema

The database includes the following main entities:

- **Users** - Authentication and roles
- **Employees** - Employee information
- **Departments** - Organizational departments
- **Positions** - Job positions
- **Contracts** - Employment contracts
- **FaceRegistrations** - Face recognition data
- **AttendanceHistory** - Time tracking records
- **WorkPlans** - Work schedules
- **Allowances & Insurances** - Salary components

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- File upload validation
- Role-based access control

## Development

### Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── types/          # TypeScript types
│   └── server.ts       # Main server file
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── seed.ts         # Database seeding
├── uploads/            # File uploads directory
└── dist/              # Compiled JavaScript
```

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run generate` - Generate Prisma client
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data

## Default Credentials

After running the seed command, you can use these credentials:

**Admin Account:**
- Email: admin@hrms.com
- Password: admin123

**Sample Employees:**
- Email: john.doe@hrms.com (Fulltime)
- Password: password123
- Email: jane.smith@hrms.com (Partime) 
- Password: password123

## API Response Format

All API responses follow this format:

```json
{
  "isSuccess": true,
  "message": ["Success message"],
  "metadata": {
    // Response data
  }
}
```

## Error Handling

Errors are handled consistently with appropriate HTTP status codes:

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
