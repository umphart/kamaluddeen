// src/services/teacherService.js
import { supabase } from './supabaseClient';

export class TeacherService {
  // ========== TEACHER CRUD OPERATIONS ==========
  
  // Generate staff ID
  async generateStaffId() {
    try {
      const year = new Date().getFullYear();
      
      // Get current serial from database
      const { data, error } = await supabase
        .from('teachers')
        .select('staff_id')
        .like('staff_id', `KCC/TEA/${year}/%`)
        .order('staff_id', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error generating staff ID:', error);
        // Fallback: Use timestamp
        return `KCC/TEA/${year}/${Date.now().toString().slice(-3)}`;
      }

      let serial = 1;
      if (data && data.length > 0) {
        const lastId = data[0].staff_id;
        const match = lastId.match(/\/(\d+)$/);
        if (match) serial = parseInt(match[1]) + 1;
      }

      return `KCC/TEA/${year}/${serial.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Exception in generateStaffId:', error);
      const year = new Date().getFullYear();
      return `KCC/TEA/${year}/${Date.now().toString().slice(-3)}`;
    }
  }

  // Upload photo to Supabase Storage
  async uploadTeacherPhoto(photoData, staffId) {
    try {
      console.log('📸 Starting teacher photo upload for:', staffId);
      
      // Generate filename
      const timestamp = Date.now();
      const cleanStaffId = staffId.replace(/[/]/g, '_');
      const fileName = `teacher_${cleanStaffId}_${timestamp}.jpg`;
      
      let blob;
      let contentType = 'image/jpeg';
      
      if (photoData instanceof File) {
        // File object
        blob = photoData;
        contentType = photoData.type || 'image/jpeg';
      } else if (typeof photoData === 'string' && photoData.startsWith('data:image')) {
        // Base64 string
        const base64Data = photoData.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const mimeType = photoData.match(/data:(.*);base64/)?.[1] || 'image/jpeg';
        contentType = mimeType;
        blob = new Blob([byteArray], { type: contentType });
      } else {
        console.warn('Invalid photo format:', typeof photoData);
        return null;
      }
      
      console.log('Uploading teacher photo to Supabase Storage...');
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('teacher-photos')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: contentType
        });

      if (uploadError) {
        console.error('Teacher photo upload error:', uploadError);
        return null;
      }
      
      console.log('Teacher photo uploaded successfully:', uploadData);
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('teacher-photos')
        .getPublicUrl(fileName);
      
      return urlData.publicUrl;
      
    } catch (error) {
      console.error('Error uploading teacher photo:', error);
      return null;
    }
  }

  // Add new teacher
  async addTeacher(teacherData) {
    try {
      console.log('👨‍🏫 Adding teacher with data:', teacherData);
      
      const staffId = await this.generateStaffId();
      
      // Upload photo if provided
      let photoUrl = null;
      if (teacherData.profilePhoto) {
        photoUrl = await this.uploadTeacherPhoto(teacherData.profilePhoto, staffId);
        console.log('Teacher photo upload result:', photoUrl ? '✅ Success' : '❌ Failed');
      }

      // Split full name into first and last name
      const nameParts = teacherData.fullName.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      const teacherPayload = {
        staff_id: staffId,
        first_name: firstName,
        last_name: lastName,
        full_name: teacherData.fullName,
        email: teacherData.email,
        phone: teacherData.phone,
        gender: teacherData.gender,
        qualification: teacherData.qualification,
        subjects: teacherData.subjects || [],
        class_assignments: teacherData.classAssignments || [],
        employment_type: teacherData.employmentType || 'Full-time',
        status: teacherData.status || 'Active',
        date_joined: teacherData.dateJoined || new Date().toISOString().split('T')[0],
        address: teacherData.address || '',
        account_number: teacherData.accountNumber || '',
        account_name: teacherData.accountName || '',
        bank_name: teacherData.bankName || '',
        photo_url: photoUrl
      };

      console.log('Inserting teacher payload:', teacherPayload);

      const { data, error } = await supabase
        .from('teachers')
        .insert([teacherPayload])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(`Failed to add teacher: ${error.message}`);
      }

      console.log('✅ Teacher added successfully:', data);
      return this.mapToFrontendFormat(data);
      
    } catch (error) {
      console.error('💥 Error adding teacher:', error);
      throw error;
    }
  }

  // Get all teachers
  async getAllTeachers() {
    try {
      console.log('📋 Fetching all teachers from Supabase...');
      
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching teachers:', error);
        return [];
      }

      console.log(`✅ Fetched ${data?.length || 0} teachers`);
      
      if (!data || !Array.isArray(data)) {
        console.warn('Data is not an array:', data);
        return [];
      }
      
      return data.map(item => this.mapToFrontendFormat(item));
      
    } catch (error) {
      console.error('💥 Exception in getAllTeachers:', error);
      return [];
    }
  }

  // Get teacher by ID
  async getTeacherById(id) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error getting teacher:', error);
        return null;
      }
      
      return this.mapToFrontendFormat(data);
    } catch (error) {
      console.error('Error in getTeacherById:', error);
      return null;
    }
  }

  // Update teacher
  async updateTeacher(id, updateData) {
    try {
      const mappedUpdates = this.mapToBackendFormat(updateData);
      
      // Handle photo upload if new photo is provided
      if (updateData.profilePhoto && typeof updateData.profilePhoto !== 'string') {
        const existingTeacher = await this.getTeacherById(id);
        if (existingTeacher) {
          const photoUrl = await this.uploadTeacherPhoto(updateData.profilePhoto, existingTeacher.staffId);
          if (photoUrl) {
            mappedUpdates.photo_url = photoUrl;
          }
        }
      }
      
      const { data, error } = await supabase
        .from('teachers')
        .update(mappedUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.mapToFrontendFormat(data);
    } catch (error) {
      console.error('Error updating teacher:', error);
      throw error;
    }
  }

  // Delete teacher
  async deleteTeacher(id) {
    try {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting teacher:', error);
      throw error;
    }
  }

  // Assign classes to teacher
  async assignClasses(teacherId, classes) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .update({ class_assignments: classes })
        .eq('id', teacherId)
        .select()
        .single();

      if (error) throw error;
      return this.mapToFrontendFormat(data);
    } catch (error) {
      console.error('Error assigning classes:', error);
      throw error;
    }
  }

  // Assign subjects to teacher
  async assignSubjects(teacherId, subjects) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .update({ subjects: subjects })
        .eq('id', teacherId)
        .select()
        .single();

      if (error) throw error;
      return this.mapToFrontendFormat(data);
    } catch (error) {
      console.error('Error assigning subjects:', error);
      throw error;
    }
  }

  // Update teacher status
  async updateStatus(teacherId, status) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .update({ status: status })
        .eq('id', teacherId)
        .select()
        .single();

      if (error) throw error;
      return this.mapToFrontendFormat(data);
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  }

  // Search teachers
  async searchTeachers(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .or(`full_name.ilike.%${searchTerm}%,staff_id.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .order('full_name');

      if (error) throw error;
      
      if (!data || !Array.isArray(data)) return [];
      return data.map(item => this.mapToFrontendFormat(item));
    } catch (error) {
      console.error('Error searching teachers:', error);
      return [];
    }
  }

