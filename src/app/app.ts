import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { CartService } from './services/cart.service';
import { OrderService } from './services/order.service';
import { ProductService } from './services/product.service';
import { CustomerInfo } from './models/order';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App { }

@Component({
  selector: 'app-store-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class StorePage {
  private readonly router = inject(Router);
  readonly cart = inject(CartService);
  readonly products = inject(ProductService);
  private readonly orders = inject(OrderService);
  readonly page = signal('');
  readonly selectedId = signal('');
  readonly category = signal('All');
  readonly search = signal('');
  readonly sortBy = signal('featured');
  readonly promo = signal('');
  readonly promoMessage = signal('');
  readonly detailQuantity = signal(1);
  readonly mobileMenuOpen = signal(false);
  readonly order = signal(this.orders.createDemoOrder());
  readonly visibleProducts = computed(() => this.products.filterProducts(this.category(), this.search(), 0, this.sortBy()));
  readonly selectedProduct = computed(() => this.products.getProductById(this.selectedId()));

  customer: CustomerInfo = { fullName: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '', country: 'United States' };
  paymentMethod: 'card' | 'paypal' | 'cod' | 'transfer' = 'card';

  constructor() {
    this.syncRoute();
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe(() => this.syncRoute());
  }

  private syncRoute(): void {
    const route = this.router.routerState.snapshot.root.firstChild;
    this.page.set(route?.routeConfig?.path?.split('/')[0] ?? '');
    this.selectedId.set(route?.paramMap.get('id') ?? '');
    if (this.page() === 'category') {
      const routeCategory = route?.paramMap.get('category') ?? 'All';
      const matchingCategory = this.products.getCategories().find(item => item.toLowerCase() === routeCategory.toLowerCase());
      this.category.set(matchingCategory ?? 'All');
    } else if (this.page() === '') {
      this.category.set('All');
    }
    if (this.page() === 'invoice') {
      const found = this.orders.getOrderById(this.selectedId());
      if (found) this.order.set(found);
    }
  }

  selectCategory(category: string): void { this.category.set(category); }
  toggleMenu(): void { this.mobileMenuOpen.update(value => !value); }
  routerNavigate(path: string): void {
    this.category.set('All');
    void this.router.navigateByUrl(path);
  }
  openCategory(category: string): void {
    this.category.set(category);
    void this.router.navigate(['/category', category]);
  }
  onSearch(value: string): void {
    this.search.set(value);
    if (this.page() !== '' && this.page() !== 'category') void this.router.navigate(['/']);
  }
  add(product: import('./models/product').Product, quantity = 1): void { this.cart.addToCart(product, quantity); }
  buyNow(product: import('./models/product').Product): void {
    this.add(product, this.detailQuantity());
    void this.router.navigate(['/cart']);
  }
  updateQuantity(id: string, quantity: number): void { this.cart.updateQuantity(id, Number(quantity)); }
  getSpecRows(product: import('./models/product').Product): Array<[string, string]> {
    return Object.entries(product.specs) as Array<[string, string]>;
  }

  applyPromo(): void {
    const result = this.cart.applyPromo(this.promo());
    this.promoMessage.set(result.message);
  }

  placeOrder(): void {
    if (!this.cart.items().length) return;
    const created = this.orders.createOrder(
      this.customer, this.cart.items(), this.cart.subtotal(), this.cart.shippingFee(), this.cart.tax(),
      this.cart.discountAmount(), this.cart.total(), this.paymentMethod, 'Standard insured delivery', this.cart.promoCode(),
    );
    this.order.set(created);
    this.cart.clearCart();
    void this.router.navigate(['/invoice', created.orderId]);
  }

  downloadInvoice(): void { this.orders.downloadInvoiceHtml(this.order()); }
  money(value: number): string { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value); }
}
