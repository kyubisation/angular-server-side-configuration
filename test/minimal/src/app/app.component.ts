import { Component } from '@angular/core';

import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  template: `
    <h1>Environment Variable: {{ variable }}</h1>
  `,
})
export class AppComponent {
  variable = environment.variable;
}
