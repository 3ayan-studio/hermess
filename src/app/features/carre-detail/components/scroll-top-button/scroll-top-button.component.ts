import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-scroll-top-button',
  standalone: true,
  template: `
    <button
      type="button"
      class="scroll-top-btn button button-color-secondary button-radius-small button-variant-filled"
      [class.is-visible]="isVisible()"
      [attr.tabindex]="isVisible() ? 0 : -1"
      [attr.aria-hidden]="!isVisible()"
      (click)="scrollToTop()"
      aria-label="Remonter en haut de la page"
      title="Remonter en haut de la page"
    >
      <svg
        class="arrow-icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M 6 14 L 12 8 L 18 14" />
      </svg>
    </button>
  `,
  styleUrl: './scroll-top-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScrollTopButtonComponent implements OnInit {
  private readonly document = inject(DOCUMENT);

  readonly isVisible = signal<boolean>(false);
  readonly scrollThreshold = 350;

  ngOnInit(): void {
    this.checkScrollVisibility();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.checkScrollVisibility();
  }

  checkScrollVisibility(): void {
    if (typeof window === 'undefined') return;
    const scrollY =
      window.scrollY ||
      this.document.documentElement?.scrollTop ||
      this.document.body?.scrollTop ||
      0;
    this.isVisible.set(scrollY > this.scrollThreshold);
  }

  scrollToTop(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }
}

