import { makeAutoObservable } from 'mobx';
import * as teacherService from '../services/teacherService';

class TeacherStore {
  teachers = [];
  positions = [];
  loading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
    // Load data from localStorage when store is created
    const savedTeachers = localStorage.getItem('teachers');
    if (savedTeachers) {
      this.teachers = JSON.parse(savedTeachers);
    }
  }

  setTeachers(teachers) {
    this.teachers = teachers;
    // Save to localStorage whenever teachers are updated
    localStorage.setItem('teachers', JSON.stringify(teachers));
  }

  setPositions(positions) {
    this.positions = positions;
  }

  setLoading(loading) {
    this.loading = loading;
  }

  setError(error) {
    this.error = error;
  }

  addTeacherToList(teacher) {
    const updatedTeachers = [...this.teachers, teacher];
    this.setTeachers(updatedTeachers);
  }

  removeTeacherFromList(teacherId) {
    const updatedTeachers = this.teachers.filter(t => t._id.$oid !== teacherId);
    this.setTeachers(updatedTeachers);
  }

  async fetchTeachers() {
    try {
      this.setLoading(true);
      const teachers = await teacherService.getTeachers();
      // Merge with existing localStorage data
      const savedTeachers = localStorage.getItem('teachers');
      if (savedTeachers) {
        const localTeachers = JSON.parse(savedTeachers);
        // Combine and remove duplicates based on _id.$oid
        const mergedTeachers = [...teachers];
        localTeachers.forEach(localTeacher => {
          if (!mergedTeachers.some(t => t._id.$oid === localTeacher._id.$oid)) {
            mergedTeachers.push(localTeacher);
          }
        });
        this.setTeachers(mergedTeachers);
      } else {
        this.setTeachers(teachers);
      }
      this.setError(null);
    } catch (error) {
      this.setError(error.message);
      console.error('Error fetching teachers:', error);
      // If API fails, still load from localStorage
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
      // Tạo ID mới cho teacher và user
      const teacherId = Math.random().toString(36).substr(2, 9);
      const userId = Math.random().toString(36).substr(2, 9);

      // Tạo đối tượng teacher mới
      const newTeacher = {
        _id: {
          $oid: teacherId
        },
        code: teacherData.code,
        startDate: {
          $date: teacherData.startDate
        },
        isActive: true,
        isDeleted: false,
        userId: {
          _id: {
            $oid: userId
          },
          name: teacherData.userId.name,
          email: teacherData.userId.email,
          phoneNumber: teacherData.userId.phone,
          address: teacherData.userId.address,
          identity: teacherData.userId.identity,
          dob: {
            $date: teacherData.userId.dateOfBirth
          },
          role: "TEACHER",
          isDeleted: false
        },
        teacherPositions: teacherData.positions.map(posId => {
          const position = this.positions.find(p => p._id.$oid === posId);
          return {
            _id: position._id,
            code: position.code,
            name: position.name,
            des: position.description
          };
        }),
        degrees: [{
          _id: {
            $oid: Math.random().toString(36).substr(2, 9)
          },
          name: teacherData.degrees[0].name,
          institution: teacherData.degrees[0].major,
          graduationYear: teacherData.degrees[0].graduationYear,
          isGraduated: true
        }]
      };

      // Thêm vào danh sách và lưu vào localStorage
      this.addTeacherToList(newTeacher);
      this.setError(null);
      return newTeacher;
    } catch (error) {
      console.error('Error adding teacher:', error);
      this.setError(error.message);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async addPosition(positionData) {
    try {
      this.setLoading(true);
      const newPosition = await teacherService.addPosition(positionData);
      await this.fetchPositions();
      this.setError(null);
      return newPosition;
    } catch (error) {
      this.setError(error.message);
      console.error('Error adding position:', error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async updateTeacher(id, teacherData) {
    try {
      this.setLoading(true);
      const updatedTeacher = await teacherService.updateTeacher(id, teacherData);
      if (updatedTeacher) {
        const index = this.teachers.findIndex(t => t._id.$oid === id);
        if (index !== -1) {
          const updatedTeachers = [...this.teachers];
          updatedTeachers[index] = updatedTeacher;
          this.setTeachers(updatedTeachers);
        }
      }
      return updatedTeacher;
    } catch (error) {
      this.setError(error.message);
      console.error('Error updating teacher:', error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async updatePosition(id, positionData) {
    try {
      this.setLoading(true);
      const updatedPosition = await teacherService.updatePosition(id, positionData);
      if (updatedPosition) {
        await this.fetchPositions();
      }
      return updatedPosition;
    } catch (error) {
      this.setError(error.message);
      console.error('Error updating position:', error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async deleteTeacher(teacherId) {
    try {
      this.setLoading(true);
      this.removeTeacherFromList(teacherId);
      this.setError(null);
    } catch (error) {
      this.setError(error.message);
      console.error('Error deleting teacher:', error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }
}

export default new TeacherStore();