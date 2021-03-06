const xlsx = require("xlsx");
const parse = require("csv-parse");
const fs = require("fs");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const stringify = require("csv-stringify");

dayjs.extend(customParseFormat);

const readXlsxFile = () => {
  const file = xlsx.readFile("./base_enriquecida_exp.xlsx", { cellDates: true });
  let data = [];
  const sheets = file.SheetNames;
  for (let i = 0; i < sheets.length; i++) {
    const temp = xlsx.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
    temp.forEach((res) => {
      data.push(res);
    });
  }
  return data;
};

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
  const dataFromXlsx = readXlsxFile();
  const dataFromCsv = await readCsvFile();

  dataFromCsv.forEach((data) => {
    const foundPersonInXlsx = dataFromXlsx.find(
      (findData) => findData.person_id === data.person_id
    );
    console.log(foundPersonInXlsx);
    if (foundPersonInXlsx === undefined) return;

    data.full_name = foundPersonInXlsx.full_name;
    data.birthday = dayjs(foundPersonInXlsx.birthday).format("YYYY-MM-DD");
    data.mother_name = foundPersonInXlsx.mother_name;
    data.state = data.state.trim();
    data.country = "Brasil";

    if (isNaN(Number(data.number)) || data.number.charAt(0) === ".") {
      data.complement =
        `${data.number} ${data.complement}`.length < 30
          ? `${data.number} ${data.complement}`
          : data.complement;
      data.number = "0";
    }
  });

  stringify(dataFromCsv, { header: false, delimiter: ";" }, (err, output) => {
    if (err) throw err;

    fs.writeFile(
      `cadastro_pf_${dayjs().format("YYYYMMDDHHmmss")}.csv`,
      output,
      (err) => {
        if (err) throw err;
        console.log("concluido");
      }
    );
  });
})();
