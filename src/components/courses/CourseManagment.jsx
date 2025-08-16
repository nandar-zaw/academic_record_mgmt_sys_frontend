// components/courses/CourseManagement.jsx
import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    AlertCircle,
    Loader2,
    X,
    Save,
    BookOpen,
    Filter,
    Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { registrarAPI } from '../../services/api.js';

const CourseManagement = () => {
    const { authToken } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [viewingCourse, setViewingCourse] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Auto-hide success message after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Load courses on component mount
    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await registrarAPI.getCourses(authToken);
            setCourses(data);
        } catch (err) {
            setError(`Failed to load courses: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Filter courses based on search
    const filteredCourses = (courses.data || []).filter(course => {
        const matchesSearch = !searchTerm ||
            `${course.courseCode || ''} ${course.title || ''}`
                .toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    // Course Form Component
    const CourseForm = ({ course, onSave, onCancel }) => {
        const [formData, setFormData] = useState(course || {
            courseCode: '',
            title: '',
            creditHours: 3
        });
        const [formLoading, setFormLoading] = useState(false);
        const [formError, setFormError] = useState('');

        const handleSubmit = async (e) => {
            e.preventDefault();
            setFormLoading(true);
            setFormError('');

            try {
                // Convert creditHours to number
                const courseData = {
                    ...formData,
                    creditHours: parseInt(formData.creditHours)
                };

                if (course) {
                    console.log(JSON.stringify(courseData, null, 2));
                    await registrarAPI.updateCourse(course.id, courseData, authToken);
                } else {
                    console.log(JSON.stringify(courseData, null, 2));
                    await registrarAPI.createCourse(courseData, authToken);
                }

                // Success: refresh list, show message, and close form
                await loadCourses();
                setSuccessMessage(course ? 'Course updated successfully!' : 'Course created successfully!');
                onSave(); // This closes the form

            } catch (err) {
                console.error('Form submission error:', err);
                setFormError(err.message);
            } finally {
                setFormLoading(false);
            }
        };

        const handleChange = (field, value) => {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
            if (formError) setFormError('');
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg w-full max-w-lg">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">
                                {course ? 'Edit Course' : 'Add New Course'}
                            </h3>
                            <button
                                onClick={onCancel}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-red-700 text-sm font-medium">Error</p>
                                    <p className="text-red-600 text-sm">{formError}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Course Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Course Code *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.courseCode}
                                    onChange={(e) => handleChange('courseCode', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={formLoading}
                                    placeholder="e.g., CS401, MBA650"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Unique identifier for the course
                                </p>
                            </div>

                            {/* Course Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Course Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={formLoading}
                                    placeholder="e.g., Algorithms and Data Structures"
                                />
                            </div>

                            {/* Credit Hours */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Credit Hours *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max="12"
                                    value={formData.creditHours}
                                    onChange={(e) => handleChange('creditHours', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={formLoading}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Number of credit hours (typically 1-12)
                                </p>
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-3 pt-6 border-t">
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {formLoading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} />
                                            {course ? 'Update Course' : 'Create Course'}
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    disabled={formLoading}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    // Course Details View Component
    const CourseDetailsView = ({ course, onClose }) => {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg w-full max-w-lg">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Course Details</h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Course Information */}
                            <div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Course Code</label>
                                        <p className="text-xl font-bold text-blue-600">{course.courseCode}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Course Title</label>
                                        <p className="text-lg text-gray-900">{course.title}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Credit Hours</label>
                                        <p className="text-gray-900">
                                            <span className="text-lg font-semibold">{course.creditHours}</span> credit{course.creditHours !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Course Information</h4>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p><strong>Course ID:</strong> {course.id}</p>
                                    {course.createdAt && (
                                        <p><strong>Created:</strong> {new Date(course.createdAt).toLocaleDateString()}</p>
                                    )}
                                    {course.updatedAt && (
                                        <p><strong>Last Updated:</strong> {new Date(course.updatedAt).toLocaleDateString()}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6 border-t">
                            <button
                                onClick={() => {
                                    setEditingCourse(course);
                                    onClose();
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Edit size={16} />
                                Edit Course
                            </button>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Delete course handler
    const handleDeleteCourse = async (courseId) => {
        if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            try {
                setLoading(true);
                setError('');

                await registrarAPI.deleteCourse(courseId, authToken);
                await loadCourses(); // Refresh the list
                setSuccessMessage('Course deleted successfully!');

            } catch (err) {
                console.error('Delete error:', err);
                setError(`Failed to delete course: ${err.message}`);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Course Management</h2>
                        <p className="text-gray-600 mt-1">Manage course offerings and curriculum</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <BookOpen size={20} />
                        Add Course
                    </button>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-green-700 text-sm font-medium">Success</p>
                            <p className="text-green-600 text-sm">{successMessage}</p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-red-700 text-sm font-medium">Error</p>
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search courses by code or title..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Export Button */}
                            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                <Download size={16} />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Results Summary */}
                    <div className="p-4 bg-gray-50 text-sm text-gray-600">
                        Showing {filteredCourses.length} of {courses.length} courses
                    </div>
                </div>

                {/* Courses Display */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <Loader2 size={32} className="animate-spin mx-auto mb-4 text-blue-600" />
                        <p className="text-gray-600">Loading courses...</p>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 mb-4">
                            {searchTerm ? 'No courses found matching your search.' : 'No courses available.'}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Add Your First Course
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course) => (
                            <div key={course.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                                <div className="p-6">
                                    {/* Course Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-blue-600">{course.courseCode}</h3>
                                            <p className="text-sm text-gray-600">{course.creditHours} Credit{course.creditHours !== 1 ? 's' : ''}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => setViewingCourse(course)}
                                                className="text-gray-400 hover:text-blue-600 p-1 rounded transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => setEditingCourse(course)}
                                                className="text-gray-400 hover:text-blue-600 p-1 rounded transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCourse(course.id)}
                                                className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Course Title */}
                                    <h4 className="font-semibold text-gray-900 mb-3 line-clamp-2">
                                        {course.title}
                                    </h4>

                                    {/* Course Stats */}
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Course ID:</span>
                                            <span className="font-medium text-gray-900">{course.id}</span>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => setViewingCourse(course)}
                                            className="w-full bg-blue-50 text-blue-600 py-2 rounded hover:bg-blue-100 transition-colors text-sm font-medium"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modals */}
                {showForm && (
                    <CourseForm
                        onSave={() => setShowForm(false)}
                        onCancel={() => setShowForm(false)}
                    />
                )}

                {editingCourse && (
                    <CourseForm
                        course={editingCourse}
                        onSave={() => setEditingCourse(null)}
                        onCancel={() => setEditingCourse(null)}
                    />
                )}

                {viewingCourse && (
                    <CourseDetailsView
                        course={viewingCourse}
                        onClose={() => setViewingCourse(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default CourseManagement;