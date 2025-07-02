import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { noticiasMock } from './mockNoticias.js';
import { carregarNoticiasReais } from './csvProcessor.js';

const app = express();
const PORT = 4000;
const GNEWS_API_KEY = '6735fb1d7a54ec42d862ff08a5e36d60';

app.use(cors());
app.use(express.json());

// Variável global para armazenar as notícias reais
let noticiasReais = [];

// Função para inicializar os dados
async function inicializarDados() {
  try {
    console.log('Carregando dados reais do CSV...');
    noticiasReais = await carregarNoticiasReais();
    
    if (noticiasReais.length === 0) {
      console.log('Nenhum dado real encontrado, usando dados mockados...');
      noticiasReais = noticiasMock;
    }
    
    console.log(`Dados carregados: ${noticiasReais.length} notícias`);
  } catch (error) {
    console.error('Erro ao carregar dados reais, usando mockados:', error);
    noticiasReais = noticiasMock;
  }
}

function extrairTema(frase) {
  // Busca por palavras-chave conhecidas
  const temas = [
    { chave: 'namorados', termos: ['namorados', 'dia dos namorados', 'casal', 'presente'] },
    { chave: 'energia nuclear', termos: ['energia nuclear', 'nuclear', 'usina', 'reator', 'angra'] },
    { chave: 'papa', termos: ['papa', 'leão xiv', 'pontífice', 'igreja', 'vaticano', 'francisco'] },
    { chave: 'the town', termos: ['the town', 'festival', 'travis scott', 'ludmilla', 'música'] },
    { chave: 'maternidade', termos: ['maternidade', 'mãe', 'mães', 'carreira', 'mulher'] }
  ];
  const fraseLower = frase.toLowerCase();
  for (const tema of temas) {
    if (tema.termos.some(t => fraseLower.includes(t))) {
      return tema.chave;
    }
  }
  return frase;
}

// Função para detectar intenção da mensagem
function detectarIntencao(mensagem) {
  const msgLower = mensagem.toLowerCase().trim();
  
  // Saudações
  const saudações = ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'hey', 'hi', 'hello'];
  if (saudações.some(s => msgLower.includes(s))) {
    return 'saudacao';
  }
  
  // Perguntas sobre funcionalidades
  const perguntasFuncionalidade = [
    'o que você faz', 'como funciona', 'o que você pode fazer', 'quais são suas funções',
    'me ajude', 'ajuda', 'help', 'funcionalidades', 'recursos'
  ];
  if (perguntasFuncionalidade.some(p => msgLower.includes(p))) {
    return 'funcionalidade';
  }
  
  // Busca de tema
  return 'busca';
}

// Função para gerar resumo das notícias
function gerarResumo(noticias) {
  if (!noticias || noticias.length === 0) {
    return 'Nenhuma notícia encontrada para gerar resumo.';
  }
  
  // Extrai palavras-chave mais frequentes
  const todasAsPalavras = noticias
    .map(n => (n.titulo + ' ' + n.descricao).toLowerCase())
    .join(' ')
    .split(/\s+/)
    .filter(palavra => palavra.length > 3);
  
  const frequencia = {};
  todasAsPalavras.forEach(palavra => {
    frequencia[palavra] = (frequencia[palavra] || 0) + 1;
  });
  
  const palavrasChave = Object.entries(frequencia)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([palavra]) => palavra);
  
  // Analisa sentimento geral
  const sentimentos = noticias.map(n => n.sentimento);
  const positivo = sentimentos.filter(s => s === 'positivo').length;
  const negativo = sentimentos.filter(s => s === 'negativo').length;
  const neutro = sentimentos.filter(s => s === 'neutro').length;
  
  let sentimentoGeral = 'neutro';
  if (positivo > negativo && positivo > neutro) sentimentoGeral = 'positivo';
  else if (negativo > positivo && negativo > neutro) sentimentoGeral = 'negativo';
  
  // Gera resumo
  const totalNoticias = noticias.length;
  const fontesUnicas = [...new Set(noticias.map(n => n.fonte))].length;
  const totalImpressoes = noticias.reduce((acc, n) => acc + (n.impressoes || 0), 0);
  
  let resumo = `📊 **Resumo das ${totalNoticias} notícias encontradas:**\n\n`;
  resumo += `• **Cobertura:** ${fontesUnicas} fontes diferentes\n`;
  resumo += `• **Alcance:** ${totalImpressoes.toLocaleString('pt-BR')} visualizações\n`;
  resumo += `• **Sentimento geral:** ${sentimentoGeral}\n`;
  resumo += `• **Palavras-chave principais:** ${palavrasChave.join(', ')}\n\n`;
  
  // Adiciona insights baseados no sentimento
  if (sentimentoGeral === 'positivo') {
    resumo += `💚 A cobertura sobre este tema tem sido predominantemente positiva, indicando uma percepção favorável na mídia.`;
  } else if (sentimentoGeral === 'negativo') {
    resumo += `🔴 A cobertura apresenta um tom mais crítico, com foco em aspectos desafiadores do tema.`;
  } else {
    resumo += `⚪ A cobertura mantém um equilíbrio entre aspectos positivos e negativos.`;
  }
  
  return resumo;
}

