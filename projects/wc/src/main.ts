import { appConfig } from './app/app.config';
// normally in polyfills.ts, but for webcomponents we only load the main.ts, not the polyfills
import '@angular/localize/init';
import { createApplication } from '@angular/platform-browser';

createApplication(appConfig).catch((err) => {
  console.error(err);
});
