import axios from 'axios';
import teachers from '../data/teachers.json';
import positions from '../data/positions.json';
import users from '../data/users.json';

const API_URL = 'http://localhost:5000/api'; // Adjust the API URL as needed

export const getTeachers = async () => {
  try {
    // Get MongoDB data
    const response = await axios.get(`${API_URL}/teachers`);
    const mongoTeachers = response.data.data || [];

    // Get static data
    const teacherUsers = users.filter(user => user.role === "TEACHER");
    const staticTeachers = teacherUsers.map(user => {
      const teacher = teachers.find(t => t.userId.$oid === user._id.$oid);
      if (!teacher) return null;

      const teacherPositions = teacher.teacherPositionsId.map(posId => {
        const position = positions.find(p => p._id.$oid === (posId.$oid || posId));
        if (position) {
          return {
            _id: position._id,
            code: position.code,
            name: position.name,
            des: position.des
          };
        }
        return null;
      }).filter(Boolean);

      // Thêm thông tin user từ users.json
      const userInfo = users.find(u => u._id.$oid === teacher.userId.$oid);
      
      return {
        ...teacher,
        userId: {
          _id: userInfo._id,
          name: userInfo.name,
          email: userInfo.email,
          phoneNumber: userInfo.phoneNumber,
          identity: userInfo.identity,
          dob: userInfo.dob,
          address: userInfo.address
        },
        teacherPositions
      };
    }).filter(Boolean);

    // Combine MongoDB and static data
    const combinedTeachers = [...mongoTeachers];
    staticTeachers.forEach(staticTeacher => {
      const exists = combinedTeachers.some(t => {
        const staticId = typeof staticTeacher._id === 'object' ? staticTeacher._id.$oid : staticTeacher._id;
        const mongoId = typeof t._id === 'object' ? t._id.$oid : t._id;
        return staticId === mongoId || 
               (t.userId && staticTeacher.userId && t.userId._id === staticTeacher.userId._id);
      });
      if (!exists) {
        combinedTeachers.push(staticTeacher);
      }
    });

    return { data: combinedTeachers };
  } catch (error) {
    console.error('Error fetching teachers:', error);
    // If MongoDB fetch fails, return only static data
    const teacherUsers = users.filter(user => user.role === "TEACHER");
    const staticTeachers = teacherUsers.map(user => {
      const teacher = teachers.find(t => t.userId.$oid === user._id.$oid);
      if (!teacher) return null;

      const teacherPositions = teacher.teacherPositionsId.map(posId => {
        const position = positions.find(p => p._id.$oid === (posId.$oid || posId));
        if (position) {
          return {
            _id: position._id,
            code: position.code,
            name: position.name,
            des: position.des
          };
        }
        return null;
      }).filter(Boolean);

      // Thêm thông tin user từ users.json
      const userInfo = users.find(u => u._id.$oid === teacher.userId.$oid);
      
      return {
        ...teacher,
        userId: {
          _id: userInfo._id,
          name: userInfo.name,
          email: userInfo.email,
          phoneNumber: userInfo.phoneNumber,
          identity: userInfo.identity,
          dob: userInfo.dob,
          address: userInfo.address
        },
        teacherPositions
      };
    }).filter(Boolean);

    return { data: staticTeachers };
  }
};

export const getPositions = async () => {
  try {
    // Get positions from MongoDB
    const response = await axios.get(`${API_URL}/teacher-positions`);
    const mongoPositions = response.data.data;

    // Get positions from local storage
    const localPositions = positions.map(position => ({
      _id: position._id,
      code: position.code,
      name: position.name,
      description: position.des,
      isActive: position.isActive,
      isDeleted: position.isDeleted
    }));

    // Combine positions from both sources
    const combinedPositions = [...mongoPositions];
    localPositions.forEach(localPosition => {
      if (!combinedPositions.some(p => p._id.$oid === localPosition._id.$oid)) {
        combinedPositions.push(localPosition);
      }
    });

    return combinedPositions;
  } catch (error) {
    console.error('Error fetching positions:', error);
    // If API fails, return local data only
    return positions.map(position => ({
      _id: position._id,
      code: position.code,
      name: position.name,
      description: position.des,
      isActive: position.isActive,
      isDeleted: position.isDeleted
    }));
  }
};

