import {
  BACKEND_URL,
  Result,
  ResultsData,
  ElevationData,
  GradientData
} from './types';

async function fetchJSON(url: string): Promise<any> {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  });

  if (!res.ok) {
    throw new Error(`Could not fetch ${url}. ${res.statusText}`);
  }

  return res.json();
}

export async function getRandomStageId(): Promise<number> {
  return fetchJSON(`${BACKEND_URL}/random`);
}

export async function getDailyStageId(): Promise<number> {
  return fetchJSON(`${BACKEND_URL}/daily`);
}

export async function getAllStageIDs(): Promise<number[]> {
  return fetchJSON(`${BACKEND_URL}/stages`);
}

/**
 * Parse the results from a list of records the backend returns.
 * @param res - The list of records to parse.
 * @param classification - The classification of the results to parse.
 * @returns The parsed results.
 */
function parseResults(
  res: Record<string, any>[],
  classification: string
): Result[] {
  return res
    .filter((r) => (
      r.classification && (r.name || r.team) && r.rank
      && r.classification === classification
    ))
    .map((r) => ({
      name: r.rider ?? r.team,
      rank: r.rank,
    }));
}

export async function getStageLength(
  stage_id: string | number
): Promise<number> {
  const info = await fetchJSON(`${BACKEND_URL}/stage/info/${stage_id}`);
  return info.StageLength;
}

export async function getResultsData(
  stage_id: string | number,
  top_n: string | number
): Promise<ResultsData> {
  const res = await fetchJSON(
    `${BACKEND_URL}/stage/results/${stage_id}?topN=${top_n}`
  );
  return {
    grand_tour: true,
    year: true,
    stage_no: true,
    stage_start: true,
    stage_end: true,
    stage_results: parseResults(res, 'stage').length,
    GC_results: parseResults(res, 'gc').length,
    points_results: parseResults(res, 'points').length,
    mountains_results: parseResults(res, 'mountains').length,
    youth_results: parseResults(res, 'youth').length,
    teams_results: parseResults(res, 'teams').length,
  };
}

export async function getTrack(
  stage_id: string | number
): Promise<GeoJSON.LineString> {
  return fetchJSON(`${BACKEND_URL}/stage/track/${stage_id}`);
}

export async function getElevationData(
  stage_id: string | number
): Promise<ElevationData[]> {
  return fetchJSON(`${BACKEND_URL}/stage/elevation/${stage_id}`);
}

export async function getGradientData(
  stage_id: string | number,
  resolution: number
): Promise<GradientData[]> {
  return fetchJSON(
    `${BACKEND_URL}/stage/gradient/${stage_id}?resolution=${resolution}`
  );
}
