// Add global to window, assigning the value of window itself.
(window as any).global = window;
import 'chartjs-adapter-date-fns';
import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app.module';

platformBrowser().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true,
})
  .catch(err => console.error(err));
