import { CommonModule } from '@angular/common';
import { Component, DOCUMENT, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Menu, NavmenuService } from '../../services/navmenu.service';
import { Feathericon } from '../feathericon/feathericon';
import { SvgIcon } from '../svg-icon/svg-icon';
import { Bookmark } from './bookmark/bookmark';
import { Cart } from './cart/cart';
import { Language } from './language/language';
import { Notification } from './notification/notification';
import { Profile } from './profile/profile';
import { Search } from './search/search';
import { Theme } from './theme/theme';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    Profile,
    Notification,
    Feathericon,
    SvgIcon,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  public navmenu = inject(NavmenuService);
  private document = inject(DOCUMENT);

  public elem: HTMLElement;
  public menuItems: Menu[] = [];
  public item: Menu[] = [];
  public open = false;
  public searchResult: boolean = false;
  public searchResultEmpty: boolean = false;
  public text: string = '';
  public show = false;

  constructor() {
    this.navmenu.item.subscribe((menuItems: Menu[]) => (this.item = menuItems));
  }

  ngOnInit(): void {
    this.elem = document.documentElement;
  }

  toggleFullScreen() {
    this.navmenu.fullScreen = !this.navmenu.fullScreen;
    if (this.navmenu.fullScreen) {
      if (this.elem.requestFullscreen) {
        this.elem.requestFullscreen();
      } else if ('mozRequestFullScreen' in this.elem) {
        (
          this.elem as HTMLElement & {
            mozRequestFullScreen: () => Promise<void>;
          }
        ).mozRequestFullScreen();
      } else if ('webkitRequestFullscreen' in this.elem) {
        (
          this.elem as HTMLElement & {
            webkitRequestFullscreen: () => Promise<void>;
          }
        ).webkitRequestFullscreen();
      } else if ('msRequestFullscreen' in this.elem) {
        (
          this.elem as HTMLElement & {
            msRequestFullscreen: () => Promise<void>;
          }
        ).msRequestFullscreen();
      }
    } else {
      if (!this.document.exitFullscreen) {
        this.document.exitFullscreen();
      } else if ('mozCancelFullScreen' in this.document) {
        (
          this.document as Document & {
            mozCancelFullScreen: () => Promise<void>;
          }
        ).mozCancelFullScreen();
      } else if ('webkitExitFullscreen' in this.document) {
        (
          this.document as Document & {
            webkitExitFullscreen: () => Promise<void>;
          }
        ).webkitExitFullscreen();
      } else if ('msExitFullscreen' in this.document) {
        (this.document as Document & { msExitFullscreen: () => Promise<void> }).msExitFullscreen();
      }
    }
  }

  openMenu() {
    this.navmenu.closeSidebar = !this.navmenu.closeSidebar;
  }

  languageToggle() {
    this.navmenu.language = !this.navmenu.language;
  }

  openSearch() {
    this.show = true;
  }

  closeSearch() {
    this.show = false;
  }

  searchTerm(term: string) {
    term ? this.addFix() : this.removeFix();
    if (!term) return (this.menuItems = []);
    let items: Menu[] = [];
    term = term.toLowerCase();
    this.item.forEach(data => {
      if (data.title?.toLowerCase().includes(term) && data.type === 'link') {
        items.push(data);
      }
      data.children?.filter(subItems => {
        if (subItems.title?.toLowerCase().includes(term) && subItems.type === 'link') {
          subItems.icon = data.icon;
          items.push(subItems);
        }
        subItems.children?.filter(suSubItems => {
          if (suSubItems.title?.toLowerCase().includes(term)) {
            suSubItems.icon = data.icon;
            items.push(suSubItems);
          }
        });
        return;
      });
      this.checkSearchResultEmpty(items);
      this.menuItems = items;
    });
    return;
  }

  checkSearchResultEmpty(items: Menu[]) {
    if (!items.length) this.searchResultEmpty = true;
    else this.searchResultEmpty = false;
  }

  addFix() {
    this.searchResult = true;
  }

  removeFix() {
    document.body.classList.remove('offcanvas');
    this.searchResult = false;
    this.text = '';
  }

  clickOutside(): void {
    this.show = false;
    this.open = false;
    this.searchResult = false;
    this.searchResultEmpty = false;
    this.navmenu.language = false;
    document.body.classList.remove('offcanvas');
  }
}
