// src/services/academicService.js
import { supabase } from './supabaseClient';

export class AcademicService {
  // ========== SUBJECTS ==========
  
  async getAllSubjects() {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;
      return data.map(this.mapSubjectToFrontend);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      return [];
    }
  }

  async addSubject(subjectData) {
    try {
      const subjectPayload = {
        code: subjectData.code,
        name: subjectData.name,
        classes: subjectData.classes || [],
        teacher_name: subjectData.teacher,
        status: subjectData.status || 'Active',
      };

      const { data, error } = await supabase
        .from('subjects')
        .insert([subjectPayload])
        .select()
        .single();

      if (error) throw error;
      return this.mapSubjectToFrontend(data);
    } catch (error) {
      console.error('Error adding subject:', error);
      throw error;
    }
  }

  async updateSubject(id, updates) {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.mapSubjectToFrontend(data);
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
  }

  async deleteSubject(id) {
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  }

  mapSubjectToFrontend(dbSubject) {
    return {
      id: dbSubject.id,
      code: dbSubject.code,
      name: dbSubject.name,
      description: dbSubject.description,
      level: dbSubject.level,
      classes: dbSubject.classes || [],
      teacher: dbSubject.teacher_name,
      status: dbSubject.status,
      weeklyPeriods: dbSubject.weekly_periods,
      color: dbSubject.color,
      createdAt: dbSubject.created_at,
      updatedAt: dbSubject.updated_at
    };
  }

  // ========== CLASSES ==========
  
  async getAllClasses() {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name');

      if (error) throw error;
      return data.map(this.mapClassToFrontend);
    } catch (error) {
      console.error('Error fetching classes:', error);
      return [];
    }
  }

  async addClass(classData) {
    try {
      const classPayload = {
        name: classData.name,
        level: classData.level,
        teacher_name: classData.teacher,
        capacity: classData.capacity || 40,
        status: 'Active'
      };

      const { data, error } = await supabase
        .from('classes')
        .insert([classPayload])
        .select()
        .single();

      if (error) throw error;
      return this.mapClassToFrontend(data);
    } catch (error) {
      console.error('Error adding class:', error);
      throw error;
    }
  }

  mapClassToFrontend(dbClass) {
    return {
      id: dbClass.id,
      name: dbClass.name,
      level: dbClass.level,
      teacher: dbClass.teacher_name,
      capacity: dbClass.capacity,
      students: dbClass.current_students,
      subjects: dbClass.subject_count,
      status: dbClass.status,
      createdAt: dbClass.created_at,
      updatedAt: dbClass.updated_at
    };
  }

  // ========== TIMETABLES ==========
  
  async getTimetable(classId) {
    try {
      const { data, error } = await supabase
        .from('timetables')
        .select('*')
        .eq('class_id', classId)
        .order('day, time_slot');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching timetable:', error);
      return [];
    }
  }

  async saveTimetablePeriod(classId, day, timeSlot, periodData) {
    try {
      const { error } = await supabase
        .from('timetables')
        .upsert({
          class_id: classId,
          class_name: periodData.className,
          day: day,
          time_slot: timeSlot,
          subject_id: periodData.subjectId,
          subject_name: periodData.subjectName,
          teacher_id: periodData.teacherId,
          teacher_name: periodData.teacherName
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving timetable:', error);
      throw error;
    }
  }

  // ========== STATISTICS ==========
  
  async getAcademicStatistics() {
    try {
      const [subjects, classes, timetables] = await Promise.all([
        this.getAllSubjects(),
        this.getAllClasses(),
        supabase.from('timetables').select('*')
      ]);

      const totalPeriods = subjects.reduce((sum, subject) => sum + subject.weeklyPeriods, 0);
      const uniqueTeachers = new Set(subjects.map(s => s.teacher)).size;

      return {
        totalSubjects: subjects.length,
        totalClasses: classes.length,
        totalPeriods,
        uniqueTeachers,
        averageSubjectsPerClass: classes.length > 0 
          ? subjects.length / classes.length 
          : 0
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return {
        totalSubjects: 0,
        totalClasses: 0,
        totalPeriods: 0,
        uniqueTeachers: 0,
        averageSubjectsPerClass: 0
      };
    }
  }

  // ========== UTILITY METHODS ==========
  
  async searchSubjects(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('name');

      if (error) throw error;
      return data.map(this.mapSubjectToFrontend);
    } catch (error) {
      console.error('Error searching subjects:', error);
      return [];
    }
  }

  async searchClasses(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,teacher_name.ilike.%${searchTerm}%`)
        .order('name');

      if (error) throw error;
      return data.map(this.mapClassToFrontend);
    } catch (error) {
      console.error('Error searching classes:', error);
      return [];
    }
  }

  // Get available levels
  getLevels() {
    return [
      { code: 'PN', name: 'Pre-Nursery' },
      { code: 'NU', name: 'Nursery' },
      { code: 'PR', name: 'Primary' },
      { code: 'JS', name: 'Junior Secondary' },
      { code: 'All', name: 'All Levels' }
    ];
  }

  // Get all available classes
  getAllAvailableClasses() {
    return [
      'Pre-Nursery', 'Nursery 1', 'Nursery 2',
      'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4',
      'JSS 1', 'JSS 2', 'JSS 3', 'All Classes'
    ];
  }

  // Get days of week
  getDaysOfWeek() {
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  }

  // Get time slots
  getTimeSlots() {
    return [
      '8:00 - 8:40', '8:40 - 9:20', '9:20 - 10:00',
      '10:20 - 11:00', '11:00 - 11:40', '11:40 - 12:20',
      '1:00 - 1:40', '1:40 - 2:20', '2:20 - 3:00'
    ];
  }
}

export const academicService = new AcademicService();