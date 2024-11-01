import { BACKEND_URL, ResultsData, ElevationData } from './types';

async function fetchJSON(url: string): Promise<any> {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return res.json();
}

export async function getRandomStageId(): Promise<number> {
  return fetchJSON(`${BACKEND_URL}/random`);
}

export async function getDailyStageId(): Promise<number> {
  return fetchJSON(`${BACKEND_URL}/daily`);
}

export async function getResultsData(
  stage_id: string | number,
  top_n: string | number
): Promise<ResultsData> {
  const info = await fetchJSON(`${BACKEND_URL}/info/${stage_id}`);
  const res = await fetchJSON(`${BACKEND_URL}/results/${stage_id}?top_n=${top_n}`);
  return {
    ...info,
    ...res
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
