// src/services/resultsService.js - Updated version
import { supabase } from './supabaseClient';
import { studentService } from './studentService';

export class ResultsService {
  // ========== UTILITY METHODS ==========
  
  getCurrentAcademicYear() {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    return `${currentYear}/${nextYear}`;
  }

  getTerms() {
    return [
      { value: '1st Term', label: 'First Term' },
      { value: '2nd Term', label: 'Second Term' },
      { value: '3rd Term', label: 'Third Term' }
    ];
  }

  getExamTypes() {
    return [
      { value: 'First Term', label: 'First Term Exam' },
      { value: 'Second Term', label: 'Second Term Exam' },
      { value: 'Third Term', label: 'Third Term Exam' },
      { value: 'Final Exam', label: 'Final Exam' }
    ];
  }

  // ========== GET RESULTS ==========
  
  async getResultsByFilters(filters = {}) {
    try {
      let query = supabase
        .from('results')
        .select('*')
        .order('student_name', { ascending: true });

      // Apply filters
      if (filters.className && filters.className !== 'All Classes') {
        query = query.eq('class_name', filters.className);
      }
      
      if (filters.term) {
        query = query.eq('term', filters.term);
      }
      
      if (filters.academicYear) {
        query = query.eq('academic_year', filters.academicYear);
      }
      
      if (filters.studentId) {
        query = query.eq('student_id', filters.studentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Map results with student photos
      const resultsWithPhotos = await this.enrichResultsWithStudentPhotos(data);
      
      return resultsWithPhotos;
    } catch (error) {
      console.error('Error fetching results:', error);
      return [];
    }
  }

  async getStudentResults(studentId, term, academicYear) {
    try {
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .eq('student_id', studentId)
        .eq('term', term)
        .eq('academic_year', academicYear)
        .order('subject_name');

      if (error) throw error;
      
      // Get student photo
      let studentPhotoUrl = null;
      try {
        const student = await studentService.getStudentById(studentId);
        studentPhotoUrl = student?.photo;
      } catch (err) {
        console.warn('Could not fetch student photo:', err);
      }
      
      return data?.map(item => this.mapToFrontendFormat(item, studentPhotoUrl)) || [];
    } catch (error) {
      console.error('Error fetching student results:', error);
      return [];
    }
  }

  async getClassResults(className, term, academicYear) {
    try {
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .eq('class_name', className)
        .eq('term', term)
        .eq('academic_year', academicYear)
        .order('student_name');

      if (error) throw error;
      
      // Enrich with student photos
      const resultsWithPhotos = await this.enrichResultsWithStudentPhotos(data);
      
      return resultsWithPhotos;
    } catch (error) {
      console.error('Error fetching class results:', error);
      return [];
    }
  }

  // Helper method to enrich results with student photos
  async enrichResultsWithStudentPhotos(results) {
    if (!results || results.length === 0) return [];
    
    // Get unique student IDs
    const uniqueStudentIds = [...new Set(results.map(r => r.student_id))];
    const studentPhotoMap = {};
    
    // Fetch all student photos
    try {
      const studentPromises = uniqueStudentIds.map(async (studentId) => {
        const student = await studentService.getStudentById(studentId);
        if (student) {
          studentPhotoMap[studentId] = student.photo;
        }
      });
      await Promise.all(studentPromises);
    } catch (error) {
      console.warn('Could not fetch some student photos:', error);
    }
    
    // Map results with photos
    return results.map(item => {
      const studentPhotoUrl = studentPhotoMap[item.student_id] || item.student_photo_url;
      return this.mapToFrontendFormat(item, studentPhotoUrl);
    });
  }

  async getExistingResult(studentId, subjectId, term, academicYear) {
    try {
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .eq('student_id', studentId)
        .eq('subject_id', subjectId)
        .eq('term', term)
        .eq('academic_year', academicYear)
        .maybeSingle();

      if (error) throw error;
      return data ? this.mapToFrontendFormat(data) : null;
    } catch (error) {
      console.error('Error fetching existing result:', error);
      return null;
    }
  }

  // ========== ADD/UPDATE RESULTS ==========
  
  async addResult(resultData) {
    try {
      // Check if result already exists
      const existingResult = await this.getExistingResult(
        resultData.studentId,
        resultData.subjectId,
        resultData.term,
        resultData.academicYear
      );

      if (existingResult) {
        // Update existing result instead of creating new
        return await this.updateResult(existingResult.id, resultData);
      }

      // Get student photo
      let studentPhotoUrl = null;
      try {
        const student = await studentService.getStudentById(resultData.studentId);
        studentPhotoUrl = student?.photo;
      } catch (error) {
        console.warn('Could not fetch student photo:', error);
      }

      const resultPayload = {
        student_id: resultData.studentId,
        admission_number: resultData.admissionNumber,
        student_name: resultData.studentName,
        student_photo_url: studentPhotoUrl, // Add student photo URL
        class_name: resultData.className,
        subject_id: resultData.subjectId,
        subject_code: resultData.subjectCode,
        subject_name: resultData.subjectName,
        exam_type: resultData.examType || 'Final Exam',
        term: resultData.term,
        academic_year: resultData.academicYear || this.getCurrentAcademicYear(),
        ca_score: this.parseScore(resultData.caScore),
        exam_score: this.parseScore(resultData.examScore),
        total_score: this.parseScore(resultData.caScore) + this.parseScore(resultData.examScore),
        grade: resultData.grade || this.calculateGrade(this.parseScore(resultData.caScore) + this.parseScore(resultData.examScore)),
        remarks: resultData.remarks || this.calculateRemarks(resultData.grade),
        teacher_id: resultData.teacherId,
        teacher_name: resultData.teacherName,
        entered_by: resultData.enteredBy || 'Teacher'
      };

      console.log('Adding result:', resultPayload);

      const { data, error } = await supabase
        .from('results')
        .insert([resultPayload])
        .select()
        .single();

      if (error) {
        // Check for constraint violations
        if (error.code === '23514') {
          throw new Error('Invalid scores. CA must be 0-30, Exam must be 0-70.');
        }
        if (error.code === '23503') {
          throw new Error('Invalid student or subject ID.');
        }
        throw error;
      }
      
      return this.mapToFrontendFormat(data, studentPhotoUrl);
    } catch (error) {
      console.error('Error adding result:', error);
      throw error;
    }
  }

  async updateResult(resultId, resultData) {
    try {
      const updatePayload = {
        ca_score: this.parseScore(resultData.caScore),
        exam_score: this.parseScore(resultData.examScore),
        total_score: this.parseScore(resultData.caScore) + this.parseScore(resultData.examScore),
        grade: resultData.grade || this.calculateGrade(
          this.parseScore(resultData.caScore) + this.parseScore(resultData.examScore)
        ),
        remarks: resultData.remarks || this.calculateRemarks(resultData.grade),
        updated_at: new Date().toISOString()
      };

      console.log('Updating result:', updatePayload);

      const { data, error } = await supabase
        .from('results')
        .update(updatePayload)
        .eq('id', resultId)
        .select()
        .single();

      if (error) {
        if (error.code === '23514') {
          throw new Error('Invalid scores. CA must be 0-30, Exam must be 0-70.');
        }
        throw error;
      }
      
      return this.mapToFrontendFormat(data);
    } catch (error) {
      console.error('Error updating result:', error);
      throw error;
    }
  }

  async bulkAddResults(results) {
    try {
      const resultsToInsert = [];
      const resultsToUpdate = [];
      
      // Create a map of student IDs to photo URLs
      const studentPhotoMap = {};
      const uniqueStudentIds = [...new Set(results.map(r => r.studentId))];
      
      // Fetch all student photos at once
      try {
        const studentPromises = uniqueStudentIds.map(async (studentId) => {
          const student = await studentService.getStudentById(studentId);
          if (student) {
            studentPhotoMap[studentId] = student.photo;
          }
        });
        await Promise.all(studentPromises);
      } catch (error) {
        console.warn('Could not fetch some student photos:', error);
      }

      // Separate new and existing results
      for (const result of results) {
        const existingResult = await this.getExistingResult(
          result.studentId,
          result.subjectId,
          result.term,
          result.academicYear || this.getCurrentAcademicYear()
        );

        if (existingResult) {
          resultsToUpdate.push({
            id: existingResult.id,
            resultData: result
          });
        } else {
          resultsToInsert.push({
            ...result,
            studentPhotoUrl: studentPhotoMap[result.studentId] || null
          });
        }
      }

      const savedResults = [];

      // Insert new results
      if (resultsToInsert.length > 0) {
        const resultsPayload = resultsToInsert.map(result => ({
          student_id: result.studentId,
          admission_number: result.admissionNumber,
          student_name: result.studentName,
          student_photo_url: result.studentPhotoUrl, // Add student photo
          class_name: result.className,
          subject_id: result.subjectId,
          subject_code: result.subjectCode,
          subject_name: result.subjectName,
          exam_type: result.examType || 'Final Exam',
          term: result.term,
          academic_year: result.academicYear || this.getCurrentAcademicYear(),
          ca_score: this.parseScore(result.caScore),
          exam_score: this.parseScore(result.examScore),
          total_score: this.parseScore(result.caScore) + this.parseScore(result.examScore),
          grade: result.grade || this.calculateGrade(
            this.parseScore(result.caScore) + this.parseScore(result.examScore)
          ),
          remarks: result.remarks || this.calculateRemarks(result.grade),
          teacher_id: result.teacherId,
          teacher_name: result.teacherName,
          entered_by: result.enteredBy || 'Teacher'
        }));

        console.log('Bulk inserting:', resultsPayload);

        const { data: insertedData, error: insertError } = await supabase
          .from('results')
          .insert(resultsPayload)
          .select();

        if (insertError) {
          if (insertError.code === '23514') {
            throw new Error('Invalid scores. CA must be 0-30, Exam must be 0-70.');
          }
          throw insertError;
        }

        savedResults.push(...(insertedData?.map(item => this.mapToFrontendFormat(item)) || []));
      }

      // Update existing results
      if (resultsToUpdate.length > 0) {
        const updatePromises = resultsToUpdate.map(async ({ id, resultData }) => {
          try {
            const updated = await this.updateResult(id, resultData);
            return updated;
          } catch (error) {
            console.error(`Error updating result ${id}:`, error);
            throw error;
          }
        });

        const updatedResults = await Promise.all(updatePromises);
        savedResults.push(...updatedResults);
      }

      return savedResults;
    } catch (error) {
      console.error('Error bulk adding results:', error);
      throw error;
    }
  }

  // ========== DELETE RESULTS ==========
  
  async deleteResult(resultId) {
    try {
      const { error } = await supabase
        .from('results')
        .delete()
        .eq('id', resultId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting result:', error);
      throw error;
    }
  }

  async deleteStudentResults(studentId, term, academicYear) {
    try {
      const { error } = await supabase
        .from('results')
        .delete()
        .eq('student_id', studentId)
        .eq('term', term)
        .eq('academic_year', academicYear);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting student results:', error);
      throw error;
    }
  }

  // In src/services/resultsService.js, add these methods to the ResultsService class:

// ========== STUDENT SUMMARIES ==========

async getStudentSummaries(className, term, academicYear) {
  try {
    // Get all results for the class/term/year
    const results = await this.getClassResults(className, term, academicYear);
    
    if (!results || results.length === 0) {
      return [];
    }
    
    // Group results by student
    const studentMap = {};
    
    results.forEach(result => {
      const studentId = result.studentId;
      
      if (!studentMap[studentId]) {
        studentMap[studentId] = {
          studentId: studentId,
          studentName: result.studentName,
          admissionNumber: result.admissionNumber,
          studentPhotoUrl: result.studentPhotoUrl,
          subjects: [],
          caScores: [],
          examScores: [],
          totalScores: []
        };
      }
      
      // Add subject data
      studentMap[studentId].subjects.push({
        name: result.subjectName,
        teacher: result.teacherName,
        caScore: this.parseScore(result.caScore),
        examScore: this.parseScore(result.examScore),
        totalScore: this.parseScore(result.totalScore),
        grade: result.grade
      });
      
      // Add scores for averages
      const caScore = this.parseScore(result.caScore);
      const examScore = this.parseScore(result.examScore);
      const totalScore = this.parseScore(result.totalScore);
      
      studentMap[studentId].caScores.push(caScore);
      studentMap[studentId].examScores.push(examScore);
      studentMap[studentId].totalScores.push(totalScore);
    });
    
    // Calculate summaries for each student
    const summaries = Object.values(studentMap).map(student => {
      const totalSubjects = student.subjects.length;
      
      // Calculate sums
      const caScoreSum = student.caScores.reduce((sum, score) => sum + score, 0);
      const examScoreSum = student.examScores.reduce((sum, score) => sum + score, 0);
      const totalScoreSum = student.totalScores.reduce((sum, score) => sum + score, 0);
      
      // Calculate averages
      const caAverage = totalSubjects > 0 ? caScoreSum / totalSubjects : 0;
      const examAverage = totalSubjects > 0 ? examScoreSum / totalSubjects : 0;
      const totalAverage = totalSubjects > 0 ? totalScoreSum / totalSubjects : 0;
      
      // Calculate grade based on total average
      const overallGrade = this.calculateGrade(totalAverage);
      
      return {
        ...student,
        totalSubjects,
        caScoreSum: parseFloat(caScoreSum.toFixed(1)),
        examScoreSum: parseFloat(examScoreSum.toFixed(1)),
        totalScoreSum: parseFloat(totalScoreSum.toFixed(1)),
        caAverage: parseFloat(caAverage.toFixed(1)),
        examAverage: parseFloat(examAverage.toFixed(1)),
        totalAverage: parseFloat(totalAverage.toFixed(1)),
        overallGrade,
        position: 0 // Will be set after sorting
      };
    });
    
    // Sort by total average (descending) and assign positions
    summaries.sort((a, b) => b.totalAverage - a.totalAverage);
    
    summaries.forEach((student, index) => {
      student.position = index + 1;
    });
    
    return summaries;
  } catch (error) {
    console.error('Error calculating student summaries:', error);
    return [];
  }
}

async getClassStatisticsWithSummaries(className, term, academicYear) {
  try {
    // Get student summaries
    const studentSummaries = await this.getStudentSummaries(className, term, academicYear);
    
    if (!studentSummaries || studentSummaries.length === 0) {
      return {
        classAverage: 0,
        topStudent: null,
        gradeDistribution: {},
        studentSummaries: []
      };
    }
    
    // Calculate class average from student averages
    const totalAverageSum = studentSummaries.reduce((sum, student) => 
      sum + parseFloat(student.totalAverage || 0), 0);
    const classAverage = studentSummaries.length > 0 
      ? totalAverageSum / studentSummaries.length 
      : 0;
    
    // Get top student
    const topStudent = studentSummaries[0] || null;
    
    // Calculate grade distribution
    const gradeDistribution = studentSummaries.reduce((dist, student) => {
      const grade = student.overallGrade || 'F';
      dist[grade] = (dist[grade] || 0) + 1;
      return dist;
    }, { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 });
    
    return {
      classAverage: parseFloat(classAverage.toFixed(1)),
      topStudent,
      gradeDistribution,
      studentSummaries
    };
  } catch (error) {
    console.error('Error calculating class statistics:', error);
    return {
      classAverage: 0,
      topStudent: null,
      gradeDistribution: {},
      studentSummaries: []
    };
  }
}
  // ========== DATA MAPPING ==========
  
  mapToFrontendFormat(dbResult, studentPhotoUrl = null) {
    if (!dbResult) return null;
    
    // Use provided photo URL or fall back to database value
    const photoUrl = studentPhotoUrl || dbResult.student_photo_url;
    
    return {
      id: dbResult.id,
      studentId: dbResult.student_id,
      admissionNumber: dbResult.admission_number,
      studentName: dbResult.student_name,
      studentPhotoUrl: photoUrl, // Add student photo URL
      className: dbResult.class_name,
      subjectId: dbResult.subject_id,
      subjectCode: dbResult.subject_code,
      subjectName: dbResult.subject_name,
      examType: dbResult.exam_type,
      term: dbResult.term,
      academicYear: dbResult.academic_year,
      caScore: dbResult.ca_score?.toString() || '',
      examScore: dbResult.exam_score?.toString() || '',
      totalScore: dbResult.total_score,
      grade: dbResult.grade,
      remarks: dbResult.remarks,
      teacherId: dbResult.teacher_id,
      teacherName: dbResult.teacher_name,
      enteredBy: dbResult.entered_by,
      enteredAt: dbResult.entered_at,
      updatedAt: dbResult.updated_at,
      isNew: false
    };
  }

  // ========== HELPER METHODS ==========
  
  parseScore(score) {
    if (score === '' || score === null || score === undefined) {
      return 0;
    }
    const parsed = parseFloat(score);
    return isNaN(parsed) ? 0 : parsed;
  }

  // ========== STATISTICS ==========
  
async getClassStatistics(className, term, academicYear) {
  try {
    const statistics = await this.getClassStatisticsWithSummaries(className, term, academicYear);
    
    return {
      total: statistics.studentSummaries.length,
      pending: 0, // You might need to calculate this separately
      completed: statistics.studentSummaries.length,
      averageScore: statistics.classAverage,
      passRate: this.calculatePassRate(statistics.studentSummaries),
      totalStudents: statistics.studentSummaries.length,
      totalSubjects: this.calculateTotalSubjects(statistics.studentSummaries),
      gradeDistribution: statistics.gradeDistribution,
      classAverage: statistics.classAverage,
      topStudent: statistics.topStudent,
      studentSummaries: statistics.studentSummaries
    };
  } catch (error) {
    console.error('Error getting class statistics:', error);
    return {
      total: 0,
      pending: 0,
      completed: 0,
      averageScore: 0,
      passRate: 0,
      totalStudents: 0,
      totalSubjects: 0,
      gradeDistribution: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 },
      classAverage: 0,
      topStudent: null,
      studentSummaries: []
    };
  }
}

// Add these helper methods to the class:
calculatePassRate(studentSummaries) {
  if (!studentSummaries || studentSummaries.length === 0) return 0;
  
  const passingStudents = studentSummaries.filter(student => {
    const grade = student.overallGrade || 'F';
    return grade !== 'F';
  }).length;
  
  return (passingStudents / studentSummaries.length) * 100;
}

calculateTotalSubjects(studentSummaries) {
  if (!studentSummaries || studentSummaries.length === 0) return 0;
  
  const firstStudent = studentSummaries[0];
  return firstStudent.totalSubjects || 0;
}
  // ========== GRADE CALCULATION ==========
  
  calculateGrade(totalScore) {
    if (totalScore >= 80) return 'A';
    if (totalScore >= 70) return 'B';
    if (totalScore >= 60) return 'C';
    if (totalScore >= 50) return 'D';
    if (totalScore >= 40) return 'E';
    return 'F';
  }

  calculateRemarks(grade) {
    const remarks = {
      'A': 'Excellent',
      'B': 'Very Good',
      'C': 'Good',
      'D': 'Pass',
      'E': 'Fair',
      'F': 'Fail'
    };
    return remarks[grade] || 'Needs Improvement';
  }

  // ========== VALIDATION ==========
  
  validateScores(caScore, examScore) {
    const errors = [];
    
    const ca = this.parseScore(caScore);
    const exam = this.parseScore(examScore);
    
    if (ca < 0 || ca > 30) {
      errors.push('CA Score must be between 0 and 30');
    }
    
    if (exam < 0 || exam > 70) {
      errors.push('Exam Score must be between 0 and 70');
    }
    
    const total = ca + exam;
    if (total < 0 || total > 100) {
      errors.push('Total score must be between 0 and 100');
    }
    
    return errors;
  }

  // ========== EXPORT METHODS ==========
  
  async exportClassResults(className, term, academicYear) {
    try {
      const results = await this.getClassResults(className, term, academicYear);
      
      // Group by student
      const groupedByStudent = {};
      results.forEach(result => {
        if (!groupedByStudent[result.studentId]) {
          groupedByStudent[result.studentId] = {
            studentName: result.studentName,
            admissionNumber: result.admissionNumber,
            studentPhotoUrl: result.studentPhotoUrl, // Include photo URL
            results: []
          };
        }
        groupedByStudent[result.studentId].results.push({
          subject: result.subjectName,
          caScore: result.caScore,
          examScore: result.examScore,
          totalScore: result.totalScore,
          grade: result.grade
        });
      });

      return Object.values(groupedByStudent);
    } catch (error) {
      console.error('Error exporting results:', error);
      return [];
    }
  }
}


export const resultsService = new ResultsService();