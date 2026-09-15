import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-faq',
  imports: [TranslatePipe],
  templateUrl: './faq.html',
  styleUrl: './faq.css'
})
export class Faq { }