// Endpoint principal do chat
app.post('/api/chat/process', async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Mensagem é obrigatória' });
  }
  
  const intencao = detectarIntencao(message);
  
  switch (intencao) {
    case 'saudacao':
      return res.json({
        type: 'saudacao',
        message: `Olá! 👋 Sou o **Cortex AI**, seu assistente especializado em monitoramento de comunicação e reputação.\n\nPosso ajudá-lo a:\n• 🔍 Encontrar notícias sobre temas específicos\n• 📊 Gerar dashboards com indicadores\n• 📋 Preparar relatórios em planilha\n• 📝 Criar resumos do conteúdo das notícias\n\nComo posso ajudá-lo hoje?`,
        suggestions: ['Dia dos Namorados', 'Energia Nuclear', 'The Town', 'Maternidade']
      });
      
    case 'funcionalidade':
      return res.json({
        type: 'funcionalidade',
        message: `🤖 **Cortex AI - Monitoramento Inteligente**\n\nSou um assistente especializado em análise de comunicação e reputação. Aqui está o que posso fazer:\n\n**🔍 Busca Inteligente**\n• Encontro notícias sobre qualquer tema, empresa ou assunto\n• Filtro por período específico\n• Identifico tendências e padrões\n\n**📊 Análise Avançada**\n• Gero dashboards com indicadores de comunicação\n• Analiso sentimento das notícias\n• Identifico fontes mais relevantes\n\n**📋 Relatórios**\n• Crio resumos automáticos do conteúdo\n• Preparo planilhas para exportação\n• Forneço insights estratégicos\n\n**💡 Sugestões Inteligentes**\n• Quando encontro mais de 3 notícias, sugiro opções de análise\n• Guio você pelo processo de forma conversacional\n\nQue tema gostaria de monitorar?`,
        suggestions: ['Dia dos Namorados', 'Energia Nuclear', 'The Town', 'Maternidade']
      });
      
    case 'busca':
      // Busca notícias
      const temaExtraido = extrairTema(message);
      const termoLower = temaExtraido.toLowerCase();
      
      const resultados = noticiasReais.filter(n =>
        n.titulo.toLowerCase().includes(termoLower) ||
        n.descricao.toLowerCase().includes(termoLower) ||
        n.texto.toLowerCase().includes(termoLower) ||
        n.assuntos.some(a => a.toLowerCase().includes(termoLower))
      );
      
      if (resultados.length === 0) {
        return res.json({
          type: 'sem_resultados',
          message: `Não encontrei notícias recentes sobre "${temaExtraido}". 😕\n\nTente outro assunto ou pergunte de outra forma! Algumas sugestões:`,
          suggestions: ['Dia dos Namorados', 'Energia Nuclear', 'The Town', 'Maternidade']
        });
      }
      
      if (resultados.length <= 3) {
        return res.json({
          type: 'poucos_resultados',
          message: `Encontrei ${resultados.length} notícia${resultados.length > 1 ? 's' : ''} sobre "${temaExtraido}".\n\nDeseja ver notícias de algum período específico?`,
          noticias: resultados,
          suggestions: ['últimos 7 dias', 'mês passado', 'todo o período']
        });
      }
      
      // Mais de 3 resultados - oferece opções
      return res.json({
        type: 'muitos_resultados',
        message: `🎯 Encontrei ${resultados.length} notícias sobre "${temaExtraido}"!\n\nO que gostaria de fazer com essas informações?`,
        noticias: resultados,
        suggestions: [
          { key: 'resumo', label: '📝 Gerar resumo do conteúdo', icon: '📝' },
          { key: 'planilha', label: '📋 Preparar planilha para exportar', icon: '📋' },
          { key: 'dashboard', label: '📊 Gerar dashboard', icon: '📊' }
        ]
      });
  }
});

