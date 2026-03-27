import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { LayoutService } from '../../services/layout.service';
import { Menu, NavmenuService } from '../../services/navmenu.service';
import { AuthPermissionService } from '../../services/auth-permission.service';
import { Auth } from '../../../classes/auth';
import { Feathericon } from '../feathericon/feathericon';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, NgbModule, Feathericon, RouterModule, TranslateModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  public layout = inject(LayoutService);
  public navServices = inject(NavmenuService);
  private router = inject(Router);
  private authPermissionService = inject(AuthPermissionService);

  public menuItems: Menu[] = [];
  public margin: number = 0;
  public width: number = window.innerWidth;
  public leftArrowNone: boolean = true;
  public rightArrowNone: boolean = false;
  public screenWidth: number;
  public screenHeight: number;
  public pined: boolean = false;
  public pinedItem: number[] = [];

  constructor() {
    // กรองเมนูตามสิทธิ์เมื่อ permissions เปลี่ยน
    this.authPermissionService.permissions$.subscribe(() => {
      this.menuItems = this.filterMenuByPermission(this.navServices.MENUITEMS);
    });

    this.navServices.item.subscribe((menuItems: Menu[]) => {
      this.menuItems = this.filterMenuByPermission(menuItems);
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          menuItems.filter(items => {
            if (items.path === event.url) {
              this.setNavActive(items);
            }
            if (!items.children) {
              return false;
            }
            items.children.filter((subItems: Menu) => {
              if (subItems.path === event.url) {
                this.setNavActive(subItems);
              }
              if (!subItems.children) {
                return false;
              }
              subItems.children.filter(subSubItems => {
                if (subSubItems.path === event.url) {
                  this.setNavActive(subSubItems);
                }
              });
              return;
            });
            return;
          });
        }
      });
    });
  }

  ngOnInit() {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
  }
  setNavActive(item: Menu) {
    this.menuItems.filter(menuItem => {
      if (menuItem !== item) {
        menuItem.active = false;
      }
      if (menuItem.children && menuItem.children.includes(item)) {
        menuItem.active = true;
      }
      if (menuItem.children) {
        menuItem.children.filter(submenuItems => {
          if (submenuItems.children && submenuItems.children.includes(item)) {
            menuItem.active = true;
            submenuItems.active = true;
          } else {
            submenuItems.active = false;
          }
        });
      }
    });
  }

  toggleMenu(item: Menu) {
    if (!item.active) {
      this.menuItems.forEach((a: Menu) => {
        if (this.menuItems.includes(item)) {
          a.active = false;
        }
        if (!a.children) {
          return false;
        }
        a.children.forEach((b: Menu) => {
          if (a.children?.includes(item)) {
            b.active = false;
          }
        });
        return;
      });
    }
    item.active = !item.active;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: { target: { innerWidth: number } }) {
    this.width = event.target.innerWidth - 500;
  }

  scrollToLeft() {
    if (this.margin >= -this.width) {
      this.margin = 0;
      this.leftArrowNone = true;
      this.rightArrowNone = false;
    } else {
      this.margin += this.width;
      this.rightArrowNone = false;
    }
  }

  scrollToRight() {
    if (this.margin <= -3500) {
      this.margin = -3000;
      this.leftArrowNone = false;
      this.rightArrowNone = true;
    } else {
      this.margin += -this.width;
      this.leftArrowNone = false;
    }
  }

  openMenu() {
    this.navServices.closeSidebar = !this.navServices.closeSidebar;
  }

  isPined(itemid: number) {
    return this.pinedItem.includes(itemid);
  }

  togglePined(id: number): void {
    const index = this.pinedItem.indexOf(id);
    if (index !== -1) {
      this.pinedItem.splice(index, 1);
    } else {
      this.pinedItem.push(id);
    }
    if (this.pinedItem.length <= 0) {
      this.pined = false;
    } else {
      this.pined = true;
    }
  }

  private hasMenuPermission(item: Menu): boolean {
    if (!item.permission) return true;
    if (typeof item.permission === 'string') {
      return this.authPermissionService.hasPermission(item.permission);
    }
    if (Array.isArray(item.permission)) {
      return this.authPermissionService.hasAnyPermission(item.permission);
    }
    return true;
  }

  private filterMenuByPermission(menuItems: Menu[]): Menu[] {
    return menuItems.filter(item => {
      // headTitle1 แสดงเสมอ
      if (item.headTitle1) return true;

      // เมนูที่มี children (type: "sub") → กรอง children ก่อน
      if (item.children) {
        const filteredChildren = item.children.filter(child => this.hasMenuPermission(child));
        if (filteredChildren.length === 0) return false;
        item.children = filteredChildren;
        return true;
      }

      return this.hasMenuPermission(item);
    });
  }
}
