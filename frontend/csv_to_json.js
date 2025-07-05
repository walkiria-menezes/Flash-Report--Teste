const fs = require('fs');
const path = require('path');
const csvFilePath = path.resolve(__dirname, '../backend/Biblioteca_de_publicacoes3.csv');
const jsonFilePath = path.resolve(__dirname, './biblioteca_publicacoes_mock.json');

function csvToJson(csv) {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split(',');
  const data = lines.slice(1).map(line => {
    // Trata campos entre aspas que podem conter vírgulas
    const regex = /("[^"]*"|[^,]+)/g;
    const values = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
      let value = match[0];
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(/""/g, '"');
      }
      values.push(value);
    }
    const obj = {};
    headers.forEach((header, i) => {
      obj[header.trim()] = values[i] ? values[i].trim() : '';
    });
    return obj;
  });
  return data;
}

fs.readFile(csvFilePath, 'utf8', (err, csvData) => {
  if (err) {
    console.error('Erro ao ler o CSV:', err);
    return;
  }
  const jsonData = csvToJson(csvData);
  fs.writeFile(jsonFilePath, JSON.stringify(jsonData, null, 2), err => {
    if (err) {
      console.error('Erro ao salvar JSON:', err);
    } else {
      console.log('Arquivo JSON gerado com sucesso:', jsonFilePath);
    }
  });
}); 