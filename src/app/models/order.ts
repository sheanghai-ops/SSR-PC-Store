import { CartItem } from './product';

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  orderNotes?: string;
}

export interface PaymentDetails {
  method: 'card' | 'paypal' | 'cod' | 'transfer';
  cardNumberMasked?: string;
  transactionId: string;
  status: 'PAID' | 'PENDING';
}

export interface Order {
  orderId: string;
  date: string;
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  discountCode?: string;
  total: number;
  payment: PaymentDetails;
  shippingMethod: string;
}
