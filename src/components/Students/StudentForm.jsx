// src/components/Students/StudentForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { studentService } from '../../services/studentService';
import toast from 'react-hot-toast';
import { 
  FiUser, 
  FiCalendar, 
  FiMail, 
  FiPhone, 
  FiMapPin,
  FiUpload,
  FiX,
  FiCheck,
  FiLoader,
  FiEdit,
  FiUserPlus
} from 'react-icons/fi';
import { 
  MdClass,
  MdSchool,
  MdPerson
} from 'react-icons/md';

const StudentForm = ({ onClose, onStudentAdded, studentData, isEditMode = false }) => {
  const levels = [
    { code: 'PN', name: 'Pre-Nursery' },
    { code: 'NU', name: 'Nursery' },
    { code: 'PR', name: 'Primary' },
    { code: 'JS', name: 'Junior Secondary' }
  ];

  const classes = {
    'PN': ['Pre-Nursery'],
    'NU': ['Nursery 1', 'Nursery 2'],
    'PR': ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4'],
    'JS': ['JSS 1', 'JSS 2', 'JSS 3']
  };

  const statusOptions = [
    { value: 'Active', label: 'Active', color: 'text-green-600' },
    { value: 'Inactive', label: 'Inactive', color: 'text-red-600' },
    { value: 'Graduated', label: 'Graduated', color: 'text-blue-600' },
    { value: 'Transferred', label: 'Transferred', color: 'text-gray-600' }
  ];

  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'Male',
    level: 'PR',
    className: 'Primary 1',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    address: '',
    photo: null,
    status: 'Active',
    admissionDate: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const formRef = useRef(null);

  // Initialize form data if in edit mode
// In the useEffect for edit mode:
useEffect(() => {
  if (isEditMode && studentData) {
    console.log('Initializing edit form with student data:', studentData);
    
    const editData = {
      ...studentData,
      // Don't modify photo here, keep it as is
    };
    
    setFormData(editData);
    
    // Set photo preview if photo exists
    if (studentData.photo) {
      setPhotoPreview(studentData.photo);
      console.log('Set photo preview from existing data');
    } else {
      console.log('No existing photo');
    }
  }
}, [isEditMode, studentData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

// In StudentForm.jsx, modify handleFileChange:
const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    setErrors(prev => ({
      ...prev,
      photo: 'Please upload a valid image (JPEG, PNG, GIF)'
    }));
    toast.error('Invalid file type. Please upload JPEG, PNG or GIF');
    return;
  }
  
  if (file.size > 2 * 1024 * 1024) {
    setErrors(prev => ({
      ...prev,
      photo: 'File size must be less than 2MB'
    }));
    toast.error('File size too large. Maximum 2MB allowed');
    return;
  }
  
  setFormData(prev => ({
    ...prev,
    photo: file // Store the File object
  }));
  
  // Create preview URL
  const previewUrl = URL.createObjectURL(file);
  setPhotoPreview(previewUrl);
  
  if (errors.photo) {
    setErrors(prev => ({
      ...prev,
      photo: ''
    }));
  }
  
  toast.success('Photo uploaded successfully');
};

  const validateForm = () => {
    const newErrors = {};
    
    const requiredFields = {
      fullName: 'Full name is required',
      dateOfBirth: 'Date of birth is required',
      parentName: 'Parent/Guardian name is required',
      parentPhone: 'Phone number is required',
      address: 'Address is required'
    };
    
    Object.keys(requiredFields).forEach(field => {
      if (!formData[field]?.toString().trim()) {
        newErrors[field] = requiredFields[field];
      }
    });
    
    if (formData.fullName && formData.fullName.trim().split(/\s+/).length < 2) {
      newErrors.fullName = 'Please enter both first and last name';
    }
    
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      if (dob >= today) {
        newErrors.dateOfBirth = 'Date of birth must be in the past';
      }
    }
    
    const phoneRegex = /^0[789][01]\d{8}$/;
    if (formData.parentPhone && !phoneRegex.test(formData.parentPhone.trim())) {
      newErrors.parentPhone = 'Enter a valid Nigerian phone number (e.g., 08012345678)';
    }
    
    if (formData.parentEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.parentEmail.trim())) {
        newErrors.parentEmail = 'Enter a valid email address';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  console.log('=== FORM SUBMIT START ===');
  console.log('isEditMode:', isEditMode);
  console.log('formData.photo:', formData.photo);
  console.log('formData.photo type:', typeof formData.photo);
  console.log('formData.photo instanceof File:', formData.photo instanceof File);
  console.log('formData.photo startsWith data:image?', 
    typeof formData.photo === 'string' ? formData.photo.startsWith('data:image') : 'N/A');
  console.log('formData.photo startsWith http?', 
    typeof formData.photo === 'string' ? formData.photo.startsWith('http') : 'N/A');
  console.log('photoPreview:', photoPreview);
  console.log('studentData (if edit):', studentData);
  console.log('studentData photo (if edit):', studentData?.photo);
  
  if (!validateForm()) {
    toast.error('Please fix the errors in the form');
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    let photoToSend = formData.photo;
    
    // Debug: Check what we're sending
    console.log('🔄 Processing photo data...');
    console.log('Original photo value:', photoToSend);
    console.log('Original photo type:', typeof photoToSend);
    
    // ======================
    // PHOTO HANDLING LOGIC
    // ======================
    
    if (photoToSend instanceof File) {
      // Case 1: New file uploaded
      console.log('📸 New File object detected:', photoToSend.name, photoToSend.type, photoToSend.size);
      // Keep as File object - studentService will handle conversion/upload
      
    } else if (typeof photoToSend === 'string') {
      if (photoToSend.startsWith('data:image')) {
        // Case 2: Base64 string from new upload (create or edit with new photo)
        console.log('📸 Base64 string detected (new upload)');
        console.log('Base64 length:', photoToSend.length);
        console.log('Base64 preview:', photoToSend.substring(0, 100) + '...');
        
      } else if (photoToSend.startsWith('http')) {
        // Case 3: Existing URL from database
        console.log('🌐 Existing photo URL detected:', photoToSend);
        
        // Check if this is the same as original student photo
        if (isEditMode && studentData && studentData.photo === photoToSend) {
          console.log('✅ Same photo URL as original - no changes made');
        } else if (!photoPreview && photoToSend === '') {
          // Case 4: Photo was removed (empty string)
          console.log('🗑️ Photo was removed by user');
          photoToSend = ''; // Empty string to indicate removal
        } else {
          console.log('⚠️ Unexpected photo string:', photoToSend);
        }
      } else if (photoToSend === '' || photoToSend === null || photoToSend === undefined) {
        // Case 5: No photo
        console.log('❌ No photo provided');
        photoToSend = null;
      }
      
    } else if (!photoToSend) {
      // Case 6: Null/undefined photo
      console.log('❌ Photo is null/undefined');
      photoToSend = null;
    }
    
    console.log('✅ Final photo value to send:', photoToSend);
    console.log('✅ Final photo type to send:', typeof photoToSend);
    
    // ======================
    // BUILD PAYLOAD
    // ======================
    
    const studentPayload = {
      fullName: formData.fullName,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      level: formData.level,
      className: formData.className,
      parentName: formData.parentName,
      parentPhone: formData.parentPhone,
      parentEmail: formData.parentEmail || '',
      address: formData.address,
      status: formData.status,
      admissionDate: formData.admissionDate,
      photo: photoToSend // Pass photo as-is (File, base64 string, URL, or null)
    };
    
    console.log('📦 Final payload being sent:');
    console.log('- All fields:', studentPayload);
    console.log('- Photo exists:', !!studentPayload.photo);
    console.log('- Photo type:', typeof studentPayload.photo);
    
    // ======================
    // CALL SERVICE
    // ======================
    
    let resultStudent;
    if (isEditMode) {
      console.log('🔄 EDIT MODE - Updating student');
      console.log('Student ID:', studentData?.id);
      
      if (!studentData?.id) {
        throw new Error('Student ID is required for update');
      }
      
      try {
        console.log('📞 Calling studentService.updateStudent()...');
        resultStudent = await studentService.updateStudent(studentData.id, studentPayload);
        console.log('✅ Update successful:', resultStudent);
        
        if (!resultStudent) {
          throw new Error('Failed to update student - no data returned');
        }
        
        if (onStudentAdded) {
          console.log('📢 Calling onStudentAdded callback...');
          onStudentAdded(resultStudent);
        }
        
        toast.success(
          <div>
            <p className="font-semibold">Student Updated Successfully!</p>
            <p className="text-sm"><strong>Name:</strong> {formData.fullName}</p>
            <p className="text-sm"><strong>Class:</strong> {formData.className}</p>
            <p className="text-sm"><strong>Status:</strong> {formData.status}</p>
            <p className="text-sm"><strong>Photo Updated:</strong> {resultStudent.photo ? 'Yes' : 'No'}</p>
          </div>,
          {
            duration: 4000,
          }
        );
        
      } catch (updateError) {
        console.error('❌ Update error details:', updateError);
        throw updateError;
      }
      
    } else {
      console.log('➕ CREATE MODE - Adding new student');
      
      try {
        console.log('📞 Calling studentService.addStudent()...');
        resultStudent = await studentService.addStudent(studentPayload);
        console.log('✅ Add successful:', resultStudent);
        
        if (!resultStudent) {
          throw new Error('Failed to add student - no data returned');
        }
        
        if (onStudentAdded) {
          console.log('📢 Calling onStudentAdded callback...');
          onStudentAdded(resultStudent);
        }
        
        toast.success(
          <div>
            <p className="font-semibold">Student Registered Successfully!</p>
            <p className="text-sm"><strong>Name:</strong> {formData.fullName}</p>
            <p className="text-sm"><strong>Class:</strong> {formData.className}</p>
            <p className="text-sm"><strong>Admission No:</strong> {resultStudent.admissionNumber}</p>
            <p className="text-sm"><strong>Photo Added:</strong> {resultStudent.photo ? 'Yes' : 'No'}</p>
          </div>,
          {
            duration: 4000,
          }
        );
        
      } catch (addError) {
        console.error('❌ Add error details:', addError);
        throw addError;
      }
    }
    
    // ======================
    // SUCCESS HANDLING
    // ======================
    
    console.log('✅ Operation completed successfully');
    console.log('Result student data:', resultStudent);
    console.log('Result student photo:', resultStudent?.photo);
    
    // Close form after success
    setTimeout(() => {
      console.log('🚪 Closing form...');
      onClose();
    }, 2000);
    
  } catch (error) {
    console.error('❌❌❌ ERROR in handleSubmit:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error:', error);
    
    toast.error(
      <div>
        <p className="font-semibold">{isEditMode ? 'Update Failed' : 'Registration Failed'}</p>
        <p className="text-sm">{error.message}</p>
        <p className="text-xs text-gray-500 mt-1">Check console for details</p>
      </div>,
      {
        duration: 6000,
      }
    );
  } finally {
    console.log('=== FORM SUBMIT END ===');
    setIsSubmitting(false);
  }
};

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    console.log('🔄 Converting File to base64:', file.name, file.type, file.size);
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = () => {
      const result = reader.result;
      console.log('✅ Base64 conversion successful');
      console.log('   Result type:', typeof result);
      console.log('   Result length:', result.length);
      console.log('   First 50 chars:', result.substring(0, 50) + '...');
      resolve(result);
    };
    
    reader.onerror = error => {
      console.error('❌ Base64 conversion failed:', error);
      reject(error);
    };
  });
};

 const removePhoto = () => {
  if (isEditMode) {
    // In edit mode, set photo to empty string instead of null
    setFormData(prev => ({ ...prev, photo: '' }));
  } else {
    // In create mode, set to null
    setFormData(prev => ({ ...prev, photo: null }));
  }
  
  if (photoPreview) {
    URL.revokeObjectURL(photoPreview);
  }
  setPhotoPreview(null);
  toast.success('Photo removed');
};

  const resetForm = () => {
    setFormData({
      fullName: '',
      dateOfBirth: '',
      gender: 'Male',
      level: 'PR',
      className: 'Primary 1',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      address: '',
      photo: null,
      status: 'Active',
      admissionDate: new Date().toISOString().split('T')[0]
    });
    setErrors({});
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
  };

  // Cleanup photo preview URL on unmount
  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="sticky top-0 bg-white z-10 p-4 border-b flex items-center justify-between flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          {isEditMode ? (
            <>
              <FiEdit className="text-indigo-600" />
              Edit Student
            </>
          ) : (
            <>
              <FiUserPlus className="text-indigo-600" />
              Register New Student
            </>
          )}
        </h2>
        <button 
          className="text-gray-400 hover:text-gray-600 text-2xl"
          onClick={onClose}
          disabled={isSubmitting}
        >
          ×
        </button>
      </div>

      {/* Scrollable Form Content */}
      <div 
        ref={formRef}
        className="flex-1 overflow-y-auto p-4"
        style={{ maxHeight: 'calc(90vh - 140px)' }}
      >
        <form onSubmit={handleSubmit} className="pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Personal Information Section */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <h3 className="text-md font-semibold text-gray-800 flex items-center gap-2">
                  <FiUser className="text-indigo-600" />
                  Personal Information
                </h3>
                <span className="text-xs text-gray-500 font-medium">* Required</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <MdPerson className="w-4 h-4" />
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm ${
                      errors.fullName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter student's full name"
                    disabled={isSubmitting}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <FiX className="w-3 h-3" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <FiCalendar className="w-4 h-4" />
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm ${
                        errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                      }`}
                      max={new Date().toISOString().split('T')[0]}
                      disabled={isSubmitting}
                    />
                    {errors.dateOfBirth && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <FiX className="w-3 h-3" />
                        {errors.dateOfBirth}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <FiUser className="w-4 h-4" />
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                      disabled={isSubmitting}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                {/* Status Field for Edit Mode */}
                {isEditMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <FiCheck className="w-4 h-4" />
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                      disabled={isSubmitting}
                    >
                      {statusOptions.map(status => (
                        <option key={status.value} value={status.value} className={status.color}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Photo Upload */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <FiUpload className="w-4 h-4" />
                    Student Photo
                  </label>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
                      {photoPreview || formData.photo ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={photoPreview || formData.photo} 
                            alt="Student preview" 
                            className="w-full h-full object-cover"
                          />
                          <button 
                            type="button" 
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                            onClick={removePhoto}
                            disabled={isSubmitting}
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center p-2">
                          <div className="text-2xl text-gray-400 mb-1">
                            <FiUser className="w-8 h-8 mx-auto" />
                          </div>
                          <p className="text-xs text-gray-500">No photo</p>
                          <p className="text-xs text-gray-400">Max 2MB</p>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        id="photo"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isSubmitting}
                        className="hidden"
                      />
                      <label 
                        htmlFor="photo" 
                        className={`inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                          isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                        }`}
                      >
                        <FiUpload className="w-3 h-3" />
                        {formData.photo ? 'Change Photo' : 'Upload Photo'}
                      </label>
                      {errors.photo && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <FiX className="w-2 h-2" />
                          {errors.photo}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        JPG, PNG, GIF - Max 2MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic & Parent Information Section */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              {/* Academic Information */}
              <div className="mb-6">
                <div className="flex items-center mb-4 pb-3 border-b">
                  <h3 className="text-md font-semibold text-gray-800 flex items-center gap-2">
                    <MdSchool className="text-indigo-600" />
                    Academic Information
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <MdSchool className="w-4 h-4" />
                      Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={(e) => {
                        handleChange(e);
                        setFormData(prev => ({
                          ...prev,
                          className: classes[e.target.value][0]
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                      disabled={isSubmitting}
                    >
                      {levels.map(level => (
                        <option key={level.code} value={level.code}>
                          {level.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <MdClass className="w-4 h-4" />
                      Class <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="className"
                      value={formData.className}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                      disabled={isSubmitting}
                    >
                      {classes[formData.level].map(cls => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white text-xs font-semibold text-gray-500 uppercase">
                    Parent Information
                  </span>
                </div>
              </div>

              {/* Parent Information */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <MdPerson className="w-4 h-4" />
                    Parent/Guardian Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm ${
                      errors.parentName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Parent/Guardian full name"
                    disabled={isSubmitting}
                  />
                  {errors.parentName && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <FiX className="w-3 h-3" />
                      {errors.parentName}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <FiPhone className="w-4 h-4" />
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="parentPhone"
                      value={formData.parentPhone}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm ${
                        errors.parentPhone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="080XXXXXXXXX"
                      disabled={isSubmitting}
                    />
                    {errors.parentPhone && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <FiX className="w-3 h-3" />
                        {errors.parentPhone}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <FiMail className="w-4 h-4" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="parentEmail"
                      value={formData.parentEmail}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm ${
                        errors.parentEmail ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="parent@example.com"
                      disabled={isSubmitting}
                    />
                    {errors.parentEmail && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <FiX className="w-3 h-3" />
                        {errors.parentEmail}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <FiMapPin className="w-4 h-4" />
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm ${
                      errors.address ? 'border-red-300' : 'border-gray-300'
                    }`}
                    rows="2"
                    placeholder="Full residential address"
                    disabled={isSubmitting}
                  />
                  {errors.address && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <FiX className="w-3 h-3" />
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Fixed Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 mt-auto flex-shrink-0">
        <div className="flex justify-end gap-3">
          <button 
            type="button" 
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            onClick={() => {
              resetForm();
              onClose();
            }}
            disabled={isSubmitting}
          >
            <FiX />
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleSubmit}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <FiLoader className="animate-spin h-4 w-4" />
                {isEditMode ? 'Updating...' : 'Registering...'}
              </>
            ) : (
              <>
                {isEditMode ? (
                  <>
                    <FiCheck />
                    Update Student
                  </>
                ) : (
                  <>
                    <FiCheck />
                    Register Student
                  </>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentForm;