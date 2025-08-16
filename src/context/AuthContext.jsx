// context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [authToken, setAuthToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const savedToken = localStorage.getItem('authToken');
        const savedUser = localStorage.getItem('currentUser');

        if (savedToken && savedUser) {
            try {
                setAuthToken(savedToken);
                setCurrentUser(JSON.parse(savedUser));
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error loading saved session:', error);
                // Clear invalid stored data
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            const response = await authAPI.login(credentials);

            // Handle your API response structure
            const data = response.data || response;
            const token = data.accessToken || data.token;

            // Create user object from the response
            const user = {
                username: credentials.username, // Use the username from login form
                email: credentials.username,    // Assuming username is email
                name: credentials.username,     // You can update this if API provides name
                roles: data.roles || [],       // Use roles from API response
                tokenType: data.tokenType,
                expiresInMs: data.expiresInMs
            };

            // Update state
            setAuthToken(token);
            setCurrentUser(user);
            setIsAuthenticated(true);

            // Persist to localStorage
            localStorage.setItem('authToken', token);
            localStorage.setItem('currentUser', JSON.stringify(user));

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setAuthToken(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    };

    // Helper function to check if user has specific role
    const hasRole = (role) => {
        if (!currentUser?.roles) return false;

        // Handle both formats: 'REGISTRAR' and 'ROLE_REGISTRAR'
        const userRoles = currentUser.roles.map(r =>
            r.startsWith('ROLE_') ? r.substring(5) : r
        );

        return userRoles.includes(role);
    };

    // Helper function to check multiple roles
    const hasAnyRole = (roles) => {
        return roles.some(role => hasRole(role));
    };

    const value = {
        isAuthenticated,
        currentUser,
        authToken,
        isLoading,
        login,
        logout,
        hasRole,
        hasAnyRole,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};