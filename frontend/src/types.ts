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
  grand_tour: GrandTour;
  year: number;
  stage_no: number;
  stage_start: string;
  stage_end: string;
  stage_length: number;
  stage_results: Result[];
  gc_results: Result[];
  points_results?: Result[];
  mountains_results?: Result[];
  youth_results?: Result[];
  teams_results?: Result[];
}

export interface ElevationData {
  elevation: number;
  distance: number;
}
