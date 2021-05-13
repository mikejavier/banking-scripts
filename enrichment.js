const xlsx = require('xlsx');
const parse = require("csv-parse");
const fs = require("fs");
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat')
const stringify = require("csv-stringify");
const { getPersonDataFromSerasa } = require("./soap");

dayjs.extend(customParseFormat)

const readCsvFile = async () => {
  records = []
  const parser = fs
  .createReadStream('./enriquecer_2021.05.10.csv')
  .pipe(parse({
    columns: true
  }));
  for await (const record of parser) {
    records.push(record)
  }
  return records
}

(async () => {
  const file = `cadastro_pf_${dayjs().format('YYYYMMDDHHmmss')}.csv`
  
  fs.writeFile(file, '',(err) => {
    if (err) throw err;
  });
  
  const dataFromCsv = await readCsvFile()

  for (let index = 0; index < dataFromCsv.length; index++) {
    let person = dataFromCsv[index];

    const result = await getPersonDataFromSerasa(person.cpf);
    console.log(result);
    person.full_name = result.name === '' ? person.full_name : result.name;
    person.birthday = result.birthday === '' ? person.birthday : result.birthday
    person.mother_name = result.motherName === '' ? person.mother_name : result.motherName;
    person.state = person.state.trim();
    person.country = 'Brasil';

    
    if (Math.sign(person.number) !== 1 || person.number % 1 !== 0) {
      person.complement = `${person.number} ${person.complement}`.length < 30 ? `${person.number} ${person.complement}` : person.complement;
      person.number = '0'
    }

    stringify([person], { header: false, delimiter: ';' }, (err, output) => {
      if (err) throw err;
  
      fs.appendFileSync(file, output)
    });
  }
})()