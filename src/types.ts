export interface Material {
  id: number;
  name: string;
  price_paid: number;
  total_length: number;
  total_weight: number;
  cost_per_meter: number;
}

export interface PointType {
  id: number;
  name: string;
  abbreviation: string;
  sample_time_10: number;
  unit_time: number;
}

export interface RecipeMaterial {
  material_id: number;
  name?: string;
  cost_per_meter?: number;
  length_used: number;
}

export interface RecipePoint {
  point_type_id: number;
  name?: string;
  unit_time?: number;
  quantity: number;
}

export interface Recipe {
  id: number;
  name: string;
  category: string;
  profit_margin: number;
  suggested_price: number;
  created_at: string;
  materials: RecipeMaterial[];
  points: RecipePoint[];
}

export interface Settings {
  hourly_rate: number;
}
