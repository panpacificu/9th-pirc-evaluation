window.PIRC_CONFIG = Object.freeze({
  APP_NAME: "9th PIRC Evaluation Form",
  VERSION: "1.2.2",

  // Preserve your currently deployed Apps Script Web App /exec URL here.
  ENDPOINT_URL: "https://script.google.com/macros/s/AKfycbwQXFJyJhZnkoE8TLuZIpW3QSKid-KNcoiBvmXsDV152kYdviD2sAa10YjaXc2sz-3T/exec",

  ENABLED_BATCHES: ["Batch 1"],

  SCHOOLS: {
    "Batch 1": [
      "Carl E. Balita Institute of Health Sciences (CBIHS)",
      "Engineering, Computing Academy of Science and Technology (ECOAST)",
      "Romeo Padilla School of Education and Arts (RPSEA)"
    ],
    "Batch 2": [
      "Panpacific Business School (PBS)",
      "Panpacific University Merchant Marine Academy (PUMMA)",
      "School of Criminology (SOC)"
    ]
  },

  SPEAKERS: {
    "Batch 1": [
      {
        name: "Phillip Clark",
        designation: "Kindai University, Japan",
        image: "assets/speakers/phillip-clark.webp"
      },
      {
        name: "Aurelio Agcaoili",
        designation: "University of Hawaii in Manoa",
        image: "assets/speakers/aurelio-agcaoili.webp"
      },
      {
        name: "Le Ha Van",
        designation: "FPT Ho Chi Minh, Vietnam",
        image: "assets/speakers/le-ha-van.webp"
      }
    ],
    "Batch 2": []
  }
});
