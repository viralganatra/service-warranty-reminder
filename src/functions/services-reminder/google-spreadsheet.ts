import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet';
import getSSMParams from '../../utils/ssm';
import { ParameterWithRequired } from '../../types/secrets';

const SSM_PARAMS = ['googleSpreadsheetId', 'googleServiceAccountEmail', 'googlePrivateKey'];

type SsmParams = 'googleSpreadsheetId' | 'googleServiceAccountEmail' | 'googlePrivateKey';

interface DataRow extends GoogleSpreadsheetRow {
  Property: string;
  'Certificate Type': string;
  'Expiry Date': string;
  Link: string;
}

function getSecrets() {
  return getSSMParams(SSM_PARAMS);
}

function spreadsheetAuth(
  document: GoogleSpreadsheet,
  secrets: Record<SsmParams, ParameterWithRequired>,
) {
  return document.useServiceAccountAuth({
    client_email: secrets.googleServiceAccountEmail?.Value,
    private_key: secrets.googlePrivateKey?.Value.replace(/\\n/gm, '\n'),
  });
}

export default async function getSpreadsheetData() {
  try {
    const secrets = await getSecrets();

    const doc = new GoogleSpreadsheet(secrets.googleSpreadsheetId?.Value);

    await spreadsheetAuth(doc, secrets);
    await doc.loadInfo();

    const [sheet] = doc.sheetsByIndex;

    const rows = (await sheet.getRows()) as DataRow[];

    return rows.map((row) => ({
      property: row.Property,
      certificateType: row['Certificate Type'],
      expiryDate: row['Expiry Date'],
      linkToCertificate: row.Link,
    }));
  } catch (err) {
    console.log(err);

    throw err;
  }
}
