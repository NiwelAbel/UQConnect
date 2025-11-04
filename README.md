# UQ Connect - Extra curricular Activity Management Platform

UQ Connect is an extra curricular activity management platform designed specifically for UQ students, providing intelligent calendar management, activity discovery, and personalized recommendations.

## 🚀 Quick Start

### Start Application

1. Ensure Node.js is installed
2. Run in project root directory:
   ```bash
   node server.js
   ```
3. Visit http://localhost:3001

### User Registration

Create your own account by visiting the registration page at http://localhost:3001/register.html

## 📱 Feature Pages

- **Login Page**: http://localhost:3001/login.html
- **Register Page**: http://localhost:3001/register.html
- **Dashboard**: http://localhost:3001/dashboard.html
- **Events Browse**: http://localhost:3001/events.html
- **Calendar Management**: http://localhost:3001/calendar.html
- **Personalized Recommendations**: http://localhost:3001/recommendations.html

## ✨ Main Features

### 1. User Registration & Login
- Secure user registration and login system
- JWT token authentication
- Password encryption storage

### 2. Smart Calendar Management
- Upload .ics format timetable files
- Automatic course information parsing
- Visual calendar view
- Activity time conflict detection

### 3. Activity Discovery
- Browse various UQ academic activities
- Filter by category and type
- View activity details
- One-click add to personal calendar

### 4. Personalized Recommendations
- Intelligent recommendations based on course schedule
- Consider free time slots
- Field of study matching
- Recommendation confidence scoring

### 5. Dashboard
- Today's activity overview
- Upcoming activities
- Quick action access
- Statistics display

## 🔧 Technical Features

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **Data Storage**: JSON file system
- **File Upload**: Multer middleware
- **Calendar Parsing**: ICS file format support

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Data Retrieval
- `GET /api/events` - Get all activities
- `GET /api/calendar` - Get user calendar
- `GET /api/recommendations` - Get personalized recommendations

### File Operations
- `POST /api/calendar/upload` - Upload calendar file

### Recommendation Operations
- `POST /api/recommendations/:eventId/accept` - Accept recommendation

## 🎯 Usage Process

1. **Register/Login**: Create your own account or login with existing credentials
2. **Upload Timetable**: Upload .ics format timetable file on calendar page
3. **Browse Activities**: View various UQ academic activities
4. **Get Recommendations**: System recommends related activities based on your course schedule
5. **Manage Calendar**: View and manage your personal calendar

## 🎨 User Interface

### Modern Authentication Pages
- **Beautiful Login Page**: Clean, modern design with feature highlights
- **Intuitive Registration**: Easy account creation with password validation
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Loading States**: Visual feedback during login/registration process

### Enhanced User Experience
- **Gradient Buttons**: Modern button design with hover effects
- **Input Icons**: Visual indicators for form fields
- **Feature Showcase**: Highlighted benefits on registration page
- **Smooth Animations**: Polished transitions and interactions

## 🧪 Testing

Run test script to verify all features:
```bash
./test-app.sh
```

## 📝 Notes

- Ensure server runs on port 3001
- Supports .ics format calendar files
- Recommendation feature requires timetable upload first
- All API requests require valid JWT token

## 🔒 Security Features

- Password bcrypt encryption
- JWT token authentication
- CORS cross-origin protection
- Input validation and error handling

---

**UQ Connect** - Making academic life smarter, making activity management simpler!
