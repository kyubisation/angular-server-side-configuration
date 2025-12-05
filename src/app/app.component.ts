import { Component, inject, InjectionToken } from '@angular/core';

export const TITLE_TOKEN = new InjectionToken<string>('injection-token');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  public title: string = inject(TITLE_TOKEN);
}
