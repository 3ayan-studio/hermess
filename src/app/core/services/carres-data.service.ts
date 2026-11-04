import { Injectable, signal } from '@angular/core';
import { Carre } from '../models/carre.model';
import { CARRES_MOCK } from '../data/carres.mock';

@Injectable({
  providedIn: 'root'
})
export class CarresDataService {
  private readonly _carres = signal<Carre[]>(CARRES_MOCK);
  readonly carres = this._carres.asReadonly();

  getCarres(): Carre[] {
    return this._carres();
  }

  getCarreBySlug(slug: string): Carre | undefined {
    return this._carres().find(c => c.slug === slug);
  }

  getCarreById(id: string): Carre | undefined {
    return this._carres().find(c => c.id === id);
  }
}
