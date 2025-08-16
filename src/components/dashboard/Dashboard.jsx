// components/dashboard/Dashboard.jsx
import React from 'react';
import { Users, BookOpen, Building, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Dashboard = ({ setActiveTab }) => {
    const { currentUser, hasRole } = useAuth();

    const StatCard = ({ title, value, icon: Icon, color, onClick }) => (
        <div
            className={`bg-white rounded-lg shadow p-6 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 text-sm">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
                <div className={`${color} p-3 rounded-lg`}>
                    <Icon size={24} className="text-white" />
                </div>
            </div>
        </div>
    );

    const QuickActionCard = ({ title, description, onClick, buttonText }) => (
        <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
            <p className="text-sm text-gray-600 mb-3">{description}</p>
            <button
                onClick={onClick}
                className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors"
            >
                {buttonText} →
            </button>
        </div>
    );

    return (
        <div className="p-8">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h2>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Students"
                        value="1,247"
                        icon={Users}
                        color="bg-blue-500"
                        onClick={hasRole('REGISTRAR') ? () => setActiveTab('students') : null}
                    />
                    <StatCard
                        title="Active Courses"
                        value="89"
                        icon={BookOpen}
                        color="bg-green-500"
                        onClick={hasRole('REGISTRAR') ? () => setActiveTab('courses') : null}
                    />
                    <StatCard
                        title="Classrooms"
                        value="42"
                        icon={Building}
                        color="bg-purple-500"
                        onClick={hasRole('REGISTRAR') ? () => setActiveTab('classrooms') : null}
                    />
                    <StatCard
                        title="System Users"
                        value="156"
                        icon={Settings}
                        color="bg-orange-500"
                        onClick={hasRole('ADMIN') ? () => setActiveTab('users') : null}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Welcome Card */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-xl font-semibold mb-4">Welcome to MIU ARMS</h3>
                        <p className="text-gray-600 mb-4">
                            Academic Records Management System for Maharishi International University
                        </p>

                        {/* User Info */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">Your Session Details:</h4>
                            <div className="text-sm text-blue-800 space-y-1">
                                <p><strong>Username:</strong> {currentUser?.username || 'N/A'}</p>
                                <p><strong>Name:</strong> {currentUser?.name || 'N/A'}</p>
                                <p><strong>Email:</strong> {currentUser?.email || 'N/A'}</p>
                                <p><strong>Roles:</strong> {currentUser?.roles?.join(', ') || 'N/A'}</p>
                                <p><strong>Login Time:</strong> {new Date().toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 gap-4">

                            {hasRole('REGISTRAR') && (
                                <>
                                    <QuickActionCard
                                        title="Student Management"
                                        description="Add, view, and manage student records"
                                        onClick={() => setActiveTab('students')}
                                        buttonText="Manage Students"
                                    />
                                    <QuickActionCard
                                        title="Course Management"
                                        description="Create and manage course offerings"
                                        onClick={() => setActiveTab('courses')}
                                        buttonText="Manage Courses"
                                    />
                                    <QuickActionCard
                                        title="Enrollment System"
                                        description="Manage student course enrollments"
                                        onClick={() => setActiveTab('enrollments')}
                                        buttonText="Manage Enrollments"
                                    />
                                </>
                            )}

                            {hasRole('FACULTY') && (
                                <QuickActionCard
                                    title="Grade Management"
                                    description="Submit and manage student grades"
                                    onClick={() => setActiveTab('grades')}
                                    buttonText="Manage Grades"
                                />
                            )}

                            {hasRole('STUDENT') && (
                                <QuickActionCard
                                    title="View Transcript"
                                    description="View your academic transcript and records"
                                    onClick={() => setActiveTab('transcripts')}
                                    buttonText="View Transcript"
                                />
                            )}

                            {hasRole('ADMIN') && (
                                <QuickActionCard
                                    title="User Management"
                                    description="Manage system users and permissions"
                                    onClick={() => setActiveTab('users')}
                                    buttonText="Manage Users"
                                />
                            )}

                            {/* Transcripts available for multiple roles */}
                            {(hasRole('REGISTRAR') || hasRole('ADMIN')) && (
                                <QuickActionCard
                                    title="Transcript Generation"
                                    description="Generate official academic transcripts"
                                    onClick={() => setActiveTab('transcripts')}
                                    buttonText="Generate Transcripts"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Activity Section (placeholder for future implementation) */}
                <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                    <div className="text-center py-8 text-gray-500">
                        <p>Recent activity feed will be implemented here</p>
                        <p className="text-sm mt-2">This will show recent enrollments, grade submissions, and system updates</p>
                    </div>
                </div>

                {/* System Status (for development) */}
                <div className="mt-8 bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">System Information:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
                        <div>
                            <p><strong>API Base URL:</strong></p>
                            <p className="font-mono">https://arms-webapp.azurewebsites.net/api</p>
                        </div>
                        <div>
                            <p><strong>Current User Role:</strong></p>
                            <p>{currentUser?.roles?.join(', ') || 'No roles assigned'}</p>
                        </div>
                        <div>
                            <p><strong>Session Status:</strong></p>
                            <p className="text-green-600">Active and authenticated</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;