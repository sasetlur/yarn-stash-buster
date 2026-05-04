export interface RavelryPattern {
  id: number;
  name: string;
  permalink: string;
  designer?: { name: string };
  first_photo?: { medium_url: string; small_url: string };
  pattern_categories?: Array<{ name: string; permalink: string }>;
  rating_average?: number;
  rating_count?: number;
  yardage_max?: number;
  yardage?: number;
  yarn_weight_description?: string;
  free: boolean;
  url?: string;
}

export interface PatternSearchResult {
  patterns: RavelryPattern[];
  paginator: {
    page: number;
    page_size: number;
    results: number;
    last_page: number;
  };
}

export interface PatternSuggestion {
  pattern: RavelryPattern;
  matchedYarn: {
    id: string;
    name: string;
    colorFamily: string;
  };
}
