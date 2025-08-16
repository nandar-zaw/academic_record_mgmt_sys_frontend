// components/enrollments/EnrollmentManagement.jsx
import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Users,
    BookOpen,
    AlertCircle,
    Loader2,
    X,
    Save,
    GraduationCap,
    Filter,
    Calendar,
    UserPlus,
    BookPlus,
    CheckCircle,
    Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { registrarAPI } from '../../services/api.js';

const EnrollmentManagement = () => {
    const { authToken } = useAuth();
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [yearFilter, setYearFilter] = useState('2025');
    const [termFilter, setTermFilter] = useState('ALL');
    const [showBulkStudentsForm, setShowBulkStudentsForm] = useState(false);
    const [showBulkCoursesForm, setShowBulkCoursesForm] = useState(false);

    // Auto-hide success message after 4 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 4000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Load data on component mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const [studentsData, coursesData] = await Promise.all([
                registrarAPI.getStudents(authToken),
                registrarAPI.getCourses(authToken)
            ]);
            setStudents(studentsData);
            setCourses(coursesData);

            // Mock enrollments data (since we don't have a GET endpoint)
            // In a real app, this would come from an API
            setEnrollments([
                {
                    id: 1,
                    studentId: studentsData[0]?.id,
                    courseId: coursesData[0]?.id,
                    year: 2025,
                    term: 'SPRING',
                    enrollmentDate: '2025-01-15',
                    status: 'ENROLLED'
                },
                {
                    id: 2,
                    studentId: studentsData[1]?.id,
                    courseId: coursesData[1]?.id,
                    year: 2025,
                    term: 'SPRING',
                    enrollmentDate: '2025-01-15',
                    status: 'ENROLLED'
                }
            ]);
        } catch (err) {
            setError(`Failed to load data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Filter enrollments
    const filteredEnrollments = (enrollments.data || []).filter(enrollment => {
        const student = students.find(s => s.id === enrollment.studentId);
        const course = courses.find(c => c.id === enrollment.courseId);

        const matchesSearch = !searchTerm ||
            `${student?.firstName || ''} ${student?.lastName || ''} ${student?.studentNumber || ''} ${course?.courseCode || ''} ${course?.title || ''}`
                .toLowerCase().includes(searchTerm.toLowerCase());

        const matchesYear = enrollment.year.toString() === yearFilter;
        const matchesTerm = termFilter === 'ALL' || enrollment.term === termFilter;

        return matchesSearch && matchesYear && matchesTerm;
    });

    // Bulk Students Form - Enroll multiple students in one course
    const BulkStudentsForm = ({ onSave, onCancel }) => {
        const [formData, setFormData] = useState({
            courseId: '',
            year: parseInt(yearFilter),
            term: 'SPRING',
            studentIds: []
        });
        const [formLoading, setFormLoading] = useState(false);
        const [formError, setFormError] = useState('');

        const handleSubmit = async (e) => {
            e.preventDefault();
            setFormLoading(true);
            setFormError('');

            if (formData.studentIds.length === 0) {
                setFormError('Please select at least one student');
                setFormLoading(false);
                return;
            }

            try {
                const enrollmentData = {
                    courseId: parseInt(formData.courseId),
                    year: parseInt(formData.year),
                    term: formData.term,
                    studentIds: formData.studentIds.map(id => parseInt(id))
                };

                await registrarAPI.bulkEnrollStudents(enrollmentData, authToken);

                // Success
                setSuccessMessage(`Successfully enrolled ${formData.studentIds.length} students in the course!`);
                onSave();

            } catch (err) {
                console.error('Bulk enrollment error:', err);
                setFormError(err.message);
            } finally {
                setFormLoading(false);
            }
        };

        const handleStudentToggle = (studentId) => {
            setFormData(prev => ({
                ...prev,
                studentIds: prev.studentIds.includes(studentId)
                    ? prev.studentIds.filter(id => id !== studentId)
                    : [...prev.studentIds, studentId]
            }));
        };

        const selectedCourse = (courses.data || []).find(c => c.id === parseInt(formData.courseId));

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">
                                Enroll Multiple Students in Course
                            </h3>
                            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
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
                            {/* Course Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Course *
                                    </label>
                                    <select
                                        required
                                        value={formData.courseId}
                                        onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={formLoading}
                                    >
                                        <option value="">Select Course</option>
                                        {(courses.data || []).map(course => (
                                            <option key={course.id} value={course.id}>
                                                {course.courseCode} - {course.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Year *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="2020"
                                        max="2030"
                                        value={formData.year}
                                        onChange={(e) => setFormData({...formData, year: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={formLoading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Term *
                                    </label>
                                    <select
                                        required
                                        value={formData.term}
                                        onChange={(e) => setFormData({...formData, term: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={formLoading}
                                    >
                                        <option value="SPRING">Spring</option>
                                        <option value="SUMMER">Summer</option>
                                        <option value="FALL">Fall</option>
                                        <option value="WINTER">Winter</option>
                                    </select>
                                </div>
                            </div>

                            {/* Course Info */}
                            {selectedCourse && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">Selected Course</h4>
                                    <p className="text-blue-800">
                                        <span className="font-semibold">{selectedCourse.courseCode}</span> - {selectedCourse.title}
                                    </p>
                                    <p className="text-blue-700 text-sm">{selectedCourse.creditHours} Credit Hours</p>
                                </div>
                            )}

                            {/* Student Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Select Students * ({formData.studentIds.length} selected)
                                </label>
                                <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                                    <div className="space-y-2">
                                        {(students.data || []).map(student => (
                                            <label key={student.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.studentIds.includes(student.id)}
                                                    onChange={() => handleStudentToggle(student.id)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">
                                                        {student.firstName} {student.lastName}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {student.studentNumber} • {student.email}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    student.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                          {student.status}
                        </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-3 pt-6 border-t">
                                <button
                                    type="submit"
                                    disabled={formLoading || formData.studentIds.length === 0}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {formLoading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Enrolling...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={20} />
                                            Enroll {formData.studentIds.length} Student{formData.studentIds.length !== 1 ? 's' : ''}
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

    // Bulk Courses Form - Enroll one student in multiple courses
    const BulkCoursesForm = ({ onSave, onCancel }) => {
        const [formData, setFormData] = useState({
            studentId: '',
            year: parseInt(yearFilter),
            term: 'SPRING',
            courseIds: []
        });
        const [formLoading, setFormLoading] = useState(false);
        const [formError, setFormError] = useState('');

        const handleSubmit = async (e) => {
            e.preventDefault();
            setFormLoading(true);
            setFormError('');

            if (formData.courseIds.length === 0) {
                setFormError('Please select at least one course');
                setFormLoading(false);
                return;
            }

            try {
                const enrollmentData = {
                    studentId: parseInt(formData.studentId),
                    year: parseInt(formData.year),
                    term: formData.term,
                    courseIds: formData.courseIds.map(id => parseInt(id))
                };

                await registrarAPI.createBulkEnrollments(enrollmentData, authToken);

                // Success
                setSuccessMessage(`Successfully enrolled student in ${formData.courseIds.length} courses!`);
                onSave();

            } catch (err) {
                console.error('Bulk enrollment error:', err);
                setFormError(err.message);
            } finally {
                setFormLoading(false);
            }
        };

        const handleCourseToggle = (courseId) => {
            setFormData(prev => ({
                ...prev,
                courseIds: prev.courseIds.includes(courseId)
                    ? prev.courseIds.filter(id => id !== courseId)
                    : [...prev.courseIds, courseId]
            }));
        };

        const selectedStudent = students.find(s => s.id === parseInt(formData.studentId));

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">
                                Enroll Student in Multiple Courses
                            </h3>
                            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
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
                            {/* Student and Term Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Student *
                                    </label>
                                    <select
                                        required
                                        value={formData.studentId}
                                        onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={formLoading}
                                    >
                                        <option value="">Select Student</option>
                                        {students.map(student => (
                                            <option key={student.id} value={student.id}>
                                                {student.firstName} {student.lastName} ({student.studentNumber})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Year *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="2020"
                                        max="2030"
                                        value={formData.year}
                                        onChange={(e) => setFormData({...formData, year: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={formLoading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Term *
                                    </label>
                                    <select
                                        required
                                        value={formData.term}
                                        onChange={(e) => setFormData({...formData, term: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={formLoading}
                                    >
                                        <option value="SPRING">Spring</option>
                                        <option value="SUMMER">Summer</option>
                                        <option value="FALL">Fall</option>
                                        <option value="WINTER">Winter</option>
                                    </select>
                                </div>
                            </div>

                            {/* Student Info */}
                            {selectedStudent && (
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-green-900 mb-2">Selected Student</h4>
                                    <p className="text-green-800">
                                        <span className="font-semibold">{selectedStudent.firstName} {selectedStudent.lastName}</span>
                                    </p>
                                    <p className="text-green-700 text-sm">
                                        {selectedStudent.studentNumber} • {selectedStudent.email} • {selectedStudent.program}
                                    </p>
                                </div>
                            )}

                            {/* Course Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Select Courses * ({formData.courseIds.length} selected)
                                </label>
                                <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                                    <div className="space-y-2">
                                        {courses.map(course => (
                                            <label key={course.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.courseIds.includes(course.id)}
                                                    onChange={() => handleCourseToggle(course.id)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">
                                                        {course.courseCode} - {course.title}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {course.creditHours} Credit Hours
                                                    </p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-3 pt-6 border-t">
                                <button
                                    type="submit"
                                    disabled={formLoading || formData.courseIds.length === 0}
                                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {formLoading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Enrolling...
                                        </>
                                    ) : (
                                        <>
                                            <BookPlus size={20} />
                                            Enroll in {formData.courseIds.length} Course{formData.courseIds.length !== 1 ? 's' : ''}
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

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Enrollment Management</h2>
                        <p className="text-gray-600 mt-1">Manage student course enrollments and registrations</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowBulkStudentsForm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <UserPlus size={20} />
                            Enroll Students
                        </button>
                        <button
                            onClick={() => setShowBulkCoursesForm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <BookPlus size={20} />
                            Enroll in Courses
                        </button>
                    </div>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                        <CheckCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
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

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by student name, student number, or course..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex gap-3">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-gray-400" />
                                    <select
                                        value={yearFilter}
                                        onChange={(e) => setYearFilter(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="2024">2024</option>
                                        <option value="2025">2025</option>
                                        <option value="2026">2026</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Filter size={16} className="text-gray-400" />
                                    <select
                                        value={termFilter}
                                        onChange={(e) => setTermFilter(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="ALL">All Terms</option>
                                        <option value="SPRING">Spring</option>
                                        <option value="SUMMER">Summer</option>
                                        <option value="FALL">Fall</option>
                                        <option value="WINTER">Winter</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Summary */}
                    <div className="p-4 bg-gray-50 text-sm text-gray-600">
                        Showing {filteredEnrollments.length} enrollment{filteredEnrollments.length !== 1 ? 's' : ''} for {yearFilter} {termFilter !== 'ALL' ? termFilter : ''}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Students</p>
                                <p className="text-2xl font-bold text-blue-600">{students.length}</p>
                            </div>
                            <Users size={24} className="text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Available Courses</p>
                                <p className="text-2xl font-bold text-green-600">{courses.length}</p>
                            </div>
                            <BookOpen size={24} className="text-green-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Active Enrollments</p>
                                <p className="text-2xl font-bold text-purple-600">{filteredEnrollments.length}</p>
                            </div>
                            <GraduationCap size={24} className="text-purple-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Current Term</p>
                                <p className="text-lg font-bold text-orange-600">{termFilter !== 'ALL' ? termFilter : 'ALL TERMS'}</p>
                            </div>
                            <Clock size={24} className="text-orange-600" />
                        </div>
                    </div>
                </div>

                {/* Enrollments Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <Loader2 size={32} className="animate-spin mx-auto mb-4 text-blue-600" />
                            <p className="text-gray-600">Loading enrollments...</p>
                        </div>
                    ) : filteredEnrollments.length === 0 ? (
                        <div className="p-8 text-center">
                            <GraduationCap size={48} className="mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-600 mb-4">
                                {searchTerm || termFilter !== 'ALL' ? 'No enrollments found matching your criteria.' : 'No enrollments available.'}
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setShowBulkStudentsForm(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Enroll Students in Course
                                </button>
                                <button
                                    onClick={() => setShowBulkCoursesForm(true)}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Enroll Student in Courses
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Course
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Academic Term
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Enrollment Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {filteredEnrollments.map((enrollment) => {
                                    const student = students.find(s => s.id === enrollment.studentId);
                                    const course = courses.find(c => c.id === enrollment.courseId);

                                    return (
                                        <tr key={enrollment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {student?.firstName} {student?.lastName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {student?.studentNumber} • {student?.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {course?.courseCode}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {course?.title}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {course?.creditHours} Credits
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {enrollment.term} {enrollment.year}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {enrollment.enrollmentDate}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              enrollment.status === 'ENROLLED' ? 'bg-green-100 text-green-800' :
                                  enrollment.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                      enrollment.status === 'DROPPED' ? 'bg-red-100 text-red-800' :
                                          'bg-yellow-100 text-yellow-800'
                          }`}>
                            {enrollment.status}
                          </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Summary Section */}
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-medium text-blue-900">Spring Enrollments</h4>
                            <p className="text-2xl font-bold text-blue-600">
                                {enrollments.filter(e => e.term === 'SPRING' && e.year.toString() === yearFilter).length}
                            </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-medium text-green-900">Summer Enrollments</h4>
                            <p className="text-2xl font-bold text-green-600">
                                {enrollments.filter(e => e.term === 'SUMMER' && e.year.toString() === yearFilter).length}
                            </p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                            <h4 className="font-medium text-orange-900">Fall Enrollments</h4>
                            <p className="text-2xl font-bold text-orange-600">
                                {enrollments.filter(e => e.term === 'FALL' && e.year.toString() === yearFilter).length}
                            </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <h4 className="font-medium text-purple-900">Winter Enrollments</h4>
                            <p className="text-2xl font-bold text-purple-600">
                                {enrollments.filter(e => e.term === 'WINTER' && e.year.toString() === yearFilter).length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                {showBulkStudentsForm && (
                    <BulkStudentsForm
                        onSave={() => setShowBulkStudentsForm(false)}
                        onCancel={() => setShowBulkStudentsForm(false)}
                    />
                )}

                {showBulkCoursesForm && (
                    <BulkCoursesForm
                        onSave={() => setShowBulkCoursesForm(false)}
                        onCancel={() => setShowBulkCoursesForm(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default EnrollmentManagement;