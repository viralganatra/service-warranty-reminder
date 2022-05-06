import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet';
import { object, string } from 'yup';
import { ParameterWithRequired } from '../../types/secrets';
import getSSMParams from '../../utils/ssm';
import validateSchema from '../../utils/validate-schema';

const tuple = <T extends string[]>(...o: T) => o;

const SSM_PARAMS = tuple('googleSpreadsheetId', 'googleServiceAccountEmail', 'googlePrivateKey');

const secretsSchema = object({
  googleServiceAccountEmail: object({
    Value: string().required(),
  }).required(),
  googlePrivateKey: object({
    Value: string().required(),
  }).required(),
  googleSpreadsheetId: object({
    Value: string().required(),
  }),
}).required();

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
  secrets: Record<typeof SSM_PARAMS[number], ParameterWithRequired>,
) {
  return document.useServiceAccountAuth({
    client_email: secrets.googleServiceAccountEmail.Value,
    private_key: secrets.googlePrivateKey.Value.replace(/\\n/gm, '\n'),
  });
}

export default async function getSpreadsheetData() {
  const secrets = await getSecrets();

  await validateSchema(secretsSchema.validate(secrets));

  const doc = new GoogleSpreadsheet(secrets.googleSpreadsheetId.Value);

  await spreadsheetAuth(doc, secrets);
  await doc.loadInfo();

  const [sheet] = doc.sheetsByIndex;

  const rows = (await sheet.getRows()) as DataRow[];

  return rows
    .filter((row) => row._rawData.length > 0)
    .map((row) => ({
      property: row.Property,
      certificateType: row['Certificate Type'],
      expiryDate: row['Expiry Date'],
      linkToCertificate: row.Link,
    }));
}
