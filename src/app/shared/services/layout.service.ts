import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  public customizer: string = '';
  public margin: number = 0;

  public config = {
    settings: {
      layout_type: 'ltr',
      layout_version: 'light',
      sidebar_type: 'horizontal-sidebar',
      icon: 'stroke-svg',
    },
    color: {
      primary_color: '#2D55FE',
      secondary_color: '#f39159',
    },
  };

  constructor() {
    if (this.config.settings.layout_type == 'box-layout') {
      document.body.classList.add('box-layout');
    }
    document.getElementsByTagName('html')[0].setAttribute('dir', this.config.settings.layout_type);

    document.documentElement.style.setProperty('--theme-default', this.config.color.primary_color);
    document.documentElement.style.setProperty(
      '--theme-secondary',
      this.config.color.secondary_color,
    );
  }
}
