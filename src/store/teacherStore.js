import { makeAutoObservable } from 'mobx';
import * as teacherService from '../services/teacherService';

class TeacherStore {
  teachers = [];
  positions = [];
  loading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
    this.loadInitialData();
  }

  loadInitialData = async () => {
    try {
      // Load data from localStorage first for immediate display
      const savedTeachers = localStorage.getItem('teachers');
      if (savedTeachers) {
        this.teachers = JSON.parse(savedTeachers);
      }

      // Then fetch from server to get the latest data
      await this.fetchTeachers();
      await this.fetchPositions();
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  setTeachers(teachers) {
    if (Array.isArray(teachers)) {
      this.teachers = teachers;
      // Save to localStorage whenever teachers are updated
      localStorage.setItem('teachers', JSON.stringify(teachers));
    }
  }

  setPositions(positions) {
    if (Array.isArray(positions)) {
      this.positions = positions;
    }
  }

  setLoading(loading) {
    this.loading = loading;
  }

  setError(error) {
    this.error = error;
  }

  addTeacherToList(teacher) {
    if (teacher) {
      const updatedTeachers = [...this.teachers, teacher];
      this.setTeachers(updatedTeachers);
    }
  }

  removeTeacherFromList(teacherId) {
    const updatedTeachers = this.teachers.filter(t => {
      const id = typeof t._id === 'object' ? t._id.$oid : t._id;
      return id !== teacherId;
    });
    this.setTeachers(updatedTeachers);
  }

  async fetchTeachers() {
    try {
      this.setLoading(true);
      const response = await teacherService.getTeachers();
      
      if (response && Array.isArray(response)) {
        // Merge with existing localStorage data
        const savedTeachers = localStorage.getItem('teachers');
        if (savedTeachers) {
          const localTeachers = JSON.parse(savedTeachers);
          // Combine and remove duplicates based on _id
          const mergedTeachers = [...response];
          localTeachers.forEach(localTeacher => {
            const localId = typeof localTeacher._id === 'object' ? 
              localTeacher._id.$oid : localTeacher._id;
            const exists = mergedTeachers.some(t => {
              const tId = typeof t._id === 'object' ? t._id.$oid : t._id;
              return tId === localId;
            });
            if (!exists) {
              mergedTeachers.push(localTeacher);
            }
          });
          this.setTeachers(mergedTeachers);
        } else {
          this.setTeachers(response);
        }
      }
      
      this.setError(null);
    } catch (error) {
      this.setError(error.message);
      console.error('Error fetching teachers:', error);
      
      // If API fails, use localStorage data
      const savedTeachers = localStorage.getItem('teachers');
      if (savedTeachers) {
        this.setTeachers(JSON.parse(savedTeachers));
      }
    } finally {
      this.setLoading(false);
    }
  }

  async fetchPositions() {
    try {
      this.setLoading(true);
      const positions = await teacherService.getPositions();
      this.setPositions(positions);
      this.setError(null);
    } catch (error) {
      this.setError(error.message);
      console.error('Error fetching positions:', error);
    } finally {
      this.setLoading(false);
    }
  }

  async addTeacher(teacherData) {
    try {
      this.setLoading(true);
      const response = await teacherService.addTeacher(teacherData);
      
      if (response) {
        // Add to local state and localStorage
        this.addTeacherToList(response);
        
        // Refresh the teacher list to ensure consistency
        await this.fetchTeachers();
      }
      
      this.setError(null);
      return response;
    } catch (error) {
      console.error('Error adding teacher:', error);
      this.setError(error.message);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async updateTeacher(id, teacherData) {
    try {
      this.setLoading(true);
      const response = await teacherService.updateTeacher(id, teacherData);
      
      if (response) {
        const index = this.teachers.findIndex(t => {
          const teacherId = typeof t._id === 'object' ? t._id.$oid : t._id;
          return teacherId === id;
        });
        
        if (index !== -1) {
          const updatedTeachers = [...this.teachers];
          updatedTeachers[index] = response;
          this.setTeachers(updatedTeachers);
        }
        
        // Refresh the teacher list to ensure consistency
        await this.fetchTeachers();
      }
      
      return response;
    } catch (error) {
      this.setError(error.message);
      console.error('Error updating teacher:', error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async deleteTeacher(teacherId) {
    try {
      this.setLoading(true);
      
      // Delete from server first
      await teacherService.deleteTeacher(teacherId);
      
      // Then remove from local state and localStorage
      this.removeTeacherFromList(teacherId);
      
      // Refresh the teacher list to ensure consistency
      await this.fetchTeachers();
      
      this.setError(null);
      return true;
    } catch (error) {
      // If server deletion fails, refresh the teacher list
      await this.fetchTeachers();
      this.setError('Không thể xóa giáo viên. Vui lòng thử lại sau.');
      console.error('Error deleting teacher:', error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }
}

export default new TeacherStore();