export enum GrandTour {
  TOUR = 'TOUR',
  GIRO = 'GIRO',
  VUELTA = 'VUELTA',
}

export interface Result {
  name: string;
  rank: number;
}

export interface Info {
  grand_tour: string;
  year: number;
  stage_no: number;
  stage_start: string;
  stage_end: string;
  stage_length: number;
}

export type InfoType = Exclude<keyof Info, 'stage_length'>;

export type ClassificationEnum = (
  'stage' |
  'general' |
  'points' |
  'mountains' |
  'youth' |
  'teams'
)

export type InfoData = Record<InfoType, boolean>;

export function NewInfoData(): InfoData {
  return {
    grand_tour: true,
    year: true,
    stage_no: true,
    stage_start: true,
    stage_end: true
  };
}

export type ResultsData = Record<ClassificationEnum, number>;

export type StageData = InfoData & ResultsData;

export interface ElevationData {
  elevation: number;
  distance: number;
}

export interface GradientData {
  distance: number;
  elevation: number;
  gradient: number | null;
}

export interface Options {
  grand_tours: string[];
  riders: string[];
  teams: string[];
}
