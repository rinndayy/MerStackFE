import teachers from '../data/teachers.json';
import positions from '../data/positions.json';
import users from '../data/users.json';

export const getTeachers = () => {
  // Lọc ra những user có role là TEACHER
  const teacherUsers = users.filter(user => user.role === "TEACHER");
  
  return teacherUsers.map(user => {
    // Tìm thông tin teacher tương ứng với user
    const teacher = teachers.find(t => t.userId.$oid === user._id.$oid);
    
    if (!teacher) return null;

    // Lấy thông tin vị trí từ bảng positions
    const teacherPositions = teacher.teacherPositionsId.map(posId => {
      const position = positions.find(p => p._id.$oid === posId.$oid);
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
    
    // Kết hợp thông tin từ cả 3 bảng
    return {
      ...teacher,
      userId: user,  // Thông tin cá nhân từ bảng users
      teacherPositions    // Thông tin vị trí công tác
    };
  }).filter(Boolean); // Lọc bỏ các giá trị null
};

export const getPositions = () => {
  return positions.map(position => ({
    _id: position._id,
    code: position.code,
    name: position.name,
    description: position.des,
    isActive: position.isActive,
    isDeleted: position.isDeleted
  }));
};

export const addTeacher = (teacherData) => {
  const newTeacher = {
    _id: {
      $oid: Math.random().toString(36).substr(2, 9)
    },
    code: teacherData.code,
    startDate: {
      $date: teacherData.startDate
    },
    isActive: true,
    isDeleted: false,
    userId: {
      $oid: Math.random().toString(36).substr(2, 9)
    },
    teacherPositionsId: teacherData.positions.map(posId => ({
      $oid: posId
    })),
    degrees: teacherData.degrees.map(degree => ({
      ...degree,
      type: degree.name,
      year: degree.graduationYear,
      isGraduated: true,
      _id: {
        $oid: Math.random().toString(36).substr(2, 9)
      }
    }))
  };

  const newUser = {
    _id: newTeacher.userId,
    ...teacherData.userId,
    dob: {
      $date: teacherData.userId.dateOfBirth
    },
    phoneNumber: teacherData.userId.phone,
    role: "TEACHER",
    isDeleted: false
  };

  teachers.push(newTeacher);
  users.push(newUser);
  return newTeacher;
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