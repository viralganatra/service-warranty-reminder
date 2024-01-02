import { GoogleSpreadsheet } from 'google-spreadsheet';
import { getSpreadsheetData } from '../google-spreadsheet';
import {
  rawFixture,
  rawInvalidFixture,
  secretsFixture,
} from '../__fixtures__/google-spreadsheet.fixture';

type Fixture = typeof rawFixture | typeof rawInvalidFixture;

const fixtureWithGet = (fixture: Fixture) =>
  fixture.map((item) => ({
    get: (name: keyof typeof item) => item[name],
  }));

const mockLoadSpreadsheetInfo = vi.fn(() => Promise.resolve());

vi.mock('../../../utils/ssm', () => ({
  getSSMParams: vi.fn(() => ({
    googleServiceAccountEmail: {
      Value: secretsFixture.googleServiceAccountEmail,
    },
    googlePrivateKey: {
      Value: secretsFixture.googlePrivateKey,
    },
    googleSpreadsheetId: {
      Value: secretsFixture.googleSpreadsheetId,
    },
  })),
}));

vi.mock('google-spreadsheet', () => ({
  GoogleSpreadsheet: vi.fn(() => ({
    loadInfo: mockLoadSpreadsheetInfo,
    sheetsByIndex: [{ getRows: () => Promise.resolve(fixtureWithGet(rawFixture)) }],
  })),
}));

describe('Google Spreadsheet', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should return an array of services', async () => {
    const data = await getSpreadsheetData();

    expect(mockLoadSpreadsheetInfo).toHaveBeenCalledOnce();

    expect(data).toMatchInlineSnapshot(`
      [
        {
          "certificateType": "cert 1",
          "expiryDate": 2022-05-16T00:00:00.000Z,
          "linkToCertificate": "https://www.google.com/1",
          "property": "property 1",
        },
        {
          "certificateType": "cert 2",
          "expiryDate": 2024-12-21T00:00:00.000Z,
          "linkToCertificate": "https://www.google.com/2",
          "property": "property 2",
        },
      ]
    `);
  });

  it('should authenticate and fetch the correct spreadsheet', async () => {
    await getSpreadsheetData();

    expect(GoogleSpreadsheet).toHaveBeenCalledWith(
      secretsFixture.googleSpreadsheetId,
      expect.objectContaining({
        key: secretsFixture.googlePrivateKey,
        email: secretsFixture.googleServiceAccountEmail,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      }),
    );
  });

  it('should throw an error if the data is invalid', async () => {
    vi.doMock('google-spreadsheet', () => ({
      GoogleSpreadsheet: vi.fn(() => ({
        loadInfo: mockLoadSpreadsheetInfo,
        sheetsByIndex: [{ getRows: () => Promise.resolve(fixtureWithGet(rawInvalidFixture)) }],
      })),
    }));

    const data = await import('../google-spreadsheet');

    await expect(data.getSpreadsheetData()).rejects.toThrowError();
  });
});
