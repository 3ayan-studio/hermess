import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer id="page-footer" class="footer-wrapper" role="contentinfo">
      <!-- Partie sombre : Logo Hermès centré & Bottom mentions -->
      <div class="footer-dark">
        <!-- Logo Hermès centré -->
        <div class="footer-brand">
          <a routerLink="/" class="footer-logo-link" aria-label="Hermess Alger — Accueil">
            <svg class="icon-hermes-logo" viewBox="0 0 466.27333 267.15055" role="presentation" focusable="false" aria-hidden="true">
              <use href="assets/icons/hermes-symbols.svg#ng__hermes-logo"></use>
            </svg>
          </a>
        </div>

        <!-- Ligne de séparation Hermès ISO -->
        <hr class="footer-separator" />

        <!-- Bottom du footer : petites mentions légales et liens discrets -->
        <div class="sub-footer">
          <div class="sub-footer-content">
            <div class="sub-footer-legal">
              <p class="copyright paragraph-xsmall">
                © Hermess 2026. Exposition d'Art — Carrés &amp; Entretiens. Tous droits réservés.
              </p>
            </div>
            <div class="sub-footer-links">
              <a routerLink="/a-propos" class="legal-link paragraph-xsmall">Démarche curatoriale</a>
              <a routerLink="/texte-oeuvre" class="legal-link paragraph-xsmall">Texte de l'œuvre</a>
              <a routerLink="/" class="legal-link paragraph-xsmall">Accueil de l'exposition</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {}
