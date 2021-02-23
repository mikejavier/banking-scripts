const parse = require("csv-parse");
const stringify = require("csv-stringify");
const fs = require("fs");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");

dayjs.extend(customParseFormat);

const readCsvFile = async () => {
  records = [];
  const parser = fs.createReadStream("./extracao.csv").pipe(
    parse({
      columns: true
    })
  );
  for await (const record of parser) {
    records.push(record);
  }
  return records;
};

(async () => {
  const dataFromCsv = await readCsvFile();

  dataFromCsv.forEach((data) => {
    data.mother_name = data.mother_name === '' ? 'DESCONHECIDO' : data.mother_name;
    data.state = data.state.trim();
    data.country = 'Brasil'

    if (isNaN(Number(data.number))) {
      data.complement = data.complement.length < 30 ? `${data.number} ${data.complement}` : data.complement;
      data.number = '0'
    }
  });

  stringify(dataFromCsv, { header: false, delimiter: ';' }, (err, output) => {
    if (err) throw err;

    fs.writeFile('result_cleaned.csv', output, (err) => {
      if (err) throw err;
      console.log("concluido");
    });
  });
})();
