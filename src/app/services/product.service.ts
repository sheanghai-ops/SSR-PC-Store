import { Injectable, signal } from '@angular/core';
import { Product } from '../models/product';
import { SAMPLE_PRODUCTS } from '../data/sample-products';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly productsSignal = signal<Product[]>(SAMPLE_PRODUCTS);

  readonly products = this.productsSignal.asReadonly();

  getAllProducts(): Product[] {
    return this.productsSignal();
  }

  getProductById(id: string): Product | undefined {
    return this.productsSignal().find(p => p.id === id);
  }

  getCategories(): string[] {
    const categories = new Set(this.productsSignal().map(p => p.category));
    return ['All', ...Array.from(categories)];
  }

  filterProducts(category: string, searchKeyword: string, maxPrice: number, sortBy: string): Product[] {
    let result = this.productsSignal();

    if (category && category !== 'All') {
      result = result.filter(p => p.category === category);
    } else {
      result = result.filter(p => Boolean(p.catalogImage));
    }

    if (searchKeyword && searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.specs.cpu.toLowerCase().includes(q) ||
        p.specs.gpu.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q)
      );
    }

    if (maxPrice > 0) {
      result = result.filter(p => p.price <= maxPrice);
    }

    // Sort
    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }
}
