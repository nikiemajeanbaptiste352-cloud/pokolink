/**
 * DONNÉES TEMPORAIRES : uniquement pour vérifier le rendu d'AfriLearn.
 * À remplacer par les réponses de l'API (TanStack Query). Niveaux, fils, publications,
 * documents, compteurs, état « populaire » et modération sont décidés par le serveur.
 */
import type {
  LearnAuthor,
  LearnComment,
  LearnDocument,
  LearnLevel,
  LearnPost,
} from '@/types/learn'

const COUNTRY = 'Burkina Faso'

/** Compte de démonstration : l'utilisateur connecté. */
export const TEMP_LEARN_ME: LearnAuthor = {
  id: 'me',
  name: 'Amadou Ba',
  handle: 'amadou.ba',
  role: 'member',
}

const AICHA: LearnAuthor = {
  id: 'u-aicha',
  name: 'Aïcha Ouédraogo',
  handle: 'aicha.o',
  role: 'moderator',
}
const ISSOUF: LearnAuthor = {
  id: 'u-issouf',
  name: 'Issouf Traoré',
  handle: 'issouf.t',
  role: 'member',
}
const MARIAM: LearnAuthor = {
  id: 'u-mariam',
  name: 'Mariam Sawadogo',
  handle: 'mariam.s',
  role: 'member',
}
const BOUREIMA: LearnAuthor = {
  id: 'u-boureima',
  name: 'Boureima Kaboré',
  handle: 'boureima.k',
  role: 'member',
}
const SALIF: LearnAuthor = {
  id: 'u-salif',
  name: 'Salif Zongo',
  handle: 'salif.z',
  role: 'member',
}
const NADEGE: LearnAuthor = {
  id: 'u-nadege',
  name: 'Nadège Compaoré',
  handle: 'nadege.c',
  role: 'member',
}

function level(
  id: string,
  name: string,
  category: LearnLevel['category'],
  membersCount = 0,
): LearnLevel {
  return { id, name, category, country: COUNTRY, membersCount, hasFeed: membersCount > 0 }
}

/** Niveaux actifs. Seuls ceux qui ont déjà des membres ont un fil ; les autres sont créés à la première arrivée. */
export const TEMP_LEARN_LEVELS: readonly LearnLevel[] = [
  level('cp1', 'CP1', 'Primaire'),
  level('cp2', 'CP2', 'Primaire'),
  level('ce1', 'CE1', 'Primaire'),
  level('ce2', 'CE2', 'Primaire'),
  level('cm1', 'CM1', 'Primaire'),
  level('cm2', 'CM2', 'Primaire'),
  level('6e', '6e', 'Collège'),
  level('5e', '5e', 'Collège'),
  level('4e', '4e', 'Collège'),
  level('3e', '3e', 'Collège', 132),
  level('seconde', 'Seconde', 'Lycée'),
  level('premiere', 'Première', 'Lycée'),
  level('terminale-a', 'Terminale A', 'Lycée'),
  level('terminale-c', 'Terminale C', 'Lycée'),
  level('terminale-d', 'Terminale D', 'Lycée', 418),
  level('licence-1', 'Licence 1', 'Université', 260),
  level('licence-2', 'Licence 2', 'Université'),
  level('licence-3', 'Licence 3', 'Université'),
  level('master', 'Master', 'Université'),
  level('doctorat', 'Doctorat', 'Université'),
]

/** Fils déjà rejoints par l'utilisateur (renvoyés par le serveur). */
export const TEMP_JOINED_LEVEL_IDS: readonly string[] = ['terminale-d']

