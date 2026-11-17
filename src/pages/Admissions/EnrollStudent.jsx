import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../config/api';
import { enrollStudent } from '../../services/studentService';
import { UserPlus, CheckCircle, ArrowRight, Building2, Calendar, Phone, Mail, User, ShieldCheck } from 'lucide-react';

const DEFAULT_DEPARTMENTS = [
  { id: 1, name: 'Computer Science & Engineering', code: 'CSE' },
  { id: 2, name: 'Information Technology', code: 'IT' },
  { id: 3, name: 'Electronics & Communication', code: 'ECE' },
  { id: 4, name: 'Mechanical Engineering', code: 'ME' },
];

const DEFAULT_BATCHES = [
  { id: 1, name: '2024-2028 (Semester 5)' },
  { id: 2, name: '2023-2027 (Semester 7)' },
  { id: 3, name: '2025-2029 (Semester 3)' },
];

export default function EnrollStudent() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [batches, setBatches] = useState(DEFAULT_BATCHES);

  const [formData, setFormData] = useState({
    enrollmentNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '+919876543210',
    gender: 'MALE',
    dateOfBirth: '2005-06-15',
    departmentId: '1',
    batchId: '1',
    enrollmentDate: new Date().toISOString().split('T')[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastEnrolled, setLastEnrolled] = useState(null);

  // Dynamically load departments from backend
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const deptRes = await apiClient.get('/api/v1/departments');
        const deptData = deptRes.data?.data || deptRes.data;
        if (Array.isArray(deptData) && deptData.length > 0) {
          setDepartments(deptData.map((d) => ({
            id: d.id,
            name: d.name,
            code: d.code,
          })));
        }
      } catch {
        // Fallback to presets
      }

      try {
        const batchRes = await apiClient.get('/api/v1/academic/batches');
        const batchData = batchRes.data?.data || batchRes.data;
        if (Array.isArray(batchData) && batchData.length > 0) {
          setBatches(batchData.map((b) => ({
            id: b.id,
            name: b.name || b.academicYear || `Batch ${b.id}`,
          })));
        }
      } catch {
        // Fallback to presets
      }
    };
    fetchMetadata();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerateEnrollmentNo = () => {
    const currentYear = new Date().getFullYear();
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({
      ...prev,
      enrollmentNumber: `ENR-${currentYear}-${randomSeq}`,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast.error('Please complete all required student profile fields.');
      return;
    }

    const selectedDept = departments.find((d) => String(d.id) === String(formData.departmentId));
    const selectedBatch = batches.find((b) => String(b.id) === String(formData.batchId));

    setIsSubmitting(true);

    try {
      const payload = {
        enrollmentNumber: formData.enrollmentNumber.trim() || `ENR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || '+919876543210',
        gender: formData.gender || 'MALE',
        dateOfBirth: formData.dateOfBirth || '2005-06-15',
        enrollmentDate: formData.enrollmentDate || new Date().toISOString().split('T')[0],
        departmentId: Number(formData.departmentId),
        department: selectedDept ? selectedDept.name : 'Computer Science and Engineering',
        batchId: Number(formData.batchId),
        batch: selectedBatch ? selectedBatch.name : '2024-2028',
        status: 'ACTIVE',
      };

      const result = await enrollStudent(payload);
      const studentData = result?.data || result;
      toast.success(`Student ${payload.firstName} ${payload.lastName} enrolled successfully!`);
      setLastEnrolled({
        ...studentData,
        firstName: payload.firstName,
        lastName: payload.lastName,
        enrollmentNumber: payload.enrollmentNumber,
        email: payload.email,
        department: payload.department,
        batch: payload.batch,
      });

      // Reset form
      setFormData({
        enrollmentNumber: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '+919876543210',
        gender: 'MALE',
        dateOfBirth: '2005-06-15',
        departmentId: departments[0] ? String(departments[0].id) : '1',
        batchId: batches[0] ? String(batches[0].id) : '1',
        enrollmentDate: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.error('Enrollment error:', err);
      const errorMsg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        err.message ||
        'Failed to enroll student. Please check input details.';

      if (err.response?.status === 400 || err.response?.status === 409) {
        toast.error(`Enrollment Conflict: ${errorMsg}`);
      } else if (err.response?.status === 403) {
        toast.error('Access Denied: You do not have permissions to enroll students.');
      } else {
        toast.error(`Error: ${errorMsg}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center space-x-3">
            <span className="p-2.5 bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-xl shadow-sm">
              <UserPlus className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admissions &amp; Student Enrollment</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Register a new student profile into the institutional repository with automated academic partition binding.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard/students')}
              className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm transition"
            >
              Student Directory
            </button>
          </div>
        </div>

        {/* Recently Enrolled Confirmation Banner */}
        {lastEnrolled && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-emerald-950 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-emerald-900">Student Profile Successfully Registered</h3>
                  <div className="mt-1 text-xs text-emerald-800 space-y-1">
                    <p>
                      <strong>Name:</strong> {lastEnrolled.firstName} {lastEnrolled.lastName} •{' '}
                      <strong>Enrollment #:</strong> <span className="font-mono font-bold">{lastEnrolled.enrollmentNumber}</span> •{' '}
                      <strong>Email:</strong> {lastEnrolled.email}
                    </p>
                    <p className="text-emerald-700">
                      <strong>Program Cohort:</strong> {lastEnrolled.department} ({lastEnrolled.batch})
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/dashboard/students')}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-700 text-white text-xs font-semibold rounded-lg hover:bg-emerald-800 transition shrink-0"
              >
                View Profile <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Enrollment Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/70 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-800">Student Identity &amp; Academic Placement</h2>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200/50 px-2.5 py-0.5 rounded-full font-semibold">
              <ShieldCheck className="w-3 h-3" /> Multi-Tenant Scoped
            </span>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-y-5 gap-x-4 sm:grid-cols-2">
              {/* Enrollment Number */}
              <div className="sm:col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="enrollmentNumber" className="block text-xs font-bold text-slate-700">
                    Enrollment / Roll Number
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateEnrollmentNo}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline"
                  >
                    Auto-Generate Canonical ID
                  </button>
                </div>
                <input
                  type="text"
                  name="enrollmentNumber"
                  id="enrollmentNumber"
                  value={formData.enrollmentNumber}
                  onChange={handleChange}
                  placeholder="e.g. ENR-2026-0842 (leave blank to auto-generate)"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono transition"
                />
                <p className="mt-1 text-[11px] text-slate-500">Unique institutional identifier partitioned per tenant boundary.</p>
              </div>

              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-xs font-bold text-slate-700 mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g. Aarav"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-xs font-bold text-slate-700 mb-1">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Sharma"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">
                  Institutional Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. aarav.sharma@college.edu"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label htmlFor="phone" className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +919876543210"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-mono"
                />
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-xs font-bold text-slate-700 mb-1">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  name="gender"
                  id="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className="block text-xs font-bold text-slate-700 mb-1">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  id="dateOfBirth"
                  required
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Academic Department */}
              <div>
                <label htmlFor="departmentId" className="block text-xs font-bold text-slate-700 mb-1">
                  Academic Department / Branch <span className="text-rose-500">*</span>
                </label>
                <select
                  name="departmentId"
                  id="departmentId"
                  required
                  value={formData.departmentId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} {dept.code ? `(${dept.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Academic Cohort / Batch */}
              <div>
                <label htmlFor="batchId" className="block text-xs font-bold text-slate-700 mb-1">
                  Academic Batch / Cohort <span className="text-rose-500">*</span>
                </label>
                <select
                  name="batchId"
                  id="batchId"
                  required
                  value={formData.batchId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    enrollmentNumber: '',
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '+919876543210',
                    gender: 'MALE',
                    dateOfBirth: '2005-06-15',
                    departmentId: departments[0] ? String(departments[0].id) : '1',
                    batchId: batches[0] ? String(batches[0].id) : '1',
                    enrollmentDate: new Date().toISOString().split('T')[0],
                  })
                }
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Enrolling Student...
                  </>
                ) : (
                  'Enroll Student'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
