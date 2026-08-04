// app/data/tankDetails.ts
// Mock tank + species data, keyed by the same tankId used in your
// MOCK_AQUARIUMS list in (tabs)/home.tsx. Swap these functions for real
// Firestore reads later — the shape is what the tank detail screen expects.

export type LivingThingType = 'fish' | 'plant';

export type Species = {
  id: string;
  type: LivingThingType;
  name: string; // common name, e.g. "Betta"
  speciesName: string; // e.g. "Betta splendens"
  origin: string;
  lifespan: string; // e.g. "2-3 years"
  preferredTempC: string; // e.g. "24-27°C"
  feeding: string; // e.g. "2x daily, small pellets"
  schoolSize: string; // e.g. "Solitary" or "6+ recommended"
  summary: string;
  favorite?: boolean; // initial state — toggled locally on the detail screen
};

export type TankConditions = {
  preferredTempC: string;
  waterQuality: 'Excellent' | 'Good' | 'Fair' | 'Needs attention';
  lastTestedDaysAgo: number;
  ph: string;
  ammoniaPpm: string;
  nitritePpm: string;
};

export type TankDetail = {
  tankId: string;
  tankName: string;
  overviewSummary: string;
  conditions: TankConditions;
  species: Species[];
  careTips: string[];
};

const TANK_DETAILS: Record<string, TankDetail> = {
  '1': {
    tankId: '1',
    tankName: 'Amazonian Reef Tank',
    overviewSummary:
      'Your Amazonian Reef Tank is stable — temperature and pH are holding steady, and your last three water changes have kept ammonia and nitrite at safe levels.',
    conditions: {
      preferredTempC: '24-26°C',
      waterQuality: 'Excellent',
      lastTestedDaysAgo: 2,
      ph: '6.8',
      ammoniaPpm: '0 ppm',
      nitritePpm: '0 ppm',
    },
    species: [
      {
        id: 'f1',
        type: 'fish',
        name: 'Guppy',
        speciesName: 'Poecilia reticulata',
        origin: 'South America',
        lifespan: '2-3 years',
        preferredTempC: '24-26°C',
        feeding: 'Flakes, 2x daily',
        schoolSize: '6+ recommended',
        summary: 'Small, colorful community fish that thrives in planted tanks.',
        favorite: true,
      },
      {
        id: 'f2',
        type: 'fish',
        name: 'Goldfish',
        speciesName: 'Carassius auratus',
        origin: 'East Asia',
        lifespan: '5-10 years',
        preferredTempC: '20-24°C',
        feeding: 'Pellets, 1-2x daily',
        schoolSize: 'Pair or small group',
        summary: 'Hardy, peaceful fish with bright orange coloration and a calm temperament.',
      },
      {
        id: 'f3',
        type: 'plant',
        name: 'Duck Weed',
        speciesName: 'Lemna minor',
        origin: 'Worldwide freshwater',
        lifespan: 'Perennial',
        preferredTempC: '18-26°C',
        feeding: 'Nutrients from water; no substrate needed',
        schoolSize: 'Float in groups',
        summary: 'Fast-growing floating plant used for natural filtration and surface cover.',
      },
    ],
    careTips: [
      'Ammonia and nitrite have read 0 ppm for 3 tests running — your current water-change schedule is working, keep it up.',
      'Cardinal tetras school more tightly in groups of 6 or more — consider adding a few more if your bioload allows.',
      'pH has been stable at 6.8 — avoid sudden swings by matching temperature closely on future water changes.',
    ],
  },
  '2': {
    tankId: '2',
    tankName: 'Nano Betta Sanctuary',
    overviewSummary:
      'Nano Betta Sanctuary needs attention — nitrite has crept up since your last test, likely from the recent feeding increase. A water change is recommended in the next day.',
    conditions: {
      preferredTempC: '25-27°C',
      waterQuality: 'Needs attention',
      lastTestedDaysAgo: 1,
      ph: '7.1',
      ammoniaPpm: '0.25 ppm',
      nitritePpm: '0.5 ppm',
    },
    species: [
      {
        id: 'f4',
        type: 'fish',
        name: 'Betta',
        speciesName: 'Betta splendens',
        origin: 'Mekong Basin, Southeast Asia',
        lifespan: '2-4 years',
        preferredTempC: '24-27°C',
        feeding: 'Betta pellets, 2x daily (small amounts)',
        schoolSize: 'Solitary',
        summary: 'Territorial and best kept alone — flares at reflections and other bettas, thrives with gentle filtration.',
        favorite: true,
      },
      {
        id: 'f5',
        type: 'plant',
        name: 'Java Fern',
        speciesName: 'Microsorum pteropus',
        origin: 'Southeast Asia',
        lifespan: 'Perennial',
        preferredTempC: '22-28°C',
        feeding: 'Liquid fertilizer, light dosing weekly',
        schoolSize: 'N/A — single plant',
        summary: 'Low-light, low-maintenance — attach to driftwood rather than planting the rhizome in substrate.',
      },
    ],
    careTips: [
      'Nitrite is elevated at 0.5 ppm — do a 25-30% water change today and retest in 48 hours.',
      'The recent feeding increase may be adding to bioload — consider trimming back to what your betta finishes in 2 minutes.',
      'Java fern is unaffected by nitrite spikes, but keep an eye on your betta for lethargy or clamped fins in the meantime.',
    ],
  },
  '3': {
    tankId: '3',
    tankName: 'Treehouse Aquascape',
    overviewSummary:
      'Treehouse Aquascape is in good shape overall — water parameters are within range, though your last test was a little over a week ago and is due for a refresh.',
    conditions: {
      preferredTempC: '23-25°C',
      waterQuality: 'Good',
      lastTestedDaysAgo: 8,
      ph: '7.0',
      ammoniaPpm: '0 ppm',
      nitritePpm: '0.1 ppm',
    },
    species: [
      {
        id: 'f6',
        type: 'fish',
        name: 'Harlequin Rasbora',
        speciesName: 'Trigonostigma heteromorpha',
        origin: 'Southeast Asia',
        lifespan: '5-8 years',
        preferredTempC: '22-27°C',
        feeding: 'Small flakes, 1-2x daily',
        schoolSize: '8+ recommended',
        summary: 'Calm schooling fish that pairs well with driftwood-heavy, planted layouts like this one.',
      },
      {
        id: 'f7',
        type: 'plant',
        name: 'Anubias Nana',
        speciesName: 'Anubias barteri var. nana',
        origin: 'West Africa',
        lifespan: 'Perennial',
        preferredTempC: '22-28°C',
        feeding: 'Root tabs occasionally, minimal fertilizer needs',
        schoolSize: 'N/A — single plant',
        summary: 'Extremely low-maintenance — like the java fern, keep the rhizome above the substrate.',
        favorite: true,
      },
    ],
    careTips: [
      'It has been 8 days since your last water test — testing is recommended weekly, so a check-in is due.',
      'Nitrite is slightly present at 0.1 ppm — not urgent, but worth confirming it hasn\u2019t risen on your next test.',
      'Harlequin rasboras feel more secure schooling near the driftwood — your current layout is well suited to them.',
    ],
  },
};

export function getTankDetail(tankId: string): TankDetail | undefined {
  return TANK_DETAILS[tankId];
}