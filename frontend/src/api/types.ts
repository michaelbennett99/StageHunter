export const BACKEND_URL = 'http://stagehunter-backend:8080';

export enum GrandTour {
  TOUR = 'TOUR',
  GIRO = 'GIRO',
  VUELTA = 'VUELTA',
}

export interface Result {
  name: string;
  rank: number;
}

export interface ResultsData {
  grand_tour: boolean;
  year: boolean;
  stage_no: boolean;
  stage_start: boolean;
  stage_end: boolean;
  stage_results: number;
  GC_results: number;
  points_results?: number;
  mountains_results?: number;
  youth_results?: number;
  teams_results?: number;
}

export interface ElevationData {
  elevation: number;
  distance: number;
}

export interface GradientData {
  distance: number;
  elevation: number;
  gradient: number | null;
}
