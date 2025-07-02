import React from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Divider } from 'antd';
import { PieChart, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';

const { Title, Text } = Typography;

const formatMilhoes = (valor, prefix = '', sufix = ' M') => {
  if (typeof valor !== 'number') return valor;
  return prefix + (valor / 1_000_000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + sufix;
};

const Dashboard = ({ data, tema }) => {
  if (!data) return null;

  // Big Numbers
  const bigs = [
    { label: 'Publicações', value: data.bigNumbers.totalPublicacoes },
    { label: 'Impressões', value: formatMilhoes(data.bigNumbers.totalImpressoes) },
    { label: 'Valoração', value: formatMilhoes(data.bigNumbers.totalValoracao, 'R$') },
    { label: 'Fontes', value: data.bigNumbers.totalFontes }
  ];

  // Gráfico de evolução
  const evolucao = data.evolucao.map(e => ({ ...e, data: e.data.slice(8, 10) + '/' + e.data.slice(5, 7) + '/' + e.data.slice(0, 4) }));

  // Tabela de mídias
  const midiasColumns = [
    { title: 'Mídia', dataIndex: 'fonte', key: 'fonte' },
    { title: 'Publicações', dataIndex: 'publicacoes', key: 'publicacoes' },
    { title: 'Impressões', dataIndex: 'impressoes', key: 'impressoes', render: v => formatMilhoes(v) },
    { title: 'Valoração', dataIndex: 'valoracao', key: 'valoracao', render: v => formatMilhoes(v, 'R$') }
  ];

  // Top 10 fontes (bar chart)
  const topFontes = data.topFontes;

  // Top 5 matérias (tabela)
  const topMateriasColumns = [
    { title: 'Título', dataIndex: 'titulo', key: 'titulo', ellipsis: true },
    { title: 'Visualizações', dataIndex: 'impressoes', key: 'impressoes', render: v => formatMilhoes(v) },
    { title: 'Valoração', dataIndex: 'valoracao', key: 'valoracao', render: v => formatMilhoes(v, 'R$') }
  ];

  return (
    <div>
      <Title level={3} style={{ marginTop: 28 }}>Flash Report</Title>
      <Title level={2} style={{ color: '#6c4ed9', marginTop: 0, marginBottom: 24, fontSize: 48 }}>{tema ? tema : '[Nome do Tema]'}</Title>
      <Text strong style={{ fontSize: 16 }}>Principais indicadores <span style={{ color: '#6c4ed9' }}>sobre os temas</span></Text>
      <Card style={{ margin: '16px 0', borderRadius: 16, boxShadow: '0 2px 8px #ececff' }}>
        <Row gutter={32} justify="center">
          {bigs.map((b, i) => (
            <Col key={b.label} span={6} style={{ textAlign: 'center' }}>
              <Statistic title={b.label} value={b.value} valueStyle={{ color: '#6c4ed9', fontWeight: 700 }} />
            </Col>
          ))}
        </Row>
      </Card>
      <Divider orientation="left" style={{ color: '#6c4ed9' }}>Evolução de publicações x impressões</Divider>
      <Card style={{ marginBottom: 24, borderRadius: 16 }}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={evolucao} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="data" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="publicacoes" fill="#6c4ed9" barSize={30} />
            <Line type="monotone" dataKey="impressoes" stroke="#ff9900" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
      <Divider orientation="left" style={{ color: '#6c4ed9' }}>Resultados por mídia</Divider>
      <Card style={{ marginBottom: 24, borderRadius: 16 }}>
        <Table columns={midiasColumns} dataSource={data.midias} size="small" pagination={false} rowKey="fonte" />
      </Card>
      <Row gutter={24}>
        <Col span={12}>
          <Divider orientation="left" style={{ color: '#6c4ed9' }}>Top 10 fontes que mais geraram visualizações</Divider>
          <Card style={{ borderRadius: 16 }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topFontes} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" />
                <YAxis dataKey="fonte" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="impressoes" fill="#6c4ed9" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Divider orientation="left" style={{ color: '#6c4ed9' }}>Top 5 matérias que mais geraram visualizações</Divider>
          <Card style={{ borderRadius: 16 }}>
            <Table columns={topMateriasColumns} dataSource={data.topMaterias} size="small" pagination={false} rowKey="titulo" />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 