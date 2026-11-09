import { Carre } from '../models/carre.model';

export const CARRES_MOCK: Carre[] = [
    {
        id: 'carre-laures',
        slug: 'carre-laures',
        title: "L'Aurès",
        subtitle: 'Édition Spéciale Exposition 2026',
        ref: 'H003924S 01',
        priceFormatted: '495 €',
        colorName: 'Noir / Nuages / BOOM',
        year: 2026,
        artist: 'Fatima-Marwa Zouzal',
        dimensions: '90 x 90 cm',
        composition: '100 % soie de mûrier twill roulotté à la main en France',
        textile: '100 % soie de mûrier twill roulotté à la main',
        technique: 'Sérigraphie au cadre lyonnais, roulotté main en France',
        exchangeNotes: 'Échange intime autour de l’exode forcé dans les montagnes de l’Aurès lors de la guerre d’Algérie, la fuite nocturne à cheval et les bombardements subis par la famille.',
        careInstructions: [
            'Nettoyage à sec par un professionnel uniquement.',
            'Repassage doux sur l’envers sans vapeur.',
            'Conserver à plat dans sa boîte d’origine à l’abri de l’humidité et du soleil direct.',
            'Éviter le contact avec l’eau, le parfum et les produits chimiques.'
        ],
        description: `À travers ce Carré d'exception, l'artiste célèbre l'envol, la mémoire et la résilience. Dans une composition aérienne et géométrique où chaque détail est imprimé avec une précision d'orfèvre, les soies s'entremêlent pour offrir un voyage poétique et intime.`,
        artisticNote: `« Concevoir ce carré a été une immersion profonde dans les récits transmis et l'architecture textile. » — Fatima-Marwa Zouzal`,
        thumbnail: '/carres/carre-laures/numeric-01.jpeg',
        media: [
            {
                id: "carre-laures-numeric-01",
                type: "image",
                url: "/carres/carre-laures/numeric-01.jpeg",
                alt: "L'Aurès à plat",
                aspectRatio: "1:1",
                isMain: true
            },
            {
                id: "carre-laures-detail-02",
                type: "image",
                url: "/carres/carre-laures/detail-02.jpg",
                alt: "Détail de la trame et des motifs de L'Aurès",
                aspectRatio: "3:4",
                isMain: false
            },
            {
                id: "carre-laures-vent-03",
                type: "video",
                url: "/carres/carre-laures/vent-03.mp4",
                srcMp4: "/carres/carre-laures/vent-03.mp4",
                poster: "/carres/carre-laures/vent-03-poster.jpg",
                alt: "Geste textile et mouvement de soie L'Aurès",
                aspectRatio: "3:4",
                isMain: false
            },
            {
                id: "carre-laures-angle-04",
                type: "image",
                url: "/carres/carre-laures/angle-04.jpg",
                alt: "Vue sous angle de L'Aurès",
                aspectRatio: "3:4",
                isMain: false
            }
        ],
        carouselMedia: {
            id: "carre-laures-peek-carousel",
            type: "image",
            url: "/carres/carre-laures/peek-carousel.jpg",
            alt: "L'Aurès — Présentation carrousel d'accueil",
            aspectRatio: "1:1"
        },
        hasInterview: true,
        interview: {
            audioUrl: '/carres/carre-laures/audio.m4a',
            transcriptUrl: '/carres/carre-laures/segmented-transcript.json',
            durationSeconds: 1345,
            durationFormatted: '00:22:25',
            title: "Échange avec Fatima-Marwa Zouzal : Autour de L'Aurès",
            interviewees: ['Fatima-Marwa Zouzal (Artiste)', 'Témoin familial'],
            interviewer: 'Fatima-Marwa Zouzal',
            synopsis: 'Échange intime autour de l’exode forcé dans les montagnes de l’Aurès lors de la guerre d’Algérie, la fuite nocturne à cheval et les bombardements subis par la famille.',
            transcript: [
                {
                    id: 't1-1',
                    timestampSeconds: 0,
                    timestampFormatted: '00:00:00',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'L’histoire de ce carré a commencé par un geste suspendu entre le ciel et la terre.'
                },
                {
                    id: 't1-2',
                    timestampSeconds: 35,
                    timestampFormatted: '00:00:35',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'Dans les archives familiales, j’avais retrouvé cette photographie sépia d’un saut au-dessus du désert, où la toile semblait flotter comme une méduse céleste.'
                },
                {
                    id: 't1-3',
                    timestampSeconds: 70,
                    timestampFormatted: '00:01:10',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'Cette image ne m’a plus jamais quittée, elle portait en elle toute la fragilité et l’audace d’un abandon confiant.'
                },
                {
                    id: 't1-4',
                    timestampSeconds: 110,
                    timestampFormatted: '00:01:50',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'Pour traduire cette sensation sur la soie, il fallait réinventer la manière dont la matière respire et capte la lumière.'
                },
                {
                    id: 't1-5',
                    timestampSeconds: 150,
                    timestampFormatted: '00:02:30',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'Le tissage du twill de soie chez Hermès possède cette rigueur géométrique absolue, mais ici, je voulais que chaque pli raconte une prise d’air, une résistance devenue poésie.'
                },
                {
                    id: 't1-6',
                    timestampSeconds: 195,
                    timestampFormatted: '00:03:15',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'Les premières esquisses étaient presque trop précises, presque trop techniques avec les suspentes et les cordages.'
                },
                {
                    id: 't1-7',
                    timestampSeconds: 240,
                    timestampFormatted: '00:04:00',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'Il a fallu déconstruire cette rigueur militaire pour retrouver la pure émotion du vertige et de la liberté.'
                },
                {
                    id: 't1-8',
                    timestampSeconds: 285,
                    timestampFormatted: '00:04:45',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'Le choix des pigments s’est alors imposé avec la force d’une évidence minérale.'
                },
                {
                    id: 't1-9',
                    timestampSeconds: 330,
                    timestampFormatted: '00:05:30',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'Un blanc pur d’écume contrasté par des nuances d’ardoise et de noir d’encre de Chine, comme pour fixer l’ombre portée d’un nuage en fuite.'
                },
                {
                    id: 't1-10',
                    timestampSeconds: 380,
                    timestampFormatted: '00:06:20',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'Quand les maîtres artisans ont commencé à imprimer les premiers cadres au cadre lyonnais, une alchimie singulière s’est produite.'
                },
                {
                    id: 't1-11',
                    timestampSeconds: 430,
                    timestampFormatted: '00:07:10',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'L’encre pénétrait la trame avec une intensité qui semblait donner du volume au tissu, comme si le parachute se gonflait réellement sous nos yeux.'
                },
                {
                    id: 't1-12',
                    timestampSeconds: 480,
                    timestampFormatted: '00:08:00',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'Chaque couleur nécessite son propre cadre de gravure, séché et superposé avec une tolérance inférieure au quart de millimètre.'
                },
                {
                    id: 't1-13',
                    timestampSeconds: 530,
                    timestampFormatted: '00:08:50',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'C’est dans cette minutie silencieuse des ateliers que réside la véritable magie de la haute façon.'
                },
                {
                    id: 't1-14',
                    timestampSeconds: 580,
                    timestampFormatted: '00:09:40',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'Le roulotté à la main, réalisé selon la tradition par les ouvrières spécialisées, borde la pièce d’un bourrelet voluptueux qui enferme l’œuvre sans la contraindre.'
                },
                {
                    id: 't1-15',
                    timestampSeconds: 635,
                    timestampFormatted: '00:10:35',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'En portant ce carré autour du cou ou sur les épaules, on n’adopte pas simplement un motif, on s’enveloppe d’une mémoire du vent.'
                },
                {
                    id: 't1-16',
                    timestampSeconds: 690,
                    timestampFormatted: '00:11:30',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'Le parachute devient une métaphore universelle de protection et de renaissance, une seconde peau capable de défier les tempêtes.'
                },
                {
                    id: 't1-17',
                    timestampSeconds: 745,
                    timestampFormatted: '00:12:25',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'Beaucoup de visiteurs de l’exposition m’ont confié avoir ressenti une sensation d’apaisement immédiat face à cette composition.'
                },
                {
                    id: 't1-18',
                    timestampSeconds: 800,
                    timestampFormatted: '00:13:20',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'C’est sans doute parce que la géométrie circulaire du dôme dialogue directement avec nos archétypes intérieurs les plus anciens.'
                },
                {
                    id: 't1-19',
                    timestampSeconds: 855,
                    timestampFormatted: '00:14:15',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'Nous cherchons tous, à un moment ou un autre de notre existence, cette voûte bienveillante qui ralentit la chute du monde.'
                },
                {
                    id: 't1-20',
                    timestampSeconds: 910,
                    timestampFormatted: '00:15:10',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'La lumière d’Alger a également profondément nourri les reflets de cette pièce.'
                },
                {
                    id: 't1-21',
                    timestampSeconds: 965,
                    timestampFormatted: '00:16:05',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'Cette clarté blanche aveuglante du midi méditerranéen exige des contrastes profonds pour ne pas se dissoudre dans l’espace.'
                },
                {
                    id: 't1-22',
                    timestampSeconds: 1020,
                    timestampFormatted: '00:17:00',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'J’ai passé des semaines à étudier la réfraction solaire sur les dômes de la Casbah et les terrasses ouvertes sur le large.'
                },
                {
                    id: 't1-23',
                    timestampSeconds: 1080,
                    timestampFormatted: '00:18:00',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'Chaque fibre de soie reflète cette vibration lumineuse de façon mouvante, selon l’angle sous lequel le regard se pose.'
                },
                {
                    id: 't1-24',
                    timestampSeconds: 1140,
                    timestampFormatted: '00:19:00',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'Le carré ne demeure jamais statique, il est un tableau vivant qui s’anime au moindre souffle d’air.'
                },
                {
                    id: 't1-25',
                    timestampSeconds: 1200,
                    timestampFormatted: '00:20:00',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'Au fil de l’échange, je réalise combien cette œuvre est le reflet d’un long cheminement intime entre deux rives.'
                },
                {
                    id: 't1-26',
                    timestampSeconds: 1265,
                    timestampFormatted: '00:21:05',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'Elle réconcilie la modernité des matériaux et la noblesse immémoriale du geste artisanal.'
                },
                {
                    id: 't1-27',
                    timestampSeconds: 1335,
                    timestampFormatted: '00:22:15',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'Pour les jeunes générations qui découvrent cette exposition, j’espère que ce carré sera une invitation à oser le grand saut créatif.'
                },
                {
                    id: 't1-28',
                    timestampSeconds: 1405,
                    timestampFormatted: '00:23:25',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'Car créer, c’est précisément accepter de se jeter dans l’inconnu en faisant confiance à la toile que l’on tisse soi-même.'
                },
                {
                    id: 't1-29',
                    timestampSeconds: 1480,
                    timestampFormatted: '00:24:40',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'Rien n’est jamais définitivement tracé à l’avance, tout s’invente dans le froissement délicat de la matière et du temps.'
                },
                {
                    id: 't1-30',
                    timestampSeconds: 1560,
                    timestampFormatted: '00:26:00',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'Le silence qui suit l’ouverture de la voile est sans doute le plus beau son qu’il m’ait été donné d’imaginer.'
                },
                {
                    id: 't1-31',
                    timestampSeconds: 1650,
                    timestampFormatted: '00:27:30',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'Un silence dense, presque palpable, où l’on entend simplement le battement de son propre cœur accordé au rythme de l’univers.'
                },
                {
                    id: 't1-32',
                    timestampSeconds: 1740,
                    timestampFormatted: '00:29:00',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'C’est ce murmure secret que ce carré tente de transmettre à quiconque prend le temps de s’y arrêter.'
                },
                {
                    id: 't1-33',
                    timestampSeconds: 1800,
                    timestampFormatted: '00:30:00',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'Et c’est peut-être là toute la vocation de l’art : suspendre la course du temps pour laisser place à la contemplation pure.'
                }
            ]
        }
    },
    {
        id: 'carre-1954-1962',
        slug: 'carre-1954-1962',
        title: '1954-1962',
        subtitle: 'Édition Spéciale Exposition 2026',
        ref: 'H003924S 02',
        priceFormatted: '495 €',
        colorName: 'Bleu / Blanc / Rouge',
        year: 2026,
        artist: 'Fatima-Marwa Zouzal',
        dimensions: '90 x 90 cm',
        composition: '100 % soie de mûrier twill roulotté à la main en France',
        textile: '100 % soie de mûrier twill roulotté à la main',
        technique: 'Sérigraphie au cadre lyonnais, roulotté main en France',
        exchangeNotes: 'Échange familial retraçant l’enfance sous les bombardements des avions français, la vie dans les abris de fortune et les déplacements successifs de village en village.',
        careInstructions: [
            'Nettoyage à sec par un professionnel uniquement.',
            'Repassage doux sur l’envers sans vapeur.',
            'Conserver à plat dans sa boîte d’origine à l’abri de l’humidité et du soleil direct.',
            'Éviter le contact avec l’eau, le parfum et les produits chimiques.'
        ],
        description: `Une composition aérienne explorant les trajectoires de vol, la mémoire des voyages et les cartes imaginaires. Les nuances d'azur et de reflets métalliques évoquent la traversée des fuseaux et les lignes d'horizon.`,
        artisticNote: `« L'avion comme symbole de traversée, de distance et de lien entre deux rives. » — Fatima-Marwa Zouzal`,
        thumbnail: '/carres/carre-1954-1962/numeric-01.jpeg',
        media: [
            {
                id: "carre-1954-1962-numeric-01",
                type: "image",
                url: "/carres/carre-1954-1962/numeric-01.jpeg",
                alt: "1954 - 1962 à plat",
                aspectRatio: "1:1",
                isMain: true
            },
            {
                id: "carre-1954-1962-detail-02",
                type: "image",
                url: "/carres/carre-1954-1962/detail-02.jpg",
                alt: "Détail de la trame et des motifs de 1954 - 1962",
                aspectRatio: "3:4",
                isMain: false
            },
            {
                id: "carre-1954-1962-visit-03",
                type: "image",
                url: "/carres/carre-1954-1962/visit-03.jpg",
                alt: "Vue immersive et détails de 1954 - 1962",
                aspectRatio: "3:4",
                isMain: false
            },
            {
                id: "carre-1954-1962-angle-04",
                type: "image",
                url: "/carres/carre-1954-1962/angle-04.jpg",
                alt: "Vue sous angle de 1954 - 1962",
                aspectRatio: "3:4",
                isMain: false
            }
        ],
        carouselMedia: {
            id: "carre-1954-1962-visit-carousel",
            type: "image",
            url: "/carres/carre-1954-1962/visit-carousel.jpg",
            alt: "1954 - 1962 — Présentation carrousel d'accueil",
            aspectRatio: "1:1"
        },
        hasInterview: true,
        interview: {
            audioUrl: '/carres/carre-1954-1962/audio.m4a',
            transcriptUrl: '/carres/carre-1954-1962/segmented-transcript.json',
            durationSeconds: 2044,
            durationFormatted: '00:34:04',
            title: 'Échange avec Fatima-Marwa Zouzal : Autour de 1954-1962',
            interviewees: ['Fatima-Marwa Zouzal (Artiste)', 'Témoin familial'],
            interviewer: 'Fatima-Marwa Zouzal',
            synopsis: 'Échange familial retraçant l’enfance sous les bombardements des avions français, la vie dans les abris de fortune et les déplacements successifs de village en village.',
            transcript: [
                {
                    id: 't2-1',
                    timestampSeconds: 0,
                    timestampFormatted: '00:00:00',
                    speaker: 'Commissaire de l’exposition',
                    speakerRole: 'Échange',
                    text: 'Avec le Carré Avion, le voyage prend une dimension à la fois physique et introspective. Comment est née cette idée ?'
                },
                {
                    id: 't2-2',
                    timestampSeconds: 38,
                    timestampFormatted: '00:00:38',
                    speaker: 'Fatima-Marwa Zouzal',
                    speakerRole: 'Artiste',
                    text: 'L’avion est le lieu où le temps s’arrête, suspendu entre un point de départ que l’on quitte et une destination qui n’est pas encore là.'
                }
            ]
        }
    },
    {
        id: 'carre-retour-a-la-terre',
        slug: 'carre-retour-a-la-terre',
        title: 'Retour à la terre',
        subtitle: 'Édition Spéciale Exposition 2026',
        ref: 'H003924S 03',
        priceFormatted: '495 €',
        colorName: 'Terre / Eau / Sable',
        year: 2026,
        artist: 'Fatima-Marwa Zouzal',
        dimensions: '90 x 90 cm',
        composition: '100 % soie de mûrier twill roulotté à la main en France',
        textile: '100 % soie de mûrier twill roulotté à la main',
        technique: 'Sérigraphie au cadre lyonnais, roulotté main en France',
        careInstructions: [
            'Nettoyage à sec par un professionnel uniquement.',
            'Repassage doux sur l’envers sans vapeur.',
            'Conserver à plat dans sa boîte d’origine à l’abri de l’humidité et du soleil direct.',
            'Éviter le contact avec l’eau, le parfum et les produits chimiques.'
        ],
        description: `Une exploration sensible du retour aux origines, de l'ancrage et des récits intimes transmis à travers les générations. Les teintes telluriques célèbrent la terre natale et la circularité de la mémoire.`,
        artisticNote: `« Revenir, c'est redécouvrir ce que l'on croyait déjà connaître d'un regard neuf. » — Fatima-Marwa Zouzal`,
        thumbnail: '/carres/carre-retour-a-la-terre/numeric-01.jpeg',
        media: [
            {
                id: "carre-retour-a-la-terre-numeric-01",
                type: "image",
                url: "/carres/carre-retour-a-la-terre/numeric-01.jpeg",
                alt: "Retour à la Terre à plat",
                aspectRatio: "1:1",
                isMain: true
            },
            {
                id: "carre-retour-a-la-terre-detail-02",
                type: "image",
                url: "/carres/carre-retour-a-la-terre/detail-02.jpg",
                alt: "Détail de la trame et des motifs de Retour à la Terre",
                aspectRatio: "3:4",
                isMain: false
            },
            {
                id: "carre-retour-a-la-terre-vent-03",
                type: "video",
                url: "/carres/carre-retour-a-la-terre/vent-03.mp4",
                srcMp4: "/carres/carre-retour-a-la-terre/vent-03.mp4",
                poster: "/carres/carre-retour-a-la-terre/vent-03-poster.jpg",
                alt: "Geste textile et mouvement de soie Retour à la Terre",
                aspectRatio: "3:4",
                isMain: false
            },
            {
                id: "carre-retour-a-la-terre-angle-04",
                type: "image",
                url: "/carres/carre-retour-a-la-terre/angle-04.jpg",
                alt: "Vue sous angle de Retour à la Terre",
                aspectRatio: "3:4",
                isMain: false
            }
        ],
        carouselMedia: {
            id: "carre-retour-a-la-terre-angle-carousel",
            type: "image",
            url: "/carres/carre-retour-a-la-terre/angle-carousel.jpg",
            alt: "Retour à la Terre — Présentation carrousel d'accueil",
            aspectRatio: "1:1"
        },
        hasInterview: false,
        },
    {
        id: 'carre-une-derniere-priere',
        slug: 'carre-une-derniere-priere',
        title: 'Une dernière prière',
        subtitle: 'Édition Spéciale Exposition 2026',
        ref: 'H003924S 04',
        priceFormatted: '495 €',
        colorName: 'Bleu / Ciel / Délivrance',
        year: 2026,
        artist: 'Fatima-Marwa Zouzal',
        dimensions: '90 x 90 cm',
        composition: '100 % soie de mûrier twill roulotté à la main en France',
        textile: '100 % soie de mûrier twill roulotté à la main',
        technique: 'Sérigraphie au cadre lyonnais, roulotté main en France',
        exchangeNotes: 'Échange intime à plusieurs voix évoquant les arrestations, les quarante jours d’emprisonnement d’un proche et la transmission des mémoires de lutte.',
        careInstructions: [
            'Nettoyage à sec par un professionnel uniquement.',
            'Repassage doux sur l’envers sans vapeur.',
            'Conserver à plat dans sa boîte d’origine à l’abri de l’humidité et du soleil direct.',
            'Éviter le contact avec l’eau, le parfum et les produits chimiques.'
        ],
        description: `Une mise en scène graphique d'objets du quotidien et d'artéfacts mémoriels, réinventés dans une géométrie sensible. Chaque élément devient le témoin silencieux d'un rituel familier.`,
        artisticNote: `« Chaque objet porte une charge affective et un silence qui lui est propre. » — Fatima-Marwa Zouzal`,
        thumbnail: '/carres/carre-une-derniere-priere/numeric-01.jpeg',
        media: [
            {
                id: "carre-une-derniere-priere-numeric-01",
                type: "image",
                url: "/carres/carre-une-derniere-priere/numeric-01.jpeg",
                alt: "Une Dernière Prière à plat",
                aspectRatio: "1:1",
                isMain: true
            },
            {
                id: "carre-une-derniere-priere-vent-02",
                type: "video",
                url: "/carres/carre-une-derniere-priere/vent-02.mp4",
                srcMp4: "/carres/carre-une-derniere-priere/vent-02.mp4",
                poster: "/carres/carre-une-derniere-priere/vent-02-poster.jpg",
                alt: "Geste textile et mouvement de soie Une Dernière Prière",
                aspectRatio: "3:4",
                isMain: false
            },
            {
                id: "carre-une-derniere-priere-photo-03",
                type: "image",
                url: "/carres/carre-une-derniere-priere/photo-03.jpg",
                alt: "Vue 3 de Une Dernière Prière",
                aspectRatio: "3:4",
                isMain: false
            }
        ],
        carouselMedia: {
            id: "carre-une-derniere-priere-face-carousel",
            type: "image",
            url: "/carres/carre-une-derniere-priere/face-carousel.jpg",
            alt: "Une Dernière Prière — Présentation carrousel d'accueil",
            aspectRatio: "1:1"
        },
        hasInterview: true,
        interview: {
            audioUrl: '/carres/carre-une-derniere-priere/audio.m4a',
            transcriptUrl: '/carres/carre-une-derniere-priere/segmented-transcript.json',
            durationSeconds: 553,
            durationFormatted: '00:09:13',
            title: 'Échange avec Fatima-Marwa Zouzal : Autour d’Une dernière prière',
            interviewees: ['Fatima-Marwa Zouzal (Artiste)', 'Témoin familial'],
            interviewer: 'Fatima-Marwa Zouzal',
            synopsis: 'Échange intime à plusieurs voix évoquant les arrestations, les quarante jours d’emprisonnement d’un proche et la transmission des mémoires de lutte.',
            transcript: [
                {
                    id: 't4-1',
                    timestampSeconds: 0,
                    timestampFormatted: '00:00:00',
                    speaker: 'Anonyme 1',
                    speakerRole: 'Témoin familial',
                    text: "Raconte-lui aussi pour l'oncle Abdellah, comment il est devenu aveugle. Raconte-lui pour Lalla Louisa, comment ils ont pris le bétail de son père, ses brebis, ses vaches, comment ils l'ont ligoté et ont tué son père. Raconte-lui aussi pour Ammar Ou Nser, comment ils ont pris son bétail..."
                },
                {
                    id: 't4-2',
                    timestampSeconds: 16,
                    timestampFormatted: '00:00:16',
                    speaker: 'Anonyme 2',
                    speakerRole: 'Témoin familial',
                    text: 'Ah oui...'
                }
            ]
        }
    },
    {
        id: 'carre-un-seul-heros-le-peuple',
        slug: 'carre-un-seul-heros-le-peuple',
        title: 'Un seul héros, le peuple',
        subtitle: 'Édition Spéciale Exposition 2026',
        ref: 'H003924S 05',
        priceFormatted: '495 €',
        colorName: 'Rose, Rouge, Libre',
        year: 2026,
        artist: 'Fatima-Marwa Zouzal',
        dimensions: '90 x 90 cm',
        composition: '100 % soie de mûrier twill roulotté à la main en France',
        textile: '100 % soie de mûrier twill roulotté à la main',
        technique: 'Sérigraphie au cadre lyonnais, roulotté main en France',
        careInstructions: [
            'Nettoyage à sec par un professionnel uniquement.',
            'Repassage doux sur l’envers sans vapeur.',
            'Conserver à plat dans sa boîte d’origine à l’abri de l’humidité et du soleil direct.',
            'Éviter le contact avec l’eau, le parfum et les produits chimiques.'
        ],
        description: `Inspiré du bestiaire mythologique et de l'imaginaire féerique, La Licorne allie délicatesse végétale et force allégorique. Les nuances chatoyantes de pourpre et d'émeraude font vibrer la soie à chaque mouvement.`,
        artisticNote: `« La licorne comme allégorie de la liberté sauvage et du secret préservé. » — Fatima-Marwa Zouzal`,
        thumbnail: '/carres/carre-un-seul-heros-le-peuple/numeric-01.jpeg',
        media: [
            {
                id: "carre-un-seul-heros-le-peuple-numeric-01",
                type: "image",
                url: "/carres/carre-un-seul-heros-le-peuple/numeric-01.jpeg",
                alt: "Un Seul Héros le Peuple à plat",
                aspectRatio: "1:1",
                isMain: true
            },
            {
                id: "carre-un-seul-heros-le-peuple-video-02",
                type: "video",
                url: "/carres/carre-un-seul-heros-le-peuple/video-02.mp4",
                srcMp4: "/carres/carre-un-seul-heros-le-peuple/video-02.mp4",
                poster: "/carres/carre-un-seul-heros-le-peuple/video-02-poster.jpg",
                alt: "Geste textile et mouvement de soie Un Seul Héros le Peuple",
                aspectRatio: "3:4",
                isMain: false
            },
            {
                id: "carre-un-seul-heros-le-peuple-angle-03",
                type: "image",
                url: "/carres/carre-un-seul-heros-le-peuple/angle-03.jpg",
                alt: "Vue sous angle de Un Seul Héros le Peuple",
                aspectRatio: "3:4",
                isMain: false
            },
            {
                id: "carre-un-seul-heros-le-peuple-nuit-04",
                type: "image",
                url: "/carres/carre-un-seul-heros-le-peuple/nuit-04.jpg",
                alt: "Reflets et nuances nocturnes de Un Seul Héros le Peuple",
                aspectRatio: "3:4",
                isMain: false
            }
        ],
        carouselMedia: {
            id: "carre-un-seul-heros-le-peuple-video-carousel",
            type: "video",
            url: "/carres/carre-un-seul-heros-le-peuple/video-carousel.mp4",
            srcMp4: "/carres/carre-un-seul-heros-le-peuple/video-carousel.mp4",
            poster: "/carres/carre-un-seul-heros-le-peuple/video-carousel-poster.jpg",
            alt: "Un Seul Héros le Peuple — Présentation carrousel d'accueil",
            aspectRatio: "1:1"
        },
        hasInterview: false
    }
];
