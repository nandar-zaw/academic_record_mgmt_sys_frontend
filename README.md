# Academic Records Management System - Frontend

A web application for managing academic records, built with React and Vite.

## Live Demo

**Deployed Application:** https://nice-forest-0bae1c010.1.azurestaticapps.net/

### Test Credentials
```
Username: registrar-admin@miu.edu
Password: TestMe@123
```

## Features

- Student Management
    - Add, edit, and delete student records
    - Search and filter students
    - View student profiles

- Academic Records
    - Manage courses and grades
    - Track academic progress

- User Authentication
    - Secure login system
    - Role-based access control

## Tech Stack

- React 19.1.1
- Vite 7.1.2
- Axios 1.11.0
- Lucide React 0.539.0
- Azure Static Web Apps

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm

### Local Development

1. Clone the repository
   ```bash
   git clone https://github.com/nandar-zaw/academic_record_mgmt_sys_frontend.git
   cd academic_record_mgmt_sys_frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start development server
   ```bash
   npm run dev
   ```

4. Open browser to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

Backend API: `https://arms-webapp.azurewebsites.net/api/`

Main endpoints:
- `GET /api/students` - Fetch students
- `POST /api/students` - Create student
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student
- `POST /api/auth/login` - Login

## Deployment

Deployed on Azure Static Web Apps with automatic deployment via GitHub Actions.

## Project Structure

```
src/
├── components/     # UI components
├── services/       # API services
├── App.jsx         # Main component
└── main.jsx        # Entry point
```