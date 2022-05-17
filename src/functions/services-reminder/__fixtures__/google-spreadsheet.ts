export const rawFixture = [
  {
    Property: 'property 1',
    ['Certificate Type']: 'cert 1',
    ['Expiry Date']: '16-May-2022',
    Link: 'https://www.google.com/1',
    _rawData: [0, 1, 2, 3],
  },
  {
    Property: null,
    ['Certificate Type']: null,
    ['Expiry Date']: null,
    Link: null,
    _rawData: [],
  },
  {
    Property: 'property 2',
    ['Certificate Type']: 'cert 2',
    ['Expiry Date']: '21-Dec-2024',
    Link: 'https://www.google.com/2',
    _rawData: [0, 1, 2, 3],
  },
  {
    Property: null,
    ['Certificate Type']: null,
    ['Expiry Date']: null,
    Link: null,
    _rawData: [],
  },
];

export const filteredFixture = [
  {
    property: 'property 1',
    certificateType: 'cert 1',
    expiryDate: '30-Apr-2022',
    linkToCertificate: 'https://www.google.com/1',
  },
  {
    property: 'property 2',
    certificateType: 'cert 2',
    expiryDate: '21-Dec-2024',
    linkToCertificate: 'https://www.google.com/2',
  },
  {
    property: 'property 3',
    certificateType: 'cert 3',
    expiryDate: '03-May-2022',
    linkToCertificate: 'https://www.google.com/3',
  },
  {
    property: 'property 4',
    certificateType: 'cert 4',
    expiryDate: '08-May-2022',
    linkToCertificate: 'https://www.google.com/4',
  },
  {
    property: 'property 5',
    certificateType: 'cert 5',
    expiryDate: '15-May-2022',
    linkToCertificate: 'https://www.google.com/5',
  },
];
