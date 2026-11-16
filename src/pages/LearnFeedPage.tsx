import { FileUp, GraduationCap, Sprout } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { FilterChips, type ChipItem } from '@/components/common/FilterChips'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchField } from '@/components/common/SearchField'
import { ComposerSheet } from '@/components/learn/ComposerSheet'
import { DocumentCard } from '@/components/learn/DocumentCard'
import { LearnFeedOffersStrip } from '@/components/learn/LearnFeedOffersStrip'
import { LearnPostCard } from '@/components/learn/LearnPostCard'
import { ReportSheet, type ReportTarget } from '@/components/learn/ReportSheet'
import { buttonVariants } from '@/components/ui/button'
import { useLocalStore } from '@/hooks/use-local-store'
import { useProfile } from '@/hooks/use-profile'
import { formatCount } from '@/lib/format'
import {
  getLearnDocument,
  getLearnDocuments,
  getLearnPosts,
} from '@/lib/learn-data'
import { learnStore } from '@/lib/learn-store'
import { getTempLevel } from '@/lib/placeholder-learn'
import { paths } from '@/routes/paths'
import type { LearnDocumentKind } from '@/types/learn'

type TabId = 'fil' | 'questions' | 'bibliotheque'

const TABS: readonly ChipItem<TabId>[] = [
  { id: 'fil', label: 'Fil' },
  { id: 'questions', label: 'Questions' },
  { id: 'bibliotheque', label: 'Bibliothèque' },
]

type QuestionFilter = 'all' | 'open'
const QUESTION_FILTERS: readonly ChipItem<QuestionFilter>[] = [
  { id: 'all', label: 'Toutes' },
  { id: 'open', label: 'Sans réponse' },
]

type KindFilter =
  'all' | Extract<LearnDocumentKind, 'cours' | 'exercice' | 'corrige' | 'examen'>
const KIND_FILTERS: readonly ChipItem<KindFilter>[] = [
  { id: 'all', label: 'Tous' },
  { id: 'cours', label: 'Cours' },
  { id: 'exercice', label: 'Exercices' },
  { id: 'corrige', label: 'Corrigés' },
  { id: 'examen', label: 'Examens' },
]

function isTab(value: string | null): value is TabId {
  return value === 'fil' || value === 'questions' || value === 'bibliotheque'
}

/** Segments réservés (routes statiques AfriLearn) — ne doivent pas être lus comme un niveau. */
const RESERVED_LEARN_SEGMENTS: Record<string, string> = {
  moi: paths.learnMine,
  marche: paths.learnMarket,
  membre: paths.learn,
  canal: paths.learnMarket,
  produits: paths.learnMarket,
}

/** Fil d'un niveau : discussions, questions et bibliothèque de documents. */
export function LearnFeedPage() {
  const { levelId } = useParams()
  if (levelId && RESERVED_LEARN_SEGMENTS[levelId]) {
    return <Navigate to={RESERVED_LEARN_SEGMENTS[levelId]!} replace />
  }
  // key : changer de niveau remet à zéro la recherche et les filtres.
  return <LearnFeed key={levelId} levelId={levelId} />
}

