import { bootstrapApplication } from '@angular/platform-browser';
import { CSP_NONCE } from '@angular/core';
import { environment } from './environments/environment';
import { TITLE_TOKEN, AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: TITLE_TOKEN, useValue: environment.title },
    {
      provide: CSP_NONCE,
      useValue: environment.cspNonce,
    },
  ],
}).catch((err) => console.error(err));
