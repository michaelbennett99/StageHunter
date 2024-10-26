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
  stage_no: number;
  stage_start: string;
  stage_end: string;
  stage_length: number;
  stage_results: Result[];
  gc_results: Result[];
  points_results?: Result[];
  mountains_results?: Result[];
  youth_results?: Result[];
}

export async function getResultsData(
  stage_id: number,
  top_n: number
): Promise<ResultsData> {
  const res = await fetch(`/api/results/${stage_id}?top_n=${top_n}`);
  return res.json();
}
