import { TestBed } from '@angular/core/testing';
import { CarresDataService } from './carres-data.service';

describe('CarresDataService', () => {
  let service: CarresDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarresDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return exactly 5 carres in the expected editorial order', () => {
    const carres = service.getCarres();
    expect(carres.length).toBe(5);

    const expectedOrder = [
      'carre-laures',
      'carre-1954-1962',
      'carre-une-derniere-priere',
      'carre-retour-a-la-terre',
      'carre-un-seul-heros-le-peuple'
    ];

    expect(carres.map(c => c.slug)).toEqual(expectedOrder);
    expect(service.carres().map(c => c.slug)).toEqual(expectedOrder);
  });

  it('should resolve carre by slug correctly', () => {
    const priere = service.getCarreBySlug('carre-une-derniere-priere');
    expect(priere).toBeDefined();
    expect(priere?.title).toBe('Une dernière prière');

    const retour = service.getCarreBySlug('carre-retour-a-la-terre');
    expect(retour).toBeDefined();
    expect(retour?.title).toBe('Retour à la terre');

    const unknown = service.getCarreBySlug('non-existent');
    expect(unknown).toBeUndefined();
  });

  it('should resolve carre by id correctly', () => {
    const carre = service.getCarreById('carre-laures');
    expect(carre).toBeDefined();
    expect(carre?.title).toBe("L'Aurès");

    const unknown = service.getCarreById('non-existent-id');
    expect(unknown).toBeUndefined();
  });
});

