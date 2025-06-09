import React from 'react';
import { Table, Space, Button, Tooltip, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import moment from 'moment';
import teacherStore from '../store/teacherStore';
import AddPositionDrawer from './AddPositionDrawer';

const TeacherPositionList = observer(() => {
  const [drawerVisible, setDrawerVisible] = React.useState(false);

  React.useEffect(() => {
    teacherStore.fetchPositions();
  }, []);

  const columns = [
    {
      title: 'Mã vị trí',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: 'Tên vị trí',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      ellipsis: {
        showTitle: false,
      },
      render: (description) => (
        <Tooltip title={description}>
          <span>{description}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'status',
      width: 120,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Đang sử dụng' : 'Đã khóa'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
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
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleEdit = (record) => {
    console.log('Edit position:', record);
  };

  const handleDelete = (record) => {
    // Implement delete logic using teacherStore
    console.log('Delete position:', record);
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Danh sách vị trí công tác</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setDrawerVisible(true)}
        >
          Thêm vị trí mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={teacherStore.positions}
        rowKey={record => record._id}
        loading={teacherStore.loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng số ${total} vị trí`,
        }}
      />

      <AddPositionDrawer
        visible={drawerVisible}
        onClose={handleDrawerClose}
      />
    </div>
  );
});

export default TeacherPositionList;