import { Injectable, inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product, CartItem } from '../models/product';

const STORAGE_KEY = 'cybertech_cart_v1';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly items = signal<CartItem[]>([]);
  readonly promoCode = signal<string>('');
  readonly discountPercent = signal<number>(0);
  readonly toastMessage = signal<string | null>(null);

  readonly totalCount = computed(() => {
    return this.items().reduce((acc, item) => acc + item.quantity, 0);
  });

  readonly subtotal = computed(() => {
    return this.items().reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  });

  readonly shippingFee = computed(() => {
    const sub = this.subtotal();
    if (sub === 0) return 0;
    if (sub >= 2000) return 0; // Free shipping over $2000
    return 49;
  });

  readonly discountAmount = computed(() => {
    return Math.round(this.subtotal() * (this.discountPercent() / 100));
  });

  readonly tax = computed(() => {
    const taxableAmount = Math.max(0, this.subtotal() - this.discountAmount());
    return Math.round(taxableAmount * 0.08 * 100) / 100; // 8% sales tax
  });

  readonly total = computed(() => {
    return this.subtotal() - this.discountAmount() + this.shippingFee() + this.tax();
  });

  constructor() {
    if (this.isBrowser) {
      this.loadCartFromStorage();
    }
  }

  addToCart(product: Product, quantity = 1): void {
    if (quantity <= 0) return;

    this.items.update(currentItems => {
      const existingIndex = currentItems.findIndex(i => i.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...currentItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      } else {
        return [...currentItems, { product, quantity }];
      }
    });

    this.saveCartToStorage();
    this.showToast(`Added ${quantity}x "${product.name}" to cart!`);
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    this.items.update(currentItems => {
      return currentItems.map(item => {
        if (item.product.id === productId) {
          return { ...item, quantity };
        }
        return item;
      });
    });

    this.saveCartToStorage();
  }

  removeFromCart(productId: string): void {
    const item = this.items().find(i => i.product.id === productId);
    this.items.update(currentItems => currentItems.filter(i => i.product.id !== productId));
    this.saveCartToStorage();
    if (item) {
      this.showToast(`Removed "${item.product.name}" from cart.`);
    }
  }

  clearCart(): void {
    this.items.set([]);
    this.promoCode.set('');
    this.discountPercent.set(0);
    this.saveCartToStorage();
  }

  applyPromo(code: string): { success: boolean; message: string } {
    const normalized = code.trim().toUpperCase();
    if (normalized === 'PCMASTER10' || normalized === 'PC10') {
      this.promoCode.set(normalized);
      this.discountPercent.set(10);
      this.showToast('Promo code applied: 10% discount!');
      return { success: true, message: '10% discount applied successfully!' };
    } else if (normalized === 'SAVE50') {
      this.promoCode.set(normalized);
      this.discountPercent.set(5);
      this.showToast('Promo code applied: 5% discount!');
      return { success: true, message: '5% discount applied successfully!' };
    } else if (normalized === 'FREESHIP') {
      this.promoCode.set(normalized);
      this.discountPercent.set(2);
      this.showToast('Free shipping promo activated!');
      return { success: true, message: 'Free Shipping promo activated!' };
    } else {
      return { success: false, message: 'Invalid promo code. Try "PC10" or "SAVE50".' };
    }
  }

  showToast(message: string): void {
    this.toastMessage.set(message);
    if (this.isBrowser) {
      setTimeout(() => {
        if (this.toastMessage() === message) {
          this.toastMessage.set(null);
        }
      }, 3500);
    }
  }

  dismissToast(): void {
    this.toastMessage.set(null);
  }

  private saveCartToStorage(): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items()));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }

  private loadCartFromStorage(): void {
    if (!this.isBrowser) return;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          this.items.set(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not load cart from localStorage', e);
    }
  }
}
