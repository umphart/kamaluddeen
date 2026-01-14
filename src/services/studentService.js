// src/services/studentService.js
import { supabase } from './supabaseClient';

export class StudentService {
  // ========== UTILITY METHODS ==========
  
  // Check if storage bucket exists
  async checkStorageBucket() {
    try {
      console.log('🔍 Checking storage bucket...');
      
      // List all buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('❌ Error listing buckets:', bucketsError);
        return { exists: false, error: bucketsError.message };
      }
      
      
      const studentBucket = buckets.find(b => b.name === 'student-photos');
      
      if (!studentBucket) {
        console.error('❌ student-photos bucket not found!');
        return { exists: false, error: 'Bucket not found' };
      }
      
      console.log('✅ Bucket found:', studentBucket);
      return { exists: true, bucket: studentBucket };
      
    } catch (error) {
      console.error('💥 Error checking bucket:', error);
      return { exists: false, error: error.message };
    }
  }

  // ========== ADMISSION NUMBER ==========
  
  async generateAdmissionNumber(level) {
    try {
      const year = new Date().getFullYear();
      
      // Get current serial from database
      const { data, error } = await supabase
        .from('students')
        .select('admission_number')
        .like('admission_number', `KCC/${level}/${year}/%`)
        .order('admission_number', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error generating admission number:', error);
        // Fallback: Use timestamp
        return `KCC/${level}/${year}/${Date.now().toString().slice(-3)}`;
      }

      let serial = 1;
      if (data && data.length > 0) {
        const lastNumber = data[0].admission_number;
        const match = lastNumber.match(/\/(\d+)$/);
        if (match) serial = parseInt(match[1]) + 1;
      }

      return `KCC/${level}/${year}/${serial.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Exception in generateAdmissionNumber:', error);
      // Fallback
      const year = new Date().getFullYear();
      return `KCC/${level}/${year}/${Date.now().toString().slice(-3)}`;
    }
  }

  // ========== PHOTO UPLOAD ==========
  
  async uploadPhotoToSupabase(photoData, admissionNumber) {
    try {
      console.log('📸 Starting photo upload for:', admissionNumber);
      
      // Generate filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const fileName = `student_${timestamp}_${random}.jpg`;
      console.log('Generated filename:', fileName);
      
      let blob;
      
      if (photoData instanceof File) {
        // File object
        blob = photoData;
        console.log('Using File object, type:', blob.type, 'size:', blob.size);
      } else if (typeof photoData === 'string' && photoData.startsWith('data:image')) {
        // Base64 string
        console.log('Processing base64 image...');
        const base64Data = photoData.split(',')[1];
        
        try {
          // Create blob from base64
          const byteCharacters = atob(base64Data);
          const byteArrays = [];
          
          for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
            byteArrays.push(new Uint8Array(byteNumbers));
          }
          
          blob = new Blob(byteArrays, { type: 'image/jpeg' });
          console.log('Created blob from base64, size:', blob.size);
        } catch (base64Error) {
          console.error('❌ Base64 conversion failed:', base64Error);
          return null;
        }
      } else {
        console.error('Unsupported photo format:', typeof photoData);
        return null;
      }
      
      // Try upload
      console.log('📤 Attempting upload to Supabase Storage...');
      const { data, error } = await supabase.storage
        .from('student-photos')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: true,
          contentType: blob.type || 'image/jpeg'
        });
      
      if (error) {
        console.error('❌ Upload failed:', error);
        
        // More detailed error analysis
        if (error.message.includes('not found') || error.message.includes('bucket')) {
          console.error('⚠️  Bucket might not exist or is not accessible');
          console.error('   Please create "student-photos" bucket in Supabase dashboard');
        } else if (error.message.includes('permission') || error.message.includes('policy')) {
          console.error('⚠️  Permission error - check bucket policies');
          console.error('   Make sure bucket has proper access policies');
        } else if (error.message.includes('JWT') || error.message.includes('auth')) {
          console.error('⚠️  Authentication error - check your Supabase anon key');
        } else {
          console.error('⚠️  Unknown error:', error);
        }
        
        return null;
      }
      
      console.log('✅ Upload successful:', data);
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('student-photos')
        .getPublicUrl(fileName);
      
      console.log('📎 Public URL:', urlData.publicUrl);
      
      return urlData.publicUrl;
      
    } catch (error) {
      console.error('💥 Unexpected error in uploadPhotoToSupabase:', error);
      return null;
    }
  }

  // ========== ADD STUDENT ==========
  
  async addStudent(studentData) {
    try {
      const admissionNumber = await this.generateAdmissionNumber(studentData.level);
      
      // Upload photo to Supabase Storage
      let photoUrl = null;
      if (studentData.photo) {
       
        photoUrl = await this.uploadPhotoToSupabase(studentData.photo, admissionNumber);
        
      } else {
    
      }

      const studentPayload = {
        admission_number: admissionNumber,
        full_name: studentData.fullName,
        date_of_birth: studentData.dateOfBirth,
        gender: studentData.gender,
        level: studentData.level,
        class_name: studentData.className,
        parent_name: studentData.parentName,
        parent_phone: studentData.parentPhone,
        parent_email: studentData.parentEmail,
        address: studentData.address,
        photo_url: photoUrl,
        status: studentData.status || 'Active',
        admission_date: studentData.admissionDate || new Date().toISOString().split('T')[0]
      };

      console.log('💾 Inserting student payload:', studentPayload);

      const { data, error } = await supabase
        .from('students')
        .insert([studentPayload])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase insert error:', error);
        throw new Error(`Failed to add student: ${error.message}`);
      }

      console.log('✅ Student added successfully:', data);
      return this.mapToFrontendFormat(data);
      
    } catch (error) {
      console.error('💥 Error adding student:', error);
      throw error;
    }
  }
  // Get Student by Admission Number
async getStudentByAdmissionNumber(admissionNumber) {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('admission_number', admissionNumber)
      .single();

    if (error) throw error;
    return this.mapToFrontendFormat(data);
  } catch (error) {
    console.error('Error fetching student:', error);
    throw error;
  }
}

  // ========== GET STUDENTS ==========
  
async getAllStudents() { 
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching students:', error);
      return [];
    }

    console.log(`✅ Fetched ${data?.length || 0} students`);

    // 🔍 LOG RAW STUDENT DATA FROM DATABASE
    console.log('📦 Raw students data (DB):', data);

    if (!data || !Array.isArray(data)) {
      console.warn('⚠️ Data is not an array:', data);
      return [];
    }

    const mappedData = data.map(item => this.mapToFrontendFormat(item));

    // 🔄 LOG MAPPED STUDENT DATA (FRONTEND FORMAT)
    console.log('🎯 Mapped students data (Frontend):', mappedData);

    return mappedData;

  } catch (error) {
    console.error('💥 Exception in getAllStudents:', error);
    return [];
  }
}


  async getStudentsByClass(className) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_name', className)
        .order('full_name');

      if (error) {
        console.error('Error fetching class students:', error);
        return [];
      }
      
      if (!data || !Array.isArray(data)) return [];
      
      return data.map(item => this.mapToFrontendFormat(item));
      
    } catch (error) {
      console.error('Exception in getStudentsByClass:', error);
      return [];
    }
  }

  async getStudentById(id) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return this.mapToFrontendFormat(data);
    } catch (error) {
      console.error('Error getting student by ID:', error);
      return null;
    }
  }

  // ========== UPDATE STUDENT ==========
  
  async updateStudent(id, updates) {
    try {
      const mappedUpdates = this.mapToBackendFormat(updates);
      
      // Handle photo upload if provided
      if (updates.photo && typeof updates.photo !== 'string') {
        // Get student to get admission number
        const existingStudent = await this.getStudentById(id);
        if (existingStudent) {
          const photoUrl = await this.uploadPhotoToSupabase(updates.photo, existingStudent.admissionNumber);
          if (photoUrl) {
            mappedUpdates.photo_url = photoUrl;
          }
        }
      }
      
      const { data, error } = await supabase
        .from('students')
        .update(mappedUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.mapToFrontendFormat(data);
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  }

  // ========== DELETE STUDENT ==========
  
  async deleteStudent(id) {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }

  // ========== DATA MAPPING ==========
  
  mapToFrontendFormat(dbStudent) {
    if (!dbStudent) return null;
    
    return {
      id: dbStudent.id,
      admissionNumber: dbStudent.admission_number,
      fullName: dbStudent.full_name,
      dateOfBirth: dbStudent.date_of_birth,
      gender: dbStudent.gender,
      level: dbStudent.level,
      className: dbStudent.class_name,
      parentName: dbStudent.parent_name,
      parentPhone: dbStudent.parent_phone,
      parentEmail: dbStudent.parent_email,
      address: dbStudent.address,
      photo: dbStudent.photo_url,
      status: dbStudent.status || 'Active',
      admissionDate: dbStudent.admission_date,
      createdAt: dbStudent.created_at
    };
  }

  mapToBackendFormat(frontendStudent) {
    return {
      full_name: frontendStudent.fullName,
      date_of_birth: frontendStudent.dateOfBirth,
      gender: frontendStudent.gender,
      level: frontendStudent.level,
      class_name: frontendStudent.className,
      parent_name: frontendStudent.parentName,
      parent_phone: frontendStudent.parentPhone,
      parent_email: frontendStudent.parentEmail,
      address: frontendStudent.address,
      status: frontendStudent.status || 'Active',
      admission_date: frontendStudent.admissionDate
    };
  }

  // ========== STATISTICS ==========
  
  async getStatistics() {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('level, status');

      if (error) {
        console.error('Statistics error:', error);
        return { total: 0, byLevel: { PN: 0, NU: 0, PR: 0, JS: 0 } };
      }

      if (!data || !Array.isArray(data)) {
        return { total: 0, byLevel: { PN: 0, NU: 0, PR: 0, JS: 0 } };
      }

      const byLevel = { PN: 0, NU: 0, PR: 0, JS: 0 };
      data.forEach(student => {
        if (student && student.level && byLevel.hasOwnProperty(student.level)) {
          byLevel[student.level]++;
        }
      });

      return { 
        total: data.length, 
        byLevel 
      };
      
    } catch (error) {
      console.error('Exception in getStatistics:', error);
      return { total: 0, byLevel: { PN: 0, NU: 0, PR: 0, JS: 0 } };
    }
  }

  // ========== TEST METHODS ==========
  
  async testStorageConnection() {
    try {
      console.log('🧪 Testing Supabase Storage connection...');
      
      // Try to list buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('Error listing buckets:', bucketsError);
        return { 
          success: false, 
          error: `Cannot access storage: ${bucketsError.message}` 
        };
      }
      
      console.log('Available buckets:', buckets);
      
      // Check if student-photos bucket exists
      const studentBucket = buckets.find(b => b.name === 'student-photos');
      
      if (!studentBucket) {
        return { 
          success: false, 
          error: 'Bucket "student-photos" not found. Please create it in Supabase dashboard.' 
        };
      }
      
      return { 
        success: true, 
        message: 'Supabase Storage is properly configured!',
        bucket: studentBucket
      };
      
    } catch (error) {
      console.error('Storage test failed:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('students')
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
}

export const studentService = new StudentService();