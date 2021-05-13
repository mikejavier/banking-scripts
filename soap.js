const soapRequest = require("easy-soap-request");
const parseStringPromise = require("xml2js").parseStringPromise;
const _ = require("lodash");
const dayjs = require("dayjs");

const url =
  "https://sitenet.serasa.com.br/experian-data-licensing-ws/dataLicensingService?wsdl";

function generateXmlPayload(documentNumber) {
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:dat="http://services.experian.com.br/DataLicensing/DataLicensingService/">
    <soapenv:Header>
        <wsse:Security soapenv:mustUnderstand="1"
      xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"
      xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
            <wsse:UsernameToken wsu:Id="UsernameToken-2">
                <wsse:Username>51853628</wsse:Username>
                <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">Senha12@</wsse:Password>
            </wsse:UsernameToken>
        </wsse:Security>
    </soapenv:Header>
    <soapenv:Body>
        <dat:ConsultarPF>
            <parameters>
                <cpf>${documentNumber}</cpf>
                <RetornoPF>
                    <nome>true</nome>
                    <nomeMae>true</nomeMae>
                    <dataNascimento>true</dataNascimento>
                </RetornoPF>
            </parameters>
        </dat:ConsultarPF>
    </soapenv:Body>
</soapenv:Envelope>`;
}

const getPersonDataFromSerasa = async (cpf) => {
  try {
    const { response } = await soapRequest({
      url: url,
      xml: generateXmlPayload(cpf)
    });

    const { headers, body, statusCode } = response;

    const result = await parseStringPromise(body);

    console.log("Serasa result: ", JSON.stringify(result));

    const data = _.get(
      result,
      "S:Envelope.S:Body[0].ns2:ConsultarPFResponse[0].result[0]"
    );

    if (!!data.mensagem) {
      return {
        birthday: '',
        motherName: '',
        name: ''
      };
    }

    return {
      birthday: dayjs(_.get(data,'dataNascimento[0]', '')).isValid() ? dayjs(_.get(data,'dataNascimento[0]')).format("YYYY-MM-DD") : '',
      motherName: _.get(data, 'nomeMae[0]', ''),
      name: _.get(data, 'nome[0]', '')
    };
  } catch (error) {
    console.log("Serasa error: ", error);
  }
};

module.exports = { getPersonDataFromSerasa };
