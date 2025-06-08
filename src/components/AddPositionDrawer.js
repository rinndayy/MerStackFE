import React from 'react';
import { Drawer, Form, Input, Button, Space } from 'antd';
import { observer } from 'mobx-react-lite';
import teacherStore from '../store/teacherStore';

const AddPositionDrawer = observer(({ visible, onClose }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      const positionData = {
        code: values.code.toUpperCase(),
        name: values.name,
        description: values.description,
        isActive: true
      };

      await teacherStore.addPosition(positionData);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error('Error adding position:', error);
    }
  };

  return (
    <Drawer
      title="Thêm vị trí công tác mới"
      width={520}
      onClose={onClose}
      open={visible}
      bodyStyle={{ paddingBottom: 80 }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="code"
          label="Mã vị trí"
          rules={[
            { required: true, message: 'Vui lòng nhập mã vị trí' },
            { pattern: /^[A-Za-z0-9]+$/, message: 'Mã vị trí chỉ được chứa chữ cái và số' }
          ]}
        >
          <Input placeholder="Ví dụ: GS, PGS, GV" />
        </Form.Item>

        <Form.Item
          name="name"
          label="Tên vị trí"
          rules={[{ required: true, message: 'Vui lòng nhập tên vị trí' }]}
        >
          <Input placeholder="Ví dụ: Giáo sư, Phó Giáo sư" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả vị trí' }]}
        >
          <Input.TextArea 
            rows={4}
            placeholder="Mô tả chi tiết về vị trí công tác"
          />
        </Form.Item>

        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={onClose}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={teacherStore.loading}>
              Thêm mới
            </Button>
          </Space>
        </div>
      </Form>
    </Drawer>
  );
});

export default AddPositionDrawer; 