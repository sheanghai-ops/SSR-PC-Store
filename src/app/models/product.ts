export interface ProductSpecs {
  cpu: string;
  gpu: string;
  ram: string;
  storage: string;
  motherboard: string;
  psu: string;
  cooler: string;
  case: string;
  os: string;
  warranty: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'Gaming PC' | 'Workstation' | 'Office & Home' | 'Mini PC' | 'Extreme Enthusiast';
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  image: string;
  catalogImage?: string;
  summary: string;
  description: string;
  specs: ProductSpecs;
  badge?: string;
  features: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}
