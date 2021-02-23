const xlsx = require('xlsx');
const parse = require("csv-parse");
const fs = require("fs");
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat')

dayjs.extend(customParseFormat)

const readXlsxFile = () => {
  const file = xlsx.readFile('./base_enriquecer.xlsx') 
    
  let data = [] 
    
  const sheets = file.SheetNames 
    
  for(let i = 0; i < sheets.length; i++) 
  { 
    const temp = xlsx.utils.sheet_to_json( 
          file.Sheets[file.SheetNames[i]]) 
    temp.forEach((res) => { 
        data.push(res) 
    }) 
  } 

  return data;
}


const readCsvFile = async () => {
  records = []
  const parser = fs
  .createReadStream('./extracao.csv')
  .pipe(parse({
    columns: true
  }));
  for await (const record of parser) {
    records.push(record)
  }
  return records
}

(async () => {
  const dataFromCsv = await readCsvFile()
  const dataFromXlsx = readXlsxFile();
  const delta = [];

  for (let index = 0; index < dataFromCsv.length; index++) {
    const element = dataFromCsv[index];
    const foundPersonInXlsx = dataFromXlsx.find((findData) => findData.Cpf === element.cpf)

    if (foundPersonInXlsx !== undefined) continue;

    delta.push({
      Cpf: element.cpf,
      Nome: element.full_name,
      Nome_Da_Mae: element.mother_name,
      Data_De_Nascimento: dayjs(element.birthday).format('DD/MM/YYYY'),
      Cep: element.zipcode,
      Rua: element.street,
      Numero: element.number,
      Complemento: element.complement,
      Bairro: element.neighborhood,
      Cidade: element.city,
      Estado: element.state,
      CPF_PADR: '',
      NOME_PADR: '',
      NOME_CONFIRMADO: '',
      PRIMEIRO_NOME_DIFERENTE: '',
      NOME_ENR: '',
      NASCIMENTO_ENR: '',
      NOME_MAE_ENR: ''
    });
    
  }
  
  const ws = xlsx.utils.json_to_sheet(delta)
  const wb = xlsx.utils.book_new();

	xlsx.utils.book_append_sheet(wb, ws, "Entrega");
  xlsx.writeFile(wb, 'result_enriquecer.xlsx');
  console.log("concluido");
})()