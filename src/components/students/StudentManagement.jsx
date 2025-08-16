// components/students/StudentManagement.jsx
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
    UserPlus,
    Filter,
    Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { registrarAPI } from '../../services/api.js';

const StudentManagement = () => {
    const { authToken } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showForm, setShowForm] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [viewingStudent, setViewingStudent] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Auto-hide success message after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Load students on component mount
    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await registrarAPI.getStudents(authToken);
            setStudents(data);
        } catch (err) {
            setError(`Failed to load students: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Filter students based on search and status
    const filteredStudents = (students.data || []).filter(student => {
        const matchesSearch = !searchTerm ||
            `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''} ${student.email || ''} ${student.studentNumber || ''}`
                .toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || student.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Student Form Component
    const StudentForm = ({ student, onSave, onCancel }) => {
        const [formData, setFormData] = useState(student || {
            studentNumber: '',
            firstName: '',
            middleName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            dateOfBirth: '',
            gender: 'MALE',
            nationality: '',
            photoUrl: '',
            program: '',
            department: '',
            level: 'UNDERGRAD',
            dateOfEnrollment: new Date().toISOString().split('T')[0],
            expectedGraduationDate: '',
            status: 'ACTIVE',
            reasonForExit: '',
            remarks: ''
        });
        const [formLoading, setFormLoading] = useState(false);
        const [formError, setFormError] = useState('');

        const handleSubmit = async (e) => {
            e.preventDefault();
            setFormLoading(true);
            setFormError('');

            try {
                if (student) {
                    await registrarAPI.updateStudent(student.id, formData, authToken);
                } else {
                    console.log(JSON.stringify(formData));
                    await registrarAPI.createStudent(formData, authToken);
                }

                // Success: refresh list, show message, and close form
                await loadStudents();
                setSuccessMessage(student ? 'Student updated successfully!' : 'Student created successfully!');
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
                <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">
                                {student ? 'Edit Student' : 'Add New Student'}
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
                            {/* Personal Information */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Student Number *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.studentNumber}
                                            onChange={(e) => handleChange('studentNumber', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            disabled={formLoading}
                                            placeholder="e.g., MIU001"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.firstName}
                                            onChange={(e) => handleChange('firstName', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            disabled={formLoading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Middle Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.middleName}
                                            onChange={(e) => handleChange('middleName', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            disabled={formLoading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.lastName}
                                            onChange={(e) => handleChange('lastName', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            disabled={formLoading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            disabled={formLoading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={(e) => handleChange('phoneNumber', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            disabled={formLoading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.dateOfBirth}
                                            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            disabled={formLoading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Gender *
                                        </label>
                                        <select
                                            required
                                            value={formData.gender}
                                            onChange={(e) => handleChange('gender', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            disabled={formLoading}
                                        >
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nationality
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.nationality}
                                            onChange={(e) => handleChange('nationality', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            disabled={formLoading}
                                            placeholder="e.g., American, Indian, etc."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Photo URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.photoUrl}
                                            onChange={(e) => handleChange('photoUrl', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            disabled={formLoading}
                                            placeholder="https://example.com/photo.jpg"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Academic Information */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Program *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.program}
                                            onChange={(e) => handleChange('program', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            disabled={formLoading}
                                            placeholder="e.g., Computer Science, MBA, etc."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Department
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.department}
                                            onChange={(e) => handleChange('department', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            disabled={formLoading}
                                            placeholder="e.g., School of Computer Science"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Level *
                                        </label>
                                        <select
                                            required
                                            value={formData.level}
                                            onChange={(e) => handleChange('level', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            disabled={formLoading}
                                        >
                                            <option value="UNDERGRAD">Undergraduate</option>
                                            <option value="GRAD">Graduate</option>
                                            <option value="DOCTORAL">Doctoral</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date of Enrollment *
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.dateOfEnrollment}
                                            onChange={(e) => handleChange('dateOfEnrollment', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            disabled={formLoading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Expected Graduation Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.expectedGraduationDate}
                                            onChange={(e) => handleChange('expectedGraduationDate', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            disabled={formLoading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status *
                                        </label>
                                        <select
                                            required
                                            value={formData.status}
                                            onChange={(e) => handleChange('status', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            disabled={formLoading}
                                        >
                                            <option value="ACTIVE">Active</option>
                                            <option value="INACTIVE">Inactive</option>
                                            <option value="GRADUATED">Graduated</option>
                                            <option value="SUSPENDED">Suspended</option>
                                            <option value="WITHDRAWN">Withdrawn</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h4>
                                <div className="space-y-4">
                                    {(formData.status === 'WITHDRAWN' || formData.status === 'SUSPENDED') && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Reason for Exit
                                            </label>
                                            <textarea
                                                value={formData.reasonForExit}
                                                onChange={(e) => handleChange('reasonForExit', e.target.value)}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                disabled={formLoading}
                                                placeholder="Please provide reason for withdrawal/suspension..."
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Remarks
                                        </label>
                                        <textarea
                                            value={formData.remarks}
                                            onChange={(e) => handleChange('remarks', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            disabled={formLoading}
                                            placeholder="Additional notes or remarks..."
                                        />
                                    </div>
                                </div>
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
                                            {student ? 'Update Student' : 'Create Student'}
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

    // Student Details View Component
    const StudentDetailsView = ({ student, onClose }) => {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Student Details</h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Personal Information */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Full Name</label>
                                        <p className="text-gray-900">
                                            {student.firstName} {student.middleName ? `${student.middleName} ` : ''}{student.lastName}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Student Number</label>
                                        <p className="text-gray-900">{student.studentNumber}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Email</label>
                                        <p className="text-gray-900">{student.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Phone</label>
                                        <p className="text-gray-900">{student.phoneNumber || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                                        <p className="text-gray-900">{student.dateOfBirth || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Gender</label>
                                        <p className="text-gray-900">
                                            {student.gender === 'MALE' ? 'Male' :
                                                student.gender === 'FEMALE' ? 'Female' :
                                                    student.gender === 'OTHER' ? 'Other' : 'Not specified'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Nationality</label>
                                        <p className="text-gray-900">{student.nationality || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Status</label>
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                            student.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                                student.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                                                    student.status === 'GRADUATED' ? 'bg-blue-100 text-blue-800' :
                                                        student.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                      {student.status}
                    </span>
                                    </div>
                                </div>

                                {student.photoUrl && (
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-500 mb-2">Photo</label>
                                        <img
                                            src={student.photoUrl}
                                            alt={`${student.firstName} ${student.lastName}`}
                                            className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Academic Information */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Program</label>
                                        <p className="text-gray-900">{student.program}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Department</label>
                                        <p className="text-gray-900">{student.department || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Level</label>
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                            student.level === 'UNDERGRAD' ? 'bg-blue-100 text-blue-800' :
                                                student.level === 'GRAD' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-green-100 text-green-800'
                                        }`}>
                      {student.level === 'UNDERGRAD' ? 'Undergraduate' :
                          student.level === 'GRAD' ? 'Graduate' :
                              student.level === 'DOCTORAL' ? 'Doctoral' : student.level}
                    </span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Date of Enrollment</label>
                                        <p className="text-gray-900">{student.dateOfEnrollment}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Expected Graduation</label>
                                        <p className="text-gray-900">{student.expectedGraduationDate || 'Not set'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">GPA</label>
                                        <p className="text-gray-900">{student.gpa || 'Not calculated'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            {(student.reasonForExit || student.remarks) && (
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h4>
                                    <div className="space-y-4">
                                        {student.reasonForExit && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500">Reason for Exit</label>
                                                <p className="text-gray-900">{student.reasonForExit}</p>
                                            </div>
                                        )}
                                        {student.remarks && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500">Remarks</label>
                                                <p className="text-gray-900">{student.remarks}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-6 border-t">
                            <button
                                onClick={() => {
                                    setEditingStudent(student);
                                    onClose();
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Edit size={16} />
                                Edit Student
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

    // Delete student handler
    const handleDeleteStudent = async (studentId, isHardDelete = false) => {
        const confirmMessage = isHardDelete
            ? 'Are you sure you want to permanently delete this student? This action cannot be undone.'
            : 'Are you sure you want to delete this student?';

        if (window.confirm(confirmMessage)) {
            try {
                setLoading(true);
                setError('');

                if (isHardDelete) {
                    await registrarAPI.hardDeleteStudent(studentId, authToken);
                } else {
                    await registrarAPI.deleteStudent(studentId, authToken);
                }

                await loadStudents(); // Refresh the list
                setSuccessMessage(isHardDelete ? 'Student permanently deleted successfully!' : 'Student deleted successfully!');

            } catch (err) {
                console.error('Delete error:', err);
                setError(`Failed to delete student: ${err.message}`);
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
                        <h2 className="text-3xl font-bold text-gray-900">Student Management</h2>
                        <p className="text-gray-600 mt-1">Manage student records and information</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <UserPlus size={20} />
                        Add Student
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

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search students by name, email, or student number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="flex items-center gap-2">
                                <Filter size={16} className="text-gray-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="GRADUATED">Graduated</option>
                                    <option value="SUSPENDED">Suspended</option>
                                    <option value="WITHDRAWN">Withdrawn</option>
                                </select>
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
                        Showing {filteredStudents.length} of {students.length} students
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <Loader2 size={32} className="animate-spin mx-auto mb-4 text-blue-600" />
                            <p className="text-gray-600">Loading students...</p>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-600">No students found matching your criteria.</p>
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
                                        Student Number
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Program
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Level
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {student.firstName} {student.middleName ? `${student.middleName} ` : ''}{student.lastName}
                                                </div>
                                                {student.phoneNumber && (
                                                    <div className="text-sm text-gray-500">{student.phoneNumber}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{student.studentNumber}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{student.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{student.program}</div>
                                            {student.department && (
                                                <div className="text-sm text-gray-500">{student.department}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            student.level === 'UNDERGRAD' ? 'bg-blue-100 text-blue-800' :
                                student.level === 'GRAD' ? 'bg-purple-100 text-purple-800' :
                                    'bg-green-100 text-green-800'
                        }`}>
                          {student.level === 'UNDERGRAD' ? 'Undergraduate' :
                              student.level === 'GRAD' ? 'Graduate' :
                                  student.level === 'DOCTORAL' ? 'Doctoral' : student.level}
                        </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            student.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                student.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                                    student.status === 'GRADUATED' ? 'bg-blue-100 text-blue-800' :
                                        student.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                        }`}>
                          {student.status}
                        </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => setViewingStudent(student)}
                                                    className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setEditingStudent(student)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteStudent(student.id)}
                                                    className="text-red-600 hover:text-red-900 p-1 rounded"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modals */}
                {showForm && (
                    <StudentForm
                        onSave={() => setShowForm(false)}
                        onCancel={() => setShowForm(false)}
                    />
                )}

                {editingStudent && (
                    <StudentForm
                        student={editingStudent}
                        onSave={() => setEditingStudent(null)}
                        onCancel={() => setEditingStudent(null)}
                    />
                )}

                {viewingStudent && (
                    <StudentDetailsView
                        student={viewingStudent}
                        onClose={() => setViewingStudent(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default StudentManagement;