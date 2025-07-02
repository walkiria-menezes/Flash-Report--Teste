# Flash Report - Plataforma SaaS de Monitoramento de Comunicação e Reputação

## Visão Geral

O Flash Report é um módulo de plataforma SaaS que permite ao usuário monitorar temas, empresas ou assuntos na mídia, gerando relatórios rápidos (flash reports) e dashboards interativos com indicadores de comunicação e reputação. O sistema conta com um agente conversacional (chatbot) que entende perguntas naturais, busca notícias reais de uma base de dados CSV e, sob demanda, gera dashboards dinâmicos com gráficos, big numbers e tabelas.

---

## Novidades e Experiência do Chat (2024)

- **Transição de texto estilo GenAI:** As respostas do chat são exibidas com efeito de digitação progressiva, tornando a experiência mais natural e moderna.
- **Apresentação inteligente:** Se o usuário disser "oi" ou "o que você faz?", o chat se apresenta como Cortex AI e explica suas funções.
- **Mensagem de boas-vindas aprimorada:** A mensagem de boas-vindas do chat agora é removida automaticamente assim que o usuário envia a primeira mensagem, evitando que a resposta do bot apareça duplicada no início da conversa.
- **Sugestões inteligentes:** Quando há mais de 3 notícias para um tema, o chat sugere:
  - 📝 Gerar resumo do conteúdo
  - 📋 Preparar planilha para exportar
  - 📊 Gerar dashboard
- **Resumo automático:** O chat pode gerar um resumo das notícias, incluindo palavras-chave, sentimento geral e insights.
- **Download de planilha:** O usuário pode baixar uma planilha CSV das notícias filtradas diretamente pelo chat.
- **Follow-up automático:** Após cada tarefa, o chat pergunta se pode ajudar em algo mais.
- **Botões de ação:** As sugestões do chat são exibidas como botões interativos, que executam ações contextuais (não apenas sugestões de texto).

---

## Atualizações do Dashboard (junho/2024)

- **Indicadores em milhões:** Os indicadores de Impressões e Valoração agora são exibidos no formato de milhões (Ex: 3,84 M e R$9,1 M), facilitando a leitura de grandes números.
- **Título dinâmico:** O título do dashboard agora exibe dinamicamente o nome do tema consultado pelo usuário no chat.
- **Gráfico de evolução aprimorado:** O gráfico "Evolução de publicações x impressões" agora apresenta barras para o total de publicações por dia e uma linha para as impressões, permitindo melhor comparação visual.
- **Tabela de mídias fiel ao backend:** A tabela "Resultados por mídia" reflete exatamente as opções de mídia/fonte presentes no backend, mostrando o total de publicações, impressões e valoração para cada mídia.
- **Integração tema-chat/dashboard:** O dashboard recebe e exibe corretamente o tema buscado pelo usuário, garantindo contexto em todas as visualizações.

---

## Tecnologias Utilizadas

- **Frontend:** React.js, Ant Design, Recharts, Chart.js, Axios
- **Backend:** Node.js, Express
- **Dados:** Base de notícias reais em arquivo CSV + dados mockados como fallback
- **Processamento:** csv-parser, date-fns para normalização de dados
- **Comunicação:** API REST

---

## Estrutura de Pastas

```
flash-report/
│
├── backend/
│   ├── package.json
│   ├── Biblioteca_de_publicacoes3.csv    # Base de dados real
│   └── src/
│       ├── index.js                      # Servidor Express e endpoints
│       ├── mockNoticias.js               # Base de notícias mockadas (fallback)
│       └── csvProcessor.js               # Processador de dados CSV
│
├── frontend/
│   ├── package.json
│   └── src/
│       ├── App.js
│       ├── components/
│       │   ├── Chat.js                   # Componente do chat conversacional
│       │   └── Dashboard.js              # Componente do dashboard
│       └── index.js
│
└── @docs/
    └── README.md                         # Este documento
```

---

## Como Rodar o Projeto

### Pré-requisitos
- Node.js 18+
- npm 9+

### 1. Instale as dependências

No backend:
```bash
cd backend
npm install
```
No frontend:
```bash
cd frontend
npm install
```

### 2. Inicie o backend
```bash
cd backend
npm start
```
O backend roda por padrão em `http://localhost:4000`.

