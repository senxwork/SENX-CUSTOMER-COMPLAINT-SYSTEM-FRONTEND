import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ClickOutsideDirective } from '../../../directives/outside.directive';
import { Feathericon } from '../../feathericon/feathericon';

interface cartitem {
  class: string;
  id: number;
  img: string;
  title: string;
  price: number;
  value: number;
}

export const carts: cartitem[] = [
  {
    id: 0,
    class: 'primary',
    img: 'assets/images/dashboard2/product/1.png',
    title: 'Apple Computers',
    price: 2600.0,
    value: 5,
  },
  {
    id: 1,
    class: 'secondary',
    img: 'assets/images/dashboard2/product/2.png',
    title: 'Microwave',
    price: 1450.45,
    value: 5,
  },
  {
    id: 2,
    class: 'tertiary',
    img: 'assets/images/dashboard2/product/3.png',
    title: 'Mackup Kit',
    price: 300.45,
    value: 5,
  },
];

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterModule, Feathericon, ClickOutsideDirective],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  public cart: boolean = false;
  public cartsdata = carts;
  public counter: number[] = [0, 0];

  carts() {
    this.cart = !this.cart;
  }

  close(data: cartitem) {
    this.cartsdata.splice(this.cartsdata.indexOf(data), 1);
  }

  decrement(i: number) {
    if (this.cartsdata[i].value > 0) {
      this.cartsdata[i].value -= 1;
    }
  }
  increment(i: number) {
    this.cartsdata[i].value += 1;
  }

  clickOutside(): void {
    this.cart = false;
  }
}
