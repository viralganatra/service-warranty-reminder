import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { getSSMParams } from '../../utils/ssm';
import { serviceSchema } from '../../schemas/data.schema';

type DataRow = {
  Property: string;
  'Certificate Type': string;
  'Expiry Date': string;
  Link: string;
};

async function getSpreadsheetDoc() {
  const secrets = await getSSMParams([
    'googleSpreadsheetId',
    'googleServiceAccountEmail',
    'googlePrivateKey',
  ]);

  const serviceAccountAuth = new JWT({
    email: secrets.googleServiceAccountEmail.Value,
    key: secrets.googlePrivateKey.Value.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return new GoogleSpreadsheet(secrets.googleSpreadsheetId.Value, serviceAccountAuth);
}

export async function getSpreadsheetData() {
  const doc = await getSpreadsheetDoc();

  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0];

  const rows = (await sheet?.getRows<DataRow>()) ?? [];

  return rows.map((row) => {
    const data = {
      property: row.get('Property'),
      certificateType: row.get('Certificate Type'),
      expiryDate: row.get('Expiry Date'),
      linkToCertificate: row.get('Link'),
    };

    return serviceSchema.parse(data);
  });
}