**Nota:** O backend automaticamente carrega os dados reais do arquivo `Biblioteca_de_publicacoes3.csv`. Se o arquivo não for encontrado ou houver erro, o sistema usa os dados mockados como fallback.

### 3. Inicie o frontend
```bash
cd frontend
npm start
```
O frontend roda por padrão em `http://localhost:3000`.

---

## Como Usar

1. **Acesse o frontend** em `http://localhost:3000`.
2. **Digite um tema, empresa ou assunto** no chat (ex: "Dia dos Namorados", "Energia Nuclear", "Papa Leão XIV", "The Town", "Maternidade").
3. O chat responde com o número de notícias encontradas e sugere filtros de período ou, se houver muitos resultados, sugere ações inteligentes.
4. **Ações inteligentes:**
   - Se houver mais de 3 notícias, o chat sugere gerar resumo, baixar planilha ou criar dashboard.
   - As ações são exibidas como botões interativos.
5. **Resumo:** O chat gera um resumo automático das notícias, incluindo sentimento, palavras-chave e insights.
6. **Planilha:** O chat gera um link para baixar a planilha CSV das notícias filtradas.
7. **Dashboard:** O chat aciona a visualização do dashboard dinâmico.
8. Após cada ação, o chat pergunta se pode ajudar em algo mais.

---

## Funcionalidades

- **Chatbot conversacional:** Interpreta perguntas naturais, busca notícias reais e conduz o usuário pelo fluxo de análise.
- **Transição de texto estilo GenAI:** Efeito de digitação progressiva nas respostas do bot.
- **Sugestões inteligentes:** Botões de ação para resumo, planilha e dashboard.
- **Busca flexível:** O backend filtra notícias por tema, palavra-chave e período.
- **Dashboard dinâmico:** Indicadores principais, gráficos de evolução, tabelas de mídia, top fontes e top matérias.
- **UI moderna:** Layout responsivo, header fixo, transições suaves, chat e dashboard lado a lado.
- **Dados reais:** Processamento automático de planilha CSV com normalização de dados.

---

## Endpoints Backend

### Principais
- `POST /api/noticias` — Busca notícias por termo (tema, palavra-chave, assunto).
- `POST /api/dashboard` — Retorna indicadores agregados para o dashboard, aceita filtros opcionais:
  - `termo`: palavra-chave/tema
  - `periodo`: `{ inicio: 'YYYY-MM-DD', fim: 'YYYY-MM-DD' }`

### Endpoints Inteligentes do Chat
- `POST /api/chat/process` — Processa a mensagem do usuário, detecta intenção (saudação, funcionalidade, busca, ações) e retorna resposta contextual, sugestões e/ou ações.
- `POST /api/chat/action` — Executa ação específica (resumo, planilha, dashboard) para o tema atual.
- `GET /api/download/planilha?termo=...` — Gera e baixa a planilha CSV das notícias filtradas.

### Administrativos
- `GET /api/status` — Verifica status dos dados carregados
- `POST /api/reload` — Recarrega dados do CSV (útil para desenvolvimento)

---

## Estrutura de Dados

### Formato Esperado pelo Sistema
Cada notícia possui os seguintes campos:
- `id`: Identificador único
- `titulo`: Título da notícia
- `descricao`: Descrição/resumo (gerado automaticamente)
- `data`: Data no formato 'YYYY-MM-DD'
- `fonte`: Nome da fonte/veículo
- `texto`: Texto completo da notícia
- `empresas_citadas`: Array de empresas mencionadas
- `sentimento`: 'positivo', 'negativo' ou 'neutro' (analisado automaticamente)
- `assuntos`: Array de tags/assuntos relacionados
- `impressoes`: Número de visualizações
- `valoracao`: Valor monetário estimado

### Campos Adicionais da Planilha Real
- `midia`: Tipo de mídia (Online/Offline)
- `tier`: Classificação da fonte (Tier 1, Outros)
- `analise_feita`: Status de análise
- `tipo_impacto`: Tipo de impacto da notícia
- `jornalistas`: Jornalistas responsáveis

---

## Processamento de Dados CSV

O sistema inclui um processador automático (`csvProcessor.js`) que:

### Conversões Automáticas
- **Data:** Converte de DD/MM/YYYY HH:MM para YYYY-MM-DD
- **Sentimento:** Análise básica de texto usando palavras-chave
- **Descrição:** Gera automaticamente a partir dos primeiros 200 caracteres do conteúdo
- **Empresas/Assuntos:** Processa strings separadas por vírgula em arrays
- **Números:** Normaliza impressões e valoração removendo formatação

