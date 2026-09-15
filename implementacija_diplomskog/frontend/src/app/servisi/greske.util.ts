import { TranslateService } from '@ngx-translate/core';

export function prevediGresku(err: any, translate: TranslateService, podrazumevano: string): string {

  const kod = err?.error?.kod;

  if (kod) {
    const prevod = translate.instant('GRESKE.' + kod);
    if (prevod && prevod !== 'GRESKE.' + kod) {
      return prevod;
    }
  }

  if (err?.error?.poruka) {
    return err.error.poruka;
  }

  if (err?.status === 0) {
    return translate.instant('GRESKE.GRESKA_MREZA');
  }

  return podrazumevano;
}
