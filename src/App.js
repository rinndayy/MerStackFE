import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import TeacherList from './components/TeacherList';
import TeacherPositionList from './components/TeacherPositionList';

const { Header, Content } = Layout;

function App() {
  return (
    <Router>
      <Layout className="layout" style={{ minHeight: '100vh' }}>
        <Header>
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
            <Menu.Item key="1">
              <Link to="/">Danh sách giáo viên</Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to="/positions">Vị trí công tác</Link>
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: '0 50px', marginTop: 64 }}>
          <Routes>
            <Route path="/" element={<TeacherList />} />
            <Route path="/positions" element={<TeacherPositionList />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;