export const TEMP_LEARN_DOCUMENTS: readonly LearnDocument[] = [
  {
    id: 'doc-genetique',
    levelId: 'terminale-d',
    title: 'Cours complet de génétique',
    description: 'Résumé, schémas des croisements et méthode du test-cross. 24 pages.',
    kind: 'cours',
    fileType: 'pdf',
    fileSize: 2_411_724,
    downloadsCount: 386,
    isPopular: true,
    author: ISSOUF,
    timeLabel: 'il y a 2 j',
  },
  {
    id: 'doc-derivees',
    levelId: 'terminale-d',
    title: 'Série d’exercices : dérivées et exponentielle',
    description: '12 exercices progressifs, du calcul de dérivée à l’étude de fonction.',
    kind: 'exercice',
    fileType: 'pdf',
    fileSize: 842_000,
    downloadsCount: 142,
    isPopular: false,
    author: BOUREIMA,
    timeLabel: 'il y a 5 h',
  },
  {
    id: 'doc-bac-maths-2024',
    levelId: 'terminale-d',
    title: 'Corrigé du BAC D 2024 : Mathématiques',
    description: 'Corrigé détaillé des quatre exercices et du problème.',
    kind: 'corrige',
    fileType: 'pdf',
    fileSize: 1_320_500,
    downloadsCount: 512,
    isPopular: true,
    author: SALIF,
    timeLabel: 'il y a 1 sem.',
  },
  {
    id: 'doc-sujet-blanc-pc',
    levelId: 'terminale-d',
    title: 'Sujet blanc de physique-chimie, série D',
    description: 'Sujet de deux heures, barème fourni. Corrigé à venir.',
    kind: 'examen',
    fileType: 'docx',
    fileSize: 318_000,
    downloadsCount: 97,
    isPopular: false,
    author: AICHA,
    timeLabel: 'hier',
  },
  {
    id: 'doc-chimie-fiche',
    levelId: 'terminale-d',
    title: 'Fiche de révision : chimie organique',
    description: 'Photo de ma fiche : familles de composés et réactions à connaître.',
    kind: 'cours',
    fileType: 'image',
    fileSize: 1_050_000,
    downloadsCount: 64,
    isPopular: false,
    author: TEMP_LEARN_ME,
    timeLabel: 'il y a 3 sem.',
  },
  {
    id: 'doc-philo',
    levelId: 'terminale-d',
    title: 'Méthode de la dissertation de philosophie',
    description: 'Plan type, introduction et conclusion, avec deux exemples rédigés.',
    kind: 'cours',
    fileType: 'docx',
    fileSize: 215_000,
    downloadsCount: 58,
    isPopular: false,
    author: MARIAM,
    timeLabel: 'il y a 1 mois',
  },
  {
    id: 'doc-brevet-histoire',
    levelId: '3e',
    title: 'Sujets corrigés du BEPC : histoire-géographie',
    description: 'Les trois dernières sessions avec corrigé.',
    kind: 'corrige',
    fileType: 'pdf',
    fileSize: 1_780_000,
    downloadsCount: 203,
    isPopular: true,
    author: AICHA,
    timeLabel: 'il y a 4 j',
  },
  {
    id: 'doc-stats-l1',
    levelId: 'licence-1',
    title: 'TD de statistiques descriptives',
    description: 'Moyenne, médiane, écart type : 8 exercices avec corrigé.',
    kind: 'exercice',
    fileType: 'pdf',
    fileSize: 690_000,
    downloadsCount: 121,
    isPopular: false,
    author: ISSOUF,
    timeLabel: 'il y a 6 j',
  },
]

