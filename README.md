# Expense Management System (ExMan)

A comprehensive expense management system built with Node.js/Express backend and Next.js frontend, featuring role-based authentication and multi-tenant company support.

## 🚀 Features

### Authentication & User Management
- **Admin Auto-Creation**: First signup creates company and admin user
- **Role-Based Access**: Admin, Manager, and Employee roles with appropriate permissions
- **Company Isolation**: Multi-tenant system with company-specific user management
- **JWT Authentication**: Secure token-based authentication with 24h expiry

### Core Functionality
- **Company Management**: Automatic company creation with currency detection
- **User Management**: Admin can create/manage users (Managers/Employees)
- **Role-Based Dashboards**: Different interfaces for each user role
- **Multi-Currency Support**: Automatic currency detection based on country
- **Protected Routes**: Role-based access control throughout the application

## 🏗️ Architecture

### Backend (Node.js/Express)
- **Database**: PostgreSQL with comprehensive schema
- **Authentication**: JWT with role-based middleware
- **API Routes**: RESTful API with proper error handling
- **Security**: bcrypt password hashing, input validation, rate limiting

### Frontend (Next.js)
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS for modern UI
- **State Management**: React Context for authentication
- **Routing**: Role-based route protection

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation & Setup

### Backend Setup

1. **Navigate to Backend directory**
   ```bash
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=expense_management
   DB_USER=your_username
   DB_PASSWORD=your_password
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=24h
   
   # Server
   PORT=5000
   NODE_ENV=development
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   
   # Email Service (Optional)
   SENDGRID_API_KEY=your_sendgrid_api_key
   SENDER_EMAIL=your_email@domain.com
   ```

4. **Database Setup**
   ```bash
   # Create database
   createdb expense_management
   
   # Initialize database schema
   npm run init-db
   ```

5. **Start Backend Server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to Frontend directory**
   ```bash
   cd Frontend/my-next-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.local.example .env.local
   ```
   
   Update `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
   ```

4. **Start Frontend Server**
   ```bash
   npm run dev
   ```

## 🎯 Usage

### First Time Setup (Admin Creation)

1. **Access the application**: http://localhost:3000
2. **Click "Get Started"** to access the signup form
3. **Fill in company details**:
   - Company Name (e.g., "Ironcore Gym Pvt Ltd")
   - Your Name
   - Email
   - Password (min 8 chars with uppercase, lowercase, number)
   - Country (for currency detection)
4. **Submit** - This creates the company and makes you the admin

### Admin Dashboard Features

- **User Management**: Create new users (Managers/Employees)
- **Role Assignment**: Assign roles and manager relationships
- **Company Overview**: View all users and company statistics
- **User Deletion**: Remove users from the system

### Manager Dashboard Features

- **Expense Approvals**: Review and approve employee expenses
- **Team Management**: View team members and their expenses
- **Reporting**: Access approval statistics and reports

### Employee Dashboard Features

- **Expense Submission**: Submit new expenses with categories
- **Expense Tracking**: View submitted expenses and their status
- **Personal Dashboard**: Track personal expense statistics

## 🔐 Authentication Flow

### Signup Flow (Admin Only)
1. Check if any company exists
2. If no company exists, allow signup
3. Create company with currency from country API
4. Create admin user linked to company
5. Generate JWT token with role and company info

### Login Flow
1. Validate credentials
2. Return user data with company info
3. Generate JWT token with role and company info
4. Redirect based on role:
   - Admin → `/dashboard/admin`
   - Manager → `/dashboard/approvals`
   - Employee → `/dashboard/expenses`

### User Creation (Admin Only)
1. Admin creates users via dashboard
2. Users receive credentials from admin
3. Users can only login, not signup directly

## 🗄️ Database Schema

### Companies Table
```sql
- id (Primary Key)
- name (Company Name)
- currency (Auto-detected from country)
- country (Selected during signup)
- admin_id (Reference to admin user)
- created_at, updated_at
```

### Users Table
```sql
- id (Primary Key)
- name (User's full name)
- email (Unique per company)
- password (Hashed with bcrypt)
- role (admin, manager, employee)
- company_id (Reference to company)
- manager_id (Reference to manager, for employees)
- verification_token, is_verified
- password_reset_token, password_reset_expires
- created_at, updated_at
```

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /signup` - Create admin and company (first signup only)
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /profile` - Get current user profile
- `GET /check-company` - Check if company exists
- `POST /verify-email` - Email verification
- `POST /forgot-password` - Password reset request
- `POST /reset-password` - Password reset

### User Management Routes (`/api/users`) - Admin Only
- `POST /` - Create new user
- `GET /` - Get all users in company
- `GET /managers` - Get managers in company
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user

## 🧪 Testing

### Backend Testing
```bash
cd Backend
npm test
```

### Frontend Testing
```bash
cd Frontend/my-next-app
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Deploy to your preferred platform (Heroku, AWS, etc.)

### Frontend Deployment
1. Build the application
2. Deploy to Vercel, Netlify, or your preferred platform
3. Update API base URL in environment variables

## 🔧 Development

### Adding New Features
1. **Backend**: Add routes in appropriate files, update models if needed
2. **Frontend**: Create components and pages, update API calls
3. **Database**: Add migrations for schema changes

### Code Structure
```
Backend/
├── config/          # Database configuration
├── middleware/      # Authentication and validation middleware
├── models/          # Database models (User, Company)
├── routes/          # API route handlers
├── services/        # External service integrations
└── database/        # Database schema and migrations

Frontend/my-next-app/
├── src/
│   ├── app/         # Next.js app router pages
│   ├── components/  # Reusable React components
│   ├── contexts/    # React context providers
│   └── lib/         # API utilities and helpers
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔄 Future Enhancements

- [ ] Expense categories and subcategories
- [ ] Receipt image upload and OCR
- [ ] Advanced reporting and analytics
- [ ] Mobile app development
- [ ] Integration with accounting software
- [ ] Multi-language support
- [ ] Advanced approval workflows
- [ ] Budget management features