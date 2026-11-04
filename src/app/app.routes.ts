import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'Hermess — Galerie des Carrés d’Art'
  },
  {
    path: 'carre/:slug',
    loadComponent: () => import('./features/carre-detail/carre-detail.component').then(m => m.CarreDetailComponent),
    title: 'Hermess — Détail du Carré & Interview'
  },
  {
    path: 'carres/:slug',
    redirectTo: 'carre/:slug'
  },
  {
    path: 'a-propos',
    loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent),
    title: 'Hermess — Démarche Artistique & Exposition'
  },
  {
    path: 'texte-oeuvre',
    loadComponent: () => import('./features/artwork-text/artwork-text.component').then(m => m.ArtworkTextComponent),
    title: 'Hermess — Texte de l’Œuvre'
  },
  {
    path: 'texte',
    redirectTo: 'texte-oeuvre'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
