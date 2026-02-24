/**
 * COMPLETE SEED DATA
 * Matches exactly your current old system
 */

export const categories = [
  { name: 'Indicatori demografici', order: 1 },
  { name: 'Parchi circolanti', order: 2 },
  { name: 'Trasporto pubblico', order: 3 },
  { name: 'Aree regolamentate', order: 4 },
  { name: 'Ciclabilità', order: 5 },
  { name: 'Parcheggi', order: 6 },
  { name: 'Incidentalità', order: 7 },
  { name: 'Sharing', order: 8 },
  { name: 'Eventi', order: 9 },
  { name: 'Qualità aria', order: 10 },
  { name: 'Standard emissivo', order: 11 },
];

export const indicators = [

  // Indicatori demografici
  { code: 40, name: 'Popolazione', categoryName: 'Indicatori demografici', unit: 'abitanti', order: 1, numero_di_decimali: 0 },
  { code: 21, name: 'Densità di popolazione', categoryName: 'Indicatori demografici', unit: 'abitanti/km²', order: 2, numero_di_decimali: 2 },

  // Parchi circolanti
  { code: 1, name: 'Autovetture a gas', categoryName: 'Parchi circolanti', unit: '%', order: 1, numero_di_decimali: 2 },
  { code: 2, name: 'Autovetture a GPL', categoryName: 'Parchi circolanti', unit: '%', order: 2, numero_di_decimali: 2 },
  { code: 3, name: 'Autovetture a metano', categoryName: 'Parchi circolanti', unit: '%', order: 3, numero_di_decimali: 2 },
  { code: 4, name: 'Autovetture elettriche', categoryName: 'Parchi circolanti', unit: '%', order: 4, numero_di_decimali: 2 },
  { code: 20, name: 'Densità di autovetture', categoryName: 'Parchi circolanti', unit: 'veicoli/km²', order: 5, numero_di_decimali: 2 },
  { code: 28, name: 'Indice di motorizzazione autovetture', categoryName: 'Parchi circolanti', unit: 'veicoli/100 abitanti', order: 6, numero_di_decimali: 2},
  { code: 29, name: 'Indice di motorizzazione motocicli', categoryName: 'Parchi circolanti', unit: 'veicoli/100 abitanti', order: 7, numero_di_decimali: 2 },
  { code: 12, name: 'Autovetture ibride', categoryName: 'Parchi circolanti', unit: '%', order: 8, numero_di_decimali: 2 },

  // Trasporto pubblico
  { code: 43, name: 'Trasporto Pubblico Locale - Domanda', categoryName: 'Trasporto pubblico', unit: 'passeggeri/abitanti', order: 1, numero_di_decimali: 1 },
  { code: 44, name: 'Trasporto Pubblico Locale - Offerta', categoryName: 'Trasporto pubblico', unit: 'posti*km/abitanti', order: 2, numero_di_decimali: 0 },

  // Ciclabilità
  { code: 19, name: 'Corsie ciclabili', categoryName: 'Ciclabilità', unit: 'km', order: 1, numero_di_decimali: 2 },

  // Incidentalità
  { code: 26, name: 'Indice di incidentalità', categoryName: 'Incidentalità', unit: 'incidenti/100 abitanti', order: 1, numero_di_decimali: 2},
  { code: 27, name: 'Indice di mortalità', categoryName: 'Incidentalità', unit: 'morti/100 incidenti', order: 2, numero_di_decimali: 2 },

  // Sharing
  { code: 13, name: 'Bike sharing - Biciclette su popolazione', categoryName: 'Sharing', unit: 'biciclette/10.000 abitanti', order: 1, numero_di_decimali: 2 },
  { code: 14, name: 'Bike sharing - Biciclette', categoryName: 'Sharing', unit: 'numero biciclette', order: 2, numero_di_decimali: 0 },
  { code: 15, name: 'Car sharing - Auto su popolazione', categoryName: 'Sharing', unit: 'auto/10.000 abitanti', order: 3, numero_di_decimali: 2 },
  { code: 16, name: 'Car sharing - Auto', categoryName: 'Sharing', unit: 'numero auto', order: 4, numero_di_decimali: 0 },
  { code: 30, name: 'Monopattini in sharing - Monopattini su popolazione', categoryName: 'Sharing', unit: 'monopattini/10.000 abitanti', order: 5, numero_di_decimali: 2 },
  { code: 31, name: 'Monopattini in sharing - Monopattini', categoryName: 'Sharing', unit: 'numero monopattini', order: 6, numero_di_decimali: 0 },
  { code: 41, name: 'Scooter sharing - Scooter su popolazione', categoryName: 'Sharing', unit: 'scooter/10.000 abitanti', order: 7, numero_di_decimali: 2 },
  { code: 42, name: 'Scooter sharing - Scooter', categoryName: 'Sharing', unit: 'numero scooter', order: 8, numero_di_decimali: 0 },

  // Qualità aria
  { code: 17, name: 'Concentrazione media annuale di NO2', categoryName: 'Qualità aria', unit: 'µg/m³', order: 1, numero_di_decimali: 0 },
  { code: 18, name: 'Concentrazione media annuale di PM10', categoryName: 'Qualità aria', unit: 'µg/m³', order: 2, numero_di_decimali: 0 },
  { code: 25, name: 'Giorni di superamento del limite di PM10', categoryName: 'Qualità aria', unit: 'giorni', order: 3, numero_di_decimali: 0 },
  { code: 39, name: 'Ore di superamento del limite di NO2', categoryName: 'Qualità aria', unit: 'ore', order: 4, numero_di_decimali: 0 },
  { code: 22, name: 'Fattore di emissione di CO2 del veicolo medio', categoryName: 'Qualità aria', unit: 'g/km', order: 5, numero_di_decimali: 1 },
  { code: 23, name: 'Fattore di emissione di NOx del veicolo medio', categoryName: 'Qualità aria', unit: 'g/km', order: 6, numero_di_decimali: 2 },
  { code: 24, name: 'Fattore di emissione di PM10 del veicolo medio', categoryName: 'Qualità aria', unit: 'g/km', order: 7, numero_di_decimali: 2 },

  // Standard emissivo
  { code: 5, name: 'Autovetture Euro 0', categoryName: 'Standard emissivo', unit: '%', order: 1, numero_di_decimali: 2 },
  { code: 6, name: 'Autovetture Euro 1', categoryName: 'Standard emissivo', unit: '%', order: 2, numero_di_decimali: 2 },
  { code: 7, name: 'Autovetture Euro 2', categoryName: 'Standard emissivo', unit: '%', order: 3, numero_di_decimali: 2 },
  { code: 8, name: 'Autovetture Euro 3', categoryName: 'Standard emissivo', unit: '%', order: 4, numero_di_decimali: 2 },
  { code: 9, name: 'Autovetture Euro 4', categoryName: 'Standard emissivo', unit: '%', order: 5, numero_di_decimali: 2 },
  { code: 10, name: 'Autovetture Euro 5', categoryName: 'Standard emissivo', unit: '%', order: 6, numero_di_decimali: 2 },
  { code: 11, name: 'Autovetture Euro 6', categoryName: 'Standard emissivo', unit: '%', order: 7, numero_di_decimali: 2 },
  { code: 32, name: 'Motocicli Euro 0', categoryName: 'Standard emissivo', unit: '%', order: 8, numero_di_decimali: 2 },
  { code: 33, name: 'Motocicli Euro 1', categoryName: 'Standard emissivo', unit: '%', order: 9, numero_di_decimali: 2 },
  { code: 34, name: 'Motocicli Euro 2', categoryName: 'Standard emissivo', unit: '%', order: 10, numero_di_decimali: 2 },
  { code: 35, name: 'Motocicli Euro 3', categoryName: 'Standard emissivo', unit: '%', order: 11, numero_di_decimali: 2 },
  { code: 36, name: 'Motocicli Euro 4', categoryName: 'Standard emissivo', unit: '%', order: 12, numero_di_decimali: 2 },
  { code: 37, name: 'Motocicli Euro 5', categoryName: 'Standard emissivo', unit: '%', order: 13, numero_di_decimali: 2 },
  { code: 38, name: 'Motocicli Euro 6', categoryName: 'Standard emissivo', unit: '%', order: 14, numero_di_decimali: 2 },

];