function LearnFeed({ levelId }: { levelId: string | undefined }) {
  const profile = useProfile()
  const level = getTempLevel(levelId)
  useLocalStore(learnStore)
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [questionFilter, setQuestionFilter] = useState<QuestionFilter>('all')
  const [kindFilter, setKindFilter] = useState<KindFilter>('all')
  const [composer, setComposer] = useState<{ open: boolean; type: 'text' | 'document' }>({
    open: false,
    type: 'text',
  })
  const [report, setReport] = useState<ReportTarget | null>(null)

  if (!level) {
    return (
      <>
        <PageHeader
          title="AfriLearn"
          leading={<BackLink to={paths.learn} label="AfriLearn" />}
        />
        <EmptyState
          icon={GraduationCap}
          tone="info"
          title="Niveau introuvable"
          description="Ce niveau n’existe pas ou n’est plus disponible."
          action={
            <Link to={paths.learn} className={buttonVariants()}>
              Choisir un niveau
            </Link>
          }
          className="py-20"
        />
      </>
    )
  }

  const tabParam = params.get('onglet')
  const tab: TabId = isTab(tabParam) ? tabParam : 'fil'
  const posts = getLearnPosts(level.id)
  const documents = getLearnDocuments(level.id)

  const normalized = query.trim().toLowerCase()
  const matches = (...texts: (string | undefined)[]) =>
    !normalized || texts.some((text) => text?.toLowerCase().includes(normalized))

  const visiblePosts = posts.filter((post) => matches(post.title, post.content))
  const visibleQuestions = posts
    .filter((post) => post.type === 'question')
    .filter((post) => questionFilter === 'all' || !post.isAnswered)
    .filter((post) => matches(post.title, post.content))
  const visibleDocuments = documents
    .filter((doc) => kindFilter === 'all' || doc.kind === kindFilter)
    .filter((doc) => matches(doc.title, doc.description))

  function selectTab(next: TabId) {
    setParams(next === 'fil' ? {} : { onglet: next }, { replace: true })
    setQuery('')
  }

  const stats = [
    `${formatCount(level.membersCount)} membres`,
    `${posts.filter((post) => post.status === 'active').length} publications`,
    `${documents.length} documents`,
  ]

  return (
    <>
      <PageHeader
        title={level.name}
        leading={<BackLink to={paths.learn} label="Niveaux AfriLearn" />}
      />

      <p className="px-4 text-caption text-muted-foreground">
        {level.category} · {level.country}
        {level.hasFeed ? ` · ${stats.join(' · ')}` : ''}
      </p>

      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar name={profile.name} src={profile.avatarSrc} size="md" />
        <button
          type="button"
          onClick={() => setComposer({ open: true, type: 'text' })}
          className="h-11 min-w-0 flex-1 truncate rounded-full bg-input px-4 text-left text-body text-muted-foreground hover:bg-input/70"
        >
          Une question, une idée ?
        </button>
        <button
          type="button"
          aria-label="Partager un document"
          onClick={() => setComposer({ open: true, type: 'document' })}
          className="grid size-11 shrink-0 place-items-center rounded-full text-brand hover:bg-muted"
        >
          <FileUp className="size-6" aria-hidden="true" />
        </button>
      </div>

      {!level.hasFeed ? (
        <EmptyState
          icon={Sprout}
          tone="brand"
          title="Un nouveau fil vous attend"
          description={`Le fil ${level.name} sera créé automatiquement à votre arrivée. Posez la première question ou partagez un premier document.`}
        />
      ) : (
        <>
          <FilterChips
            label="Sections du fil"
            items={TABS}
            value={tab}
            onChange={selectTab}
          />

          <div className="px-4 pt-3">
            <SearchField
              label={`Rechercher dans le fil ${level.name}`}
              placeholder="Cours, exercice, question…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          {tab === 'questions' ? (
            <FilterChips
              label="Filtrer les questions"
              items={QUESTION_FILTERS}
              value={questionFilter}
              onChange={setQuestionFilter}
              className="pt-3"
            />
          ) : null}
          {tab === 'bibliotheque' ? (
            <FilterChips
              label="Filtrer par type de document"
              items={KIND_FILTERS}
              value={kindFilter}
              onChange={setKindFilter}
              className="pt-3"
            />
          ) : null}

          {tab === 'fil' || tab === 'bibliotheque' ? (
            <div className="pt-3">
              <LearnFeedOffersStrip query={query} />
            </div>
          ) : null}

          <section
            aria-label={TABS.find((item) => item.id === tab)?.label}
            className="py-3"
          >
            {tab === 'fil' ? (
              visiblePosts.length === 0 ? (
                <EmptyState
                  icon={GraduationCap}
                  tone="info"
                  title="Aucune publication"
                  description="Aucune publication ne correspond à votre recherche."
                  className="py-10"
                />
              ) : (
                <ul className="divide-y">
                  {visiblePosts.map((post) => (
                    <li key={post.id}>
                      <LearnPostCard
                        post={post}
                        document={getLearnDocument(post.documentId)}
                        onReport={
                          post.author.id === 'me'
                            ? undefined
                            : (item) =>
                                setReport({
                                  type: 'post',
                                  label:
                                    item.title ?? `Publication de ${item.author.name}`,
                                })
                        }
                      />
                    </li>
                  ))}
                </ul>
              )
            ) : null}

            {tab === 'questions' ? (
              visibleQuestions.length === 0 ? (
                <EmptyState
                  icon={GraduationCap}
                  tone="info"
                  title="Aucune question"
                  description={
                    questionFilter === 'open' && !normalized
                      ? 'Toutes les questions ont reçu une réponse.'
                      : 'Aucune question ne correspond à votre recherche.'
                  }
                  className="py-10"
                />
              ) : (
                <ul className="divide-y">
                  {visibleQuestions.map((post) => (
                    <li key={post.id}>
                      <LearnPostCard
                        post={post}
                        onReport={
                          post.author.id === 'me'
                            ? undefined
                            : (item) =>
                                setReport({
                                  type: 'post',
                                  label: item.title ?? `Question de ${item.author.name}`,
                                })
                        }
                      />
                    </li>
                  ))}
                </ul>
              )
            ) : null}

            {tab === 'bibliotheque' ? (
              visibleDocuments.length === 0 ? (
                <EmptyState
                  icon={GraduationCap}
                  tone="info"
                  title="Aucun document"
                  description="Aucun document ne correspond à ce filtre ou à cette recherche."
                  className="py-10"
                />
              ) : (
                <ul className="space-y-3 px-4">
                  {visibleDocuments.map((doc) => (
                    <li key={doc.id}>
                      <DocumentCard
                        document={doc}
                        onReport={(item) =>
                          setReport({ type: 'document', label: item.title })
                        }
                      />
                    </li>
                  ))}
                </ul>
              )
            ) : null}
          </section>
        </>
      )}

      <ComposerSheet
        open={composer.open}
        levelId={level.id}
        levelName={level.name}
        initialType={composer.type}
        onClose={() => setComposer((value) => ({ ...value, open: false }))}
      />
      <ReportSheet target={report} onClose={() => setReport(null)} />
    </>
  )
}
