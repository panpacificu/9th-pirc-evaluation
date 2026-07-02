const APP_CONFIG = Object.freeze({
  VERSION: '1.2.2',

  // Preserve your current Google Sheet ID.
  SPREADSHEET_ID: 'PASTE_GOOGLE_SHEET_ID_HERE',
  SHEET_NAME: 'Evaluation Responses',

  EMAIL: {
    ENABLED: true,
    SENDER_NAME: '9th PIRC Secretariat',
    REPLY_TO: 'PASTE_OFFICIAL_REPLY_TO_EMAIL_HERE',
    SUBJECT: '9th PIRC Evaluation and Certificate of Participation'
  },

  CERTIFICATE: {
    ENABLED: true,
    FILE_PREFIX: '9th-PIRC-Certificate',
    EVENT_NAME: '9th Panpacific International Research Conference',
    TITLE: 'CERTIFICATE OF PARTICIPATION',
    VENUE: 'Urdaneta City Cultural and Sports Center',
    BATCH_DETAILS: {
      'Batch 1': 'July 13-14, 2026',
      'Batch 2': 'July 23-24, 2026'
    }
  },

  // Batch 2 is visible but disabled in the public form.
  // The backend also rejects Batch 2 submissions until it is added here.
  ENABLED_BATCHES: ['Batch 1'],

  ENFORCE_ONE_RESPONSE_PER_EMAIL_AND_BATCH: false,

  DEFAULT_CLOSED_MESSAGE:
    'We are not currently accepting responses. Please check again later.',

  CAMPUSES: ['Tayug', 'Urdaneta'],

  BATCH_SCHOOLS: {
    'Batch 1': [
      'Carl E. Balita Institute of Health Sciences (CBIHS)',
      'Engineering, Computing Academy of Science and Technology (ECOAST)',
      'Romeo Padilla School of Education and Arts (RPSEA)'
    ],
    'Batch 2': [
      'Panpacific Business School (PBS)',
      'Panpacific University Merchant Marine Academy (PUMMA)',
      'School of Criminology (SOC)'
    ]
  },

  BATCH_SPEAKERS: {
    'Batch 1': [
      'Phillip Clark — Kindai University, Japan',
      'Aurelio Agcaoili — University of Hawaii in Manoa',
      'Le Ha Van — FPT Ho Chi Minh, Vietnam'
    ],
    'Batch 2': []
  }
});
