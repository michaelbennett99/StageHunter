import { BACKEND_URL, STAGES_SEGMENT } from './constants';
import {
  ResultsData,
  ElevationData,
  GradientData,
  NewInfoData,
  Info,
  InfoData
} from './types';

export class APIClient {
  private baseURL: string;
  private version: string;

  constructor(baseURL: string, version: string) {
    this.baseURL = baseURL;
    this.version = version;
  }

  async fetchJSON<T>(url: string): Promise<T> {
    const res = await fetch(`${this.baseURL}/${this.version}/${url}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Could not fetch ${url}. ${res.statusText}`);
    }

    return res.json();
  }

  async getRandomStageId(): Promise<number> {
    return this.fetchJSON('/random');
  }

  async getDailyStageId(): Promise<number> {
    return this.fetchJSON('/daily');
  }

  async getAllStageIDs(): Promise<number[]> {
    return this.fetchJSON(STAGES_SEGMENT);
  }

  async getStageLength(
    stage_id: string | number
  ): Promise<number> {
    const info: Info = await this.fetchJSON(
      `${STAGES_SEGMENT}/${stage_id}/info`
    );
    return info.stage_length;
  }

  async getRiders(
    stage_id: string | number
  ): Promise<string[]> {
    return this.fetchJSON(`${STAGES_SEGMENT}/${stage_id}/riders`);
  }

  async getTeams(
    stage_id: string | number
  ): Promise<string[]> {
    return this.fetchJSON(`${STAGES_SEGMENT}/${stage_id}/teams`);
  }

  async getTrack(
    stage_id: string | number
  ): Promise<GeoJSON.LineString> {
    return this.fetchJSON(`${STAGES_SEGMENT}/${stage_id}/track`);
  }

  async getElevationData(
    stage_id: string | number
  ): Promise<ElevationData[]> {
    return this.fetchJSON(`${STAGES_SEGMENT}/${stage_id}/elevation`);
  }

  async getGradientData(
    stage_id: string | number,
    resolution: number
  ): Promise<GradientData[]> {
    return this.fetchJSON(
      `${STAGES_SEGMENT}/${stage_id}/gradient?resolution=${resolution}`
    );
  }

  async getResultsData(
    stage_id: string | number
  ): Promise<ResultsData> {
    return this.fetchJSON(`${STAGES_SEGMENT}/${stage_id}/results/count`);
  }

  async getStageData(
    stage_id: string | number,
    topN: number = 3
  ): Promise<{ info: InfoData, results: ResultsData }> {
    const resultsData = await this.getResultsData(stage_id);
    for (const key of Object.keys(resultsData) as (keyof ResultsData)[]) {
      resultsData[key] = Math.min(resultsData[key], topN);
    }
    const infoData = NewInfoData();
    return { info: infoData, results: resultsData };
  }
}

export const apiClient = new APIClient(BACKEND_URL, 'v1');
