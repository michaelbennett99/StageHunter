import path from 'path';

import {
  ResultsData,
  ElevationData,
  GradientData,
  NewInfoData,
  Info,
  InfoData,
  DailyStage
} from './types';

export class APIClient {
  private host: string;
  private baseURL: string;
  private version: string;

  private static StagesSegment = '/stages';

  constructor(host: string, baseURL: string, version: string) {
    this.host = host;
    this.baseURL = baseURL;
    this.version = version;
  }

  private getURL(url: string): string {
    if (this.host === '') { // Ensure the path is absolute
      return path.join('/', this.baseURL, this.version, url);
    }
    return path.join(this.host, this.baseURL, this.version, url);
  }

  async fetchJSON<T>(url: string): Promise<T> {
    const fullURL = this.getURL(url);
    const res = await fetch(fullURL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Could not fetch ${fullURL}. ${res.statusText}`);
    }

    return res.json();
  }

  async getRandomStageId(): Promise<number> {
    return this.fetchJSON('/random');
  }

  async getDailyStage(): Promise<DailyStage> {
    return this.fetchJSON('/daily');
  }

  async getDailyStageId(): Promise<number> {
    return this.getDailyStage().then(dailyStage => dailyStage.stage_id);
  }

  async getAllStageIDs(): Promise<number[]> {
    return this.fetchJSON(APIClient.StagesSegment);
  }

  async getStageLength(
    stage_id: string | number
  ): Promise<number> {
    const info: Info = await this.fetchJSON(
      path.join(APIClient.StagesSegment, stage_id.toString(), 'info')
    );
    return info.stage_length;
  }

  async getRiders(
    stage_id: string | number
  ): Promise<string[]> {
    return this.fetchJSON(
      path.join(APIClient.StagesSegment, stage_id.toString(), 'riders')
    );
  }

  async getTeams(
    stage_id: string | number
  ): Promise<string[]> {
    return this.fetchJSON(
      path.join(APIClient.StagesSegment, stage_id.toString(), 'teams')
    );
  }

  async getTrack(
    stage_id: string | number
  ): Promise<GeoJSON.LineString> {
    return this.fetchJSON(
      path.join(APIClient.StagesSegment, stage_id.toString(), 'track')
    );
  }

  async getElevationData(
    stage_id: string | number
  ): Promise<ElevationData[]> {
    return this.fetchJSON(
      path.join(APIClient.StagesSegment, stage_id.toString(), 'elevation')
    );
  }

  async getGradientData(
    stage_id: string | number,
    resolution: number
  ): Promise<GradientData[]> {
    return this.fetchJSON(
      path.join(APIClient.StagesSegment, stage_id.toString(), 'gradient') +
        `?resolution=${resolution}`
    );
  }

  async getResultsData(
    stage_id: string | number
  ): Promise<ResultsData> {
    return this.fetchJSON(
      path.join(
        APIClient.StagesSegment,
        stage_id.toString(),
        'results',
        'count'
      )
    );
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

export const serverApiClient = new APIClient(
  'http://stagehunter-backend:8080',
  '',
  'v1'
);

export const clientApiClient = new APIClient(
  '',
  'api',
  'v1'
);