// Endpoint para gerar resumo
app.post('/api/chat/summary', (req, res) => {
  const { termo } = req.body;
  
  if (!termo) {
    return res.status(400).json({ error: 'Termo é obrigatório' });
  }
  
  const termoLower = termo.toLowerCase();
  const noticias = noticiasReais.filter(n =>
    n.titulo.toLowerCase().includes(termoLower) ||
    n.descricao.toLowerCase().includes(termoLower) ||
    n.texto.toLowerCase().includes(termoLower) ||
    n.assuntos.some(a => a.toLowerCase().includes(termoLower))
  );
  
  const resumo = gerarResumo(noticias);
  
  res.json({
    type: 'resumo',
    message: resumo,
    noticias: noticias,
    followUp: 'Posso ajudar em algo mais?'
  });
});

// Endpoint para processar ação específica
app.post('/api/chat/action', (req, res) => {
  const { action, termo } = req.body;
  
  if (!action || !termo) {
    return res.status(400).json({ error: 'Ação e termo são obrigatórios' });
  }
  
  const termoLower = termo.toLowerCase();
  const noticias = noticiasReais.filter(n =>
    n.titulo.toLowerCase().includes(termoLower) ||
    n.descricao.toLowerCase().includes(termoLower) ||
    n.texto.toLowerCase().includes(termoLower) ||
    n.assuntos.some(a => a.toLowerCase().includes(termoLower))
  );
  
  switch (action) {
    case 'resumo':
      const resumo = gerarResumo(noticias);
      return res.json({
        type: 'resumo',
        message: resumo,
        noticias: noticias,
        followUp: 'Posso ajudar em algo mais?'
      });
      
    case 'planilha':
      return res.json({
        type: 'planilha',
        message: `📋 Preparando planilha com ${noticias.length} notícias sobre "${termo}"...\n\nA planilha incluirá:\n• Título e descrição das notícias\n• Data de publicação\n• Fonte e tipo de mídia\n• Sentimento e valoração\n• Empresas citadas\n\nClique no botão abaixo para baixar:`,
        noticias: noticias,
        downloadUrl: `/api/download/planilha?termo=${encodeURIComponent(termo)}`,
        followUp: 'Posso ajudar em algo mais?'
      });
      
    case 'dashboard':
      return res.json({
        type: 'dashboard',
        message: `📊 Gerando dashboard com indicadores sobre "${termo}"...`,
        noticias: noticias,
        followUp: 'Posso ajudar em algo mais?'
      });
      
    default:
      return res.status(400).json({ error: 'Ação não reconhecida' });
  }
});

app.post('/api/noticias', async (req, res) => {
  const { termo } = req.body;
  if (!termo) {
    return res.status(400).json({ error: 'O campo "termo" é obrigatório.' });
  }
  
  // Extrai o tema principal da frase informal
  const temaExtraido = extrairTema(termo);
  const termoLower = temaExtraido.toLowerCase();
  
  const resultados = noticiasReais.filter(n =>
    n.titulo.toLowerCase().includes(termoLower) ||
    n.descricao.toLowerCase().includes(termoLower) ||
    n.texto.toLowerCase().includes(termoLower) ||
    n.assuntos.some(a => a.toLowerCase().includes(termoLower))
  );
  
  res.json(resultados);
});

