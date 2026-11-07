import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the footer component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the centered Hermès logo with routerLink to home', () => {
    const logoLink: HTMLAnchorElement | null = fixture.nativeElement.querySelector('.footer-logo-link');
    expect(logoLink).not.toBeNull();
    expect(logoLink?.getAttribute('href') ?? logoLink?.getAttribute('ng-reflect-router-link')).toBeTruthy();

    const logoSvg = logoLink?.querySelector('.icon-hermes-logo use');
    expect(logoSvg?.getAttribute('href')).toBe('assets/icons/hermes-symbols.svg#ng__hermes-logo');
  });

  it('should render the artist Instagram link with target="_blank" and rel="noopener noreferrer"', () => {
    const instaLink: HTMLAnchorElement | null = fixture.nativeElement.querySelector('.footer-social-link');
    expect(instaLink).not.toBeNull();
    expect(instaLink?.getAttribute('href')).toBe('https://www.instagram.com/fatimamarwazouzal/');
    expect(instaLink?.getAttribute('target')).toBe('_blank');
    expect(instaLink?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(instaLink?.getAttribute('aria-label')).toContain('Instagram');
  });

  it('should render the black Instagram SVG icon using #ng__instagram and the @fatimamarwazouzal handle', () => {
    const instaIcon = fixture.nativeElement.querySelector('.footer-social-link .icon-instagram');
    expect(instaIcon).not.toBeNull();

    const useTag = instaIcon?.querySelector('use');
    expect(useTag?.getAttribute('href')).toBe('assets/icons/hermes-symbols.svg#ng__instagram');

    const handle = fixture.nativeElement.querySelector('.footer-social-link .social-handle');
    expect(handle).not.toBeNull();
    expect(handle?.textContent?.trim()).toBe('@fatimamarwazouzal');
  });

  it('should not render the 3 previous internal redirection links', () => {
    const oldLinks = fixture.nativeElement.querySelectorAll('.sub-footer-links, .legal-link');
    expect(oldLinks.length).toBe(0);
  });
});