### Palavras-chave para Análise de Sentimento
- **Positivas:** sucesso, crescimento, melhoria, avanço, positivo, bom, ótimo, excelente, destacado, liderança, inovação, desenvolvimento, conquista, vitória, progresso, benefício, oportunidade
- **Negativas:** problema, crise, queda, perda, negativo, ruim, pior, falha, erro, dificuldade, prejuízo, risco, ameaça, escândalo, polêmica, controvérsia, fracasso

### Temas Reconhecidos pelo Chat
- **Dia dos Namorados:** namorados, dia dos namorados, casal, presente
- **Energia Nuclear:** energia nuclear, nuclear, usina, reator, angra
- **Papa:** papa, leão xiv, pontífice, igreja, vaticano, francisco
- **The Town:** the town, festival, travis scott, ludmilla, música
- **Maternidade:** maternidade, mãe, mães, carreira, mulher

---

## Base de Dados

### Dados Reais
- **Arquivo:** `backend/Biblioteca_de_publicacoes3.csv`
- **Formato:** CSV com codificação UTF-8
- **Campos:** Título, Data, Conteúdo, Fonte, Mídia, Tier, Alcance orgânico, Valoração, Empresas citadas, Análise feita?, Tipo de impacto, Assunto específico, Jornalistas

### Dados Mockados (Fallback)
- **Arquivo:** `backend/src/mockNoticias.js`
- **Uso:** Quando o CSV não está disponível ou há erro no processamento
- **Conteúdo:** 30 notícias fictícias sobre temas específicos

---

## Customização e Expansão

### Adicionar Novos Dados
1. **Atualizar CSV:** Substitua ou adicione registros no arquivo `Biblioteca_de_publicacoes3.csv`
2. **Recarregar:** Use o endpoint `POST /api/reload` ou reinicie o servidor
3. **Verificar:** Use `GET /api/status` para confirmar o carregamento

### Adicionar Novos Temas
1. **Editar `index.js`:** Adicione novos termos na função `extrairTema()`
2. **Reiniciar servidor:** Para aplicar as mudanças

### Melhorar Análise de Sentimento
1. **Editar `csvProcessor.js`:** Adicione palavras-chave nas arrays `palavrasPositivas` e `palavrasNegativas`
2. **Implementar IA:** Substitua a análise básica por um modelo de machine learning

### Integrar APIs Reais
1. **Substituir CSV:** Modifique `csvProcessor.js` para consumir APIs de notícias
2. **Manter formato:** Garanta que os dados retornem no formato esperado pelo sistema

---

## Monitoramento e Debug

### Endpoints de Status
- `GET /api/status` — Mostra:
  - Total de notícias carregadas
  - Se está usando dados reais ou mockados
  - Exemplo das primeiras 3 notícias

### Logs do Servidor
O backend exibe logs informativos:
- Carregamento de dados CSV
- Número de notícias processadas
- Erros de processamento (com fallback automático)

### Recarregamento de Dados
```bash
# Via curl
curl -X POST http://localhost:4000/api/reload

# Via navegador
POST http://localhost:4000/api/reload
```

---

## Para Desenvolvedores

### Estrutura do Código
- **Modular:** Separação clara entre processamento de dados e API
- **Fallback:** Sistema robusto com dados mockados como backup
- **Extensível:** Fácil adição de novos processadores e endpoints

### Fluxo de Dados
1. **Inicialização:** Servidor carrega CSV automaticamente
2. **Processamento:** Conversão e normalização de dados
3. **Busca:** Filtros aplicados em tempo real
4. **Resposta:** Dados formatados para frontend

### Performance
- **Carregamento único:** Dados carregados na inicialização
- **Busca em memória:** Filtros aplicados sem consultas ao disco
- **Cache automático:** Dados mantidos em variável global

---

## Suporte
Dúvidas ou sugestões? Fale com o time de desenvolvimento ou consulte este README.

### Troubleshooting
- **Erro de porta:** Use `lsof -ti:4000 | xargs kill -9` para liberar porta
- **Dados não carregam:** Verifique se o arquivo CSV existe e está no formato correto
- **Erro de processamento:** Verifique logs do servidor para detalhes específicos 