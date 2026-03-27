import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { LayoutService } from '../../../../shared/services/layout.service';
import { NavmenuService } from '../../../services/navmenu.service';
import { Breadcrumb } from '../../breadcrumb/breadcrumb';
import { Footer } from '../../footer/footer';
import { Header } from '../../header/header';
import { Sidebar } from '../../sidebar/sidebar';

@Component({
  selector: 'app-content',
  imports: [CommonModule, Header, Sidebar, Breadcrumb, RouterOutlet, Footer],
  templateUrl: './content.html',
  styleUrl: './content.scss',
})
export class Content {
  public layout = inject(LayoutService);
  public navmenu = inject(NavmenuService);
  constructor() {
    if (window.innerWidth < 1200) {
      this.navmenu.closeSidebar = true;
    }
    if (window.innerWidth <= 1200) {
      this.layout.config.settings.sidebar_type = 'compact-wrapper';
    } else {
      this.layout.config.settings.sidebar_type = this.layout.config.settings.sidebar_type;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth < 1200) {
      this.navmenu.closeSidebar = true;
    } else {
      this.navmenu.closeSidebar = false;
    }

    if (window.innerWidth <= 1200) {
      this.layout.config.settings.sidebar_type = 'compact-wrapper';
    } else {
      this.layout.config.settings.sidebar_type = this.layout.config.settings.sidebar_type;
    }
  }
}
