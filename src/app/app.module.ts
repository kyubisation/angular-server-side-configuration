import 'angular-server-side-configuration/process';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent, TITLE_TOKEN } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [{ provide: TITLE_TOKEN, useValue: process.env['TITLE'] }],
  bootstrap: [AppComponent],
})
export class AppModule {}
