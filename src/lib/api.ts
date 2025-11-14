const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "https://api.ustozaibot.uz";
const STATS_BASE =
  process.env.NEXT_PUBLIC_STATS_BASE?.replace(/\/$/, "") ||
  `${API_BASE}/api/v1/statistics`;

type ApiEnvelope<T> = {
  data: T;
};

async function request<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const json = (await response.json()) as ApiEnvelope<T> | undefined;
    return json?.data ?? null;
  } catch (error) {
    console.error(`[api] GET ${url} failed`, error);
    return null;
  }
}

function withQuery(
  baseUrl: string,
  params?: Record<string, string | number | undefined>,
) {
  if (!params) return baseUrl;
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    search.append(key, String(value));
  });
  const query = search.toString();
  return query ? `${baseUrl}?${query}` : baseUrl;
}

export type MainStatsResponse = {
  users?: number;
  lessons?: number;
  certificates?: number;
  courseViews?: number;
  course_views?: number;
  views?: number;
};

export type RegionRow = {
  region?: string;
  name?: string;
  users?: number | string;
  views?: number | string;
  certificates?: number | string;
};

export type DistrictRow = {
  district: string;
  users?: number | string;
};

export type MFYRow = {
  mfy: string;
  users?: number | string;
};

export type SchoolRow = {
  school: string;
  users?: number | string;
};

export type CourseRow = {
  title: string;
  views: number;
  certificates: number;
  users: number;
  portfolios: number;
};

export type SeriesRow = {
  date: string;
  count: number;
};

export async function getMainStats() {
  return request<MainStatsResponse>(`${STATS_BASE}/main`);
}

export type RegionParams = {
  startDate?: string;
  endDate?: string;
  provider?: string;
};

export async function getRegions(params?: RegionParams) {
  const url = withQuery(`${STATS_BASE}/region`, params);
  return request<RegionRow[]>(url);
}

export async function getDistricts(region: string) {
  const url = withQuery(`${STATS_BASE}/district`, { region });
  return request<DistrictRow[]>(url);
}

export async function getMFY(region: string, district: string) {
  const url = withQuery(`${STATS_BASE}/mfy`, { region, district });
  return request<MFYRow[]>(url);
}

export async function getSchools(region: string, district: string) {
  const url = withQuery(`${STATS_BASE}/school`, { region, district });
  return request<SchoolRow[]>(url);
}

export async function getCourses(startDate: string, endDate: string) {
  const url = withQuery(`${STATS_BASE}/course`, { startDate, endDate });
  return request<CourseRow[]>(url);
}

export async function getDailyUsers(startDate: string, endDate: string) {
  const url = withQuery(`${STATS_BASE}/users/daily`, { startDate, endDate });
  return request<SeriesRow[]>(url);
}

export async function getDailyViews(startDate: string, endDate: string) {
  const url = withQuery(`${STATS_BASE}/views/daily`, { startDate, endDate });
  return request<SeriesRow[]>(url);
}