app.post('/api/dashboard', (req, res) => {
  const { termo, periodo } = req.body || {};
  let noticiasFiltradas = noticiasReais;

  if (termo) {
    const termoLower = termo.toLowerCase();
    noticiasFiltradas = noticiasFiltradas.filter(n =>
      n.titulo.toLowerCase().includes(termoLower) ||
      n.descricao.toLowerCase().includes(termoLower) ||
      n.texto.toLowerCase().includes(termoLower) ||
      n.assuntos.some(a => a.toLowerCase().includes(termoLower))
    );
  }

  if (periodo && periodo.inicio && periodo.fim) {
    noticiasFiltradas = noticiasFiltradas.filter(n =>
      n.data >= periodo.inicio && n.data <= periodo.fim
    );
  }

  // Indicadores agregados
  const totalPublicacoes = noticiasFiltradas.length;
  const totalImpressoes = noticiasFiltradas.reduce((acc, n) => acc + (n.impressoes || 0), 0);
  const totalValoracao = noticiasFiltradas.reduce((acc, n) => acc + (n.valoracao || 0), 0);
  const fontes = [...new Set(noticiasFiltradas.map(n => n.fonte))];

  // Evolução por data
  const evolucao = {};
  noticiasFiltradas.forEach(n => {
    if (!evolucao[n.data]) evolucao[n.data] = { publicacoes: 0, impressoes: 0 };
    evolucao[n.data].publicacoes += 1;
    evolucao[n.data].impressoes += n.impressoes || 0;
  });
  const evolucaoArray = Object.entries(evolucao).map(([data, val]) => ({ data, ...val }));

  // Resultados por mídia (fonte)
  const midias = {};
  noticiasFiltradas.forEach(n => {
    if (!midias[n.fonte]) midias[n.fonte] = { publicacoes: 0, impressoes: 0, valoracao: 0 };
    midias[n.fonte].publicacoes += 1;
    midias[n.fonte].impressoes += n.impressoes || 0;
    midias[n.fonte].valoracao += n.valoracao || 0;
  });
  const midiasArray = Object.entries(midias).map(([fonte, val]) => ({ fonte, ...val }));

  // Top 10 fontes por visualizações (impressoes)
  const topFontes = midiasArray.sort((a, b) => b.impressoes - a.impressoes).slice(0, 10);

  // Top 5 matérias por visualizações
  const topMaterias = noticiasFiltradas
    .sort((a, b) => (b.impressoes || 0) - (a.impressoes || 0))
    .slice(0, 5)
    .map(n => ({ titulo: n.titulo, impressoes: n.impressoes, valoracao: n.valoracao }));

  res.json({
    bigNumbers: {
      totalPublicacoes,
      totalImpressoes,
      totalValoracao,
      totalFontes: fontes.length
    },
    evolucao: evolucaoArray,
    midias: midiasArray,
    topFontes,
    topMaterias
  });
});

// Endpoint para recarregar dados (útil para desenvolvimento)
app.post('/api/reload', async (req, res) => {
  try {
    await inicializarDados();
    res.json({ message: 'Dados recarregados com sucesso', count: noticiasReais.length });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao recarregar dados' });
  }
});

// Endpoint para verificar status dos dados
app.get('/api/status', (req, res) => {
  res.json({
    totalNoticias: noticiasReais.length,
    usandoDadosReais: noticiasReais.length > 0 && noticiasReais !== noticiasMock,
    primeirasNoticias: noticiasReais.slice(0, 3).map(n => ({
      titulo: n.titulo,
      fonte: n.fonte,
      data: n.data
    }))
  });
});

// Endpoint para download de planilha
app.get('/api/download/planilha', (req, res) => {
  const { termo } = req.query;
  
  if (!termo) {
    return res.status(400).json({ error: 'Termo é obrigatório' });
  }
  
  const termoLower = termo.toLowerCase();
  const noticias = noticiasReais.filter(n =>
    n.titulo.toLowerCase().includes(termoLower) ||
    n.descricao.toLowerCase().includes(termoLower) ||
    n.texto.toLowerCase().includes(termoLower) ||
    n.assuntos.some(a => a.toLowerCase().includes(termoLower))
  );
  
  // Cria CSV para download
  const csvHeader = 'Título,Descrição,Data,Fonte,Tipo de Mídia,Sentimento,Valoração,Impressões,Empresas Citadas,Assuntos\n';
  const csvRows = noticias.map(n => {
    const empresas = Array.isArray(n.empresas_citadas) ? n.empresas_citadas.join('; ') : n.empresas_citadas || '';
    const assuntos = Array.isArray(n.assuntos) ? n.assuntos.join('; ') : n.assuntos || '';
    
    return `"${n.titulo.replace(/"/g, '""')}","${n.descricao.replace(/"/g, '""')}","${n.data}","${n.fonte}","${n.midia}","${n.sentimento}","${n.valoracao}","${n.impressoes}","${empresas}","${assuntos}"`;
  }).join('\n');
  
  const csvContent = csvHeader + csvRows;
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="noticias_${termo.replace(/[^a-zA-Z0-9]/g, '_')}.csv"`);
  res.send(csvContent);
});

// Inicializa os dados quando o servidor inicia
inicializarDados().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend rodando em http://localhost:${PORT}`);
    console.log(`Total de notícias carregadas: ${noticiasReais.length}`);
  });
}).catch(error => {
  console.error('Erro ao inicializar servidor:', error);
  process.exit(1);
}); 