import React from 'react';
import { Drawer, Form, Input, Button, DatePicker, Select, Space } from 'antd';
import { observer } from 'mobx-react-lite';
import moment from 'moment';
import teacherStore from '../store/teacherStore';

const { Option } = Select;

const AddTeacherDrawer = observer(({ visible, onClose }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (visible) {
      teacherStore.fetchPositions();
    }
  }, [visible]);

  const handleSubmit = async (values) => {
    try {
      const teacherData = {
        code: values.code,
        startDate: values.startDate.toISOString(),
        positions: values.positions,
        degrees: [{
          name: values.degreeType,
          major: values.major,
          graduationYear: values.graduationYear.year()
        }],
        isActive: true,
        userId: {
          name: values.name,
          email: values.email,
          phone: values.phone,
          address: values.address,
          identity: values.identity,
          dateOfBirth: values.dateOfBirth.toISOString(),
          role: 'TEACHER'
        }
      };

      await teacherStore.addTeacher(teacherData);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error('Error adding teacher:', error);
    }
  };

  return (
    <Drawer
      title="Thêm giáo viên mới"
      width={720}
      onClose={onClose}
      open={visible}
      bodyStyle={{ paddingBottom: 80 }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          startDate: moment(),
          dateOfBirth: moment().subtract(25, 'years')
        }}
      >
        <h3>Thông tin cá nhân</h3>
        <Form.Item
          name="name"
          label="Họ và tên"
          rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không hợp lệ' }
          ]}
        >
          <Input />
        </Form.Item>

        <Space style={{ display: 'flex', gap: 8 }}>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="identity"
            label="CMND/CCCD"
            rules={[{ required: true, message: 'Vui lòng nhập CMND/CCCD' }]}
          >
            <Input />
          </Form.Item>
        </Space>

        <Form.Item
          name="address"
          label="Địa chỉ"
          rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="dateOfBirth"
          label="Ngày sinh"
          rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
        >
          <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
        </Form.Item>

        <h3>Thông tin công việc</h3>
        <Form.Item
          name="code"
          label="Mã giáo viên"
          rules={[{ required: true, message: 'Vui lòng nhập mã giáo viên' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="positions"
          label="Vị trí công tác"
          rules={[{ required: true, message: 'Vui lòng chọn vị trí công tác' }]}
        >
          <Select mode="multiple" placeholder="Chọn vị trí công tác">
            {teacherStore.positions.map(pos => (
              <Option key={pos._id.$oid} value={pos._id.$oid}>
                {pos.name} - {pos.des}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="startDate"
          label="Ngày bắt đầu"
          rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
        >
          <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
        </Form.Item>

        <h3>Thông tin bằng cấp</h3>
        <Form.Item
          name="degreeType"
          label="Loại bằng cấp"
          rules={[{ required: true, message: 'Vui lòng chọn loại bằng cấp' }]}
        >
          <Select>
            <Option value="Cử nhân">Cử nhân</Option>
            <Option value="Thạc sĩ">Thạc sĩ</Option>
            <Option value="Tiến sĩ">Tiến sĩ</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="major"
          label="Chuyên ngành"
          rules={[{ required: true, message: 'Vui lòng nhập chuyên ngành' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="graduationYear"
          label="Năm tốt nghiệp"
          rules={[{ required: true, message: 'Vui lòng chọn năm tốt nghiệp' }]}
        >
          <DatePicker picker="year" style={{ width: '100%' }} />
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

export default AddTeacherDrawer; 