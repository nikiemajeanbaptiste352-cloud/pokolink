/** Chemins de navigation principaux (cahier des charges, section 7). */
export const paths = {
  home: '/',
  /** Creator Performance Market (remplace l'onglet Shorts). */
  markets: '/cotes',
  marketsList: '/cotes/liste',
  /** Fil Creator Market (cotes) ouvert sur un événement. */
  marketFeed: (eventId: string) => `/cotes?evenement=${eventId}`,
  /** Fil Creator Market (coins) ouvert sur un événement. */
  coinFeed: (eventId: string) => `/cotes?type=coins&evenement=${eventId}`,
  marketEvent: (eventId: string) => `/cotes/${eventId}`,
  /** Creator Market, 2e type d'événement : les coins. */
  coinEvent: (eventId: string) => `/cotes/coins/${eventId}`,
  /** Page publique d'un créateur (Creator Market et Creator Studio), par @identifiant. */
  creator: (handle: string) => `/createur/${handle}`,
  /** Page publique ouverte sur les forfaits publicitaires. */
  creatorAdPlans: (handle: string) => `/createur/${handle}?onglet=publicite`,
  /** Fiche d’un forfait : stats réseaux + Contacter / Commander. */
  creatorAdPlan: (handle: string, planId: string) =>
    `/createur/${handle}/publicite/${planId}`,
  /** Commander un forfait : acheteur paie le prix ; commission 10 % déduite du créateur. */
  creatorAdOrder: (handle: string, planId: string) =>
    `/createur/${handle}/publicite/${planId}/commander`,
  /** Explorer : marketplace, avec un accès direct à Market Event. */
  explore: '/explorer',
  /** Market Event : fil vertical des événements (façon TikTok). */
  events: '/explorer/evenements',
  /**
   * Participation Market Event : ouvre le fil + panneau (`?evenement=`).
   * L’ancienne URL `/explorer/evenements/:id` redirige encore vers ici.
   */
  eventDetail: (eventId: string) =>
    `/explorer/evenements?evenement=${encodeURIComponent(eventId)}`,
  /** AfriLearn : choix du niveau. */
  learn: '/afrilearn',
  /** AfriLearn : espace privé (Canal Pro, produits, contributions). */
  learnMine: '/afrilearn/moi',
  /** AfriLearn : fil d'un niveau (onglets via `?onglet=`). */
  learnFeed: (levelId: string) => `/afrilearn/${levelId}`,
  learnPost: (levelId: string, postId: string) =>
    `/afrilearn/${levelId}/publication/${postId}`,
  /** AfriLearn : page publique d'un membre (publications, documents, questions). */
  learnMember: (handle: string) => `/afrilearn/membre/${handle}`,
  /** AfriLearn commerce : marché public, Canal Pro, produits. */
  learnMarket: '/afrilearn/marche',
  learnCanalPlans: '/afrilearn/moi/canal/formules',
  learnCanalPay: (planId: string) => `/afrilearn/moi/canal/payer/${planId}`,
  learnCanalRenew: '/afrilearn/moi/canal/renouveler',
  learnCanalManage: '/afrilearn/moi/canal',
  learnCanalPublic: (canalId: string) => `/afrilearn/canal/${canalId}`,
  /** Contenu du canal réservé aux abonnés (après paiement). */
  learnCanalAccess: (canalId: string) => `/afrilearn/canal/${canalId}/acceder`,
  /** Paiement Wallet d’un forfait abonné visiteur (Canal Pro). */
  learnCanalMemberPay: (canalId: string, planId: string) =>
    `/afrilearn/canal/${canalId}/abonner/${planId}`,
  /** Raccourci : S’abonner → forfait par défaut → page de paiement. */
  learnCanalSubscribe: (canalId: string) =>
    `/afrilearn/canal/${canalId}/abonner`,
  learnEduProducts: '/afrilearn/moi/produits',
  learnEduProductNew: '/afrilearn/moi/produits/nouveau',
  learnEduProductEdit: (productId: string) =>
    `/afrilearn/moi/produits/${productId}/modifier`,
  learnEduSales: '/afrilearn/moi/ventes',
  learnFinance: '/afrilearn/moi/finances',
  learnEduProduct: (productId: string) => `/afrilearn/produits/${productId}`,
  /** Paiement Wallet d’un produit éducatif. */
  learnEduCheckout: (productId: string) =>
    `/afrilearn/produits/${productId}/payer`,
  messages: '/messages',
  /** Conversation de la messagerie centrale. */
  conversation: (conversationId: string) => `/messages/${conversationId}`,
  profile: '/profil',
  /** Modifier le profil (nom, identifiant, bio, ville). */
  profileEdit: '/profil/modifier',
  /** Mon QR code : lien de ma page publique à partager ou à faire scanner. */
  profileQr: '/profil/qr',
  /**
   * Classement : créateurs (vues / participants) et vendeurs (ventes / visiteurs).
   */
  ranking: '/classement',
  /** Paramètres de l'application et du compte. */
  settings: '/parametres',
  /** Historique personnel : paiements Wallet, achats et activité Rewards. */
  history: '/historique',
  /** Notifications de l'utilisateur. */
  notifications: '/notifications',
  /** Recherche globale (`?q=` pré-remplit le champ). */
  search: '/recherche',
  /** Wallet : soldes, historique, dépôts et retraits. */
  wallet: '/wallet',
  walletDeposit: (id?: string) => (id ? `/wallet/depot/${id}` : '/wallet/depot'),
  walletWithdrawal: (id?: string) => (id ? `/wallet/retrait/${id}` : '/wallet/retrait'),
  /** Détail d'une ligne du journal Wallet : paiement, crédit, commission, remboursement, annulation. */
  walletOperation: (id: string) => `/wallet/operations/${id}`,
  /** Justificatif ou ticket d'une opération (`source` : `operation` ou `achat`). */
  receipt: (source: 'operation' | 'achat', id: string) => `/justificatif/${source}/${id}`,
  /** Paiement entre utilisateurs (P2P) : envoyer ou demander de l'argent. */
  walletTransfer: '/wallet/transfert',
  /** Rewards : points de fidélité (écran central, atteint depuis Profil). */
  rewards: '/rewards',
  rewardsEarn: '/rewards/gagner',
  /** Missions publicitaires rémunérées (vues, visites, abonnements). */
  rewardsAds: '/rewards/missions',
  rewardsTransfer: '/rewards/transfert',
  rewardsUse: '/rewards/utiliser',
  rewardsHistory: '/rewards/historique',
  /** Panier de l'utilisateur (un panier par vendeur) et suivi de ses achats. */
  cart: '/panier',
  purchases: '/panier?vue=achats',
  /** Passage à la caisse d'un vendeur : identité de l'acheteur puis paiement avec le Wallet. */
  checkout: (serviceId: string) => `/panier/commande/${serviceId}`,
  /** Maquette interactive paiement Wallet + Rewards (hors nav principale). */
  paymentMaquette: '/panier/maquette-paiement',
  purchase: (purchaseId: string) => `/achats/${purchaseId}`,
  /** Tickets numériques de paiement de l'utilisateur. */
  tickets: '/tickets',
  ticket: (ticketId: string) => `/tickets/${ticketId}`,
  /** Crédit commerçant (espace client) : dettes envers les boutiques. */
  merchantCredits: '/profil/credits',
  merchantCreditDetail: (debtId: string) => `/profil/credits/${debtId}`,
  /** Creator Studio : aperçu, événements, stats, revenus + rubriques publicitaires. */
  studio: '/studio',
  studioTab: (tab: string) => `/studio?onglet=${tab}`,
  studioEventNew: '/studio/evenements/nouveau',
  studioEventNewOfKind: (kind: string) => `/studio/evenements/nouveau?type=${kind}`,
  studioEvent: (eventId: string) => `/studio/evenements/${eventId}`,
  studioEventEdit: (eventId: string) => `/studio/evenements/${eventId}/modifier`,
  /** Raccourcis onglets pub (navigation privée uniquement). */
  studioAdPlans: '/studio?onglet=tarifs-pub',
  studioAdStats: '/studio?onglet=stats-pub',
  studioAdOrders: '/studio?onglet=commandes-pub',
  /** Affiliation côté affilié (Creator Studio). */
  studioAffiliate: '/studio?onglet=affiliation',
  studioAffiliatePartnership: (membershipId: string) =>
    `/studio/affiliation/partenariat/${membershipId}`,
  /** Découverte publique des programmes d’affiliation. */
  affiliateDiscover: '/affiliation',
  /** Aperçu du design system (développement). */
  designSystem: '/design-system',

  // --- Services (espaces professionnels) ---
  /** Espace Pro : hub de tous les établissements de l'utilisateur. */
  proSpace: '/espace-pro',
  /** Espace Pro avec un établissement présélectionné. */
  proSpaceFor: (serviceId: string) => `/espace-pro?service=${serviceId}`,
  /** Étape 1 : création d'un service. */
  serviceNew: '/services/nouveau',
  /** Espace professionnel : tableau de bord. */
  service: (serviceId: string) => `/services/${serviceId}`,
  /** Étape 2 : configuration (aussi accessible depuis l'espace professionnel). */
  serviceSettings: (serviceId: string) => `/services/${serviceId}/configuration`,
  serviceOrders: (serviceId: string) => `/services/${serviceId}/commandes`,
  serviceCatalog: (serviceId: string) => `/services/${serviceId}/catalogue`,
  serviceItemNew: (serviceId: string) => `/services/${serviceId}/catalogue/nouveau`,
  /** Fiche produit. */
  serviceItem: (serviceId: string, itemId: string) =>
    `/services/${serviceId}/catalogue/${itemId}`,
  serviceItemEdit: (serviceId: string, itemId: string) =>
    `/services/${serviceId}/catalogue/${itemId}/modifier`,
  /** Fiche produit publique (vue par les clients), quel que soit le vendeur. */
  product: (productId: string) => `/produits/${productId}`,
  /** Profil public d'un établissement : `ref` est son nom d'utilisateur (ou son identifiant). */
  establishment: (ref: string) => `/etablissement/${ref}`,
  /** Profil public ouvert sur le catalogue, au niveau d'un produit ou d'une prestation. */
  establishmentProduct: (ref: string, itemId: string) =>
    `/etablissement/${ref}?onglet=catalogue&produit=${itemId}`,
  /** Parcours de souscription à un forfait d'un Service Pro (forfait, paiement, carte). */
  subscribe: (ref: string, planId: string) =>
    `/etablissement/${ref}/abonnement/${planId}`,
  /** Carte d'abonnement de l'utilisateur (QR code, téléchargement). */
  subscriptionCard: (cardId: string) => `/tickets/abonnements/${cardId}`,
  /** Espace Pro : scanner des tickets et des cartes d'abonnement. */
  serviceScanner: (serviceId: string, code?: string) =>
    code
      ? `/services/${serviceId}/scanner?code=${encodeURIComponent(code)}`
      : `/services/${serviceId}/scanner`,
  /** Espace Pro : publicité (campagnes sponsorisées), création et suivi. */
  serviceAds: (serviceId: string) => `/services/${serviceId}/publicite`,
  serviceAdNew: (serviceId: string) => `/services/${serviceId}/publicite/nouvelle`,
  serviceAd: (serviceId: string, campaignId: string) =>
    `/services/${serviceId}/publicite/${campaignId}`,
  /** Espace Pro : crédits clients (créances commerçant). */
  serviceCredits: (serviceId: string) => `/services/${serviceId}/credits`,
  /** Espace Pro : configuration du crédit (établissement + articles). */
  serviceCreditConfig: (serviceId: string) =>
    `/services/${serviceId}/credits/configuration`,
  serviceCreditClient: (serviceId: string, debtId: string) =>
    `/services/${serviceId}/credits/${debtId}`,
  /** Espace Pro : programme d’affiliation (vendeur). */
  serviceAffiliate: (serviceId: string) => `/services/${serviceId}/affiliation`,
  serviceAffiliateNew: (serviceId: string) =>
    `/services/${serviceId}/affiliation/nouveau`,
  serviceAffiliateEdit: (serviceId: string, programId: string) =>
    `/services/${serviceId}/affiliation/${programId}/modifier`,
  serviceAffiliateMembers: (serviceId: string, programId: string) =>
    `/services/${serviceId}/affiliation/${programId}/affilies`,
  serviceAffiliateStats: (serviceId: string, programId: string) =>
    `/services/${serviceId}/affiliation/${programId}/statistiques`,
  /** Espace Pro : canal (créé automatiquement avec l'établissement). */
  serviceChannel: (serviceId: string) => `/services/${serviceId}/canal`,
  /** Profil public ouvert sur la rubrique des publications (le canal de diffusion). */
  establishmentPosts: (ref: string) => `/etablissement/${ref}?onglet=publications`,
} as const

/** Préfixes d'URL qui doivent garder un onglet de navigation principal actif. */
export const sectionPrefixes = {
  profile: [
    '/services',
    '/espace-pro',
    '/wallet',
    '/rewards',
    '/panier',
    '/achats',
    '/tickets',
    '/studio',
    '/parametres',
    '/historique',
    '/justificatif',
    '/classement',
    '/profil/credits',
    /** Espace privé AfriLearn (gestion canal / produits), pas la vitrine publique. */
    '/afrilearn/moi',
  ],
  explore: ['/etablissement', '/produits', '/afrilearn'],
  markets: ['/cotes', '/createur'],
  messages: ['/messages'],
} as const
