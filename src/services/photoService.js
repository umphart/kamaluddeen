// src/services/photoService.js
import { supabase } from '../lib/supabaseClient';

export const photoService = {
  // Get photo URL from Supabase storage
  async getStudentPhotoUrl(admissionNumber) {
    try {
      if (!admissionNumber) return null;
      
      // Try to get the photo URL from the students table first
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('photo_url')
        .eq('admission_number', admissionNumber)
        .single();

      if (studentError) {
        console.error('Error fetching student photo URL:', studentError);
        return null;
      }

      if (studentData?.photo_url) {
        // If it's a full URL, return it directly
        if (studentData.photo_url.startsWith('http')) {
          return studentData.photo_url;
        }
        
        // If it's a storage path, get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('student-photos')
          .getPublicUrl(studentData.photo_url);
          
        return publicUrl;
      }
      
      return null;
    } catch (error) {
      console.error('Error in getStudentPhotoUrl:', error);
      return null;
    }
  },

  // Alternative: Get photo directly from storage
  async getPhotoFromStorage(admissionNumber) {
    try {
      const fileName = `student_${admissionNumber}.jpg`;
      const { data: { publicUrl } } = supabase.storage
        .from('student-photos')
        .getPublicUrl(fileName);
      
      // Test if the image exists
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = () => resolve(publicUrl);
        img.onerror = () => reject();
        img.src = publicUrl;
      }).catch(() => null);
      
      return publicUrl;
    } catch (error) {
      return null;
    }
  }
};