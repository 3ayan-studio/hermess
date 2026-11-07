import { AudioQuote } from '../models/quote.model';

export const AUDIO_QUOTES_MOCK: AudioQuote[] = [
  {
    id: 'quote-laures-1',
    type: 'audio',
    carreSlug: 'carre-laures',
    carreTitle: "L'Aurès",
    segmentId: 'seg-3',
    timestampSeconds: 16,
    timestampFormatted: '00:00:16',
    quote: 'Je lui ai dit : <em>« Maman, où va-t-on ? »</em> Elle m’a répondu : <em>« La France nous chasse de nos montagnes, il faut que l’on parte d’ici. »</em>',
    speaker: 'Témoin familial',
    speakerRole: 'Mémoire des Aurès'
  },
  {
    id: 'quote-1954-1962-1',
    type: 'audio',
    carreSlug: 'carre-1954-1962',
    carreTitle: '1954-1962',
    segmentId: 'seg-258',
    timestampSeconds: 1756,
    timestampFormatted: '00:29:16',
    quote: 'Même quand on est venus en France ... quand j’entendais le bruit d’un avion, ça résonnait, ça me faisait peur ! ... C’est un truc qui ne sort pas de la tête.',
    speaker: 'Témoin familial',
    speakerRole: 'Récit d’enfance'
  },
  {
    id: 'quote-une-derniere-priere-1',
    type: 'audio',
    carreSlug: 'carre-une-derniere-priere',
    carreTitle: 'Une dernière prière',
    segmentId: 'seg-0',
    timestampSeconds: 0,
    timestampFormatted: '00:00:00',
    quote: 'Je lui ai raconté au sujet de mon oncle Abdallah, comment il a perdu la vue ; je lui ai parlé de Lalla Louiza, de son père, de ceux à qui ils ont confisqué les brebis, de ceux à qui ils ont pris les bœufs, et puis de ceux dont ils ont assassiné le père...',
    speaker: 'Témoin familial',
    speakerRole: 'Généalogie orale'
  },
  {
    id: 'quote-artwork-1',
    type: 'artwork',
    carreTitle: 'Her Story, Her Mess',
    quote: 'Les récits sont, pour la plupart, difficiles à entendre. Pour Fatima-Marwa Zouzal, nous devons toustes nous confronter à cette écoute, un geste éthique et politique nécessaire à plus d’un titre : pour nous laisser affecter par la voix de ces femmes, qui témoignent parfois pour la première fois.',
    speaker: 'Virginie Bobin',
    speakerRole: 'Texte de l’œuvre',
    routeUrl: '/her-story-her-mess'
  }
];
