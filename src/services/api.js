// services/api.js
const API_BASE_URL = 'https://arms-webapp.azurewebsites.net/api';

// Base API utility
const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        return data;
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Network error: Unable to connect to server');
        }
        throw error;
    }
};

// Helper to add auth token to requests
const authenticatedRequest = (endpoint, options = {}, token) => {
    return apiRequest(endpoint, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
        },
    });
};

// Auth API
export const authAPI = {
    login: async (credentials) => {
        return apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    },
};

// Registrar API
export const registrarAPI = {
    // Students
    getStudents: (token) =>
        authenticatedRequest('/registrar/students', { method: 'GET' }, token),

    createStudent: (student, token) =>
        authenticatedRequest('/registrar/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(student),
        }, token),

    getStudent: (id, token) =>
        authenticatedRequest(`/registrar/students/${id}`, { method: 'GET' }, token),

    updateStudent: (id, student, token) =>
        authenticatedRequest(`/registrar/students/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(student),
        }, token),

    deleteStudent: (id, token) =>
        authenticatedRequest(`/registrar/students/${id}`, { method: 'DELETE' }, token),

    hardDeleteStudent: (id, token) =>
        authenticatedRequest(`/registrar/students/${id}/hard`, { method: 'DELETE' }, token),

    // Courses
    getCourses: (token) =>
        authenticatedRequest('/registrar/courses', { method: 'GET' }, token),

    createCourse: (course, token) =>
        authenticatedRequest('/registrar/courses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(course),
        }, token),

    updateCourse: (id, course, token) =>
        authenticatedRequest(`/registrar/courses/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(course),
        }, token),

    deleteCourse: (id, token) =>
        authenticatedRequest(`/registrar/courses/${id}`, { method: 'DELETE' }, token),

    // Enrollments
    createBulkEnrollments: (enrollments, token) =>
        authenticatedRequest('/registrar/enrollments/bulk', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(enrollments),
        }, token),

    bulkEnrollStudents: (data, token) =>
        authenticatedRequest('/registrar/enrollments/bulk-students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }, token),

    // Classrooms
    getClassrooms: (token) =>
        authenticatedRequest('/registrar/classrooms', { method: 'GET' }, token),

    createClassroom: (classroom, token) =>
        authenticatedRequest('/registrar/classroom', {
            method: 'POST',
            body: JSON.stringify(classroom),
        }, token),

    startClassroomMembership: (classroomId, studentId, token) =>
        authenticatedRequest(`/registrar/classrooms/${classroomId}/students/${studentId}/start`, {
            method: 'POST',
        }, token),

    endClassroomMembership: (membershipId, token) =>
        authenticatedRequest(`/registrar/classrooms/memberships/${membershipId}/end`, {
            method: 'POST',
        }, token),

    assignClassroom: (assignment, token) =>
        authenticatedRequest('/registrar/classrooms/assign', {
            method: 'POST',
            body: JSON.stringify(assignment),
        }, token),
};

// Faculty API
export const facultyAPI = {
    submitGrade: (gradeData, token) =>
        authenticatedRequest('/faculty/grade', {
            method: 'POST',
            body: JSON.stringify(gradeData),
        }, token),
};

// Admin API
export const adminAPI = {
    getUsers: (token) =>
        authenticatedRequest('/admin/users', { method: 'GET' }, token),

    createUser: (user, token) =>
        authenticatedRequest('/admin/users', {
            method: 'POST',
            body: JSON.stringify(user),
        }, token),

    getUser: (username, token) =>
        authenticatedRequest(`/admin/users/${username}`, { method: 'GET' }, token),

    updateUserRoles: (username, roles, token) =>
        authenticatedRequest(`/admin/users/${username}/roles`, {
            method: 'POST',
            body: JSON.stringify(roles),
        }, token),

    toggleUserEnabled: (username, enabled, token) =>
        authenticatedRequest(`/admin/users/${username}/enabled`, {
            method: 'PATCH',
            body: JSON.stringify({ enabled }),
        }, token),
};

// Student API
export const studentAPI = {
    getStudent: (id, token) =>
        authenticatedRequest(`/student/${id}`, { method: 'GET' }, token),

    getTranscript: (id, token) =>
        authenticatedRequest(`/student/${id}/transcript`, { method: 'GET' }, token),
};