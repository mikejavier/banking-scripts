const xlsx = require('xlsx');
const parse = require("csv-parse");
const fs = require("fs");
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat')
const stringify = require("csv-stringify");

dayjs.extend(customParseFormat)

const readCsvFile = async (path) => {
  records = []
  const parser = fs
  .createReadStream(path)
  .pipe(parse({
    columns: true
  }));
  for await (const record of parser) {
    records.push(record)
  }
  return records
}

(async () => {
  let totalPAraEnriquecer = 0;
  const baseEnriquecidaData = await readCsvFile('./base_enriquecida.csv');
  const dataFromCsv = await readCsvFile('./extracao.csv')

  console.log("Já enviados para enriquecimento: ", baseEnriquecidaData.length);
  console.log("Total de registros com erros de KYC no último report: ", dataFromCsv.length);

  const file = `enriquecer_${dayjs().format('YYYY.MM.DD')}.csv`

  fs.writeFile(file, '', (err) => {
    if (err) throw err;
  });

  for (let index = 0; index < dataFromCsv.length; index++) {
    const element = dataFromCsv[index];
    const foundPersonInXlsx = baseEnriquecidaData.find((findData) => Number(findData.cpf) === Number(element.cpf))

    if (foundPersonInXlsx !== undefined) continue;
    
    stringify([element], (err, output) => {
      if (err) throw err;
  
      fs.appendFileSync(file, output)
      fs.appendFileSync("./base_enriquecida.csv", output)
    });

    totalPAraEnriquecer++    
  }

  console.log("Total de registros para serem enriquecidos: ", totalPAraEnriquecer);
  console.log("concluido");
})()