export type LivingThingType = 'fish' | 'plant';

export type Species = {
  id: string;
  type: LivingThingType;
  image?: string;
  name: string;
  speciesName: string;
  origin: string;
  lifespan: string;
  preferredTempC: string;
  feeding: string;
  schoolSize: string;
  summary: string;
  favorite?: boolean;
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
  tankSize?: number;
  tankImg?: string;
  overviewSummary: string;
  conditions: TankConditions;
  species: Species[];
  careTips: string[];
};
