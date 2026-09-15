import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

function oblikSr(broj: number, jedan: string, malo: string, mnogo: string): string {
    const zadnjaCifra = broj % 10;
    const zadnjeDvijeCifre = broj % 100;

    if (zadnjaCifra == 1 && zadnjeDvijeCifre != 11) return jedan;
    if (zadnjaCifra >= 2 && zadnjaCifra <= 4 && !(zadnjeDvijeCifre >= 12 && zadnjeDvijeCifre <= 14)) return malo;
    return mnogo;
}

@Pipe({ name: 'starost', pure: false })
export class StarostPipe implements PipeTransform {

    private translate = inject(TranslateService);

    transform(meseci: number | null | undefined): string {
        if (meseci == null) return '';

        const jezik = this.translate.getCurrentLang() || 'sr';

        if (meseci < 12) {
            if (jezik == 'en') return `${meseci} ${meseci == 1 ? 'month' : 'months'}`;
            return `${meseci} ${oblikSr(meseci, 'mesec', 'meseca', 'meseci')}`;
        }

        const godine = Math.floor(meseci / 12);

        if (jezik == 'en') return `${godine} ${godine == 1 ? 'year' : 'years'}`;
        return `${godine} ${oblikSr(godine, 'godina', 'godine', 'godina')}`;
    }
}