export const TEMP_LEARN_POSTS: readonly LearnPost[] = [
  {
    id: 'p-regles',
    levelId: 'terminale-d',
    author: AICHA,
    type: 'annonce',
    title: 'Bienvenue en Terminale D',
    content:
      'Pour garder un fil utile : indiquez toujours l’épreuve et l’année d’un corrigé, posez une question par publication, et pas de publicité. Les contenus signalés sont examinés par les modérateurs.',
    timeLabel: 'il y a 1 mois',
    status: 'active',
    likesCount: 54,
    commentsCount: 0,
    sharesCount: 9,
    isPinned: true,
  },
  {
    id: 'p-genetique-q',
    levelId: 'terminale-d',
    author: MARIAM,
    type: 'question',
    title: 'Génétique : gènes liés ou indépendants ?',
    content:
      'Je bloque sur l’exercice 4 de la fiche : comment savoir si deux gènes sont liés ou indépendants à partir des résultats d’un test-cross ?',
    timeLabel: 'il y a 3 h',
    status: 'active',
    likesCount: 12,
    commentsCount: 5,
    sharesCount: 1,
    isAnswered: true,
  },
  {
    id: 'p-cours-genetique',
    levelId: 'terminale-d',
    author: ISSOUF,
    type: 'document',
    title: 'Cours complet de génétique',
    content:
      'J’ai regroupé le cours et les schémas en un seul PDF. Bon courage pour les révisions !',
    timeLabel: 'il y a 2 j',
    status: 'active',
    likesCount: 87,
    commentsCount: 0,
    sharesCount: 23,
    documentId: 'doc-genetique',
  },
  {
    id: 'p-exos-derivees',
    levelId: 'terminale-d',
    author: BOUREIMA,
    type: 'exercice',
    title: 'Série d’exercices : dérivées et exponentielle',
    content: 'Douze exercices pour s’entraîner avant le devoir de jeudi.',
    timeLabel: 'il y a 5 h',
    status: 'active',
    likesCount: 31,
    commentsCount: 0,
    sharesCount: 5,
    documentId: 'doc-derivees',
  },
  {
    id: 'p-corrige-bac',
    levelId: 'terminale-d',
    author: SALIF,
    type: 'corrige',
    title: 'Corrigé du BAC D 2024 : Mathématiques',
    content: 'Corrigé détaillé, rédigé comme on l’attend le jour de l’examen.',
    timeLabel: 'il y a 1 sem.',
    status: 'active',
    likesCount: 120,
    commentsCount: 0,
    sharesCount: 41,
    documentId: 'doc-bac-maths-2024',
  },
  {
    id: 'p-mitose-q',
    levelId: 'terminale-d',
    author: NADEGE,
    type: 'question',
    title: 'Mitose et méiose : que retenir pour l’épreuve ?',
    content:
      'Quelle est la différence essentielle à connaître, et comment la présenter en trois lignes ?',
    timeLabel: 'il y a 20 min',
    status: 'active',
    likesCount: 2,
    commentsCount: 0,
    sharesCount: 0,
    isAnswered: false,
  },
  {
    id: 'p-revision',
    levelId: 'terminale-d',
    author: SALIF,
    type: 'text',
    content: 'Quelqu’un pour réviser la chimie organique ce samedi à la bibliothèque ?',
    timeLabel: 'hier',
    status: 'active',
    likesCount: 9,
    commentsCount: 2,
    sharesCount: 0,
  },
  {
    id: 'p-sujet-blanc',
    levelId: 'terminale-d',
    author: AICHA,
    type: 'examen',
    title: 'Sujet blanc de physique-chimie, série D',
    content:
      'Sujet de deux heures, à faire dans les conditions de l’examen. Le corrigé arrive dimanche.',
    timeLabel: 'hier',
    status: 'active',
    likesCount: 44,
    commentsCount: 0,
    sharesCount: 12,
    documentId: 'doc-sujet-blanc-pc',
  },
  {
    id: 'p-concentration-q',
    levelId: 'terminale-d',
    author: TEMP_LEARN_ME,
    type: 'question',
    title: 'Comment calculer une concentration après dilution ?',
    content:
      'Je dilue 10 mL d’une solution à 0,5 mol/L dans 90 mL d’eau. Quelle est la nouvelle concentration ?',
    timeLabel: 'il y a 2 j',
    status: 'active',
    likesCount: 4,
    commentsCount: 2,
    sharesCount: 0,
    isAnswered: true,
  },
  {
    id: 'p-vente-cahiers',
    levelId: 'terminale-d',
    author: TEMP_LEARN_ME,
    type: 'text',
    content: 'Je vends mes cahiers de TD de l’an dernier, contactez-moi en privé.',
    timeLabel: 'il y a 1 sem.',
    status: 'flagged',
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
  },
  {
    id: 'p-bepc-conseils',
    levelId: '3e',
    author: AICHA,
    type: 'annonce',
    title: 'BEPC : le calendrier des épreuves',
    content:
      'Le calendrier officiel est paru. Vérifiez les dates auprès de votre établissement.',
    timeLabel: 'il y a 3 j',
    status: 'active',
    likesCount: 38,
    commentsCount: 0,
    sharesCount: 14,
    isPinned: true,
  },
  {
    id: 'p-bepc-corrige',
    levelId: '3e',
    author: AICHA,
    type: 'corrige',
    title: 'Sujets corrigés du BEPC : histoire-géographie',
    content: 'Les trois dernières sessions avec corrigé.',
    timeLabel: 'il y a 4 j',
    status: 'active',
    likesCount: 66,
    commentsCount: 0,
    sharesCount: 18,
    documentId: 'doc-brevet-histoire',
  },
  {
    id: 'p-l1-stats',
    levelId: 'licence-1',
    author: ISSOUF,
    type: 'exercice',
    title: 'TD de statistiques descriptives',
    content: 'Huit exercices avec corrigé pour préparer le contrôle continu.',
    timeLabel: 'il y a 6 j',
    status: 'active',
    likesCount: 27,
    commentsCount: 0,
    sharesCount: 6,
    documentId: 'doc-stats-l1',
  },
  {
    id: 'p-l1-question',
    levelId: 'licence-1',
    author: MARIAM,
    type: 'question',
    title: 'Médiane ou moyenne : laquelle choisir ?',
    content:
      'Quand faut-il préférer la médiane à la moyenne dans un exercice de statistiques ?',
    timeLabel: 'il y a 1 j',
    status: 'active',
    likesCount: 5,
    commentsCount: 0,
    sharesCount: 0,
    isAnswered: false,
  },
]

