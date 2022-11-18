import { Component, Inject, InjectionToken } from '@angular/core';

export const TITLE_TOKEN = new InjectionToken<string>('injection-token');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(@Inject(TITLE_TOKEN) public title: string) {}
}
