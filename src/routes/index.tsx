import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AppShell } from '@/layouts/AppShell'
import { ServiceLayout } from '@/layouts/ServiceLayout'
import { CoinEventPage } from '@/pages/CoinEventPage'
import { AffiliateDiscoverPage } from '@/pages/AffiliateDiscoverPage'
import { CreatorAdOrderPage } from '@/pages/CreatorAdOrderPage'
import { CreatorAdPlanPage } from '@/pages/CreatorAdPlanPage'
import { CreatorPage } from '@/pages/CreatorPage'
import { StudioAffiliatePartnershipPage } from '@/pages/studio/StudioAffiliatePartnershipPage'
import { ConversationPage } from '@/pages/ConversationPage'
import { DesignSystemPage } from '@/pages/DesignSystemPage'
import { EventParticipationPage } from '@/pages/EventParticipationPage'
import { EventsFeedPage } from '@/pages/EventsFeedPage'
import { EstablishmentPage } from '@/pages/EstablishmentPage'
import { EspaceProPage } from '@/pages/EspaceProPage'
import { ExplorePage } from '@/pages/ExplorePage'
import { HistoryPage } from '@/pages/HistoryPage'
import { HomePage } from '@/pages/HomePage'
import { LearnFeedPage } from '@/pages/LearnFeedPage'
import { LearnHomePage } from '@/pages/LearnHomePage'
import { LearnMemberPage } from '@/pages/LearnMemberPage'
import { LearnMinePage } from '@/pages/LearnMinePage'
import { LearnPostPage } from '@/pages/LearnPostPage'
import { LearnCanalAccessPage } from '@/pages/learn/LearnCanalAccessPage'
import { LearnCanalManagePage } from '@/pages/learn/LearnCanalManagePage'
import { LearnCanalMemberPayPage } from '@/pages/learn/LearnCanalMemberPayPage'
import { LearnCanalPayPage } from '@/pages/learn/LearnCanalPayPage'
import { LearnCanalPlansPage } from '@/pages/learn/LearnCanalPlansPage'
import { LearnCanalPublicPage } from '@/pages/learn/LearnCanalPublicPage'
import { LearnCanalRenewPage } from '@/pages/learn/LearnCanalRenewPage'
import { LearnCanalSubscribePage } from '@/pages/learn/LearnCanalSubscribePage'
import { LearnEduCheckoutPage } from '@/pages/learn/LearnEduCheckoutPage'
import { LearnEduProductFormPage } from '@/pages/learn/LearnEduProductFormPage'
import { LearnEduProductPublicPage } from '@/pages/learn/LearnEduProductPublicPage'
import { LearnEduProductsPage } from '@/pages/learn/LearnEduProductsPage'
import { LearnEduSalesPage } from '@/pages/learn/LearnEduSalesPage'
import { LearnFinancePage } from '@/pages/learn/LearnFinancePage'
import { LearnMarketPage } from '@/pages/learn/LearnMarketPage'
import { MarketEventPage } from '@/pages/MarketEventPage'
import { MarketsListPage } from '@/pages/MarketsListPage'
import { MarketsPage } from '@/pages/MarketsPage'
import { MessagesPage } from '@/pages/MessagesPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { ProductPage } from '@/pages/ProductPage'
import { MerchantCreditDetailPage } from '@/pages/credits/MerchantCreditDetailPage'
import { MerchantCreditsPage } from '@/pages/credits/MerchantCreditsPage'
import { ProfileEditPage } from '@/pages/ProfileEditPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { ProfileQrPage } from '@/pages/ProfileQrPage'
import { RankingPage } from '@/pages/RankingPage'
import { SearchPage } from '@/pages/SearchPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { RewardsAdsPage } from '@/pages/rewards/RewardsAdsPage'
import { RewardsEarnPage } from '@/pages/rewards/RewardsEarnPage'
import { RewardsHistoryPage } from '@/pages/rewards/RewardsHistoryPage'
import { RewardsPage } from '@/pages/rewards/RewardsPage'
import { RewardsTransferPage } from '@/pages/rewards/RewardsTransferPage'
import { RewardsUsePage } from '@/pages/rewards/RewardsUsePage'
import { CartPage } from '@/pages/purchases/CartPage'
import { CheckoutPage } from '@/pages/purchases/CheckoutPage'
import { PaymentMaquettePage } from '@/pages/purchases/PaymentMaquettePage'
import { PurchaseDetailPage } from '@/pages/purchases/PurchaseDetailPage'
import { DepositDetailPage } from '@/pages/wallet/DepositDetailPage'
import { DepositPage } from '@/pages/wallet/DepositPage'
import { SubscribePage } from '@/pages/SubscribePage'
import { SubscriptionCardPage } from '@/pages/tickets/SubscriptionCardPage'
import { TicketDetailPage } from '@/pages/tickets/TicketDetailPage'
import { TicketsPage } from '@/pages/tickets/TicketsPage'
import { ReceiptPage } from '@/pages/wallet/ReceiptPage'
import { WalletOperationPage } from '@/pages/wallet/WalletOperationPage'
import { WalletPage } from '@/pages/wallet/WalletPage'
import { WithdrawalDetailPage } from '@/pages/wallet/WithdrawalDetailPage'
import { TransferPage } from '@/pages/wallet/TransferPage'
import { WithdrawPage } from '@/pages/wallet/WithdrawPage'
import { CatalogItemFormPage } from '@/pages/services/CatalogItemFormPage'
import { CreateServicePage } from '@/pages/services/CreateServicePage'
import { ServiceCatalogPage } from '@/pages/services/ServiceCatalogPage'
import { ServiceChannelPage } from '@/pages/services/ServiceChannelPage'
import { ServiceCreditClientPage } from '@/pages/services/ServiceCreditClientPage'
import { ServiceCreditConfigPage } from '@/pages/services/ServiceCreditConfigPage'
import { ServiceCreditsPage } from '@/pages/services/ServiceCreditsPage'
import { ServiceAdCreatePage } from '@/pages/services/ServiceAdCreatePage'
import { ServiceAdPage } from '@/pages/services/ServiceAdPage'
import { ServiceAffiliateFormPage } from '@/pages/services/ServiceAffiliateFormPage'
import { ServiceAffiliateMembersPage } from '@/pages/services/ServiceAffiliateMembersPage'
import { ServiceAffiliatePage } from '@/pages/services/ServiceAffiliatePage'
import { ServiceAffiliateStatsPage } from '@/pages/services/ServiceAffiliateStatsPage'
import { ServiceAdsPage } from '@/pages/services/ServiceAdsPage'
import { ServiceEventsPage } from '@/pages/services/ServiceEventsPage'
import { ServiceScannerPage } from '@/pages/services/ServiceScannerPage'
import { ServiceReviewsPage } from '@/pages/services/ServiceReviewsPage'
import { ServiceSubscriptionsPage } from '@/pages/services/ServiceSubscriptionsPage'
import { ServiceConfigPage } from '@/pages/services/ServiceConfigPage'
import { ServiceDashboardPage } from '@/pages/services/ServiceDashboardPage'
import { ServiceItemPage } from '@/pages/services/ServiceItemPage'
import { ServiceOrdersPage } from '@/pages/services/ServiceOrdersPage'
import { ServiceHistoryPage } from '@/pages/services/ServiceHistoryPage'
import { ServiceReportsPage } from '@/pages/services/ServiceReportsPage'
import { ServiceToolPage } from '@/pages/services/ServiceToolPage'
import { StudioEventFormPage } from '@/pages/studio/StudioEventFormPage'
import { StudioEventPage } from '@/pages/studio/StudioEventPage'
import { StudioPage } from '@/pages/studio/StudioPage'
import { paths } from './paths'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: paths.home, element: <HomePage /> },
      { path: paths.markets, element: <MarketsPage /> },
      { path: paths.marketsList, element: <MarketsListPage /> },
      { path: 'cotes/coins/:eventId', element: <CoinEventPage /> },
      { path: 'cotes/:eventId', element: <MarketEventPage /> },
      // Page publique d'un créateur (Creator Market et Creator Studio).
      { path: 'createur/:handle', element: <CreatorPage /> },
      {
        path: 'createur/:handle/publicite/:planId',
        element: <CreatorAdPlanPage />,
      },
      {
        path: 'createur/:handle/publicite/:planId/commander',
        element: <CreatorAdOrderPage />,
      },
      { path: paths.explore, element: <ExplorePage /> },
      { path: paths.events, element: <EventsFeedPage /> },
      { path: 'explorer/evenements/:eventId', element: <EventParticipationPage /> },
      { path: paths.learn, element: <LearnHomePage /> },
      { path: paths.learnMine, element: <LearnMinePage /> },
      { path: paths.learnMarket, element: <LearnMarketPage /> },
      // Canaux / produits : routes statiques AVANT afrilearn/:levelId
      {
        path: 'afrilearn/canal/:canalId/abonner/:planId',
        element: <LearnCanalMemberPayPage />,
      },
      {
        path: 'afrilearn/canal/:canalId/abonner',
        element: <LearnCanalSubscribePage />,
      },
      {
        path: 'afrilearn/canal/:canalId/acceder',
        element: <LearnCanalAccessPage />,
      },
      { path: 'afrilearn/canal/:canalId', element: <LearnCanalPublicPage /> },
      {
        path: 'afrilearn/produits/:productId/payer',
        element: <LearnEduCheckoutPage />,
      },
      { path: 'afrilearn/produits/:productId', element: <LearnEduProductPublicPage /> },
      { path: paths.learnCanalPlans, element: <LearnCanalPlansPage /> },
      { path: 'afrilearn/moi/canal/payer/:planId', element: <LearnCanalPayPage /> },
      { path: paths.learnCanalRenew, element: <LearnCanalRenewPage /> },
      { path: paths.learnCanalManage, element: <LearnCanalManagePage /> },
      { path: paths.learnEduProducts, element: <LearnEduProductsPage /> },
      { path: paths.learnEduProductNew, element: <LearnEduProductFormPage /> },
      {
        path: 'afrilearn/moi/produits/:productId/modifier',
        element: <LearnEduProductFormPage />,
      },
      { path: paths.learnEduSales, element: <LearnEduSalesPage /> },
      { path: paths.learnFinance, element: <LearnFinancePage /> },
      { path: 'afrilearn/membre/:handle', element: <LearnMemberPage /> },
      { path: 'afrilearn/:levelId', element: <LearnFeedPage /> },
      { path: 'afrilearn/:levelId/publication/:postId', element: <LearnPostPage /> },
      { path: paths.messages, element: <MessagesPage /> },
      { path: 'messages/:conversationId', element: <ConversationPage /> },
      { path: paths.profile, element: <ProfilePage /> },
      { path: 'profil/modifier', element: <ProfileEditPage /> },
      { path: 'profil/qr', element: <ProfileQrPage /> },
      { path: 'profil/credits', element: <MerchantCreditsPage /> },
      { path: 'profil/credits/:debtId', element: <MerchantCreditDetailPage /> },
      { path: 'classement', element: <RankingPage /> },
      { path: 'parametres', element: <SettingsPage /> },
      { path: 'historique', element: <HistoryPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'recherche', element: <SearchPage /> },

      // Wallet : soldes, historique, dépôts et retraits.
      { path: 'wallet', element: <WalletPage /> },
      { path: 'wallet/depot', element: <DepositPage /> },
      { path: 'wallet/depot/:depositId', element: <DepositDetailPage /> },
      { path: 'wallet/retrait', element: <WithdrawPage /> },
      { path: 'wallet/transfert', element: <TransferPage /> },
      { path: 'wallet/operations/:operationId', element: <WalletOperationPage /> },
      { path: 'justificatif/:source/:id', element: <ReceiptPage /> },
      { path: 'wallet/retrait/:withdrawalId', element: <WithdrawalDetailPage /> },

      // Rewards : points de fidélité (distincts du Wallet FCFA).
      { path: 'rewards', element: <RewardsPage /> },
      { path: 'rewards/gagner', element: <RewardsEarnPage /> },
      { path: 'rewards/missions', element: <RewardsAdsPage /> },
      { path: 'rewards/transfert', element: <RewardsTransferPage /> },
      { path: 'rewards/utiliser', element: <RewardsUsePage /> },
      { path: 'rewards/historique', element: <RewardsHistoryPage /> },

      // Panier, passage à la caisse (Wallet, seul moyen de paiement) et suivi des achats.
      { path: 'panier', element: <CartPage /> },
      { path: 'panier/maquette-paiement', element: <PaymentMaquettePage /> },
      { path: 'panier/commande/:serviceId', element: <CheckoutPage /> },
      { path: 'achats/:purchaseId', element: <PurchaseDetailPage /> },

      // Tickets numériques de paiement de l'utilisateur.
      { path: 'tickets', element: <TicketsPage /> },
      { path: 'tickets/abonnements/:cardId', element: <SubscriptionCardPage /> },
      { path: 'tickets/:ticketId', element: <TicketDetailPage /> },

      // Creator Studio : l'espace du créateur (événements Creator Market, historique, statistiques).
      { path: 'studio', element: <StudioPage /> },
      { path: 'studio/evenements/nouveau', element: <StudioEventFormPage /> },
      { path: 'studio/evenements/:eventId', element: <StudioEventPage /> },
      { path: 'studio/evenements/:eventId/modifier', element: <StudioEventFormPage /> },
      {
        path: 'studio/affiliation/partenariat/:membershipId',
        element: <StudioAffiliatePartnershipPage />,
      },
      { path: 'affiliation', element: <AffiliateDiscoverPage /> },

      { path: paths.proSpace, element: <EspaceProPage /> },

      // Services : étape 1 (création), puis espace professionnel d'un service.
      { path: paths.serviceNew, element: <CreateServicePage /> },
      {
        path: 'services/:serviceId',
        element: <ServiceLayout />,
        children: [
          { index: true, element: <ServiceDashboardPage /> },
          { path: 'catalogue', element: <ServiceCatalogPage /> },
          { path: 'catalogue/nouveau', element: <CatalogItemFormPage /> },
          { path: 'catalogue/:itemId', element: <ServiceItemPage /> },
          { path: 'catalogue/:itemId/modifier', element: <CatalogItemFormPage /> },
          { path: 'commandes', element: <ServiceOrdersPage /> },
          // La rubrique Caisse n'existe plus : les anciens liens retombent sur le tableau de bord.
          { path: 'caisse', element: <Navigate to=".." replace /> },
          { path: 'clients', element: <ServiceToolPage toolId="customers" /> },
          { path: 'credits', element: <ServiceCreditsPage /> },
          {
            path: 'credits/configuration',
            element: <ServiceCreditConfigPage />,
          },
          { path: 'credits/:debtId', element: <ServiceCreditClientPage /> },
          { path: 'historique', element: <ServiceHistoryPage /> },
          { path: 'scanner', element: <ServiceScannerPage /> },
          { path: 'rapports', element: <ServiceReportsPage /> },
          { path: 'notifications', element: <ServiceToolPage toolId="notifications" /> },
          { path: 'canal', element: <ServiceChannelPage /> },
          { path: 'avis', element: <ServiceReviewsPage /> },
          { path: 'abonnements', element: <ServiceSubscriptionsPage /> },
          { path: 'evenements', element: <ServiceEventsPage /> },
          { path: 'publicite', element: <ServiceAdsPage /> },
          { path: 'publicite/nouvelle', element: <ServiceAdCreatePage /> },
          { path: 'publicite/:campaignId', element: <ServiceAdPage /> },
          { path: 'affiliation', element: <ServiceAffiliatePage /> },
          { path: 'affiliation/nouveau', element: <ServiceAffiliateFormPage /> },
          {
            path: 'affiliation/:programId/modifier',
            element: <ServiceAffiliateFormPage />,
          },
          {
            path: 'affiliation/:programId/affilies',
            element: <ServiceAffiliateMembersPage />,
          },
          {
            path: 'affiliation/:programId/statistiques',
            element: <ServiceAffiliateStatsPage />,
          },
          { path: 'configuration', element: <ServiceConfigPage /> },
        ],
      },
      // Profil public d'un établissement (vu par les clients).
      { path: 'etablissement/:ref', element: <EstablishmentPage /> },
      { path: 'etablissement/:ref/abonnement/:planId', element: <SubscribePage /> },
      // Fiche produit publique (vue par les clients).
      { path: 'produits/:productId', element: <ProductPage /> },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
  // Hors shell : page de développement
  { path: paths.designSystem, element: <DesignSystemPage /> },
])
