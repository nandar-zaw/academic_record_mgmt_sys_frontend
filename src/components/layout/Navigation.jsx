// components/layout/Navigation.jsx
import React from 'react';
import {
    GraduationCap,
    Home,
    Users,
    BookOpen,
    FileText,
    Building,
    Settings,
    LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navigation = ({ activeTab, setActiveTab }) => {
    const { currentUser, logout, hasRole } = useAuth();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['ADMIN', 'REGISTRAR', 'FACULTY', 'STUDENT'] },
        { id: 'students', label: 'Students', icon: Users, roles: ['ADMIN', 'REGISTRAR'] },
        { id: 'courses', label: 'Courses', icon: BookOpen, roles: ['ADMIN', 'REGISTRAR'] },
        { id: 'enrollments', label: 'Enrollments', icon: FileText, roles: ['ADMIN', 'REGISTRAR'] },
        { id: 'grades', label: 'Grades', icon: FileText, roles: ['FACULTY'] },
        { id: 'transcripts', label: 'Transcripts', icon: FileText, roles: ['ADMIN', 'REGISTRAR', 'STUDENT'] },
        { id: 'classrooms', label: 'Classrooms', icon: Building, roles: ['ADMIN', 'REGISTRAR'] },
        { id: 'users', label: 'User Management', icon: Settings, roles: ['ADMIN'] },
    ];

    const visibleNavItems = navItems.filter(item =>
        item.roles.some(role => hasRole(role))
    );

    const NavButton = ({ item }) => (
        <button
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                activeTab === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-200 hover:bg-blue-700 hover:text-white'
            }`}
        >
            <item.icon size={16} />
            {item.label}
        </button>
    );

    return (
        <nav className="bg-blue-800 text-white p-4">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <GraduationCap size={32} />
                    <div>
                        <h1 className="text-xl font-bold">MIU ARMS</h1>
                        <p className="text-blue-200 text-sm">Academic Records Management</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm">Welcome back!</p>
                        <p className="font-medium">
                            {currentUser?.name || currentUser?.username || 'User'}
                        </p>
                        {currentUser?.roles && (
                            <p className="text-xs text-blue-200">
                                {currentUser.roles.join(', ')}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={logout}
                        className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </div>

            <div className="flex gap-2 flex-wrap">
                {visibleNavItems.map(item => (
                    <NavButton key={item.id} item={item} />
                ))}
            </div>
        </nav>
    );
};

export default Navigation;