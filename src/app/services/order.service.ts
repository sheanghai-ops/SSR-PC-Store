import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Order, CustomerInfo, PaymentDetails } from '../models/order';
import { CartItem } from '../models/product';
import { SAMPLE_PRODUCTS } from '../data/sample-products';

const ORDERS_KEY = 'cybertech_orders_v1';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  createOrder(
    customer: CustomerInfo,
    items: CartItem[],
    subtotal: number,
    shippingFee: number,
    tax: number,
    discount: number,
    total: number,
    paymentMethod: 'card' | 'paypal' | 'cod' | 'transfer',
    shippingMethod: string,
    discountCode?: string,
    cardNumberMasked?: string
  ): Order {
    const timestamp = Date.now();
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const orderId = `INV-${new Date().getFullYear()}-${randomHex}`;

    const order: Order = {
      orderId,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      customer,
      items: [...items],
      subtotal,
      shippingFee,
      tax,
      discount,
      discountCode,
      total,
      shippingMethod,
      payment: {
        method: paymentMethod,
        cardNumberMasked: cardNumberMasked || (paymentMethod === 'card' ? '•••• •••• •••• 4242' : undefined),
        transactionId: `TXN-${timestamp}-${Math.floor(Math.random() * 10000)}`,
        status: paymentMethod === 'cod' ? 'PENDING' : 'PAID'
      }
    };

    this.saveOrder(order);
    return order;
  }

  saveOrder(order: Order): void {
    if (!this.isBrowser) return;
    try {
      const existing = this.getAllOrders();
      existing.unshift(order);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(existing));
    } catch (e) {
      console.warn('Could not save order', e);
    }
  }

  getAllOrders(): Order[] {
    if (!this.isBrowser) return [];
    try {
      const data = localStorage.getItem(ORDERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  getOrderById(id: string): Order | undefined {
    const orders = this.getAllOrders();
    const found = orders.find(o => o.orderId === id || o.orderId.toLowerCase() === id.toLowerCase());
    if (found) return found;

    // Fallback default sample order for direct testing / preview
    return this.createDemoOrder(id);
  }

  createDemoOrder(id = 'INV-2026-DEMO'): Order {
    const p1 = SAMPLE_PRODUCTS[0];
    const p2 = SAMPLE_PRODUCTS[3];
    return {
      orderId: id,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      customer: {
        fullName: 'Alexander Vance',
        email: 'alex.vance@gamingcorp.com',
        phone: '+1 (555) 839-2019',
        address: '742 Evergreen Silicon Way, Suite 400',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94107',
        country: 'United States',
        orderNotes: 'Please ring bell upon delivery. Fragile high-end PC hardware.'
      },
      items: [
        { product: p1, quantity: 1 },
        { product: p2, quantity: 1 }
      ],
      subtotal: p1.price + p2.price,
      shippingFee: 0,
      tax: Math.round((p1.price + p2.price) * 0.08 * 100) / 100,
      discount: 200,
      discountCode: 'PCMASTER10',
      total: p1.price + p2.price - 200 + Math.round((p1.price + p2.price) * 0.08 * 100) / 100,
      shippingMethod: 'Express Secure Insured Freight (1-2 Days)',
      payment: {
        method: 'card',
        cardNumberMasked: '•••• •••• •••• 8821',
        transactionId: `TXN-DEMO-${Date.now()}`,
        status: 'PAID'
      }
    };
  }

  /**
   * Generates a self-contained, beautifully styled standalone .html invoice document
   */
  generateInvoiceHtml(order: Order): string {
    const itemsRows = order.items
      .map(
        (item, index) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 14px 12px; color: #64748b; font-weight: 600;">${index + 1}</td>
          <td style="padding: 14px 12px;">
            <div style="font-weight: 700; color: #0f172a; font-size: 15px;">${item.product.name}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
              ${item.product.specs.cpu} | ${item.product.specs.gpu} | ${item.product.specs.ram}
            </div>
            <div style="font-size: 11px; color: #0284c7; margin-top: 2px; font-weight: 600;">
              Warranty: ${item.product.specs.warranty}
            </div>
          </td>
          <td style="padding: 14px 12px; text-align: center; font-weight: 600; color: #1e293b;">${item.quantity}</td>
          <td style="padding: 14px 12px; text-align: right; color: #334155;">$${item.product.price.toLocaleString()}</td>
          <td style="padding: 14px 12px; text-align: right; font-weight: 700; color: #0f172a;">$${(item.product.price * item.quantity).toLocaleString()}</td>
        </tr>
      `
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${order.orderId} - CyberTech PC Store</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      line-height: 1.5;
      padding: 30px 20px;
    }
    .invoice-container {
      max-width: 860px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
      border: 1px solid #e2e8f0;
      padding: 40px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 30px;
      margin-bottom: 30px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-badge {
      background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
      color: white;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 6px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-heading {
      font-size: 32px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: 1px;
    }
    .invoice-id {
      font-size: 15px;
      font-weight: 700;
      color: #0284c7;
      margin-top: 4px;
    }
    .status-badge {
      display: inline-block;
      margin-top: 8px;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.5px;
      background-color: ${order.payment.status === 'PAID' ? '#dcfce7' : '#fef3c7'};
      color: ${order.payment.status === 'PAID' ? '#15803d' : '#b45309'};
      border: 1px solid ${order.payment.status === 'PAID' ? '#86efac' : '#fde68a'};
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 24px;
      background-color: #f8fafc;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 30px;
    }
    .info-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 6px;
    }
    .info-val {
      font-size: 14px;
      color: #1e293b;
      line-height: 1.4;
    }
    .table-container {
      width: 100%;
      margin-bottom: 30px;
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    th {
      background-color: #f1f5f9;
      color: #475569;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 12px;
    }
    .totals-area {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 35px;
    }
    .totals-card {
      width: 320px;
      background: #f8fafc;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #e2e8f0;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      padding: 6px 0;
      color: #475569;
    }
    .totals-row.final {
      border-top: 2px dashed #cbd5e1;
      margin-top: 8px;
      padding-top: 12px;
      font-size: 18px;
      font-weight: 900;
      color: #0f172a;
    }
    .footer-note {
      border-top: 1px solid #e2e8f0;
      padding-top: 25px;
      text-align: center;
      color: #64748b;
      font-size: 13px;
    }
    .action-bar {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-top: 30px;
    }
    .btn {
      padding: 10px 22px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
    }
    .btn-print {
      background-color: #0284c7;
      color: white;
    }
    @media print {
      body { background-color: white; padding: 0; }
      .invoice-container { box-shadow: none; border: none; padding: 20px 0; }
      .action-bar { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div>
        <div class="brand-title">
          <span>⚡ CYBERTECH</span>
          <span class="brand-badge">SSR PC STORE</span>
        </div>
        <p style="font-size: 13px; color: #64748b; margin-top: 6px;">Next-Gen High Performance Computing & Gaming Rigs</p>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 2px;">Support: sv34@pcshop.com | (+855) 027-10-2026</p>
      </div>
      <div class="invoice-title">
        <div class="invoice-heading">TAX INVOICE</div>
        <div class="invoice-id">#${order.orderId}</div>
        <div>
          <span class="status-badge">${order.payment.status === 'PAID' ? '✓ PAYMENT COMPLETED' : '⏳ PAYMENT PENDING'}</span>
        </div>
      </div>
    </div>

    <div class="info-grid">
      <div>
        <div class="info-label">Billed & Shipped To</div>
        <div class="info-val">
          <strong>${order.customer.fullName}</strong><br>
          ${order.customer.address}<br>
          ${order.customer.city}, ${order.customer.state} ${order.customer.zipCode}<br>
          ${order.customer.country}<br>
          📞 ${order.customer.phone}<br>
          ✉️ ${order.customer.email}
        </div>
      </div>
      <div>
        <div class="info-label">Order & Shipping Details</div>
        <div class="info-val">
          <strong>Order Date:</strong> ${order.date}<br>
          <strong>Shipping Method:</strong> ${order.shippingMethod}<br>
          <strong>Estimated Delivery:</strong> 2 - 4 Business Days<br>
          <strong>Carrier:</strong> FedEx Priority PC Express
        </div>
      </div>
      <div>
        <div class="info-label">Payment Information</div>
        <div class="info-val">
          <strong>Method:</strong> ${order.payment.method.toUpperCase()} ${order.payment.cardNumberMasked ? '(' + order.payment.cardNumberMasked + ')' : ''}<br>
          <strong>Transaction ID:</strong><br>
          <code style="font-size: 11px; background: #e2e8f0; padding: 2px 4px; border-radius: 4px;">${order.payment.transactionId}</code><br>
          <strong>Status:</strong> ${order.payment.status}
        </div>
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 40px;">#</th>
            <th>Computer System & Specifications</th>
            <th style="width: 80px; text-align: center;">Qty</th>
            <th style="width: 120px; text-align: right;">Unit Price</th>
            <th style="width: 130px; text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
    </div>

    <div class="totals-area">
      <div class="totals-card">
        <div class="totals-row">
          <span>Items Subtotal:</span>
          <span>$${order.subtotal.toLocaleString()}</span>
        </div>
        ${order.discount > 0
        ? `<div class="totals-row" style="color: #16a34a; font-weight: 600;">
                <span>Discount (${order.discountCode || 'Promo'}):</span>
                <span>-$${order.discount.toLocaleString()}</span>
              </div>`
        : ''
      }
        <div class="totals-row">
          <span>Shipping & Handling:</span>
          <span>${order.shippingFee === 0 ? '<strong style="color: #16a34a;">FREE</strong>' : '$' + order.shippingFee.toLocaleString()}</span>
        </div>
        <div class="totals-row">
          <span>Sales Tax (8%):</span>
          <span>$${order.tax.toLocaleString()}</span>
        </div>
        <div class="totals-row final">
          <span>Grand Total:</span>
          <span style="color: #0284c7;">$${order.total.toLocaleString()}</span>
        </div>
      </div>
    </div>

    <div class="footer-note">
      <p style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">Thank you for choosing CyberTech PC Store!</p>
      <p>All PC rigs undergo 72-hour rigorous thermal stress testing and memory validation prior to shipment.</p>
      <p style="font-size: 11px; color: #94a3b8; margin-top: 6px;">
        For warranty service, technical queries, or serial number registration, please visit cybertech-pc.com/warranty or quote Invoice #${order.orderId}.
      </p>
    </div>

    <div class="action-bar">
      <button class="btn btn-print" onclick="window.print()">🖨️ Print Invoice</button>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Triggers client-side download of the standalone .html invoice file
   */
  downloadInvoiceHtml(order: Order): void {
    if (!this.isBrowser) return;

    const htmlContent = this.generateInvoiceHtml(order);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${order.orderId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
