import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { ArtworkTextComponent } from './artwork-text.component';
import { ArtworkTextService } from '../../core/services/artwork-text.service';
import { ArtworkText } from '../../core/models/artwork-text.model';

describe('ArtworkTextComponent', () => {
  let component: ArtworkTextComponent;
  let fixture: ComponentFixture<ArtworkTextComponent>;

  const mockData: ArtworkText = {
    artist: 'Fatima Marwa Zouzal',
    title: 'Le Chant de la Soie',
    author: 'Habib Hadjar',
    paragraphs: [
      'Premier paragraphe avec <em>italique em</em> et <i>italique i</i>.',
      'Deuxième paragraphe avec <cite>titre d’œuvre</cite> et <strong>gras</strong>.'
    ]
  };

  const mockArtworkService = {
    data: signal<ArtworkText | null>(mockData),
    isLoading: signal<boolean>(false),
    error: signal<string | null>(null),
    menuLabel: signal<string>('Le Chant de la Soie')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtworkTextComponent],
      providers: [
        provideRouter([]),
        { provide: ArtworkTextService, useValue: mockArtworkService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArtworkTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('devrait afficher l’en-tête dans l’ordre exact : Artiste, Titre, Écrivain', () => {
    const el = fixture.nativeElement as HTMLElement;
    const artist = el.querySelector('.artist-name');
    const title = el.querySelector('.artwork-title');
    const author = el.querySelector('.author-name');

    expect(artist?.textContent?.trim()).toBe('Fatima Marwa Zouzal');
    expect(title?.textContent?.trim()).toBe('Le Chant de la Soie');
    expect(author?.textContent?.trim()).toBe('par Habib Hadjar');
  });

  it('devrait afficher tous les paragraphes avec rendu HTML pour les balises de formatage (em, i, cite, strong)', () => {
    const el = fixture.nativeElement as HTMLElement;
    const paragraphs = el.querySelectorAll('.artwork-paragraph');

    expect(paragraphs.length).toBe(2);
    expect(paragraphs[0].innerHTML).toContain('<em>italique em</em>');
    expect(paragraphs[0].innerHTML).toContain('<i>italique i</i>');
    expect(paragraphs[1].innerHTML).toContain('<cite>titre d’œuvre</cite>');
    expect(paragraphs[1].innerHTML).toContain('<strong>gras</strong>');
  });

  it('devrait appliquer la classe page-white-bg sur le body pour assurer un fond blanc pur', () => {
    expect(document.body.classList.contains('page-white-bg')).toBe(true);

    fixture.destroy();
    expect(document.body.classList.contains('page-white-bg')).toBe(false);
  });

  it('devrait afficher la reading-end-mark et ne pas afficher de bouton retour en fin de texte', () => {
    const el = fixture.nativeElement as HTMLElement;
    const endMark = el.querySelector('.reading-end-mark');
    const backBtn = el.querySelector('.back-link-container');
    const button = el.querySelector('.artwork-text-footer a');

    expect(endMark).toBeTruthy();
    expect(endMark?.textContent?.trim()).toBe('— ♦ —');
    expect(backBtn).toBeNull();
    expect(button).toBeNull();
  });
});

