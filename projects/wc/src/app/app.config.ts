import { initializeWC } from './initialize-wc';
import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  ErrorHandler,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { createErrorHandler } from '@sentry/angular';
import { provideNamedApollo } from 'apollo-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => {
      initializeWC();
    }),
    provideZonelessChangeDetection(),
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
