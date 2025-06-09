import React, { useEffect } from 'react';
import { Table, Space, Button, Tooltip, Modal, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import moment from 'moment';
import teacherStore from '../store/teacherStore';
import AddTeacherDrawer from './AddTeacherDrawer';

const { confirm } = Modal;

const TeacherList = observer(() => {
  const [drawerVisible, setDrawerVisible] = React.useState(false);

  useEffect(() => {
    teacherStore.fetchTeachers();
    teacherStore.fetchPositions();
  }, []);

  const showDeleteConfirm = (teacher) => {
    confirm({
      title: 'Xác nhận xóa giáo viên',
      content: `Bạn có chắc chắn muốn xóa giáo viên ${teacher.userId.name} không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        handleDelete(teacher);
      },
    });
  };

  const handleDelete = async (record) => {
    try {
      await teacherStore.deleteTeacher(record._id.$oid);
      Modal.success({
        title: 'Thành công',
        content: 'Đã xóa giáo viên thành công',
      });
    } catch (error) {
      Modal.error({
        title: 'Lỗi',
        content: 'Không thể xóa giáo viên. Vui lòng thử lại sau.',
      });
    }
  };

  const columns = [
    {
      title: 'Mã GV',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: 'Họ và tên',
      dataIndex: ['userId', 'name'],
      key: 'name',
      width: 200,
    },
    {
      title: 'Email',
      dataIndex: ['userId', 'email'],
      key: 'email',
      width: 200,
      render: (text) => text ? (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ) : null,
    },
    {
      title: 'Số điện thoại',
      dataIndex: ['userId', 'phoneNumber'],
      key: 'phoneNumber',
      width: 150,
    },
    {
      title: 'CMND/CCCD',
      dataIndex: ['userId', 'identity'],
      key: 'identity',
      width: 150,
    },
    {
      title: 'Địa chỉ',
      dataIndex: ['userId', 'address'],
      key: 'address',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (address) => address ? (
        <Tooltip title={address}>
          <span>{address}</span>
        </Tooltip>
      ) : null,
    },
    {
      title: 'Ngày sinh',
      dataIndex: ['userId', 'dob'],
      key: 'dob',
      width: 120,
      render: (date) => date ? moment(date.$date || date).format('DD/MM/YYYY') : null,
    },
    {
      title: 'Chức vụ',
      dataIndex: 'teacherPositionsId',
      key: 'positions',
      width: 200,
      render: (positions) => {
        if (!positions) return null;
        return (
          <Space wrap>
            {positions.map((pos) => {
              const posId = typeof pos === 'string' ? pos : pos.$oid;
              const position = teacherStore.positions.find(p => p._id.$oid === posId);
              return position ? (
                <Tag color="blue" key={posId}>
                  {position.name}
                </Tag>
              ) : null;
            })}
          </Space>
        );
      },
    },
    {
      title: 'Bằng cấp',
      dataIndex: 'degrees',
      key: 'degrees',
      width: 300,
      render: (degrees) => degrees ? (
        <Space direction="vertical" size="small">
          {degrees.map((degree, index) => (
            <div key={index}>
              {degree.type} - {degree.major} ({degree.year})
            </div>
          ))}
        </Space>
      ) : null,
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      render: (date) => date ? moment(date).format('DD/MM/YYYY') : null,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'status',
      width: 120,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Đang làm việc' : 'Đã nghỉ việc'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
              type="primary" 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
              onClick={() => showDeleteConfirm(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleEdit = (record) => {
    console.log('Edit teacher:', record);
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Danh sách giáo viên</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setDrawerVisible(true)}
        >
          Thêm giáo viên mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={teacherStore.teachers || []}
        rowKey={record => record._id.$oid}
        loading={teacherStore.loading}
        pagination={{
          showSizeChanger: true,
          showTotal: (total) => `Tổng số ${total} giáo viên`,
          pageSize: 10
        }}
        scroll={{ x: 1800 }}
      />

      <AddTeacherDrawer
        visible={drawerVisible}
        onClose={handleDrawerClose}
      />
    </div>
  );
});

export default TeacherList;