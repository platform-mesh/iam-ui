import { initializeWC } from './initialize-wc';
import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  ErrorHandler,
  provideAppInitializer,
} from '@angular/core';
import { createErrorHandler } from '@sentry/angular';
import { provideNamedApollo } from 'apollo-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => {
      const initializerFn = initializeWC();
      initializerFn();
    }),
    provideNamedApollo(() => ({})),
    provideHttpClient(),
    {
      provide: ErrorHandler,
      useValue: createErrorHandler({
        showDialog: false,
        logErrors: true,
      }),
    },
  ],
};
