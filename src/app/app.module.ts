import 'angular-server-side-configuration/process';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { environment } from '../environments/environment';
import { AppComponent, TITLE_TOKEN } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [{ provide: TITLE_TOKEN, useValue: environment.title }],
  bootstrap: [AppComponent],
})
export class AppModule {}
