import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom, provideZoneChangeDetection } from '@angular/core';

import { TITLE_TOKEN, AppComponent } from './app/app.component';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    importProvidersFrom(BrowserModule),
    { provide: TITLE_TOKEN, useValue: environment.title },
  ],
}).catch((err) => console.error(err));
