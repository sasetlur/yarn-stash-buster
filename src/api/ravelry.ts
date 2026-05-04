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

function buildAuthHeader(username: string, password: string): string {
  return 'Basic ' + btoa(`${username}:${password}`);
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
  page?: number;
  pageSize?: number;
}): Promise<PatternSearchResult> {
  const { username, password, weight, maxYardage, freeOnly, page = 1, pageSize = 20 } = params;

  const ravelryWeight = RAVELRY_WEIGHT_MAP[weight] ?? weight.toLowerCase();
  const cacheKey = `patterns_${ravelryWeight}_${maxYardage}_${freeOnly}_${page}`;

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
