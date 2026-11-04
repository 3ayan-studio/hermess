import { TestBed } from '@angular/core/testing';
import { ArtworkTextService } from './artwork-text.service';

describe('ArtworkTextService', () => {
  let service: ArtworkTextService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ArtworkTextService]
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('devrait être créé et initialiser les signaux', () => {
    service = TestBed.inject(ArtworkTextService);
    expect(service).toBeTruthy();
    expect(service.menuLabel()).toBe("Texte de l'Œuvre");
  });

  it('devrait charger les données et mettre à jour le menuLabel avec le titre', async () => {
    const mockData = {
      artist: 'Artiste Test',
      title: 'Mon Titre Poétique',
      author: 'Auteur Test',
      paragraphs: ['Paragraphe 1', 'Paragraphe 2']
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockData
    } as Response);

    service = TestBed.inject(ArtworkTextService);
    const result = await service.loadText('/texte-oeuvre.json', true);

    expect(result).toEqual(mockData);
    expect(service.data()).toEqual(mockData);
    expect(service.menuLabel()).toBe('Mon Titre Poétique');
  });

  it('devrait gérer les erreurs de chargement réseau avec repli', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404
    } as Response);

    service = TestBed.inject(ArtworkTextService);
    const result = await service.loadText('/fichier-inexistant.json', true);

    expect(result).toBeNull();
    expect(service.error()).toBeTruthy();
    expect(service.menuLabel()).toBe("Texte de l'Œuvre");
  });
});
