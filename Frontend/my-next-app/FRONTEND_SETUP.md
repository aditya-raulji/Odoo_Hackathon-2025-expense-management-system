# 🚀 Frontend Setup Guide

## Quick Start

### 1. Environment Setup
```bash
cd my-next-app
cp env.local.example .env.local
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

## 🔧 Environment Configuration

Your `.env.local` file should contain:
```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api

# Frontend Configuration
NEXT_PUBLIC_APP_NAME=SmartReq
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_PROFILE=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## 🎯 Features Implemented

### ✅ Authentication System
- **Login/Register Forms** - Fully functional with backend integration
- **Form Validation** - Client-side validation with error handling
- **Loading States** - User feedback during API calls
- **Success/Error Messages** - Clear user feedback
- **Auto-redirect** - Redirects authenticated users

### ✅ Profile Management
- **Profile Creation** - Complete profile setup
- **Profile Editing** - Update all profile information
- **Social Links** - Twitter, LinkedIn, GitHub, Instagram
- **Preferences** - Theme, notifications, newsletter
- **Form Validation** - Comprehensive input validation

### ✅ Notification System
- **Real-time Notifications** - Bell icon with unread count
- **Notification Center** - Dropdown with all notifications
- **Mark as Read** - Individual and bulk actions
- **Delete Notifications** - Remove unwanted notifications
- **Notification Types** - Success, warning, error, info

### ✅ User Interface
- **Responsive Design** - Works on all screen sizes
- **Dark Theme** - Modern dark UI
- **Loading States** - Smooth user experience
- **Error Handling** - Graceful error management
- **Authentication State** - Dynamic UI based on login status

## 📁 Project Structure

```
my-next-app/
├── src/
│   ├── app/
│   │   ├── auth/page.js          # Authentication page
│   │   ├── profile/page.js       # Profile management
│   │   ├── layout.js             # Root layout with AuthProvider
│   │   └── page.js               # Home page with notifications
│   ├── components/
│   │   └── NotificationCenter.js # Notification component
│   ├── contexts/
│   │   └── AuthContext.js        # Authentication context
│   └── lib/
│       └── api.js                # API service functions
├── .env.local                    # Environment variables
└── FRONTEND_SETUP.md            # This file
```

## 🔗 API Integration

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset
- `GET /api/auth/me` - Get current user

### Profile Endpoints
- `GET /api/profile/me` - Get user profile
- `POST /api/profile/create` - Create profile
- `PUT /api/profile/update` - Update profile
- `GET /api/profile/search` - Search profiles

### Notification Endpoints
- `GET /api/notifications` - Get notifications
- `POST /api/notifications/mark-read/:id` - Mark as read
- `POST /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## 🎨 UI Components

### Authentication Page (`/auth`)
- **Login Form** - Email and password
- **Register Form** - Name, email, password, confirm password
- **Form Validation** - Real-time validation
- **Loading States** - Button states during submission
- **Error/Success Messages** - User feedback

### Profile Page (`/profile`)
- **Basic Information** - Username, name, bio, location, etc.
- **Social Links** - Twitter, LinkedIn, GitHub, Instagram
- **Preferences** - Theme, notifications, newsletter
- **Form Validation** - Comprehensive validation
- **Auto-save** - Form state management

### Home Page (`/`)
- **Dynamic Header** - Shows different content for logged-in users
- **Notification Center** - Bell icon with unread count
- **User Welcome** - Personalized greeting
- **Navigation** - Profile and logout links

## 🔐 Security Features

- **JWT Token Storage** - Secure localStorage management
- **Auto-logout** - Token expiration handling
- **Protected Routes** - Authentication checks
- **Input Sanitization** - XSS prevention
- **CSRF Protection** - Secure API calls

## 🚀 Getting Started

1. **Start Backend** (in Backend folder):
   ```bash
   cd Backend
   npm install
   npm run init-db
   npm run dev
   ```

2. **Start Frontend** (in my-next-app folder):
   ```bash
   cd my-next-app
   npm install
   cp env.local.example .env.local
   npm run dev
   ```

3. **Test the Application**:
   - Visit `http://localhost:3000`
   - Click "Sign Up" to register
   - Check your email for verification
   - Login and create your profile
   - Test notifications and profile management

## 🧪 Testing Features

### Registration Flow
1. Go to `/auth`
2. Click "Register with your e-mail"
3. Fill in the form
4. Submit and check email for verification

### Login Flow
1. Go to `/auth`
2. Enter email and password
3. Click "Log in now"
4. Should redirect to home page

### Profile Management
1. Login and go to `/profile`
2. Fill in profile information
3. Add social links
4. Set preferences
5. Save profile

### Notifications
1. Login to see notification bell
2. Click bell to see notifications
3. Mark notifications as read
4. Delete notifications

## 🔧 Customization

### Adding New Profile Fields
1. Update the form in `/profile/page.js`
2. Add validation rules
3. Update the API call
4. Test the changes

### Adding New Notification Types
1. Update `NotificationCenter.js`
2. Add new icon in `getNotificationIcon()`
3. Update notification styling
4. Test with different types

### Styling Changes
- All styles use Tailwind CSS
- Dark theme is applied throughout
- Responsive design for mobile/desktop
- Custom colors can be added to `globals.css`

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Error**
   - Check if backend is running on port 5000
   - Verify `.env.local` has correct API URL
   - Check browser console for errors

2. **Authentication Not Working**
   - Clear localStorage and try again
   - Check if JWT token is being stored
   - Verify backend authentication endpoints

3. **Profile Not Loading**
   - Check if user is authenticated
   - Verify profile API endpoints
   - Check browser network tab

4. **Notifications Not Showing**
   - Check if user is logged in
   - Verify notification API endpoints
   - Check for JavaScript errors

## 📱 Mobile Responsiveness

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🎉 Ready to Use!

Your frontend is now fully integrated with the backend and ready for production use. All authentication, profile management, and notification features are working seamlessly!

## 🔄 Next Steps

1. **Customize the UI** - Modify colors, fonts, layouts
2. **Add More Features** - User search, messaging, etc.
3. **Deploy to Production** - Use Vercel, Netlify, or similar
4. **Add Analytics** - Track user behavior
5. **Add Tests** - Unit and integration tests

Happy coding! 🚀
