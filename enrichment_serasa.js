const xlsx = require('xlsx');
const parse = require("csv-parse");
const fs = require("fs");
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat')
const stringify = require("csv-stringify");

dayjs.extend(customParseFormat)

const readXlsxFile = () => {
  const file = xlsx.readFile('./Entrega_J0109593.xlsx') 
    
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
  
  dataFromCsv.forEach((data) => {
    const foundPersonInXlsx = dataFromXlsx.find((findData) => findData.Cpf === data.cpf)

    if (foundPersonInXlsx === undefined) return;

    data.full_name = foundPersonInXlsx.NOME_ENR === '' ? data.full_name : foundPersonInXlsx.NOME_ENR;
    data.birthday = foundPersonInXlsx.NASCIMENTO_ENR === '' ? data.birthday : dayjs(foundPersonInXlsx.NASCIMENTO_ENR, 'DD/MM/YYYY').format('YYYY-MM-DD')
    data.mother_name = foundPersonInXlsx.NOME_MAE_ENR === '' ? data.mother_name : foundPersonInXlsx.NOME_MAE_ENR;
    data.state = data.state.trim();
    data.country = 'Brasil'

    if (isNaN(Number(data.number)) || data.number.charAt(0) === '.') {
      data.complement = `${data.number} ${data.complement}`.length < 30 ? `${data.number} ${data.complement}` : data.complement;
      data.number = '0'
    }
  });

  stringify(dataFromCsv, { header: false, delimiter: ';' }, (err, output) => {
    if (err) throw err;

    fs.writeFile(`cadastro_pf_${dayjs().format('YYYYMMDDHHmmss')}.csv`, output, (err) => {
      if (err) throw err;
      console.log("concluido");
    });
  });
})()