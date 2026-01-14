// src/components/Teachers/TeacherForm.jsx

import React, { useState, useEffect } from 'react';
import './TeacherForm.css';
import toast from 'react-hot-toast';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin,
  FiUpload,
  FiX,
  FiCheck,
  FiLoader,
  FiAward,
  FiCreditCard
} from 'react-icons/fi';
import { 
  MdPerson
} from 'react-icons/md';

// Import avatar images
import maleAvatar from '../images/TeacterMaleAvata.png';
import femaleAvatar from '../images/TeacherfemaleAvata.png';

const TeacherForm = ({ onClose, onTeacherAdded, teacherToEdit }) => {
  const [formData, setFormData] = useState({
    id: null,
    fullName: '',
    email: '',
    phone: '',
    gender: 'Male',
    qualification: '',
    address: '',
    accountNumber: '',
    accountName: '',
    bankName: '',
    profilePhoto: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const isEditMode = !!teacherToEdit;

  // Get appropriate avatar based on gender
  const getAvatarImage = () => {
    return formData.gender === 'Male' ? maleAvatar : femaleAvatar;
  };

  // Load teacher data for editing
  useEffect(() => {
    if (teacherToEdit) {
      const editData = {
        id: teacherToEdit.id,
        fullName: teacherToEdit.fullName || '',
        email: teacherToEdit.email || '',
        phone: teacherToEdit.phone || '',
        gender: teacherToEdit.gender || 'Male',
        qualification: teacherToEdit.qualification || '',
        address: teacherToEdit.address || '',
        accountNumber: teacherToEdit.accountNumber || '',
        accountName: teacherToEdit.accountName || '',
        bankName: teacherToEdit.bankName || '',
        profilePhoto: teacherToEdit.profilePhoto || null
      };
      
      setFormData(editData);
      
      if (teacherToEdit.profilePhoto && typeof teacherToEdit.profilePhoto === 'string') {
        setPhotoPreview(teacherToEdit.profilePhoto);
      }
    }
  }, [teacherToEdit]);

  // Save form data to localStorage on change (for new teachers only)
  useEffect(() => {
    if (!isEditMode) {
      const saveTimeout = setTimeout(() => {
        localStorage.setItem('teacherFormDraft', JSON.stringify({
          ...formData,
          profilePhoto: null // Don't save photo in localStorage
        }));
      }, 500);
      return () => clearTimeout(saveTimeout);
    }
  }, [formData, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        profilePhoto: 'Please upload a valid image (JPEG, PNG, GIF)'
      }));
      toast.error('Invalid file type. Please upload JPEG, PNG or GIF');
      return;
    }
    
    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        profilePhoto: 'File size must be less than 2MB'
      }));
      toast.error('File size too large. Maximum 2MB allowed');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      profilePhoto: file
    }));
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
    
    if (errors.profilePhoto) {
      setErrors(prev => ({
        ...prev,
        profilePhoto: ''
      }));
    }
    
    toast.success('Photo uploaded successfully');
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    const requiredFields = {
      fullName: 'Full name is required',
      email: 'Email address is required',
      phone: 'Phone number is required',
      qualification: 'Qualification is required',
      gender: 'Gender is required'
    };
    
    Object.keys(requiredFields).forEach(field => {
      if (!formData[field]?.toString().trim()) {
        newErrors[field] = requiredFields[field];
      }
    });
    
    // Validate full name has at least two parts
    if (formData.fullName && formData.fullName.trim().split(/\s+/).length < 2) {
      newErrors.fullName = 'Please enter both first and last name';
    }
    
    // Validate email
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    
    // Validate phone number (Nigerian format)
    const phoneRegex = /^0[789][01]\d{8}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = 'Enter a valid Nigerian phone number (e.g., 08012345678)';
    }
    
    // Validate account number if provided
    if (formData.accountNumber && !/^\d{10}$/.test(formData.accountNumber.replace(/\s/g, ''))) {
      newErrors.accountNumber = 'Account number must be 10 digits';
    }
    
    // Validate gender
    if (!['Male', 'Female'].includes(formData.gender)) {
      newErrors.gender = 'Select a valid gender';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let photoBase64 = formData.profilePhoto;
      
      // Convert file to base64 if it's a File object
      if (formData.profilePhoto instanceof File) {
        photoBase64 = await convertToBase64(formData.profilePhoto);
      } else if (!formData.profilePhoto) {
        // Use avatar image if no photo is uploaded
        photoBase64 = formData.gender === 'Male' ? maleAvatar : femaleAvatar;
      }
      
      // Split full name into firstName and lastName
      const nameParts = formData.fullName.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      const teacherData = {
        id: formData.id,
        firstName,
        lastName,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        qualification: formData.qualification,
        address: formData.address,
        accountNumber: formData.accountNumber || '',
        accountName: formData.accountName || '',
        bankName: formData.bankName || '',
        profilePhoto: photoBase64,
        updatedAt: new Date().toISOString()
      };
      
      if (isEditMode) {
        // For edit, preserve existing fields
        teacherData.status = teacherToEdit.status;
        teacherData.staffId = teacherToEdit.staffId;
        teacherData.dateJoined = teacherToEdit.dateJoined;
        teacherData.createdAt = teacherToEdit.createdAt;
        teacherData.classAssignments = teacherToEdit.classAssignments || [];
        teacherData.subjects = teacherToEdit.subjects || []; // Keep existing subjects if any
      } else {
        // For new teacher, add new fields
        teacherData.status = 'Active';
        teacherData.dateJoined = new Date().toISOString().split('T')[0];
        teacherData.createdAt = new Date().toISOString();
        teacherData.classAssignments = [];
        teacherData.subjects = []; // Initialize empty subjects array
      }
      
      // Call parent callback
      if (onTeacherAdded) {
        onTeacherAdded(teacherData);
      }
            
      // Reset form and close after success
      if (!isEditMode) {
        resetForm();
      }
      
      toast.success(
        <div>
          <p className="font-semibold">
            {isEditMode ? 'Teacher Updated Successfully!' : 'Teacher Registered Successfully!'}
          </p>
          <p className="text-sm"><strong>Name:</strong> {formData.fullName}</p>
          <p className="text-sm"><strong>Qualification:</strong> {formData.qualification}</p>
          {!isEditMode && teacherData.staffId && (
            <p className="text-sm"><strong>Staff ID:</strong> {teacherData.staffId}</p>
          )}
        </div>,
        {
          duration: 4000,
        }
      );
      
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      toast.error(
        <div>
          <p className="font-semibold">{isEditMode ? 'Update Failed' : 'Registration Failed'}</p>
          <p className="text-sm">{error.message}</p>
        </div>,
        {
          duration: 5000,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, profilePhoto: null }));
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(null);
    toast.success('Photo removed');
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      gender: 'Male',
      qualification: '',
      address: '',
      accountNumber: '',
      accountName: '',
      bankName: '',
      profilePhoto: null
    });
    setErrors({});
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
    // Clear localStorage draft
    localStorage.removeItem('teacherFormDraft');
  };

  const handleClearDraft = () => {
    if (window.confirm('Are you sure you want to clear all unsaved data?')) {
      resetForm();
      toast.success('Form cleared successfully', {
        duration: 2000,
        icon: '🗑️'
      });
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
    <form onSubmit={handleSubmit} className="teacher-form compact">
      <div className="compact-grid">
        {/* Personal Information with Photo Upload */}
        <div className="compact-section">
          <div className="section-header compact">
            <h3 className="flex items-center gap-2">
              <FiUser className="section-icon" />
              Personal Information
            </h3>
          </div>
          
          {/* Photo Upload Section */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <FiUpload className="w-4 h-4" />
              Profile Photo
            </label>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                {photoPreview || formData.profilePhoto ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={photoPreview || formData.profilePhoto} 
                      alt="Teacher preview" 
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
                  <div className="text-center p-3">
                    <img 
                      src={getAvatarImage()} 
                      alt="Default avatar" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  id="profilePhoto"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                  className="hidden"
                />
                <label 
                  htmlFor="profilePhoto" 
                  className={`inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded text-sm font-medium cursor-pointer transition-colors ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                >
                  <FiUpload className="w-4 h-4" />
                  {formData.profilePhoto ? 'Change Photo' : 'Upload Photo'}
                </label>
                {errors.profilePhoto && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FiX className="w-3 h-3" />
                    {errors.profilePhoto}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Upload a profile photo (JPG, PNG, GIF - Max 2MB)
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Default avatar will be used if no photo is uploaded
                </p>
              </div>
            </div>
          </div>
          
          <div className="form-group compact">
            <label className="required flex items-center gap-1">
              <MdPerson className="w-4 h-4" />
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`form-input compact ${errors.fullName ? 'error' : ''}`}
              placeholder="Enter first and last name"
              disabled={isSubmitting}
            />
            {errors.fullName && <span className="error-message compact">{errors.fullName}</span>}
          </div>
          
          <div className="form-row compact">
            <div className="form-group compact">
              <label className="required flex items-center gap-1">
                <FiUser className="w-4 h-4" />
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`form-input compact ${errors.gender ? 'error' : ''}`}
                disabled={isSubmitting}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.gender && <span className="error-message compact">{errors.gender}</span>}
            </div>
          </div>
          
          <div className="form-row compact">
            <div className="form-group compact">
              <label className="required flex items-center gap-1">
                <FiMail className="w-4 h-4" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input compact ${errors.email ? 'error' : ''}`}
                placeholder="teacher@example.com"
                disabled={isSubmitting}
              />
              {errors.email && <span className="error-message compact">{errors.email}</span>}
            </div>
            
            <div className="form-group compact">
              <label className="required flex items-center gap-1">
                <FiPhone className="w-4 h-4" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`form-input compact ${errors.phone ? 'error' : ''}`}
                placeholder="080XXXXXXXXX"
                disabled={isSubmitting}
              />
              {errors.phone && <span className="error-message compact">{errors.phone}</span>}
            </div>
          </div>
          
          <div className="form-group compact">
            <label className="flex items-center gap-1">
              <FiMapPin className="w-4 h-4" />
              Residential Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="form-textarea compact"
              rows="2"
              placeholder="Enter full residential address"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Professional & Bank Information */}
        <div className="compact-section">
          <div className="section-header compact">
            <h3 className="flex items-center gap-2">
              <FiAward className="section-icon" />
              Professional Information
            </h3>
          </div>
          
          <div className="form-group compact">
            <label className="required flex items-center gap-1">
              <FiAward className="w-4 h-4" />
              Qualification
            </label>
            <input
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              className={`form-input compact ${errors.qualification ? 'error' : ''}`}
              placeholder="e.g., B.Ed. Mathematics, M.Sc. Physics"
              disabled={isSubmitting}
            />
            {errors.qualification && <span className="error-message compact">{errors.qualification}</span>}
          </div>

          {/* Bank Information */}
          <div className="section-header compact mt-4">
            <h3 className="flex items-center gap-2">
              <FiCreditCard className="section-icon" />
              Bank Information (Optional)
            </h3>
          </div>
          
          <div className="form-row compact">
            <div className="form-group compact">
              <label className="flex items-center gap-1">
                <FiCreditCard className="w-4 h-4" />
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                className="form-input compact"
                placeholder="e.g., Zenith Bank, GTBank"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group compact">
              <label className="flex items-center gap-1">
                <FiCreditCard className="w-4 h-4" />
                Account Number
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                className={`form-input compact ${errors.accountNumber ? 'error' : ''}`}
                placeholder="10-digit account number"
                disabled={isSubmitting}
                maxLength="10"
              />
              {errors.accountNumber && <span className="error-message compact">{errors.accountNumber}</span>}
            </div>
          </div>
          
          <div className="form-group compact">
            <label className="flex items-center gap-1">
              <FiUser className="w-4 h-4" />
              Account Name
            </label>
            <input
              type="text"
              name="accountName"
              value={formData.accountName}
              onChange={handleChange}
              className="form-input compact"
              placeholder="Account holder name"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      <div className="form-actions compact">
        <div className="form-actions-left">
          {!isEditMode && (
            <button 
              type="button" 
              className="btn-tertiary compact flex items-center gap-2" 
              onClick={handleClearDraft}
              disabled={isSubmitting}
              title="Clear all unsaved data"
            >
              <FiX className="w-4 h-4" />
              Clear Draft
            </button>
          )}
        </div>
        <div className="form-actions-right">
          <button 
            type="button" 
            className="btn-secondary compact flex items-center gap-2" 
            onClick={() => {
              if (Object.keys(formData).some(key => formData[key] && key !== 'profilePhoto')) {
                if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                  if (!isEditMode) resetForm();
                  onClose();
                }
              } else {
                if (!isEditMode) resetForm();
                onClose();
              }
            }}
            disabled={isSubmitting}
          >
            <FiX className="w-4 h-4" />
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary compact flex items-center gap-2" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                {isEditMode ? 'Updating...' : 'Registering...'}
              </>
            ) : (
              <>
                <FiCheck className="w-4 h-4" />
                {isEditMode ? 'Update Teacher' : 'Register Teacher'}
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Auto-save indicator */}
      {!isEditMode && (
        <div className="autosave-indicator">
          <small className="flex items-center gap-1">
            <span className="autosave-icon">⏳</span>
            Form data is auto-saved locally
          </small>
        </div>
      )}
    </form>
  );
};

export default TeacherForm;