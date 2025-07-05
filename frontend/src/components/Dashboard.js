import React from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Divider } from 'antd';
import { PieChart, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import noticiasMock from './biblioteca_publicacoes_mock.json';

const { Title, Text } = Typography;

const formatMilhoes = (valor, prefix = '', sufix = ' M') => {
  if (typeof valor !== 'number') return valor;
  return prefix + (valor / 1_000_000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + sufix;
};

const Dashboard = ({ data, tema }) => {
  // Se não receber data, gera a partir do JSON e do tema
  let dashboardData = data;
  if (!dashboardData) {
    // Filtra notícias pelo tema, se fornecido
    let noticias = noticiasMock;
    if (tema) {
      const termoLower = tema.toLowerCase();
      noticias = noticiasMock.filter(n =>
        (n['Título'] || '').toLowerCase().includes(termoLower) ||
        (n['Conteúdo'] || '').toLowerCase().includes(termoLower) ||
        (n['Assunto específico'] || '').toLowerCase().includes(termoLower)
      );
    }
    // Mapeia para o formato esperado
    const noticiasFormatadas = noticias.map(n => ({
      titulo: n['Título'],
      fonte: n['Fonte'],
      data: n['Data'],
      descricao: n['Conteúdo'],
      sentimento: 'neutro', // pode usar função de sentimento se desejar
      impressoes: parseInt((n['Alcance orgânico'] || '0').replace(/[^\d]/g, '')),
      valoracao: parseFloat((n['Valoração'] || '0').replace(/[^\d,]/g, '').replace(',', '.'))
    }));
    // Indicadores
    const totalPublicacoes = noticiasFormatadas.length;
    const totalImpressoes = noticiasFormatadas.reduce((acc, n) => acc + (n.impressoes || 0), 0);
    const totalValoracao = noticiasFormatadas.reduce((acc, n) => acc + (n.valoracao || 0), 0);
    const totalFontes = new Set(noticiasFormatadas.map(n => n.fonte)).size;
    // Evolução por data
    const evolucaoMap = {};
    noticiasFormatadas.forEach(n => {
      const dataKey = n.data.split(' ')[0];
      if (!evolucaoMap[dataKey]) evolucaoMap[dataKey] = { data: dataKey, publicacoes: 0, impressoes: 0 };
      evolucaoMap[dataKey].publicacoes += 1;
      evolucaoMap[dataKey].impressoes += n.impressoes || 0;
    });
    const evolucao = Object.values(evolucaoMap).sort((a, b) => new Date(a.data.split('/').reverse().join('-')) - new Date(b.data.split('/').reverse().join('-')));
    // Resultados por mídia
    const midiasMap = {};
    noticiasFormatadas.forEach(n => {
      if (!midiasMap[n.fonte]) midiasMap[n.fonte] = { fonte: n.fonte, publicacoes: 0, impressoes: 0, valoracao: 0 };
      midiasMap[n.fonte].publicacoes += 1;
      midiasMap[n.fonte].impressoes += n.impressoes || 0;
      midiasMap[n.fonte].valoracao += n.valoracao || 0;
    });
    const midias = Object.values(midiasMap).sort((a, b) => b.impressoes - a.impressoes);
    // Top 10 fontes
    const topFontes = midias.slice(0, 10);
    // Top 5 matérias
    const topMaterias = noticiasFormatadas
      .sort((a, b) => (b.impressoes || 0) - (a.impressoes || 0))
      .slice(0, 5)
      .map(n => ({ titulo: n.titulo, impressoes: n.impressoes, valoracao: n.valoracao }));
    dashboardData = {
      bigNumbers: {
        totalPublicacoes,
        totalImpressoes,
        totalValoracao,
        totalFontes
      },
      evolucao,
      midias,
      topFontes,
      topMaterias
    };
  }

  // Big Numbers
  const bigs = [
    { label: 'Publicações', value: dashboardData.bigNumbers.totalPublicacoes },
    { label: 'Impressões', value: formatMilhoes(dashboardData.bigNumbers.totalImpressoes) },
    { label: 'Valoração', value: formatMilhoes(dashboardData.bigNumbers.totalValoracao, 'R$') },
    { label: 'Fontes', value: dashboardData.bigNumbers.totalFontes }
  ];

  // Gráfico de evolução
  const evolucao = dashboardData.evolucao.map(e => ({ ...e, data: e.data.slice(8, 10) + '/' + e.data.slice(5, 7) + '/' + e.data.slice(0, 4) }));

  // Tabela de mídias
  const midiasColumns = [
    { title: 'Mídia', dataIndex: 'fonte', key: 'fonte' },
    { title: 'Publicações', dataIndex: 'publicacoes', key: 'publicacoes' },
    { title: 'Impressões', dataIndex: 'impressoes', key: 'impressoes', render: v => formatMilhoes(v) },
    { title: 'Valoração', dataIndex: 'valoracao', key: 'valoracao', render: v => formatMilhoes(v, 'R$') }
  ];

  // Top 10 fontes (bar chart)
  const topFontes = dashboardData.topFontes;

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
        <Table columns={midiasColumns} dataSource={dashboardData.midias} size="small" pagination={false} rowKey="fonte" />
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
            <Table columns={topMateriasColumns} dataSource={dashboardData.topMaterias} size="small" pagination={false} rowKey="titulo" />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 