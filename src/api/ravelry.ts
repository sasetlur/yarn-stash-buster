import { PatternSearchResult } from '../types/pattern';
import { YarnWeight } from '../types/yarn';
import { RAVELRY_WEIGHT_MAP } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api.ravelry.com';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
  data: PatternSearchResult;
  timestamp: number;
}

function base64Encode(str: string): string {
  // React Native doesn't have btoa, so we encode manually
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  for (let i = 0; i < str.length; i += 3) {
    const a = str.charCodeAt(i);
    const b = i + 1 < str.length ? str.charCodeAt(i + 1) : 0;
    const c = i + 2 < str.length ? str.charCodeAt(i + 2) : 0;
    output += chars[a >> 2];
    output += chars[((a & 3) << 4) | (b >> 4)];
    output += i + 1 < str.length ? chars[((b & 15) << 2) | (c >> 6)] : '=';
    output += i + 2 < str.length ? chars[c & 63] : '=';
  }
  return output;
}

function buildAuthHeader(username: string, password: string): string {
  return 'Basic ' + base64Encode(`${username}:${password}`);
}

async function getCached(key: string): Promise<PatternSearchResult | null> {
  const raw = await AsyncStorage.getItem(`@cache_${key}`);
  if (!raw) return null;
  const entry: CacheEntry = JSON.parse(raw);
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    await AsyncStorage.removeItem(`@cache_${key}`);
    return null;
  }
  return entry.data;
}

async function setCache(key: string, data: PatternSearchResult): Promise<void> {
  const entry: CacheEntry = { data, timestamp: Date.now() };
  await AsyncStorage.setItem(`@cache_${key}`, JSON.stringify(entry));
}

export async function searchPatterns(params: {
  username: string;
  password: string;
  weight: YarnWeight;
  maxYardage: number;
  freeOnly: boolean;
  category?: string;
  page?: number;
  pageSize?: number;
}): Promise<PatternSearchResult> {
  const { username, password, weight, maxYardage, freeOnly, category, page = 1, pageSize = 20 } = params;

  const ravelryWeight = RAVELRY_WEIGHT_MAP[weight] ?? weight.toLowerCase();
  const cacheKey = `patterns_${ravelryWeight}_${maxYardage}_${freeOnly}_${category ?? 'all'}_${page}_${pageSize}`;

  const cached = await getCached(cacheKey);
  if (cached) return cached;

  const queryParams = new URLSearchParams({
    craft: 'knitting',
    weight: ravelryWeight,
    yardage: `-${maxYardage}`,
    sort: 'best',
    page: String(page),
    page_size: String(pageSize),
  });

  if (freeOnly) {
    queryParams.set('availability', 'free');
  }

  if (category) {
    queryParams.set('pc', category);
  }

  const response = await fetch(`${BASE_URL}/patterns/search.json?${queryParams}`, {
    headers: {
      Authorization: buildAuthHeader(username, password),
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid Ravelry credentials. Please check your username and personal key in Settings.');
    }
    throw new Error(`Ravelry API error: ${response.status}`);
  }

  const data: PatternSearchResult = await response.json();
  await setCache(cacheKey, data);
  return data;
}

export async function searchMultiYarnPatterns(params: {
  username: string;
  password: string;
  weight: YarnWeight;
  totalYardage: number;
  numColors: number;
  freeOnly: boolean;
  category?: string;
  page?: number;
  pageSize?: number;
}): Promise<PatternSearchResult> {
  const { username, password, weight, totalYardage, numColors, freeOnly, category, page = 1, pageSize = 20 } = params;

  const ravelryWeight = RAVELRY_WEIGHT_MAP[weight] ?? weight.toLowerCase();
  const cacheKey = `multi_${ravelryWeight}_${totalYardage}_${numColors}_${freeOnly}_${category ?? 'all'}_${page}_${pageSize}`;

  const cached = await getCached(cacheKey);
  if (cached) return cached;

  const queryParams = new URLSearchParams({
    craft: 'knitting',
    weight: ravelryWeight,
    yardage: `-${totalYardage}`,
    'colors-number': String(numColors),
    sort: 'best',
    page: String(page),
    page_size: String(pageSize),
  });

  if (freeOnly) {
    queryParams.set('availability', 'free');
  }

  if (category) {
    queryParams.set('pc', category);
  }

  const response = await fetch(`${BASE_URL}/patterns/search.json?${queryParams}`, {
    headers: {
      Authorization: buildAuthHeader(username, password),
    },
  });

  if (!response.ok) {
    throw new Error(`Ravelry API error: ${response.status}`);
  }

  const data: PatternSearchResult = await response.json();
  await setCache(cacheKey, data);
  return data;
}

export async function getPatternDetails(params: {
  username: string;
  password: string;
  patternId: number;
}): Promise<any> {
  const { username, password, patternId } = params;

  const response = await fetch(`${BASE_URL}/patterns/${patternId}.json`, {
    headers: {
      Authorization: buildAuthHeader(username, password),
    },
  });

  if (!response.ok) {
    throw new Error(`Ravelry API error: ${response.status}`);
  }

  return response.json();
}

export interface RavelryYarn {
  id: number;
  name: string;
  permalink: string;
  yarn_company_name: string;
  yardage?: number;
  grams?: number;
  yarn_weight?: { name: string };
  fiber_content?: string;
  first_photo?: { small_url: string };
}

export interface YarnSearchResult {
  yarns: RavelryYarn[];
  paginator: {
    results: number;
    page: number;
    last_page: number;
  };
}

export async function searchYarns(params: {
  username: string;
  password: string;
  query: string;
  page?: number;
}): Promise<YarnSearchResult> {
  const { username, password, query, page = 1 } = params;

  if (!query.trim()) {
    return { yarns: [], paginator: { results: 0, page: 1, last_page: 1 } };
  }

  const queryParams = new URLSearchParams({
    query: query.trim(),
    page: String(page),
    page_size: '10',
    sort: 'best',
  });

  const response = await fetch(`${BASE_URL}/yarns/search.json?${queryParams}`, {
    headers: {
      Authorization: buildAuthHeader(username, password),
    },
  });

  if (!response.ok) {
    throw new Error(`Ravelry API error: ${response.status}`);
  }

  return response.json();
}
