import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CarresDataService } from '../../core/services/carres-data.service';
import { HomeCarouselComponent } from './components/home-carousel/home-carousel.component';
import { HomeQuoteCarouselComponent } from './components/home-quote-carousel/home-quote-carousel.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HomeCarouselComponent, HomeQuoteCarouselComponent],
  template: `
    <main class="w-full flex flex-col">
      <app-home-carousel [carres]="carresDataService.carres()"></app-home-carousel>
      <app-home-quote-carousel></app-home-quote-carousel>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  readonly carresDataService = inject(CarresDataService);
}
