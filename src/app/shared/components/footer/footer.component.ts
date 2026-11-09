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
                © 2026 Fatima-Marwa Zouzal / Hermess – Tous droits réservés. Cette exposition s'inscrit dans une démarche exclusivement artistique et culturelle, sans visée commerciale détournée. Ce projet est totalement indépendant de la société Hermès International et de ses filiales. Les marques, logos et modèles éventuellement cités ou représentés restent la propriété exclusive de leurs détenteurs respectifs.
              </p>
            </div>
            <div class="sub-footer-social">
              <a
                href="https://www.instagram.com/fatimamarwazouzal/"
                target="_blank"
                rel="noopener noreferrer"
                class="footer-social-link"
                aria-label="Instagram de l'artiste @fatimamarwazouzal (nouvelle fenêtre)"
              >
                <svg class="icon-instagram" viewBox="0 0 512 512" role="presentation" focusable="false" aria-hidden="true">
                  <use href="assets/icons/hermes-symbols.svg#ng__instagram"></use>
                </svg>
                <span class="social-handle">&#64;fatimamarwazouzal</span>
              </a>
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
