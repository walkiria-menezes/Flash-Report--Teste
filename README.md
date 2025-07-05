# Flash Report - Plataforma de Monitoramento de Comunicação e Reputação

## Passo a Passo Rápido: Como Rodar e Publicar o Projeto

### Pré-requisitos
- Node.js 18+
- npm 9+

### 1. Instale as dependências

No diretório raiz do projeto, rode:

```sh
npm install
```

Depois, instale as dependências do frontend:

```sh
cd frontend && npm install
cd ..
```

### 2. Rodando o projeto localmente

No diretório raiz, rode:

```sh
npm start
```

O projeto rodará em `http://localhost:3000`

### 3. Build do projeto

Para gerar a versão de produção:

```sh
npm run build:frontend
```

### 4. Publicando no GitHub Pages

No diretório raiz, rode:

```sh
npm run deploy:frontend
```

O site ficará disponível em: `https://walkiria-menezes.github.io/Flash-Report--Teste`

---

# Documentação Completa

## Visão Geral

O Flash Report é uma plataforma de monitoramento de comunicação e reputação que permite ao usuário monitorar temas, empresas ou assuntos na mídia, gerando relatórios rápidos (flash reports) e dashboards interativos com indicadores de comunicação e reputação. O sistema conta com um agente conversacional (chatbot) que entende perguntas naturais, busca notícias de uma base de dados JSON e, sob demanda, gera dashboards dinâmicos com gráficos, big numbers e tabelas.

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
- **Tabela de mídias fiel aos dados:** A tabela "Resultados por mídia" reflete exatamente as opções de mídia/fonte presentes nos dados, mostrando o total de publicações, impressões e valoração para cada mídia.
- **Integração tema-chat/dashboard:** O dashboard recebe e exibe corretamente o tema buscado pelo usuário, garantindo contexto em todas as visualizações.

---

## Tecnologias Utilizadas

- **Frontend:** React.js, Ant Design, Recharts, Chart.js
- **Dados:** Base de notícias em arquivo JSON (`biblioteca_publicacoes_mock.json`)
- **Processamento:** Processamento local de dados no frontend
- **Deploy:** GitHub Pages

---

## Estrutura de Pastas

```
Flash Report [Teste 3]/
│
├── frontend/
│   ├── package.json                    # Dependências e scripts do frontend
│   ├── csv_to_json.js                  # Script para converter CSV para JSON
│   ├── public/
│   │   └── index.html                  # HTML base da aplicação
│   └── src/
│       ├── App.js                      # Componente principal da aplicação
│       ├── index.js                    # Ponto de entrada do React
│       └── components/
│           ├── Chat.js                 # Componente do chat conversacional
│           ├── Dashboard.js            # Componente do dashboard
│           └── biblioteca_publicacoes_mock.json  # Base de dados das notícias
│
├── package.json                        # Scripts do projeto raiz
├── package-lock.json                   # Lock file das dependências
└── README.md                           # Este documento
```

---

## Como Rodar o Projeto

### Pré-requisitos
- Node.js 18+
- npm 9+

### 1. Instale as dependências

No diretório raiz do projeto:
```bash
npm install
```

No diretório frontend:
```bash
cd frontend
npm install
cd ..
```

### 2. Inicie o projeto
```bash
npm start
```

O projeto roda em `http://localhost:3000`.

---

## Como Usar

1. **Acesse o projeto** em `http://localhost:3000`.
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

- **Chatbot conversacional:** Interpreta perguntas naturais, busca notícias e conduz o usuário pelo fluxo de análise.
- **Transição de texto estilo GenAI:** Efeito de digitação progressiva nas respostas do bot.
- **Sugestões inteligentes:** Botões de ação para resumo, planilha e dashboard.
- **Busca flexível:** Filtra notícias por tema, palavra-chave e período.
- **Dashboard dinâmico:** Indicadores principais, gráficos de evolução, tabelas de mídia, top fontes e top matérias.
- **UI moderna:** Layout responsivo, header fixo, transições suaves, chat e dashboard lado a lado.
- **Dados locais:** Processamento de dados JSON com normalização automática.

