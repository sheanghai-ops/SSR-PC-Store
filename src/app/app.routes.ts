import { Routes } from '@angular/router';
import { StorePage } from './app';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: StorePage },
  { path: 'category/:category', component: StorePage },
  { path: 'product/:id', component: StorePage },
  { path: 'cart', component: StorePage },
  { path: 'checkout', component: StorePage },
  { path: 'invoice/:id', component: StorePage },
  { path: '**', redirectTo: '' },
];
