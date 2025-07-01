import { AppComponent } from './app/app-component/app.component';
import { appConfig } from './app/app.config';
import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { init } from '@sentry/angular';

if (!isDevMode()) {
  init({
    dsn: 'https://f2627641f0203ebfc3f8aca95cec60df@o1240783.ingest.sentry.io/4508931443064839',
  });
}

bootstrapApplication(AppComponent, appConfig).catch((err) => {
  console.error(err);
});
