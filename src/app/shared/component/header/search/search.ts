import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ClickOutsideDirective } from '../../../directives/outside.directive';
import { NavmenuService, Menu } from '../../../services/navmenu.service';
import { SvgIcon } from '../../svg-icon/svg-icon';

@Component({
  selector: 'app-search',
  imports: [
    CommonModule,
    SvgIcon,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ClickOutsideDirective,
  ],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search {
  public navServices = inject(NavmenuService);

  public menuItems: Menu[] = [];
  public item: Menu[] = [];
  public searchResult: boolean = false;
  public searchResultEmpty: boolean = false;
  public text: string = '';
  public open = false;
  public show = false;

  constructor() {
    this.navServices.item.subscribe((menuItems: Menu[]) => (this.item = menuItems));
  }

  openMenu() {
    this.open = !this.open;
  }

  searchTerm(term: string) {
    term ? this.addFix() : this.removeFix();
    if (!term) return (this.menuItems = []);
    let items: Menu[] = [];
    term = term.toLowerCase();
    this.item?.filter(menuItems => {
      if (menuItems.title?.toLowerCase().includes(term) && menuItems.type === 'link') {
        items.push(menuItems);
      }
      menuItems.children?.filter(subItems => {
        if (subItems.title?.toLowerCase().includes(term) && subItems.type === 'link') {
          subItems.icon = menuItems.icon;
          items.push(subItems);
        }
        subItems.children?.filter(suSubItems => {
          if (suSubItems.title?.toLowerCase().includes(term)) {
            suSubItems.icon = menuItems.icon;
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

  openSearch() {
    this.show = !this.show;
    this.searchResult = false;
  }

  addFix() {
    this.searchResult = true;
  }

  removeFix() {
    this.searchResult = false;
    this.text = '';
    document.body.classList.remove('offcanvas');
  }

  clickOutside(): void {
    this.searchResultEmpty = false;
    this.searchResult = false;
    document.body.classList.remove('offcanvas');
  }
}
