import React, { useState } from 'react';
import { Layout, Avatar, Row, Col } from 'antd';
import Chat from './components/Chat';
import Dashboard from './components/Dashboard';

const { Header, Content } = Layout;

function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  // Função para ser passada ao Chat e ativar o dashboard
  const handleShowDashboard = (data) => {
    setDashboardData(data);
    setShowDashboard(true);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#fafbfc' }}>
      <Header style={{ background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px #f0f1f2', position: 'fixed', width: '100%', zIndex: 10, top: 0, left: 0, height: 64}}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="https://pages.cortex-intelligence.com/hs-fs/hubfs/Logo%20cortex%20principal.png?width=110&height=19&name=Logo%20cortex%20principal.png" alt="cortex logo" style={{ height: 22, marginRight: 12 }} />
        </div>
        <Avatar style={{ background: '#e6e6e6', color: '#888' }}>WM</Avatar>
      </Header>
      <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh', paddingTop: 64, background: '#fafbfc', transition: 'all 0.5s' }}>
        {showDashboard ? (
          <Row style={{ width: '100%', maxWidth: 1400, minHeight: 'calc(100vh - 64px)', transition: 'all 0.5s' }} gutter={32}>
            <Col span={16} style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', transition: 'all 0.5s' }}>
              <Dashboard data={dashboardData} tema={dashboardData?.tema} />
            </Col>
            <Col span={8} style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', transition: 'all 0.5s' }}>
              <Chat onShowDashboard={handleShowDashboard} chatMode="sidebar" />
            </Col>
          </Row>
        ) : (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)', transition: 'all 0.5s' }}>
            <h1 style={{ fontSize: 36, fontWeight: 700, color: '#222', marginTop: 36, textAlign: 'center' }}>
              Bem-vindo(a) à sua plataforma de <span style={{ color: '#7B61FF' }}>Comunicação Estratégica</span>
            </h1>
            <div style={{ height: 32 }} />
            <Chat onShowDashboard={handleShowDashboard} />
          </div>
        )}
      </Content>
    </Layout>
  );
}

export default App; 