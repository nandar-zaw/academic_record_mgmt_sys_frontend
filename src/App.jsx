// App.jsx - Main Application Component
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LoginForm from './components/auth/LoginForm.jsx';
import Navigation from './components/layout/Navigation.jsx';
import Dashboard from './components/dashboard/Dashboard.jsx';
import StudentManagement from './components/students/StudentManagement.jsx';
import CourseManagement from "./components/courses/CourseManagment.jsx";
import EnrollmentManagement from './components/enrollment/EnrollmentManagement.jsx';

// Main App Content (after authentication)
const AppContent = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading MIU ARMS...</p>
                </div>
            </div>
        );
    }

    // Show login form if not authenticated
    if (!isAuthenticated) {
        return <LoginForm />;
    }

    // Placeholder components for other tabs
    const PlaceholderPage = ({ title, description }) => (
        <div className="p-8">
            <h2 className="text-3xl font-bold mb-6">{title}</h2>
            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-12">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">{title} Module</h3>
                    <p className="text-gray-600 mb-6">{description}</p>
                    <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                        <span className="mr-2">🚧</span>
                        Coming Soon - Ready for Implementation
                    </div>
                </div>
            </div>
        </div>
    );

    // Main application interface
    return (
        <div className="min-h-screen bg-gray-100">
            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

            <main>
                {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
                {activeTab === 'students' && <StudentManagement />}

                {activeTab === 'courses' && <CourseManagement />}

                {activeTab === 'enrollments' && <EnrollmentManagement />}

                {activeTab === 'grades' && (
                    <PlaceholderPage
                        title="Grade Management"
                        description="Submit and manage student grades for courses. This module is designed for faculty to submit grades through the faculty API."
                    />
                )}

                {activeTab === 'transcripts' && (
                    <PlaceholderPage
                        title="Transcript Management"
                        description="Generate and view official academic transcripts. This module will display student transcripts using the student API endpoints."
                    />
                )}

                {activeTab === 'classrooms' && (
                    <PlaceholderPage
                        title="Classroom Management"
                        description="Manage classroom assignments and student-classroom relationships. This module will handle classroom operations through the registrar API."
                    />
                )}

                {activeTab === 'users' && (
                    <PlaceholderPage
                        title="User Management"
                        description="Manage system users, roles, and permissions. This admin module will use the admin API endpoints for user management."
                    />
                )}
            </main>
        </div>
    );
};

// Main App Component with AuthProvider
export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}