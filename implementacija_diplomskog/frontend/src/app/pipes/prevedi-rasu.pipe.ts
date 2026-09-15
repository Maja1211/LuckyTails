import { Pipe, PipeTransform, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

const PREVODI: Record<string, string> = {
    'Bigl mešanac': 'Beagle mix',
    'Domaća dugodlaka': 'Domestic long-haired',
    'Domaća kratkodlaka': 'Domestic short-haired',
    'Haski mešanac': 'Husky mix',
    'Jazavičar mešanac': 'Dachshund mix',
    'Labrador mešanac': 'Labrador mix',
    'Mešanac': 'Mixed breed',
    'Mešanac malog rasta': 'Small mixed breed',
    'Mešanac srednje veličine': 'Medium-sized mixed breed',
    'Mešanac velike rase': 'Large mixed breed',
    'Nemački ovčar mešanac': 'German Shepherd mix',
    'Sijamska mešanac': 'Siamese mix',
    'Zlatni retriver mešanac': 'Golden Retriever mix'
};

@Pipe({ name: 'prevediRasu', pure: false })
export class PrevediRasuPipe implements PipeTransform {

    private http = inject(HttpClient);
    private translate = inject(TranslateService);
    private kes = new Map<string, string>();
    private uToku = new Set<string>();

    transform(rasa: string | null | undefined): string {
        if (!rasa) return '';

        const jezik = this.translate.getCurrentLang() || 'sr';
        if (jezik != 'en') return rasa;

        if (PREVODI[rasa]) return PREVODI[rasa];

        if (this.kes.has(rasa)) return this.kes.get(rasa)!;

        if (!this.uToku.has(rasa)) {
            this.uToku.add(rasa);

            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(rasa)}&langpair=sr|en`;

            this.http.get<any>(url).subscribe({
                next: (odgovor) => {
                    const prevod = odgovor?.responseData?.translatedText;
                    this.kes.set(rasa, prevod || rasa);
                },
                error: () => this.kes.set(rasa, rasa)
            });
        }

        return rasa;
    }
}