export const TEMP_LEARN_COMMENTS: readonly LearnComment[] = [
  {
    id: 'c1',
    postId: 'p-genetique-q',
    author: ISSOUF,
    content:
      'Regarde les proportions : si tu obtiens quatre phénotypes à 25 % chacun, les gènes sont indépendants.',
    timeLabel: 'il y a 2 h',
    parentId: null,
    likesCount: 8,
  },
  {
    id: 'c2',
    postId: 'p-genetique-q',
    author: MARIAM,
    content: 'Et s’il y a deux phénotypes parentaux nettement majoritaires ?',
    timeLabel: 'il y a 2 h',
    parentId: 'c1',
    likesCount: 1,
  },
  {
    id: 'c3',
    postId: 'p-genetique-q',
    author: AICHA,
    content:
      'Dans ce cas les gènes sont liés. Calcule la distance entre eux avec le pourcentage de recombinés.',
    timeLabel: 'il y a 1 h',
    parentId: 'c2',
    likesCount: 6,
  },
  {
    id: 'c4',
    postId: 'p-genetique-q',
    author: BOUREIMA,
    content:
      'J’ai mis une fiche sur le test-cross dans la bibliothèque, regarde le cours de génétique.',
    timeLabel: 'il y a 1 h',
    parentId: null,
    likesCount: 3,
  },
  {
    id: 'c5',
    postId: 'p-revision',
    author: NADEGE,
    content: 'Je suis partante !',
    timeLabel: 'hier',
    parentId: null,
    likesCount: 1,
  },
  {
    id: 'c6',
    postId: 'p-revision',
    author: SALIF,
    content: 'Parfait, rendez-vous à 15 h devant le CDI.',
    timeLabel: 'hier',
    parentId: 'c5',
    likesCount: 0,
  },
  {
    id: 'c7',
    postId: 'p-concentration-q',
    author: AICHA,
    content:
      'Le nombre de moles ne change pas : 0,5 × 0,010 = 0,005 mol. Le volume final est 0,100 L, donc la concentration est 0,05 mol/L.',
    timeLabel: 'il y a 2 j',
    parentId: null,
    likesCount: 5,
  },
  {
    id: 'c8',
    postId: 'p-concentration-q',
    author: TEMP_LEARN_ME,
    content: 'Merci, j’avais oublié que la quantité de matière se conserve.',
    timeLabel: 'il y a 2 j',
    parentId: 'c7',
    likesCount: 0,
  },
  {
    id: 'c9',
    postId: 'p-genetique-q',
    author: TEMP_LEARN_ME,
    content: 'Merci pour la méthode, c’est beaucoup plus clair.',
    timeLabel: 'il y a 1 h',
    parentId: 'c3',
    likesCount: 0,
  },
]

export function getTempLevel(id: string | undefined): LearnLevel | undefined {
  return TEMP_LEARN_LEVELS.find((item) => item.id === id)
}

export function getTempPosts(levelId: string): readonly LearnPost[] {
  return TEMP_LEARN_POSTS.filter(
    (post) =>
      post.levelId === levelId && (post.status === 'active' || post.author.id === 'me'),
  )
}

export function getTempPost(id: string | undefined): LearnPost | undefined {
  return TEMP_LEARN_POSTS.find((post) => post.id === id)
}

export function getTempDocuments(levelId: string): readonly LearnDocument[] {
  return TEMP_LEARN_DOCUMENTS.filter((doc) => doc.levelId === levelId)
}

export function getTempDocument(id: string | undefined): LearnDocument | undefined {
  return TEMP_LEARN_DOCUMENTS.find((doc) => doc.id === id)
}

export function getTempComments(postId: string): readonly LearnComment[] {
  return TEMP_LEARN_COMMENTS.filter((comment) => comment.postId === postId)
}

/** Membre d'AfriLearn par @identifiant, retrouvé parmi les auteurs d'exemple. */
export function getTempMember(handle: string | undefined): LearnAuthor | undefined {
  if (!handle) return undefined
  if (TEMP_LEARN_ME.handle === handle) return TEMP_LEARN_ME
  for (const post of TEMP_LEARN_POSTS)
    if (post.author.handle === handle) return post.author
  for (const doc of TEMP_LEARN_DOCUMENTS)
    if (doc.author.handle === handle) return doc.author
  for (const comment of TEMP_LEARN_COMMENTS) {
    if (comment.author.handle === handle) return comment.author
  }
  return undefined
}

/** Tous les membres d'exemple d'AfriLearn (pour la recherche). */
export function listTempMembers(): LearnAuthor[] {
  const members = new Map<string, LearnAuthor>([[TEMP_LEARN_ME.handle, TEMP_LEARN_ME]])
  for (const post of TEMP_LEARN_POSTS) members.set(post.author.handle, post.author)
  for (const doc of TEMP_LEARN_DOCUMENTS) members.set(doc.author.handle, doc.author)
  for (const comment of TEMP_LEARN_COMMENTS)
    members.set(comment.author.handle, comment.author)
  return [...members.values()]
}
