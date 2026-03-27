import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-svg-icon',
  imports: [CommonModule],
  templateUrl: './svg-icon.html',
  styleUrl: './svg-icon.scss',
})
export class SvgIcon {
  public readonly icon = input<string>();

  getSvgType() {
    return (
      document.getElementsByClassName('sidebar-wrapper')[0].getAttribute('icon') == 'stroke-svg'
    );
  }
}
