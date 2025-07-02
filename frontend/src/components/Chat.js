import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, List, Typography, Spin, Space, Tag } from 'antd';
import { SendOutlined, DownloadOutlined, BarChartOutlined, FileTextOutlined } from '@ant-design/icons';
import axios from 'axios';

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

  const processChatMessage = async (userInput) => {
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:4000/api/chat/process', {
        message: userInput
      });
      
      const { type, message, suggestions, noticias } = response.data;
      
      addMessage('bot', message, suggestions, noticias);
      
      // Se for busca com muitos resultados, salva o tema atual
      if (type === 'muitos_resultados') {
        setCurrentTema(userInput);
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
      const response = await axios.post('http://localhost:4000/api/chat/action', {
        action,
        termo: currentTema
      });
      
      const { type, message, noticias, followUp, downloadUrl } = response.data;
      
      addMessage('bot', message, followUp ? [followUp] : null, noticias);
      
      if (type === 'dashboard' && onShowDashboard) {
        // Buscar dados do dashboard
        const dashboardResponse = await axios.post('http://localhost:4000/api/dashboard', { 
          termo: currentTema 
        });
        onShowDashboard({ ...dashboardResponse.data, tema: currentTema });
      }
      
      // Se for planilha, adiciona botão de download
      if (type === 'planilha' && downloadUrl) {
        setTimeout(() => {
          addMessage('bot', 'Clique no botão abaixo para baixar a planilha:', [
            { key: 'download', label: '📥 Baixar Planilha', icon: '📥' }
          ]);
        }, 1000);
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
      // É uma sugestão de tema ou período
      await handleSend(suggestion);
    } else if (suggestion === 'download') {
      // Download da planilha
      const downloadUrl = `http://localhost:4000/api/download/planilha?termo=${encodeURIComponent(currentTema)}`;
      window.open(downloadUrl, '_blank');
    } else if (typeof suggestion === 'object' && suggestion.key) {
      // É uma ação (resumo, planilha, dashboard) - objeto com key
      await handleAction(suggestion.key);
    } else {
      // É uma ação (resumo, planilha, dashboard) - string direta
      await handleAction(suggestion);
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
                              <Tag size="small" color="green">{new Date(noticia.data).toLocaleDateString()}</Tag>
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