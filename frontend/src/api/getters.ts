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

function parseResults(res: any[], classification: string): Result[] {
  return res.filter((r: any) => (
    r.classification && (r.name || r.team) && r.rank
    && r.classification === classification
  )).map((r: any) => ({
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
  const info = await fetchJSON(`${BACKEND_URL}/stage/info/${stage_id}`);
  const res = await fetchJSON(
    `${BACKEND_URL}/stage/results/${stage_id}?topN=${top_n}`
  );
  return {
    grand_tour: info.GrandTour,
    year: info.Year,
    stage_no: info.StageNumber,
    stage_start: info.StageStart,
    stage_end: info.StageEnd,
    stage_results: parseResults(res, 'stage'),
    gc_results: parseResults(res, 'gc'),
    points_results: parseResults(res, 'points'),
    mountains_results: parseResults(res, 'mountains'),
    youth_results: parseResults(res, 'youth'),
    teams_results: parseResults(res, 'teams'),
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
  const data = await fetchJSON(`${BACKEND_URL}/stage/elevation/${stage_id}`);
  return data.map((d: { Elevation: number; Distance: number }) => ({
    elevation: d.Elevation,
    distance: d.Distance,
  }));
}

export async function getGradientData(
  stage_id: string | number,
  resolution: number
): Promise<GradientData[]> {
  const data = await fetchJSON(
    `${BACKEND_URL}/stage/gradient/${stage_id}?resolution=${resolution}`
  );
  return data.map(
    (d: { Distance: number; Elevation: number; Gradient: number | null }) => ({
      distance: d.Distance,
      elevation: d.Elevation,
      gradient: d.Gradient,
    })
  );
}
