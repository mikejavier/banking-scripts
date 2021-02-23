const xlsx = require('xlsx');
const parse = require("csv-parse");
const fs = require("fs");
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)
const readXlsxFile = () => {
  const file = xlsx.readFile('./base_enriquecida_exp.xlsx') 
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
    data.full_name = foundPersonInXlsx.full_name;
    data.birthday = dayjs(foundPersonInXlsx.birthday).format('YYYY-MM-DD')
    data.mother_name = foundPersonInXlsx.mother_name;
  });
  console.info(dataFromCsv[1]);
  console.info(dataFromXlsx[1]);
  const ws = xlsx.utils.json_to_sheet(dataFromCsv)
  const wb = xlsx.utils.book_new();
	xlsx.utils.book_append_sheet(wb, ws, "result");
  xlsx.writeFile(wb, 'result_exp.xlsx');

  console.log("concluido");
})()















