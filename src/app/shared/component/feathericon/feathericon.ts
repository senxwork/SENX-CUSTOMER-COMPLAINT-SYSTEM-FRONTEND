import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

import * as feather from 'feather-icons';

@Component({
  selector: 'app-feather-icon',
  imports: [CommonModule],
  templateUrl: './feathericon.html',
  styleUrl: './feathericon.scss',
})
export class Feathericon {
  public readonly icon = input<string>();

  ngAfterViewInit() {
    feather.replace();
  }
}