export const addTeacher = async (teacherData) => {
  // Check if email exists in local storage first
  const emailExists = users.some(user => user.email === teacherData.userId.email);
  if (emailExists) {
    throw new Error('Email already exists');
  }

  // Generate new IDs
  const teacherId = Math.random().toString(36).substr(2, 9);
  const userId = Math.random().toString(36).substr(2, 9);

  // Prepare local storage data first
  const localTeacher = {
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
      $oid: userId
    },
    teacherPositionsId: teacherData.positions.map(posId => ({
      $oid: posId
    })),
    degrees: teacherData.degrees.map(degree => ({
      name: degree.name,
      type: degree.name,
      major: degree.major,
      year: degree.graduationYear,
      isGraduated: true,
      _id: {
        $oid: Math.random().toString(36).substr(2, 9)
      }
    }))
  };

  const localUser = {
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
  };

  // Prepare MongoDB data
  const mongoTeacherData = {
    code: teacherData.code,
    startDate: teacherData.startDate,
    isActive: true,
    teacherPositions: teacherData.positions,
    degrees: teacherData.degrees.map(degree => ({
      name: degree.name,
      institution: degree.major,
      graduationYear: degree.graduationYear
    }))
  };

  const mongoUserData = {
    name: teacherData.userId.name,
    email: teacherData.userId.email,
    phoneNumber: teacherData.userId.phone,
    address: teacherData.userId.address,
    identity: teacherData.userId.identity,
    dob: teacherData.userId.dateOfBirth,
    role: 'TEACHER'
  };

  try {
    // Save to local storage first
    teachers.push(localTeacher);
    users.push(localUser);

    // Then try to save to MongoDB
    try {
      const response = await axios.post(`${API_URL}/teachers`, {
        user: mongoUserData,
        ...mongoTeacherData
      });

      // If MongoDB save fails, we'll keep the local storage data
      // If it succeeds, we'll update the IDs to match MongoDB
      const savedTeacher = response.data.data;
      localTeacher._id.$oid = savedTeacher._id;
      localTeacher.userId.$oid = savedTeacher.userId._id;
      
    } catch (error) {
      console.error("Error saving to MongoDB:", error);
      // Even if MongoDB save fails, we'll keep the local data
    }

    return localTeacher;
  } catch (error) {
    // If any other error occurs, we'll remove the local storage data
    const teacherIndex = teachers.findIndex(t => t._id.$oid === localTeacher._id.$oid);
    if (teacherIndex !== -1) {
      teachers.splice(teacherIndex, 1);
    }
    const userIndex = users.findIndex(u => u._id.$oid === localUser._id.$oid);
    if (userIndex !== -1) {
      users.splice(userIndex, 1);
    }
    throw error;
  }
};

export const addPosition = (positionData) => {
  const newPosition = {
    _id: {
      $oid: Math.random().toString(36).substr(2, 9)
    },
    code: positionData.code,
    des: positionData.description,
    name: positionData.name,
    isActive: true,
    isDeleted: false
  };
  positions.push(newPosition);
  return newPosition;
};

export const updateTeacher = (id, teacherData) => {
  const index = teachers.findIndex(t => t._id.$oid === id);
  if (index !== -1) {
    teachers[index] = { ...teachers[index], ...teacherData };
    return teachers[index];
  }
  return null;
};

export const updatePosition = (id, positionData) => {
  const index = positions.findIndex(p => p._id.$oid === id);
  if (index !== -1) {
    positions[index] = { ...positions[index], ...positionData };
    return positions[index];
  }
  return null;
};

export const deleteTeacher = async (teacherId) => {
  try {
    // Delete from MongoDB
    await axios.delete(`${API_URL}/teachers/${teacherId}`);

    // Delete from local storage
    const index = teachers.findIndex(t => t._id.$oid === teacherId);
    if (index !== -1) {
      teachers.splice(index, 1);
    }
  } catch (error) {
    console.error("Error deleting teacher:", error);
    throw error;
  }
};