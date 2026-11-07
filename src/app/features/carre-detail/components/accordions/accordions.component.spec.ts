import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ZoneBAccordionsComponent } from './accordions.component';
import { CARRES_MOCK } from '../../../../core/data/carres.mock';

describe('ZoneBAccordionsComponent', () => {
  let component: ZoneBAccordionsComponent;
  let fixture: ComponentFixture<ZoneBAccordionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZoneBAccordionsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ZoneBAccordionsComponent);
    component = fixture.componentInstance;
  });

  it('should render the carre title under the slider with no subtext below it', () => {
    const carre = CARRES_MOCK[0]; // L'Aurès
    fixture.componentRef.setInput('carre', carre);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.carre-detail-title');
    expect(title).toBeTruthy();
    expect(title?.textContent?.trim()).toBe("L'Aurès");

    // Ensure no editorial quote or description paragraph below it
    expect(compiled.querySelector('.body-desc')).toBeNull();
    expect(compiled.querySelector('.quote')).toBeNull();
  });

  it('should render 2 expansion panels for a carre with interview (e.g. L’Aurès)', () => {
    const carreWithInterview = CARRES_MOCK.find(c => c.hasInterview)!;
    fixture.componentRef.setInput('carre', carreWithInterview);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const panels = compiled.querySelectorAll('.expansion-panel');
    expect(panels.length).toBe(2);

    const headers = Array.from(compiled.querySelectorAll('.header-title')).map(el => el.textContent?.trim());
    expect(headers).toEqual(['Médium', 'À propos de l\'échange']);
  });

  it('should render only 1 expansion panel (Médium) for a carre without interview (e.g. Retour à la terre)', () => {
    const carreWithoutInterview = CARRES_MOCK.find(c => !c.hasInterview)!;
    fixture.componentRef.setInput('carre', carreWithoutInterview);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const panels = compiled.querySelectorAll('.expansion-panel');
    expect(panels.length).toBe(1);

    const headers = Array.from(compiled.querySelectorAll('.header-title')).map(el => el.textContent?.trim());
    expect(headers).toEqual(['Médium']);
  });

  it('should display dimensions, textile, and techniques in the Médium panel', () => {
    const carre = CARRES_MOCK[0]; // L'Aurès
    fixture.componentRef.setInput('carre', carre);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const mediumList = compiled.querySelector('.medium-list');
    expect(mediumList).toBeTruthy();

    const text = mediumList?.textContent || '';
    expect(text).toContain(carre.dimensions);
    expect(text).toContain(carre.textile || carre.composition);
    expect(text).toContain(carre.technique || 'Sérigraphie au cadre lyonnais');
  });

  it('should toggle sections when accordion header buttons are clicked', () => {
    const carre = CARRES_MOCK[0];
    fixture.componentRef.setInput('carre', carre);
    fixture.detectChanges();

    expect(component.openSection()).toBe('medium');

    // Click medium header to close
    const buttons = fixture.nativeElement.querySelectorAll('.expansion-panel-header-btn') as NodeListOf<HTMLButtonElement>;
    buttons[0].click();
    fixture.detectChanges();
    expect(component.openSection()).toBeNull();

    // Click second header to open exchange
    buttons[1].click();
    fixture.detectChanges();
    expect(component.openSection()).toBe('exchange');

    const exchangeText = fixture.nativeElement.querySelector('.exchange-text');
    expect(exchangeText).toBeTruthy();
    expect(exchangeText?.textContent).toContain(carre.exchangeNotes || carre.interview?.synopsis);
  });

  it('should render chevron icon ng__arrow-rounded and apply is-expanded class to the active panel', () => {
    const carre = CARRES_MOCK[0];
    fixture.componentRef.setInput('carre', carre);
    fixture.detectChanges();

    const chevrons = fixture.nativeElement.querySelectorAll('.accordion-chevron');
    expect(chevrons.length).toBe(2);

    // Initial state: medium is open, exchange is closed
    expect(chevrons[0].classList.contains('is-expanded')).toBe(true);
    expect(chevrons[1].classList.contains('is-expanded')).toBe(false);

    // Verify SVG uses ng__arrow-rounded
    const useElements = fixture.nativeElement.querySelectorAll('.accordion-chevron use');
    expect(useElements[0].getAttribute('href')).toContain('ng__arrow-rounded');
    expect(useElements[1].getAttribute('href')).toContain('ng__arrow-rounded');

    // Click to toggle medium off
    const buttons = fixture.nativeElement.querySelectorAll('.expansion-panel-header-btn') as NodeListOf<HTMLButtonElement>;
    buttons[0].click();
    fixture.detectChanges();

    expect(chevrons[0].classList.contains('is-expanded')).toBe(false);

    // Click to toggle exchange on
    buttons[1].click();
    fixture.detectChanges();

    expect(chevrons[1].classList.contains('is-expanded')).toBe(true);
  });

  it('should have the first accordion cell (medium) open by default initially and reset when carre input changes', () => {
    const carre1 = CARRES_MOCK[0];
    fixture.componentRef.setInput('carre', carre1);
    fixture.detectChanges();

    expect(component.openSection()).toBe('medium');
    const firstCollapse = fixture.nativeElement.querySelector('#panel-content-medium');
    expect(firstCollapse.classList.contains('is-expanded')).toBe(true);

    // Close the accordion
    const buttons = fixture.nativeElement.querySelectorAll('.expansion-panel-header-btn') as NodeListOf<HTMLButtonElement>;
    buttons[0].click();
    fixture.detectChanges();
    expect(component.openSection()).toBeNull();
    expect(firstCollapse.classList.contains('is-expanded')).toBe(false);

    // Switch carre -> should reset to first cell open by default
    const carre2 = CARRES_MOCK[1];
    fixture.componentRef.setInput('carre', carre2);
    fixture.detectChanges();

    expect(component.openSection()).toBe('medium');
    expect(firstCollapse.classList.contains('is-expanded')).toBe(true);
  });
});

