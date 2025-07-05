import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, List, Typography, Spin, Space, Tag } from 'antd';
import { SendOutlined, DownloadOutlined, BarChartOutlined, FileTextOutlined } from '@ant-design/icons';
import noticiasMock from './biblioteca_publicacoes_mock.json';

const { Text } = Typography;

// Componente de animação de digitação
const TypingAnimation = ({ text, onComplete, speed = 30 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
      {displayedText}
      {currentIndex < text.length && <span className="typing-cursor">|</span>}
    </div>
  );
};

// Componente de sugestões
const ChatSuggestions = ({ suggestions, onSuggestionClick, loading }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <Space wrap style={{ margin: '10px 0' }}>
      {suggestions.map((suggestion, index) => {
        if (typeof suggestion === 'string') {
          return (
            <Button
              key={index}
              size="small"
              onClick={() => onSuggestionClick(suggestion)}
              disabled={loading}
              style={{ borderRadius: 20 }}
            >
              {suggestion}
            </Button>
          );
        } else {
          return (
            <Button
              key={index}
              size="small"
              icon={suggestion.icon ? <span>{suggestion.icon}</span> : null}
              onClick={() => onSuggestionClick(suggestion)}
              disabled={loading}
              style={{ borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {suggestion.label}
            </Button>
          );
        }
      })}
    </Space>
  );
};

// Componente de mensagem do chat
const ChatMessage = ({ message, isTyping, onTypingComplete }) => {
  return (
    <div style={{ 
      padding: '12px 16px', 
      margin: '8px 0', 
      borderRadius: 12,
      background: message.type === 'user' ? '#e6f7ff' : '#f8f9fa',
      border: message.type === 'user' ? '1px solid #bae7ff' : '1px solid #e8e8e8',
      maxWidth: '85%',
      alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
      marginLeft: message.type === 'user' ? 'auto' : '0',
      marginRight: message.type === 'user' ? '0' : 'auto'
    }}>
      {isTyping ? (
        <TypingAnimation 
          text={message.text} 
          onComplete={onTypingComplete}
          speed={20}
        />
      ) : (
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
          {message.text}
        </div>
      )}
    </div>
  );
};

// Globalizar o estado das mensagens do chat
let globalMessages = null;

const Chat = ({ onShowDashboard, chatMode }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => globalMessages || [
    { 
      type: 'bot', 
      text: 'Olá! 👋 Sou o **Cortex AI**, seu assistente especializado em monitoramento de comunicação e reputação.\n\nPosso ajudá-lo a:\n• 🔍 Encontrar notícias sobre temas específicos\n• 📊 Gerar dashboards com indicadores\n• 📋 Preparar relatórios em planilha\n• 📝 Criar resumos do conteúdo das notícias\n\nComo posso ajudá-lo hoje?',
      isTyping: true,
      suggestions: ['Dia dos Namorados', 'Energia Nuclear', 'The Town', 'Dia das Mães', 'Novo papa']
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [currentTypingIndex, setCurrentTypingIndex] = useState(0);
  const [currentTema, setCurrentTema] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sempre que as mensagens mudarem, salva no global
  useEffect(() => {
    globalMessages = messages;
  }, [messages]);

  const addMessage = (type, text, suggestions = null, noticias = null) => {
    const newMessage = {
      type,
      text,
      isTyping: type === 'bot',
      suggestions,
      noticias
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    if (type === 'bot') {
      setCurrentTypingIndex(prev => prev + 1);
    }
  };

  const handleTypingComplete = (messageIndex) => {
    setMessages(prev => prev.map((msg, index) => 
      index === messageIndex ? { ...msg, isTyping: false } : msg
    ));
  };

  // Funções utilitárias para processar os dados do mock
  function extrairTema(frase) {
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

  function detectarIntencao(mensagem) {
    const msgLower = mensagem.toLowerCase().trim();
    const saudações = ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'hey', 'hi', 'hello'];
    if (saudações.some(s => msgLower.includes(s))) return 'saudacao';
    const perguntasFuncionalidade = [
      'o que você faz', 'como funciona', 'o que você pode fazer', 'quais são suas funções',
      'me ajude', 'ajuda', 'help', 'funcionalidades', 'recursos'
    ];
    if (perguntasFuncionalidade.some(p => msgLower.includes(p))) return 'funcionalidade';
    return 'busca';
  }

  function gerarResumo(noticias) {
    if (!noticias || noticias.length === 0) {
      return 'Nenhuma notícia encontrada para gerar resumo.';
    }

    // Estatísticas básicas
    const totalPublicacoes = noticias.length;
    const fontesUnicas = [...new Set(noticias.map(n => n.fonte))].length;
    
    // Soma total de impressões (alcance orgânico)
    const totalImpressoes = noticias.reduce((acc, n) => acc + (n.impressoes || 0), 0);
    
    // Soma total de valoração
    const totalValoracao = noticias.reduce((acc, n) => acc + (n.valoracao || 0), 0);

    // Análise de palavras-chave do conteúdo
    const todasAsPalavras = noticias
      .map(n => (n.titulo + ' ' + (n.descricao || '')).toLowerCase())
      .join(' ')
      .split(/\s+/)
      .filter(palavra => {
        // Filtra palavras com mais de 3 caracteres e remove palavras comuns
        const palavrasComuns = [
          'para', 'com', 'não', 'uma', 'por', 'mais', 'como', 'mas', 'foi', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos', 'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'suas', 'minha', 'têm', 'naquele', 'essas', 'esses', 'pelos', 'pelas', 'este', 'fosse', 'dele', 'tu', 'te', 'você', 'vocês', 'lhe', 'deles', 'elas', 'estes', 'estas', 'aquele', 'aquela', 'aqueles', 'aquelas', 'isto', 'aquilo', 'estou', 'está', 'estamos', 'estão', 'estive', 'esteve', 'estivemos', 'estiveram', 'estava', 'estávamos', 'estavam', 'estivera', 'estivéramos', 'esteja', 'estejamos', 'estejam', 'estivesse', 'estivéssemos', 'estivessem', 'estiver', 'estivermos', 'estiverem', 'hei', 'há', 'havemos', 'hão', 'houve', 'houvemos', 'houveram', 'houvera', 'houvéramos', 'haja', 'hajamos', 'hajam', 'houvesse', 'houvéssemos', 'houvessem', 'houver', 'houvermos', 'houverem', 'houverei', 'houverá', 'houveremos', 'houverão', 'houveria', 'houveríamos', 'houveriam', 'sou', 'somos', 'são', 'era', 'éramos', 'eram', 'fora', 'fôramos', 'seja', 'sejamos', 'sejam', 'fosse', 'fôssemos', 'fossem', 'for', 'formos', 'forem', 'serei', 'será', 'seremos', 'serão', 'seria', 'seríamos', 'seriam', 'tenho', 'tem', 'temos', 'têm', 'tinha', 'tínhamos', 'tinham', 'tivera', 'tivéramos', 'tenha', 'tenhamos', 'tenham', 'tivesse', 'tivéssemos', 'tivessem', 'tiver', 'tivermos', 'tiverem', 'terei', 'terá', 'teremos', 'terão', 'teria', 'teríamos', 'teriam'
        ];
        return palavra.length > 3 && !palavrasComuns.includes(palavra) && !/\d/.test(palavra);
      });

    // Conta frequência das palavras
    const frequencia = {};
    todasAsPalavras.forEach(palavra => {
      frequencia[palavra] = (frequencia[palavra] || 0) + 1;
    });

    // Pega as 10 palavras mais frequentes
    const palavrasChave = Object.entries(frequencia)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([palavra]) => palavra);

    // Análise de sentimento
    const sentimentos = noticias.map(n => n.sentimento);
    const positivas = sentimentos.filter(s => s === 'positivo').length;
    const negativas = sentimentos.filter(s => s === 'negativo').length;
    const neutras = sentimentos.filter(s => s === 'neutro').length;

    // Determina sentimento geral
    let sentimentoGeral = 'neutro';
    if (positivas > negativas && positivas > neutras) sentimentoGeral = 'positivo';
    else if (negativas > positivas && negativas > neutras) sentimentoGeral = 'negativo';

    // Formata números para exibição
    const formatarNumero = (num) => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toLocaleString('pt-BR');
    };

    const formatarValor = (valor) => {
      if (valor >= 1000000) {
        return 'R$' + (valor / 1000000).toFixed(1) + 'M';
      } else if (valor >= 1000) {
        return 'R$' + (valor / 1000).toFixed(1) + 'K';
      }
      return 'R$' + valor.toLocaleString('pt-BR');
    };

    // Gera o resumo completo
    let resumo = `📊 **Resumo das ${totalPublicacoes} notícias encontradas:**\n\n`;
    
    resumo += `📈 **Indicadores Principais:**\n`;
    resumo += `• **Total de publicações:** ${totalPublicacoes}\n`;
    resumo += `• **Fontes diferentes:** ${fontesUnicas}\n`;
    resumo += `• **Alcance total:** ${formatarNumero(totalImpressoes)}\n`;
    resumo += `• **Valoração total:** ${formatarValor(totalValoracao)}\n\n`;
    
    resumo += `🎯 **Análise de Sentimento:**\n`;
    resumo += `• Positivas: ${positivas} (${((positivas/totalPublicacoes)*100).toFixed(1)}%)\n`;
    resumo += `• Negativas: ${negativas} (${((negativas/totalPublicacoes)*100).toFixed(1)}%)\n`;
    resumo += `• Neutras: ${neutras} (${((neutras/totalPublicacoes)*100).toFixed(1)}%)\n`;
    resumo += `• **Sentimento geral:** ${sentimentoGeral === 'positivo' ? '✅ Positivo' : sentimentoGeral === 'negativo' ? '❌ Negativo' : '⚪ Neutro'}\n\n`;
    
    resumo += `🔑 **Palavras-chave mais recorrentes:**\n`;
    resumo += `• ${palavrasChave.slice(0, 5).join(', ')}\n`;
    resumo += `• ${palavrasChave.slice(5, 10).join(', ')}\n\n`;
    
    resumo += `💡 **Insights:**\n`;
    if (totalImpressoes > 100000) {
      resumo += `• Alto alcance de mídia com ${formatarNumero(totalImpressoes)} de impressões\n`;
    }
    if (totalValoracao > 10000) {
      resumo += `• Valor significativo de mídia: ${formatarValor(totalValoracao)}\n`;
    }
    if (fontesUnicas > 10) {
      resumo += `• Cobertura diversificada em ${fontesUnicas} fontes diferentes\n`;
    }
    if (sentimentoGeral === 'positivo') {
      resumo += `• Cobertura predominantemente positiva\n`;
    } else if (sentimentoGeral === 'negativo') {
      resumo += `• Cobertura com tom mais crítico\n`;
    } else {
      resumo += `• Cobertura equilibrada entre aspectos positivos e negativos\n`;
    }

    return resumo;
  }

  // Função para gerar descrição a partir do título e conteúdo
  function gerarDescricao(titulo, conteudo) {
    if (!conteudo) return titulo || 'Sem descrição';
    const inicio = conteudo.substring(0, 200);
    const ultimoEspaco = inicio.lastIndexOf(' ');
    const descricao = ultimoEspaco > 150 ? inicio.substring(0, ultimoEspaco) : inicio;
    return descricao + (descricao.length >= 200 ? '...' : '');
  }

  // Função para extrair sentimento do texto (análise básica)
  function extrairSentimento(texto) {
    if (!texto) return 'neutro';
    const textoLower = texto.toLowerCase();
    const positivas = [
      'sucesso', 'crescimento', 'melhoria', 'avanço', 'positivo', 'bom', 'ótimo',
      'excelente', 'destacado', 'liderança', 'inovação', 'desenvolvimento',
      'conquista', 'vitória', 'progresso', 'benefício', 'oportunidade'
    ].filter(p => textoLower.includes(p)).length;
    const negativas = [
      'problema', 'crise', 'queda', 'perda', 'negativo', 'ruim', 'pior',
      'falha', 'erro', 'dificuldade', 'prejuízo', 'risco', 'ameaça',
      'escândalo', 'polêmica', 'controvérsia', 'fracasso'
    ].filter(n => textoLower.includes(n)).length;
    if (positivas > negativas) return 'positivo';
    if (negativas > positivas) return 'negativo';
    return 'neutro';
  }

  // Função para gerar dados de dashboard a partir das notícias formatadas
  function gerarDashboardData(noticiasFormatadas) {
    // Indicadores
    const totalPublicacoes = noticiasFormatadas.length;
    const totalImpressoes = noticiasFormatadas.reduce((acc, n) => acc + (n.impressoes || 0), 0);
    const totalValoracao = noticiasFormatadas.reduce((acc, n) => acc + (n.valoracao || 0), 0);
    const totalFontes = new Set(noticiasFormatadas.map(n => n.fonte)).size;
    
    // Evolução por data
    const evolucaoMap = {};
    noticiasFormatadas.forEach(n => {
      if (n.data && typeof n.data === 'string') {
        // Extrai apenas a data (dd/MM/yyyy) do campo Data
        const dataKey = n.data.split(' ')[0]; // Remove a hora se existir
        if (dataKey && dataKey.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          if (!evolucaoMap[dataKey]) {
            evolucaoMap[dataKey] = { 
              data: dataKey, 
              publicacoes: 0, 
              impressoes: 0 
            };
          }
          evolucaoMap[dataKey].publicacoes += 1;
          evolucaoMap[dataKey].impressoes += n.impressoes || 0;
        }
      }
    });
    
    // Ordena por data (converte dd/MM/yyyy para yyyy-MM-dd para ordenação)
    const evolucao = Object.values(evolucaoMap).sort((a, b) => {
      const dateA = new Date(a.data.split('/').reverse().join('-'));
      const dateB = new Date(b.data.split('/').reverse().join('-'));
      return dateA - dateB;
    });
    
    // Resultados por mídia
    const midiasMap = {};
    noticiasFormatadas.forEach(n => {
      if (!midiasMap[n.fonte]) {
        midiasMap[n.fonte] = { 
          fonte: n.fonte, 
          publicacoes: 0, 
          impressoes: 0, 
          valoracao: 0 
        };
      }
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
      .map(n => ({ 
        titulo: n.titulo, 
        impressoes: n.impressoes, 
        valoracao: n.valoracao 
      }));
    
    return {
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

  const processChatMessage = async (userInput) => {
    setLoading(true);
    try {
      const intencao = detectarIntencao(userInput);
      if (intencao === 'saudacao') {
        addMessage('bot', `Olá! 👋 Sou o **Cortex AI**, seu assistente especializado em monitoramento de comunicação e reputação.\n\nPosso ajudá-lo a:\n• 🔍 Encontrar notícias sobre temas específicos\n• 📊 Gerar dashboards com indicadores\n• 📋 Preparar relatórios em planilha\n• 📝 Criar resumos do conteúdo das notícias\n\nComo posso ajudá-lo hoje?`, ['Dia dos Namorados', 'Energia Nuclear', 'The Town', 'Maternidade']);
      } else if (intencao === 'funcionalidade') {
        addMessage('bot', `🤖 **Cortex AI - Monitoramento Inteligente**\n\nSou um assistente especializado em análise de comunicação e reputação. Aqui está o que posso fazer:\n\n**🔍 Busca Inteligente**\n• Encontro notícias sobre qualquer tema, empresa ou assunto\n• Filtro por período específico\n• Identifico tendências e padrões\n\n**📊 Análise Avançada**\n• Gero dashboards com indicadores de comunicação\n• Analiso sentimento das notícias\n• Identifico fontes mais relevantes\n\n**📋 Relatórios**\n• Crio resumos automáticos do conteúdo\n• Preparo planilhas para exportação\n• Forneço insights estratégicos\n\n**💡 Sugestões Inteligentes**\n• Quando encontro mais de 3 notícias, sugiro opções de análise\n• Guio você pelo processo de forma conversacional\n\nQue tema gostaria de monitorar?`, ['Dia dos Namorados', 'Energia Nuclear', 'The Town', 'Maternidade']);
      } else {
        const temaExtraido = extrairTema(userInput);
        const termoLower = temaExtraido.toLowerCase();
        const resultados = noticiasMock.filter(n =>
          (n.Título || '').toLowerCase().includes(termoLower) ||
          (n.Conteúdo || '').toLowerCase().includes(termoLower) ||
          (n['Assunto específico'] || '').toLowerCase().includes(termoLower)
        );
        const noticiasFormatadas = resultados.map(n => ({
          titulo: n['Título'],
          fonte: n['Fonte'],
          data: n['Data'],
          descricao: gerarDescricao(n['Título'], n['Conteúdo']),
          sentimento: extrairSentimento(n['Conteúdo']),
          impressoes: parseInt((n['Alcance orgânico'] || '0').replace(/[^\d]/g, '')),
          valoracao: parseFloat((n['Valoração'] || '0').replace(/[^\d,]/g, '').replace(',', '.'))
        }));
        if (noticiasFormatadas.length === 0) {
          addMessage('bot', `Não encontrei notícias recentes sobre "${temaExtraido}". 😕\n\nTente outro assunto ou pergunte de outra forma! Algumas sugestões:`, ['Dia dos Namorados', 'Energia Nuclear', 'The Town', 'Maternidade']);
        } else if (noticiasFormatadas.length <= 3) {
          addMessage('bot', `Encontrei ${noticiasFormatadas.length} notícia${noticiasFormatadas.length > 1 ? 's' : ''} sobre "${temaExtraido}".\n\nDeseja ver notícias de algum período específico?`, null, noticiasFormatadas);
        } else {
          addMessage('bot', `🎯 Encontrei ${noticiasFormatadas.length} notícias sobre "${temaExtraido}"!\n\nO que gostaria de fazer com essas informações?`, [
            { key: 'resumo', label: '📝 Gerar resumo do conteúdo', icon: '📝' },
            { key: 'dashboard', label: '📊 Gerar dashboard', icon: '📊' }
          ], noticiasFormatadas);
          setCurrentTema(userInput);
        }
      }
    } catch (error) {
      addMessage('bot', 'Desculpe, tive um problema ao processar sua mensagem. Tente novamente em alguns instantes.');
    }
    setLoading(false);
  };

  const handleAction = async (action) => {
    if (!currentTema) return;
    setLoading(true);
    try {
      const temaExtraido = extrairTema(currentTema);
      const termoLower = temaExtraido.toLowerCase();
      const resultados = noticiasMock.filter(n =>
        (n.Título || '').toLowerCase().includes(termoLower) ||
        (n.Conteúdo || '').toLowerCase().includes(termoLower) ||
        (n['Assunto específico'] || '').toLowerCase().includes(termoLower)
      );
      const noticiasFormatadas = resultados.map(n => ({
        titulo: n['Título'],
        fonte: n['Fonte'],
        data: n['Data'],
        descricao: gerarDescricao(n['Título'], n['Conteúdo']),
        sentimento: extrairSentimento(n['Conteúdo']),
        impressoes: parseInt((n['Alcance orgânico'] || '0').replace(/[^\d]/g, '')),
        valoracao: parseFloat((n['Valoração'] || '0').replace(/[^\d,]/g, '').replace(',', '.'))
      }));
      if (action === 'resumo') {
        addMessage('bot', gerarResumo(noticiasFormatadas));
      } else if (action === 'dashboard' && onShowDashboard) {
        // Simular dados de dashboard
        const dashboardData = gerarDashboardData(noticiasFormatadas);
        onShowDashboard({ ...dashboardData, tema: currentTema });
      }
    } catch (error) {
      addMessage('bot', 'Erro ao processar a ação solicitada. Tente novamente.');
    }
    setLoading(false);
  };

  const handleSend = async (customInput) => {
    const userInput = typeof customInput === 'string' ? customInput : input;
    if (!userInput.trim() || loading) return;

    // Remove mensagem de boas-vindas se for a primeira interação
    setMessages(prev => {
      if (
        prev.length === 1 &&
        prev[0].type === 'bot' &&
        prev[0].text.startsWith('Olá! 👋 Sou o **Cortex AI**')
      ) {
        return [];
      }
      return prev;
    });

    addMessage('user', userInput);
    setInput('');

    await processChatMessage(userInput);
  };

  const handleSuggestionClick = async (suggestion) => {
    if (typeof suggestion === 'string') {
      await handleSend(suggestion);
    } else if (typeof suggestion === 'object' && suggestion.key) {
      await handleAction(suggestion.key);
    }
  };

  return (
    <div style={{
      width: chatMode === 'sidebar' ? '420px' : '100%',
      maxWidth: chatMode === 'sidebar' ? '420px' : 420,
      margin: chatMode === 'sidebar' ? 0 : '0 auto',
      height: chatMode === 'sidebar' ? 'calc(100vh - 64px)' : '100%',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
      position: chatMode === 'sidebar' ? 'fixed' : 'static',
      right: chatMode === 'sidebar' ? 0 : undefined,
      top: chatMode === 'sidebar' ? 64 : undefined,
      zIndex: chatMode === 'sidebar' ? 20 : undefined,
      background: chatMode === 'sidebar' ? '#fff' : undefined,
      boxShadow: chatMode === 'sidebar' ? '-2px 0 16px #e6e6e6' : undefined
    }}>
      {/* Input inicial em card roxo, antes da primeira mensagem do usuário */}
      {messages.filter(m => m.type === 'user').length === 0 ? (
        <Card style={{ background: '#d6c3fa', borderRadius: 16, boxShadow: '0 2px 16px #e6e6e6', margin: '32px 0', width: '100%' }} bodyStyle={{ padding: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 18, color: '#3d246c', marginBottom: 16, textAlign: 'center' }}>
              O que você quer monitorar?
            </div>
            <Input.Group compact style={{ width: '100%' }}>
              <Input
                style={{ width: '80%', background: '#f8f6ff', border: '1px solid #b39ddb' }}
                placeholder="Pode me dizer temas, assuntos ou empresas que gostaria de saber mais."
                value={input}
                onChange={e => setInput(e.target.value)}
                onPressEnter={() => handleSend()}
                disabled={loading}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                style={{ background: '#7B61FF', border: 'none' }}
              />
            </Input.Group>
          </div>
        </Card>
      ) : (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 12px #e6e6e6',
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          height: '100%',
          maxHeight: chatMode === 'sidebar' ? '100%' : undefined
        }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: 24, minHeight: 0, maxHeight: chatMode === 'sidebar' ? 'calc(100vh - 64px)' : undefined }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {messages.map((msg, index) => (
                <div key={index} style={{ display: 'flex', flexDirection: 'column' }}>
                  <ChatMessage
                    message={msg}
                    isTyping={msg.isTyping}
                    onTypingComplete={() => handleTypingComplete(index)}
                  />
                  {!msg.isTyping && msg.suggestions && (
                    <ChatSuggestions
                      suggestions={msg.suggestions}
                      onSuggestionClick={handleSuggestionClick}
                      loading={loading}
                    />
                  )}
                  {!msg.isTyping && msg.noticias && msg.noticias.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      {msg.noticias.slice(0, 3).map((noticia, idx) => (
                        <Card
                          key={idx}
                          size="small"
                          style={{
                            marginBottom: 8,
                            background: '#f6f6ff',
                            border: '1px solid #ececff',
                            borderRadius: 8
                          }}
                        >
                          <div>
                            <Text strong style={{ fontSize: 14 }}>{noticia.titulo}</Text>
                            <div style={{ marginTop: 4 }}>
                              <Tag size="small" color="blue">{noticia.fonte}</Tag>
                              <Tag size="small" color="green">{new Date(noticia.data.split(' ')[0].split('/').reverse().join('-')).toLocaleDateString('pt-BR')}</Tag>
                              <Tag size="small" color={noticia.sentimento === 'positivo' ? 'green' : noticia.sentimento === 'negativo' ? 'red' : 'default'}>
                                {noticia.sentimento}
                              </Tag>
                            </div>
                            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                              {noticia.descricao}
                            </div>
                          </div>
                        </Card>
                      ))}
                      {msg.noticias.length > 3 && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          ... e mais {msg.noticias.length - 3} notícias
                        </Text>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
                  <Spin />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <Card style={{
            background: '#f3eaff',
            borderRadius: '0 0 12px 12px',
            boxShadow: '0 -2px 8px #e6e6e6',
            margin: 0,
            position: 'sticky',
            bottom: 0,
            zIndex: 2
          }} bodyStyle={{ padding: 12 }}>
            <Input.Group compact>
              <Input
                style={{ width: '85%' }}
                placeholder="Digite um tema, empresa ou assunto..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onPressEnter={() => handleSend()}
                disabled={loading}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
              />
            </Input.Group>
          </Card>
        </div>
      )}
      
      <style jsx>{`
        .typing-cursor {
          animation: blink 1s infinite;
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Chat; 