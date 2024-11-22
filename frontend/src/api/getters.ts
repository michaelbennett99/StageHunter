import { BACKEND_STAGES_URL, BACKEND_URL } from './constants';
import {
  ResultsData,
  ElevationData,
  GradientData,
  NewInfoData,
  Info,
  InfoData
} from './types';

export async function fetchJSON<T>(url: string): Promise<T> {
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
  return fetchJSON(`${BACKEND_STAGES_URL}`);
}

export async function getStageLength(
  stage_id: string | number
): Promise<number> {
  const info = await fetchJSON<Info>(`${BACKEND_STAGES_URL}/info/${stage_id}`);
  return info.stage_length;
}

export async function getTrack(
  stage_id: string | number
): Promise<GeoJSON.LineString> {
  return fetchJSON(`${BACKEND_STAGES_URL}/track/${stage_id}`);
}

export async function getElevationData(
  stage_id: string | number
): Promise<ElevationData[]> {
  return fetchJSON(`${BACKEND_STAGES_URL}/elevation/${stage_id}`);
}

export async function getGradientData(
  stage_id: string | number,
  resolution: number
): Promise<GradientData[]> {
  return fetchJSON(
    `${BACKEND_STAGES_URL}/gradient/${stage_id}?resolution=${resolution}`
  );
}

export async function getResultsData(
  stage_id: string | number
): Promise<ResultsData> {
  return fetchJSON(`${BACKEND_STAGES_URL}/results/count/${stage_id}`);
}

export async function getStageData(
  stage_id: string | number,
  topN: number = 3
): Promise<{ info: InfoData, results: ResultsData }> {
  const resultsData = await getResultsData(stage_id);
  for (const key of Object.keys(resultsData) as (keyof ResultsData)[]) {
    resultsData[key] = Math.min(resultsData[key], topN);
  }
  const infoData = NewInfoData();
  return { info: infoData, results: resultsData };
}
