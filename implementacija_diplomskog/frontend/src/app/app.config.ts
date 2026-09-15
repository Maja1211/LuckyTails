import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { autorizacijaInterceptor } from './interceptors/autorizacija.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([autorizacijaInterceptor])),
    provideTranslateService({
      lang: localStorage.getItem('luckytails_jezik') || 'sr',
      fallbackLang: 'sr'
    }),
    provideTranslateHttpLoader({ prefix: '/assets/i18n/', suffix: '.json' })
  ]
};
