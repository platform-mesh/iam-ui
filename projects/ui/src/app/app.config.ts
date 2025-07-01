import { routes } from './app.routes';
import { initializeMatomo } from './initialize-matomo';
import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideAppInitializer } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withHashLocation } from '@angular/router';
import {
  ContentDensityMode,
  provideContentDensity,
  provideTheming,
} from '@fundamental-ngx/core';
import { provideNamedApollo } from 'apollo-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideNamedApollo(() => ({})),
    provideRouter(routes, withHashLocation()),
    provideContentDensity({
      storage: 'memory',
      defaultGlobalContentDensity: ContentDensityMode.COMPACT,
    }),
    provideHttpClient(),
    provideTheming({ themeQueryParam: 'sap-theme' }),
    provideNoopAnimations(),
    provideAppInitializer(() => {
      const initializerFn = initializeMatomo();
      initializerFn();
    }),
  ],
};
