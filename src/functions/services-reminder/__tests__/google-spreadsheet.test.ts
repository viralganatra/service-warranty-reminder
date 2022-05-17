import { GoogleSpreadsheet } from 'google-spreadsheet';
import googleSpreadsheet from '../google-spreadsheet';
import { rawFixture } from '../__fixtures__/google-spreadsheet';

const spyServiceAccountAuth = jest.fn();

jest.mock('../../../utils/ssm');

jest.mock('google-spreadsheet', () => ({
  GoogleSpreadsheet: jest.fn(() => ({
    useServiceAccountAuth: spyServiceAccountAuth,
    loadInfo: () => Promise.resolve(),
    sheetsByIndex: [{ getRows: () => Promise.resolve(rawFixture) }],
  })),
}));

describe('Google Spreadhseet', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should use the correct spreadsheet id to initialise the gsheet', async () => {
    const spyConstructor = GoogleSpreadsheet as jest.Mock;

    await googleSpreadsheet();

    expect(spyConstructor).toBeCalledWith('googleSpreadsheetId');
  });

  it('should authorise the gsheet', async () => {
    await googleSpreadsheet();

    expect(spyServiceAccountAuth).toBeCalledTimes(1);
    expect(spyServiceAccountAuth).toBeCalledWith({
      client_email: 'googleServiceAccountEmail',
      private_key: 'googlePrivateKey',
    });
  });

  it('should return an array of secret objects', async () => {
    expect(await googleSpreadsheet()).toMatchInlineSnapshot(`
      Array [
        Object {
          "certificateType": "cert 1",
          "expiryDate": "16-May-2022",
          "linkToCertificate": "https://www.google.com/1",
          "property": "property 1",
        },
        Object {
          "certificateType": "cert 2",
          "expiryDate": "21-Dec-2024",
          "linkToCertificate": "https://www.google.com/2",
          "property": "property 2",
        },
      ]
    `);
  });

  it('should throw an error if the schema validation fails', async () => {
    jest.doMock('../../../utils/ssm', () => ({
      __esModule: true,
      default: () => ({
        googleSpreadsheetId: {
          Value: 'googleSpreadsheetId',
        },
      }),
    }));

    const gsheet = await import('../google-spreadsheet');

    await expect(gsheet.default()).rejects.toThrowErrorMatchingInlineSnapshot(
      `"ValidationError: googlePrivateKey.Value is a required field"`,
    );
  });
});