  // Get teachers by status
  async getTeachersByStatus(status) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('status', status)
        .order('full_name');

      if (error) throw error;
      
      if (!data || !Array.isArray(data)) return [];
      return data.map(item => this.mapToFrontendFormat(item));
    } catch (error) {
      console.error('Error getting teachers by status:', error);
      return [];
    }
  }

  // Get statistics
  async getStatistics() {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('status, employment_type, gender');

      if (error) {
        console.error('Statistics error:', error);
        return { 
          total: 0, 
          active: 0, 
          fullTime: 0, 
          partTime: 0, 
          male: 0, 
          female: 0,
          subjectsCount: 0
        };
      }

      if (!data || !Array.isArray(data)) {
        return { 
          total: 0, 
          active: 0, 
          fullTime: 0, 
          partTime: 0, 
          male: 0, 
          female: 0,
          subjectsCount: 0
        };
      }

      const stats = {
        total: data.length,
        active: data.filter(t => t.status === 'Active').length,
        fullTime: data.filter(t => t.employment_type === 'Full-time').length,
        partTime: data.filter(t => t.employment_type === 'Part-time').length,
        male: data.filter(t => t.gender === 'Male').length,
        female: data.filter(t => t.gender === 'Female').length,
        subjectsCount: new Set(data.flatMap(t => t.subjects || [])).size
      };

      return stats;
      
    } catch (error) {
      console.error('Exception in getStatistics:', error);
      return { 
        total: 0, 
        active: 0, 
        fullTime: 0, 
        partTime: 0, 
        male: 0, 
        female: 0,
        subjectsCount: 0
      };
    }
  }

  // ========== DATA MAPPING ==========
  
  mapToFrontendFormat(dbTeacher) {
    if (!dbTeacher) return null;
    
    return {
      id: dbTeacher.id,
      staffId: dbTeacher.staff_id,
      firstName: dbTeacher.first_name,
      lastName: dbTeacher.last_name,
      fullName: dbTeacher.full_name,
      email: dbTeacher.email,
      phone: dbTeacher.phone,
      gender: dbTeacher.gender,
      qualification: dbTeacher.qualification,
      subjects: dbTeacher.subjects || [],
      classAssignments: dbTeacher.class_assignments || [],
      employmentType: dbTeacher.employment_type,
      status: dbTeacher.status,
      dateJoined: dbTeacher.date_joined,
      address: dbTeacher.address,
      accountNumber: dbTeacher.account_number,
      accountName: dbTeacher.account_name,
      bankName: dbTeacher.bank_name,
      profilePhoto: dbTeacher.photo_url,
      createdAt: dbTeacher.created_at,
      updatedAt: dbTeacher.updated_at
    };
  }

  mapToBackendFormat(frontendTeacher) {
    const result = {
      first_name: frontendTeacher.firstName,
      last_name: frontendTeacher.lastName,
      full_name: frontendTeacher.fullName,
      email: frontendTeacher.email,
      phone: frontendTeacher.phone,
      gender: frontendTeacher.gender,
      qualification: frontendTeacher.qualification,
      subjects: frontendTeacher.subjects,
      class_assignments: frontendTeacher.classAssignments,
      employment_type: frontendTeacher.employmentType,
      status: frontendTeacher.status,
      address: frontendTeacher.address,
      account_number: frontendTeacher.accountNumber,
      account_name: frontendTeacher.accountName,
      bank_name: frontendTeacher.bankName
    };
    
    // Only include date_joined if it exists
    if (frontendTeacher.dateJoined) {
      result.date_joined = frontendTeacher.dateJoined;
    }
    
    return result;
  }

  // ========== TEST METHODS ==========
  
  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('count')
        .limit(1);
      
      return { 
        success: !error, 
        error: error?.message,
        data 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  async testStorage() {
    try {
      // Check if bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        return { 
          success: false, 
          error: `Cannot access storage: ${bucketsError.message}` 
        };
      }
      
      const teacherBucket = buckets.find(b => b.name === 'teacher-photos');
      
      if (!teacherBucket) {
        return { 
          success: false, 
          error: 'Bucket "teacher-photos" not found. Please create it in Supabase dashboard.' 
        };
      }
      
      return { 
        success: true, 
        message: 'Teacher storage is properly configured!',
        bucket: teacherBucket
      };
      
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
}

export const teacherService = new TeacherService();