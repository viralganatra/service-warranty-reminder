const { GoogleSpreadsheet } = require('google-spreadsheet');
const getSSMParams = require('../../utils/ssm');

async function getSecrets() {
  return getSSMParams([
    'GOOGLE_SPREADSHEET_ID',
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
  ]);
}

function spreadsheetAuth(document, secrets) {
  return document.useServiceAccountAuth({
    client_email: secrets.GOOGLE_SERVICE_ACCOUNT_EMAIL.Value,
    private_key: secrets.GOOGLE_PRIVATE_KEY.Value.replace(/\\n/gm, '\n'),
  });
}

async function getSpreadsheetData() {
  const secrets = await getSecrets();

  const doc = new GoogleSpreadsheet(secrets.GOOGLE_SPREADSHEET_ID.Value);

  await spreadsheetAuth(doc, secrets);
  await doc.loadInfo();

  const [sheet] = doc.sheetsByIndex;

  const rows = await sheet.getRows();

  return rows.map((row) => ({
    property: row.Property,
    certificateType: row['Certificate Type'],
    expiryDate: row['Expiry Date'],
    linkToCertificate: row.Link,
  }));
}

exports.getData = getSpreadsheetData;
