import fs from 'fs';
import csv from 'csv-parser';
import { parse } from 'date-fns';

// Função para converter data do formato DD/MM/YYYY HH:MM para YYYY-MM-DD
function converterData(dataString) {
  try {
    if (!dataString || dataString.trim() === '') return '2024-01-01';
    
    // Remove a parte do horário se existir
    const dataParte = dataString.split(' ')[0];
    const data = parse(dataParte, 'dd/MM/yyyy', new Date());
    return data.toISOString().split('T')[0]; // Retorna YYYY-MM-DD
  } catch (error) {
    console.error('Erro ao converter data:', dataString, error);
    return '2024-01-01'; // Data padrão em caso de erro
  }
}

// Função para extrair sentimento do texto (análise básica)
function extrairSentimento(texto) {
  if (!texto) return 'neutro';
  
  const textoLower = texto.toLowerCase();
  
  // Palavras positivas
  const palavrasPositivas = [
    'sucesso', 'crescimento', 'melhoria', 'avanço', 'positivo', 'bom', 'ótimo',
    'excelente', 'destacado', 'liderança', 'inovação', 'desenvolvimento',
    'conquista', 'vitória', 'progresso', 'benefício', 'oportunidade'
  ];
  
  // Palavras negativas
  const palavrasNegativas = [
    'problema', 'crise', 'queda', 'perda', 'negativo', 'ruim', 'pior',
    'falha', 'erro', 'dificuldade', 'prejuízo', 'risco', 'ameaça',
    'escândalo', 'polêmica', 'controvérsia', 'fracasso'
  ];
  
  const positivas = palavrasPositivas.filter(palavra => textoLower.includes(palavra)).length;
  const negativas = palavrasNegativas.filter(palavra => textoLower.includes(palavra)).length;
  
  if (positivas > negativas) return 'positivo';
  if (negativas > positivas) return 'negativo';
  return 'neutro';
}

// Função para gerar descrição a partir do título e início do conteúdo
function gerarDescricao(titulo, conteudo) {
  if (!conteudo) return titulo || 'Sem descrição';
  
  // Pega os primeiros 200 caracteres do conteúdo
  const inicio = conteudo.substring(0, 200);
  
  // Se terminar no meio de uma palavra, corta na última palavra completa
  const ultimoEspaco = inicio.lastIndexOf(' ');
  const descricao = ultimoEspaco > 150 ? inicio.substring(0, ultimoEspaco) : inicio;
  
  return descricao + (descricao.length >= 200 ? '...' : '');
}

// Função para processar empresas citadas
function processarEmpresas(empresasString) {
  if (!empresasString || empresasString.trim() === '') return [];
  
  // Remove espaços extras e divide por vírgula
  return empresasString.split(',').map(empresa => empresa.trim()).filter(empresa => empresa);
}

// Função para processar assuntos
function processarAssuntos(assuntoString) {
  if (!assuntoString || assuntoString.trim() === '') return [];
  
  // Remove espaços extras e divide por vírgula
  return assuntoString.split(',').map(assunto => assunto.trim()).filter(assunto => assunto);
}

// Função principal para processar o CSV
export function processarCSV(caminhoArquivo) {
  return new Promise((resolve, reject) => {
    const noticias = [];
    let id = 1;
    let linhaAtual = 0;
    let linhasProcessadas = 0;
    let linhasIgnoradas = 0;
    
    console.log('Iniciando processamento do CSV...');
    
    fs.createReadStream(caminhoArquivo)
      .pipe(csv({
        separator: ',',
        skipEmptyLines: true,
        strict: false
      }))
      .on('data', (row) => {
        linhaAtual++;
        
        try {
          // Verifica se a linha tem dados mínimos necessários
          if (!row['Título'] && !row['Conteúdo']) {
            console.log(`Linha ${linhaAtual}: Ignorada - sem título ou conteúdo`);
            linhasIgnoradas++;
            return;
          }
          
          const noticia = {
            id: id++,
            titulo: row['Título'] || 'Sem título',
            descricao: gerarDescricao(row['Título'], row['Conteúdo']),
            data: converterData(row['Data']),
            fonte: row['Fonte'] || 'Fonte não especificada',
            texto: row['Conteúdo'] || '',
            empresas_citadas: processarEmpresas(row['Empresas citadas']),
            sentimento: extrairSentimento(row['Conteúdo']),
            assuntos: processarAssuntos(row['Assunto específico']),
            impressoes: parseInt(row['Alcance orgânico']?.replace(/[^\d]/g, '') || '0'),
            valoracao: parseFloat(row['Valoração']?.replace(/[^\d,]/g, '').replace(',', '.') || '0'),
            // Campos adicionais da planilha real
            midia: row['Mídia'] || '',
            tier: row['Tier'] || '',
            analise_feita: row['Análise feita?'] || '',
            tipo_impacto: row['Tipo de impacto'] || '',
            jornalistas: row['Jornalistas'] || ''
          };
          
          noticias.push(noticia);
          linhasProcessadas++;
          
          if (linhasProcessadas % 10 === 0) {
            console.log(`Processadas ${linhasProcessadas} notícias...`);
          }
          
        } catch (error) {
          console.error(`Erro ao processar linha ${linhaAtual}:`, error);
          console.error('Dados da linha:', row);
          linhasIgnoradas++;
        }
      })
      .on('end', () => {
        console.log(`CSV processado com sucesso.`);
        console.log(`- Total de linhas processadas: ${linhasProcessadas}`);
        console.log(`- Linhas ignoradas: ${linhasIgnoradas}`);
        console.log(`- Notícias carregadas: ${noticias.length}`);
        resolve(noticias);
      })
      .on('error', (error) => {
        console.error('Erro ao ler CSV:', error);
        reject(error);
      });
  });
}

// Função para carregar dados do CSV e retornar no formato esperado
export async function carregarNoticiasReais() {
  try {
    const caminhoCSV = './Biblioteca_de_publicacoes3.csv';
    const noticias = await processarCSV(caminhoCSV);
    return noticias;
  } catch (error) {
    console.error('Erro ao carregar notícias reais:', error);
    return [];
  }
} 