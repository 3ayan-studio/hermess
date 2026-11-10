import { ChangeDetectionStrategy, Component, input, linkedSignal } from '@angular/core';
import { Carre } from '../../../../core/models/carre.model';
import { SvgIconComponent } from '../../../../shared/components/svg-icon/svg-icon.component';

@Component({
  selector: 'app-accordions',
  standalone: true,
  imports: [SvgIconComponent],
  template: `
    <section class="product-details-wrapper" aria-label="Informations et médium">
      <div class="product-details">
        <!-- Titre du carré sous le slider -->
        <div class="product-title-section">
          <h2 class="carre-detail-title">{{ carre().title }}</h2>
        </div>

        <!-- Accordéons ISO Hermès (1 ou 2 cellules) -->
        <div class="max-w-3xl">
          <!-- Accordéon 1 : Médium -->
          <div class="expansion-panel">
            <button
              type="button"
              class="expansion-panel-header-btn"
              (click)="toggleSection('medium')"
              [attr.aria-expanded]="openSection() === 'medium'"
              aria-controls="panel-content-medium"
            >
              <span class="header-title">Médium</span>
              <span class="header-icon">
                <app-svg-icon
                  name="ng__arrow-rounded"
                  size="14px"
                  stroke="#000"
                  strokeWidth="2.5"
                  class="accordion-chevron"
                  [class.is-expanded]="openSection() === 'medium'"
                ></app-svg-icon>
              </span>
            </button>
            <div
              id="panel-content-medium"
              role="region"
              class="expansion-panel-collapse"
              [class.is-expanded]="openSection() === 'medium'"
              [attr.aria-hidden]="openSection() !== 'medium'"
            >
              <div class="expansion-panel-collapse-inner">
                <div class="expansion-panel-content">
                  <ul class="medium-list">
                    <li><strong>Dimensions :</strong> {{ carre().dimensions }}</li>
                    <li><strong>Textile :</strong> {{ carre().textile || 'Satin de soie' }}</li>
                    <li><strong>Techniques :</strong> {{ carre().technique || 'Impression numérique sur tissu' }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Accordéon 2 : À propos de l'échange (si présent) -->
          @if (carre().hasInterview && (carre().exchangeNotes || carre().interview?.synopsis)) {
            <div class="expansion-panel">
              <button
                type="button"
                class="expansion-panel-header-btn"
                (click)="toggleSection('exchange')"
                [attr.aria-expanded]="openSection() === 'exchange'"
                aria-controls="panel-content-exchange"
              >
                <span class="header-title">À propos de l'échange</span>
                <span class="header-icon">
                  <app-svg-icon
                    name="ng__arrow-rounded"
                    size="14px"
                    stroke="#000"
                    strokeWidth="2.5"
                    class="accordion-chevron"
                    [class.is-expanded]="openSection() === 'exchange'"
                  ></app-svg-icon>
                </span>
              </button>
              <div
                id="panel-content-exchange"
                role="region"
                class="expansion-panel-collapse"
                [class.is-expanded]="openSection() === 'exchange'"
                [attr.aria-hidden]="openSection() !== 'exchange'"
              >
                <div class="expansion-panel-collapse-inner">
                  <div class="expansion-panel-content">
                    <p class="exchange-text">
                      {{ carre().exchangeNotes || carre().interview?.synopsis }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styleUrl: './accordions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZoneBAccordionsComponent {
  readonly carre = input.required<Carre>();
  readonly openSection = linkedSignal<string | null>(() => {
    this.carre();
    return 'medium';
  });

  toggleSection(section: string): void {
    this.openSection.update(curr => (curr === section ? null : section));
  }
}
