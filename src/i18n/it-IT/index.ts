/**
 * Italian translations for ICUBoost
 * Traduzioni italiane per ICUBoost
 */

export default {
  // Common
  common: {
    search: 'Cerca',
    calculate: 'Calcola',
    reset: 'Reset',
    close: 'Chiudi',
    save: 'Salva',
    cancel: 'Annulla',
    error: 'Errore',
    success: 'Successo',
    warning: 'Attenzione',
    info: 'Informazione',
  },

  // App layout
  layout: {
    appName: 'ICUBoost',
    appDescription: 'Strumenti per la Terapia Intensiva',
    menu: 'Menu',
    home: 'Home',
    calculators: 'Calcolatori',
    settings: 'Impostazioni',
    about: 'Info',
  },

  // Calculators
  calculators: {
    mechanicalPower: {
      title: 'Mechanical Power',
      description: 'Calcolo della potenza meccanica ventilatoria',
      rr: 'Frequenza Respiratoria (RR)',
      rrUnit: 'atti/min',
      vte: 'Volume Corrente Espirato (VTe)',
      vteUnit: 'litri',
      picco: 'Pressione di Picco',
      piccoUnit: 'cmH₂O',
      plateau: 'Pressione di Plateau',
      plateauUnit: 'cmH₂O',
      peep: 'PEEP',
      peepUnit: 'cmH₂O',
      result: 'Mechanical Power',
      resultUnit: 'J/min',
      normalRange: 'Normale',
      warningRange: 'Attenzione',
      criticalRange: 'Critico',
      referenceRanges: 'Valori di Riferimento',
    },
    respiratoryQuotient: {
      title: 'Quoziente Respiratorio',
      description: 'Calcolo del quoziente respiratorio (QR)',
      pvco2: 'PvCO₂ (CO₂ venosa)',
      pvco2Unit: 'mmHg',
      paco2: 'PaCO₂ (CO₂ arteriosa)',
      paco2Unit: 'mmHg',
      hb: 'Emoglobina (HB)',
      hbUnit: 'g/dL',
      sao2: 'SaO₂ (saturazione arteriosa)',
      sao2Unit: '%',
      svo2: 'SvO₂ (saturazione venosa)',
      svo2Unit: '%',
      pao2: 'PaO₂ (O₂ arterioso)',
      pao2Unit: 'mmHg',
      pvo2: 'PvO₂ (O₂ venoso)',
      pvo2Unit: 'mmHg',
      result: 'Quoziente Respiratorio',
      resultUnit: 'ml-O₂/dL',
      normalRange: 'Normale (Aerobico)',
      abnormalRange: 'Fuori Range',
      referenceRanges: 'Valori di Riferimento',
      metabolismTitle: 'QR - Tipo di Metabolismo',
      metabolismDescription:
        'Il Quoziente Respiratorio esprime il tipo di metabolismo in corso (aerobico o anaerobico) in base al consumo di substrati energetici',
      fatMetabolism: 'Metabolismo lipidico (aerobico)',
      mixedMetabolism: 'Metabolismo misto',
      carbMetabolism: 'Metabolismo glucidico (aerobico)',
      anaerobicMetabolism: 'Metabolismo anaerobico',
    },
  },

  // Validation messages
  validation: {
    required: 'Campo obbligatorio',
    mustBePositive: 'Deve essere maggiore di zero',
    outOfRange: 'Valore fuori range consentito',
    invalidNumber: 'Numero non valido',
    noNegativeNumbers: 'I valori negativi non sono ammessi',
    maxDecimals: 'Troppi decimali',
    maxPercentage: 'La percentuale non può superare 100%',
    plateauLessThanPeak: 'Plateau deve essere ≤ Pressione di Picco',
    peepLessThanPlateau: 'PEEP deve essere ≤ Pressione di Plateau',
    pvco2GreaterThanPaco2: 'PvCO₂ deve essere > PaCO₂',
    sao2GreaterThanSvo2: 'SaO₂ deve essere > SvO₂',
    pao2GreaterThanPvo2: 'PaO₂ deve essere > PvO₂',
  },

  // Error messages
  errors: {
    calculationFailed: 'Errore nel calcolo',
    invalidInput: 'Input non valido',
    missingParameters: 'Parametri mancanti',
  },
};
