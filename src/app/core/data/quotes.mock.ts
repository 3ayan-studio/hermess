import { AudioQuote } from '../models/quote.model';

export const AUDIO_QUOTES_MOCK: AudioQuote[] = [
  {
    id: 'quote-laures-1',
    carreSlug: 'carre-laures',
    carreTitle: "L'Aurès",
    segmentId: 'seg-3',
    timestampSeconds: 16,
    timestampFormatted: '00:00:16',
    quote: 'Je lui ai dit : <i>« Maman, où va-t-on ? »</i> Elle m’a répondu : <em>« La France nous chasse de nos montagnes, il faut que l’on parte d’ici. »</em>',
    speaker: 'Témoin familial',
    speakerRole: 'Mémoire des Aurès'
  },
  {
    id: 'quote-1954-1962-1',
    carreSlug: 'carre-1954-1962',
    carreTitle: '1954-1962',
    segmentId: 'seg-4',
    timestampSeconds: 22,
    timestampFormatted: '00:00:22',
    quote: 'En 1955, je commençais à comprendre qu’il y avait une guerre... On était dans les montagnes, dans les Aurès, au-dessus de Kbach.',
    speaker: 'Témoin familial',
    speakerRole: 'Récit d’enfance'
  },
  {
    id: 'quote-une-derniere-priere-1',
    carreSlug: 'carre-une-derniere-priere',
    carreTitle: 'Une dernière prière',
    segmentId: 'seg-0',
    timestampSeconds: 0,
    timestampFormatted: '00:00:00',
    quote: 'Raconte-lui aussi pour l’oncle Abdellah... Raconte-lui pour Lalla Louisa, comment ils ont traversé l’épreuve.',
    speaker: 'Voix de la transmission',
    speakerRole: 'Généalogie orale'
  },
  {
    id: 'quote-laures-2',
    carreSlug: 'carre-laures',
    carreTitle: "L'Aurès",
    segmentId: 'seg-0',
    timestampSeconds: 0,
    timestampFormatted: '00:00:00',
    quote: 'Pour ce qui est de la guerre d’Algérie, je me souviens de trois choses qui m’ont profondément marquée et construite.',
    speaker: 'Fatima-Marwa Zouzal',
    speakerRole: 'Artiste'
  }
];

