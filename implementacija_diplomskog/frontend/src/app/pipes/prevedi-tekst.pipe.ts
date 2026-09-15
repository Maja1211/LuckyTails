import { Pipe, PipeTransform, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

@Pipe({ name: 'prevediTekst', pure: false })
export class PrevediTekstPipe implements PipeTransform {

    private http = inject(HttpClient);
    private translate = inject(TranslateService);
    private kes = new Map<string, string>();
    private uToku = new Set<string>();

    transform(tekst: string | null | undefined): string {
        if (!tekst) return '';

        const jezik = this.translate.getCurrentLang() || 'sr';
        if (jezik != 'en') return tekst;

        if (this.kes.has(tekst)) return this.kes.get(tekst)!;

        if (!this.uToku.has(tekst)) {
            this.uToku.add(tekst);

            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(tekst)}&langpair=sr|en`;

            this.http.get<any>(url).subscribe({
                next: (odgovor) => {
                    const prevod = odgovor?.responseData?.translatedText;
                    this.kes.set(tekst, prevod || tekst);
                },
                error: () => this.kes.set(tekst, tekst)
            });
        }

        return tekst;
    }
}
