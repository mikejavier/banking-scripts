const xlsx = require("xlsx");
const parse = require("csv-parse");
const fs = require("fs");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const stringify = require("csv-stringify");

dayjs.extend(customParseFormat);

const readCsvFile = async (path) => {
  records = [];
  const parser = fs.createReadStream(path).pipe(
    parse({
      delimiter: ";",
      columns: ["person_id","full_name","mother_name","birthday","gender","cpf","idnumber","identityissuingentity","issuingdateidentity","idfederativeunit","idbusinesssource","idproduct","incomevalue","ispep","ispepsince","idaddresstype","zipcode","street","number","complement","neighborhood","city","state","country","mailingaddress","idphonetype","phoneareacode","phonenumber"]
    })
  );
  for await (const record of parser) {
    records.push(record);
  }
  return records;
};

(async () => {
  const dataFromCsv = await readCsvFile("./teste.csv");
  const dataToEnrichment = [];

  for (let index = 0; index < dataFromCsv.length; index++) {
    const element = dataFromCsv[index];

    dataToEnrichment.push({
      Cpf: element.cpf,
      Nome: element.full_name,
      Nome_Da_Mae: element.mother_name,
      Data_De_Nascimento: dayjs(element.birthday).format("DD/MM/YYYY"),
      Cep: element.zipcode,
      Rua: element.street,
      Numero: element.number,
      Complemento: element.complement,
      Bairro: element.neighborhood,
      Cidade: element.city,
      Estado: element.state,
      CPF_PADR: "",
      NOME_PADR: "",
      NOME_CONFIRMADO: "",
      PRIMEIRO_NOME_DIFERENTE: "",
      NOME_ENR: "",
      NASCIMENTO_ENR: "",
      NOME_MAE_ENR: ""
    });
  }

  const ws = xlsx.utils.json_to_sheet(dataToEnrichment);
  const wb = xlsx.utils.book_new();

  xlsx.utils.book_append_sheet(wb, ws, "Entrega");
  xlsx.writeFile(wb, "base_enriquecer.xlsx");

  console.log("concluido");
})();
