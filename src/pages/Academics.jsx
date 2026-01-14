// src/pages/Academics.jsx
import React, { useState, useEffect } from 'react';
import { academicService } from '../services/academicService';
import SubjectsTab from '../components/Academics/SubjectsTab';
import ClassesTab from '../components/Academics/ClassesTab';
import TimetablesTab from '../components/Academics/TimetablesTab';
import CurriculumTab from '../components/Academics/CurriculumTab';
import AcademicsHeader from '../components/Academics/AcademicsHeader';
import AcademicsFilters from '../components/Academics/AcademicsFilters';
import './Academics.css';

const Academics = () => {
  const [activeTab, setActiveTab] = useState('subjects');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [statistics, setStatistics] = useState({
    totalSubjects: 0,
    totalClasses: 0,
    totalPeriods: 0,
    uniqueTeachers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const stats = await academicService.getAcademicStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLevel('all');
    setSelectedStatus('all');
  };

  const handleSubjectAdded = () => {
    loadStatistics(); // Refresh stats
  };

  const handleClassAdded = () => {
    loadStatistics(); // Refresh stats
  };

  const filterProps = {
    searchTerm,
    setSearchTerm,
    selectedLevel,
    setSelectedLevel,
    selectedStatus,
    setSelectedStatus,
    activeTab,
    clearFilters
  };

  return (
    <div className="academics-page">
      <AcademicsHeader 
        statistics={statistics}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSubjectAdded={handleSubjectAdded}
        onClassAdded={handleClassAdded}
      />

      <AcademicsFilters {...filterProps} />

      {activeTab === 'subjects' && (
        <SubjectsTab 
          searchTerm={searchTerm}
          selectedLevel={selectedLevel}
          selectedStatus={selectedStatus}
          onSubjectAdded={handleSubjectAdded}
        />
      )}

      {activeTab === 'classes' && (
        <ClassesTab 
          searchTerm={searchTerm}
          selectedLevel={selectedLevel}
          onClassAdded={handleClassAdded}
        />
      )}

      {activeTab === 'timetables' && (
        <TimetablesTab />
      )}

      {activeTab === 'curriculum' && (
        <CurriculumTab />
      )}
    </div>
  );
};

export default Academics;