---

## Estrutura de Dados

### Formato dos Dados JSON
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

### Campos Adicionais
- `midia`: Tipo de mídia (Online/Offline)
- `tier`: Classificação da fonte (Tier 1, Outros)
- `analise_feita`: Status de análise
- `tipo_impacto`: Tipo de impacto da notícia
- `jornalistas`: Jornalistas responsáveis

---

## Processamento de Dados

O sistema inclui processamento automático de dados que:

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

### Dados JSON
- **Arquivo:** `frontend/src/components/biblioteca_publicacoes_mock.json`
- **Formato:** JSON com codificação UTF-8
- **Origem:** Convertido do arquivo CSV original usando o script `csv_to_json.js`
- **Tamanho:** Aproximadamente 1.1MB com dados reais de notícias

### Script de Conversão
- **Arquivo:** `frontend/csv_to_json.js`
- **Função:** Converte dados CSV para formato JSON otimizado para o frontend
- **Uso:** Executar manualmente quando necessário atualizar os dados

---

## Customização e Expansão

### Adicionar Novos Dados
1. **Atualizar JSON:** Edite diretamente o arquivo `biblioteca_publicacoes_mock.json`
2. **Ou converter CSV:** Use o script `csv_to_json.js` para converter novos dados CSV
3. **Verificar formato:** Certifique-se de que os dados seguem a estrutura esperada

### Adicionar Novos Temas
1. **Editar `Chat.js`:** Adicione novos termos na função de extração de tema
2. **Reiniciar aplicação:** Para aplicar as mudanças

### Melhorar Análise de Sentimento
1. **Editar `Chat.js`:** Adicione palavras-chave nas arrays de análise de sentimento
2. **Implementar IA:** Substitua a análise básica por um modelo de machine learning

### Integrar APIs Reais
1. **Substituir JSON:** Modifique os componentes para consumir APIs de notícias
2. **Manter formato:** Garanta que os dados retornem no formato esperado pelo sistema

---

## Deploy e Publicação

### GitHub Pages
O projeto está configurado para deploy automático no GitHub Pages:

1. **Configuração:** O `homepage` em `frontend/package.json` está configurado para o repositório
2. **Build:** `npm run build:frontend` gera os arquivos de produção
3. **Deploy:** `npm run deploy:frontend` publica no GitHub Pages

### Outras Plataformas
O projeto pode ser facilmente adaptado para outras plataformas de deploy:
- **Netlify:** Conecte o repositório e configure o build command
- **Vercel:** Importe o projeto e configure automaticamente
- **AWS S3:** Faça upload dos arquivos de build

---

## Para Desenvolvedores

### Estrutura do Código
- **Modular:** Separação clara entre componentes de chat e dashboard
- **Dados locais:** Sistema simples com dados JSON carregados no frontend
- **Extensível:** Fácil adição de novos componentes e funcionalidades

### Fluxo de Dados
1. **Carregamento:** Dados JSON carregados no componente Chat
2. **Processamento:** Filtros aplicados em tempo real no frontend
3. **Busca:** Algoritmos de busca implementados no JavaScript
4. **Resposta:** Dados formatados e exibidos nos componentes

### Performance
- **Carregamento único:** Dados carregados uma vez na inicialização
- **Busca em memória:** Filtros aplicados sem requisições externas
- **Cache automático:** Dados mantidos em estado do React

---

## Suporte
Dúvidas ou sugestões? Fale com o time de desenvolvimento ou consulte este README.

### Troubleshooting
- **Erro de porta:** Use `lsof -ti:3000 | xargs kill -9` para liberar porta
- **Dados não carregam:** Verifique se o arquivo JSON existe e está no formato correto
- **Erro de build:** Verifique se todas as dependências estão instaladas corretamente 