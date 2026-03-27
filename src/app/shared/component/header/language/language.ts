import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { NavmenuService } from '../../../../shared/services/navmenu.service';

interface selectedlanguage {
  language?: string;
  code: string;
  type?: string;
  icon?: string;
}

@Component({
  selector: 'app-language',
  imports: [CommonModule],
  templateUrl: './language.html',
  styleUrl: './language.scss',
})
export class Language {
  public navServices = inject(NavmenuService);
  private translate = inject(TranslateService);

  public language: boolean = false;

  public languages: selectedlanguage[] = [
    {
      language: 'English',
      code: 'en',
      type: 'US',
      icon: 'us',
    },
    {
      language: 'Español',
      code: 'es',
      icon: 'es',
    },
    {
      language: 'Français',
      code: 'fr',
      icon: 'fr',
    },
    {
      language: 'Português',
      code: 'pt',
      type: 'BR',
      icon: 'pt',
    },
  ];

  public selectedLanguage: selectedlanguage = {
    language: 'ENG',
    code: 'en',
    type: 'US',
    icon: 'us',
  };

  changeLanguage(lang: selectedlanguage) {
    this.translate.use(lang.code);
    this.selectedLanguage = lang;
  }
}
