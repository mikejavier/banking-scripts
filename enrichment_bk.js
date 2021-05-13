const xlsx = require("xlsx");
const parse = require("csv-parse");
const fs = require("fs");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const stringify = require("csv-stringify");

dayjs.extend(customParseFormat);

const readXlsxFile = () => {
  const file = xlsx.readFile("./base_enriquecida_bk.xlsx", { cellDates: true });
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
      (findData) => findData.CPF === data.cpf
    );
    console.log(foundPersonInXlsx);
    if (foundPersonInXlsx === undefined) return;

    data.full_name = foundPersonInXlsx['Nome Completo'];
    data.birthday = dayjs(foundPersonInXlsx['Data de Nascimento']).format("YYYY-MM-DD");
    data.mother_name = foundPersonInXlsx['Nome Mãe Completo'];
    data.street = foundPersonInXlsx['Endereço - RUA'] !== '' ? foundPersonInXlsx['Endereço - RUA'] : data.street
    data.complement = foundPersonInXlsx['Endereço - COMPLEMENTO'] !== '' ? foundPersonInXlsx['Endereço - COMPLEMENTO'] : data.complement
    data.number = foundPersonInXlsx['Endereço - NUMERO'] !== '' ? foundPersonInXlsx['Endereço - NUMERO'] : data.number
    data.neighborhood = foundPersonInXlsx['Endereço - BAIRRO'] !== '' ? foundPersonInXlsx['Endereço - BAIRRO'] : data.neighborhood
    data.city = foundPersonInXlsx['Endereço - CIDADE'] !== '' ? foundPersonInXlsx['Endereço - CIDADE'] : data.city
    data.state = foundPersonInXlsx['Endereço - ESTADO'] !== '' ? foundPersonInXlsx['Endereço - ESTADO'] : data.state
    data.state = data.state.trim();
    data.country = "Brasil";
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