export const cities = [
  { name: 'Ancona', latitude: 43.6158, longitude: 13.5189 },
  { name: 'Aosta', latitude: 45.7372, longitude: 7.3201 },
  { name: 'Bari', latitude: 41.1171, longitude: 16.8719 },
  { name: 'Bergamo', latitude: 45.6983, longitude: 9.6773 },
  { name: 'Bologna', latitude: 44.4949, longitude: 11.3426 },
  { name: 'Bolzano', latitude: 46.4983, longitude: 11.3548 },
  { name: 'Brescia', latitude: 45.5416, longitude: 10.2118 },
  { name: 'Cagliari', latitude: 39.2238, longitude: 9.1217 },
  { name: 'Campobasso', latitude: 41.5629, longitude: 14.6556 },
  { name: 'Catania', latitude: 37.5079, longitude: 15.0830 },
  { name: 'Catanzaro', latitude: 38.9098, longitude: 16.5877 },
  { name: 'Ferrara', latitude: 44.8381, longitude: 11.6198 },
  { name: 'Firenze', latitude: 43.7696, longitude: 11.2558 },
  { name: 'Foggia', latitude: 41.4622, longitude: 15.5446 },
  { name: 'Forli', latitude: 44.2226, longitude: 12.0407 },
  { name: 'Genova', latitude: 44.4056, longitude: 8.9463 },
  { name: 'Laquila', latitude: 42.3498, longitude: 13.3995 },
  { name: 'Latina', latitude: 41.4676, longitude: 12.9037 },
  { name: 'Livorno', latitude: 43.5485, longitude: 10.3106 },
  { name: 'Messina', latitude: 38.1938, longitude: 15.5540 },
  { name: 'Milano', latitude: 45.4642, longitude: 9.1900 },
  { name: 'Modena', latitude: 44.6471, longitude: 10.9252 },
  { name: 'Monza', latitude: 45.5845, longitude: 9.2744 },
  { name: 'Napoli', latitude: 40.8518, longitude: 14.2681 },
  { name: 'Novara', latitude: 45.4450, longitude: 8.6216 },
  { name: 'Padova', latitude: 45.4064, longitude: 11.8768 },
  { name: 'Palermo', latitude: 38.1157, longitude: 13.3615 },
  { name: 'Parma', latitude: 44.8015, longitude: 10.3279 },
  { name: 'Perugia', latitude: 43.1122, longitude: 12.3888 },
  { name: 'Pescara', latitude: 42.4618, longitude: 14.2161 },
  { name: 'Piacenza', latitude: 45.0522, longitude: 9.6930 },
  { name: 'Potenza', latitude: 40.6401, longitude: 15.8051 },
  { name: 'Prato', latitude: 43.8777, longitude: 11.1022 },
  { name: 'R. Calabria', latitude: 38.1140, longitude: 15.6500 },
  { name: 'R. Emilia', latitude: 44.6983, longitude: 10.6312 },
  { name: 'Ravenna', latitude: 44.4184, longitude: 12.2035 },
  { name: 'Rimini', latitude: 44.0678, longitude: 12.5695 },
  { name: 'Roma', latitude: 41.9028, longitude: 12.4964 },
  { name: 'Salerno', latitude: 40.6824, longitude: 14.7681 },
  { name: 'Sassari', latitude: 40.7259, longitude: 8.5557 },
  { name: 'Siracusa', latitude: 37.0755, longitude: 15.2866 },
  { name: 'Taranto', latitude: 40.4644, longitude: 17.2470 },
  { name: 'Terni', latitude: 42.5636, longitude: 12.6427 },
  { name: 'Torino', latitude: 45.0703, longitude: 7.6869 },
  { name: 'Trento', latitude: 46.0748, longitude: 11.1217 },
  { name: 'Trieste', latitude: 45.6495, longitude: 13.7768 },
  { name: 'Udine', latitude: 46.0711, longitude: 13.2346 },
  { name: 'Venezia', latitude: 45.4408, longitude: 12.3155 },
  { name: 'Verona', latitude: 45.4384, longitude: 10.9916 },
  { name: 'Vicenza', latitude: 45.5455, longitude: 11.5354 },
];