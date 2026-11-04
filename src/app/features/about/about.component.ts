import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="about-page">
      <article class="editorial-container">
        <!-- En-tête de la page éditoriale -->
        <span class="section-label text-center">Démarche Curatoriale & Artistique</span>
        <h1 class="hero-title">L'Étoffe des Voix</h1>
        <p class="chapo">
          « Donner à entendre la résonance intérieure de ce que la main a gravé sur la soie. »
        </p>

        <!-- Corps du texte éditorial -->
        <div class="editorial-text">
          <p>
            Depuis sa création en 1937, le Carré Hermès transcende le statut de simple accessoire pour devenir un territoire d’expérimentation picturale. 90 centimètres carrés de soie blanche qui accueillent le geste des plus grands artistes contemporains, graveurs et maîtres de la couleur.
          </p>
          <p>
            Cette exposition invite le public à une expérience multisensorielle inédite : pour la première fois, chaque pièce exposée est accompagnée d'un entretien audio au long cours (de 20 minutes à 2 heures), capté dans l'intimité de l'atelier du créateur.
          </p>
        </div>

        <!-- Citation mise en exergue -->
        <blockquote class="pull-quote">
          « Le carré n'est jamais silencieux. Quand le twill frissonne au moindre souffle, c'est toute la polyphonie des gestes d'atelier qui se réveille. »
          <cite>— Fatima-Marwa Zouzal, Commissaire de l'Exposition</cite>
        </blockquote>

        <!-- Visuels Duo Médias Hermès ISO -->
        <div class="media-duo">
          <figure>
            <img
              src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80"
              alt="Geste du roulotté main sur soie"
            />
            <figcaption>L'art séculaire du roulotté à la main, scellé par les artisanes lyonnaises.</figcaption>
          </figure>
          <figure>
            <img
              src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80"
              alt="Gravure des cadres d'impression textile"
            />
            <figcaption>Jusqu'à 40 cadres d'impression millimétrés pour une seule œuvre.</figcaption>
          </figure>
        </div>

        <section class="mt-12">
          <span class="section-label">L'Expérience de Visite</span>
          <h2 class="section-heading">L'Écoute et la Lecture Synchronisées</h2>
          <div class="editorial-text">
            <p>
              Pour respecter le temps de l'œuvre et du regard, le lecteur sonore vous accompagne tout au long du défilement textuel. Vous pouvez ainsi naviguer entre les confessions des artistes, les anecdotes de création et la transcription minutieuse des échanges.
            </p>
          </div>

          <div class="mt-8 text-center">
            <a
              routerLink="/"
              class="button button-color-primary button-radius-small button-size-medium button-variant-filled inline-flex"
            >
              <span class="button-label label-medium">Explorer les Carrés d'Art</span>
            </a>
          </div>
        </section>
      </article>
    </main>
  `,
  styleUrl: './about.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutComponent {}
