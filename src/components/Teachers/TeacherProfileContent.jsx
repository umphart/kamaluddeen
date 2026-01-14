import React from 'react';
import {
  FaEnvelope, FaPhone, FaVenusMars, FaMapMarkerAlt,
  FaIdBadge, FaCalendarAlt, FaGraduationCap, FaSchool,
  FaBook, FaBuilding, FaUser, FaBriefcase, FaChalkboardTeacher
} from 'react-icons/fa';
import { MdPerson, MdClass, MdAccountBalance, MdCreditCard } from 'react-icons/md';
import maleAvatar from '../images/TeacterMaleAvata.png';
import femaleAvatar from '../images/TeacherfemaleAvata.png';

const TeacherProfileContent = ({ 
  teacher, 
  getAvatar, 
  formatDate, 
  getYearsOfService, 
  schoolInfo 
}) => {
  const renderProfileHeader = () => (
    <div className="profile-header">
      <div className="profile-photo-container">
        <img 
          src={getAvatar(teacher)} 
          alt={teacher.fullName} 
          className="profile-photo"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = teacher.gender?.toLowerCase() === 'female' ? femaleAvatar : maleAvatar;
          }}
        />
        <div className={`profile-status-indicator ${teacher.status === 'Active' ? 'active' : 'inactive'}`} />
      </div>
      
      <div className="profile-info">
        <h2>{teacher.fullName}</h2>
        
        <div className="badges-container">
          <div className="badge">
            <FaIdBadge />
            <span>{teacher.staffId || 'No ID'}</span>
          </div>
          
          <div className={`badge status-${teacher.status?.toLowerCase() || 'unknown'}`}>
            <FaUser />
            <span>{teacher.status || 'Unknown'}</span>
          </div>
        </div>
        
        {teacher.qualification && (
          <div className="qualification-display">
            <FaGraduationCap />
            {teacher.qualification}
          </div>
        )}
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="profile-section">
      <div className="section-header">
        <MdPerson className="section-icon" />
        <h3>Personal Information</h3>
      </div>
      
      <div className="info-list">
        {teacher.email && (
          <div className="info-row">
            <div className="info-label">
              <FaEnvelope />
              Email:
            </div>
            <div className="info-value">{teacher.email}</div>
          </div>
        )}
        
        {teacher.phone && (
          <div className="info-row">
            <div className="info-label">
              <FaPhone />
              Phone:
            </div>
            <div className="info-value">{teacher.phone}</div>
          </div>
        )}
        
        {teacher.gender && (
          <div className="info-row">
            <div className="info-label">
              <FaVenusMars />
              Gender:
            </div>
            <div className="info-value">{teacher.gender}</div>
          </div>
        )}
        
        {teacher.address && (
          <div className="info-row">
            <div className="info-label">
              <FaMapMarkerAlt />
              Address:
            </div>
            <div className="info-value">{teacher.address}</div>
          </div>
        )}
      </div>
    </div>
  );

  const renderProfessionalInfo = () => (
    <div className="profile-section">
      <div className="section-header">
        <FaBriefcase className="section-icon" />
        <h3>Professional Information</h3>
      </div>
      
      <div className="info-list">
        <div className="info-row">
          <div className="info-label">
            <FaIdBadge />
            Staff ID:
          </div>
          <div className="info-value">{teacher.staffId || 'N/A'}</div>
        </div>
        
        {teacher.dateJoined && (
          <div className="info-row">
            <div className="info-label">
              <FaCalendarAlt />
              Date Joined:
            </div>
            <div className="info-value">{formatDate(teacher.dateJoined)}</div>
          </div>
        )}
        
        {teacher.dateJoined && (
          <div className="info-row">
            <div className="info-label">
              <FaCalendarAlt />
              Years of Service:
            </div>
            <div className="info-value">{getYearsOfService()}</div>
          </div>
        )}
      </div>
    </div>
  );

  const renderTeachingDetails = () => (
    <div className="profile-section">
      <div className="section-header">
        <FaChalkboardTeacher className="section-icon" />
        <h3>Teaching Details</h3>
      </div>
      
      {teacher.subjects?.length > 0 ? (
        <div className="subjects-container">
          <div className="info-label">
            <FaBook />
            Subjects:
          </div>
          <div className="subjects-list">
            {teacher.subjects.map((subject, index) => (
              <span key={index} className="subject-tag">
                {subject}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="info-row">
          <div className="info-label">
            <FaBook />
            Subjects:
          </div>
          <div className="info-value">No subjects assigned</div>
        </div>
      )}
      
      {teacher.classAssignments?.length > 0 ? (
        <div className="info-row">
          <div className="info-label">
            <MdClass />
            Class Assignments:
          </div>
          <div className="info-value">
            {teacher.classAssignments.join(', ')}
          </div>
        </div>
      ) : (
        <div className="info-row">
          <div className="info-label">
            <MdClass />
            Class Assignments:
          </div>
          <div className="info-value">No class assignments</div>
        </div>
      )}
    </div>
  );

  const renderBankDetails = () => {
    if (!teacher.accountNumber && !teacher.accountName && !teacher.bankName) return null;
    
    return (
      <div className="profile-section bank-details">
        <div className="section-header">
          <MdAccountBalance className="section-icon" />
          <h3>Bank Information</h3>
        </div>
        
        <div className="info-list">
          {teacher.bankName && (
            <div className="info-row">
              <div className="info-label">
                <FaBuilding />
                Bank Name:
              </div>
              <div className="info-value">{teacher.bankName}</div>
            </div>
          )}
          
          {teacher.accountNumber && (
            <div className="info-row">
              <div className="info-label">
                <MdCreditCard />
                Account Number:
              </div>
              <div className="info-value account-number">{teacher.accountNumber}</div>
            </div>
          )}
          
          {teacher.accountName && (
            <div className="info-row">
              <div className="info-label">
                <FaUser />
                Account Name:
              </div>
              <div className="info-value">{teacher.accountName}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSchoolInfo = () => (
    <div className="school-info">
      <h4>
        <FaSchool />
        School Information
      </h4>
      <div className="school-info-grid">
        <div className="school-info-item">
          <FaSchool size={14} />
          <div><strong>Name:</strong> {schoolInfo.name}</div>
        </div>
        <div className="school-info-item">
          <FaSchool size={14} />
          <div><strong>Motto:</strong> {schoolInfo.motto}</div>
        </div>
        <div className="school-info-item">
          <FaMapMarkerAlt size={14} />
          <div><strong>Address:</strong> {schoolInfo.address}</div>
        </div>
        <div className="school-info-item">
          <FaPhone size={14} />
          <div><strong>Phone:</strong> {schoolInfo.phone}</div>
        </div>
        <div className="school-info-item">
          <FaEnvelope size={14} />
          <div><strong>Email:</strong> {schoolInfo.email}</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {renderProfileHeader()}
      
      <div className="sections-grid">
        {renderPersonalInfo()}
        {renderProfessionalInfo()}
        {renderTeachingDetails()}
        {renderBankDetails()}
      </div>
      
      {renderSchoolInfo()}
    </>
  );
};

export { TeacherProfileContent };