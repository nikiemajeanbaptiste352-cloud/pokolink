import { FileText, GraduationCap } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { FilterChips, type ChipItem } from '@/components/common/FilterChips'
import { useLocalStore } from '@/hooks/use-local-store'
import { getContributions } from '@/lib/learn-contributions'
import { getLearnDocument, getLearnPost } from '@/lib/learn-data'
import { learnStore } from '@/lib/learn-store'
import { getTempLevel } from '@/lib/placeholder-learn'
import { paths } from '@/routes/paths'
import type { LearnAuthor } from '@/types/learn'

import { DocumentCard } from './DocumentCard'
import { LearnPostCard } from './LearnPostCard'

type TabId = 'publications' | 'documents' | 'questions' | 'reponses'

const TABS: readonly ChipItem<TabId>[] = [
  { id: 'publications', label: 'Publications' },
  { id: 'documents', label: 'Documents' },
  { id: 'questions', label: 'Questions' },
  { id: 'reponses', label: 'Réponses' },
]

function emptyCopy(own: boolean): Record<TabId, { title: string; description: string }> {
  return {
    publications: {
      title: 'Aucune publication',
      description: own
        ? 'Vos messages, exercices et corrigés apparaîtront ici.'
        : 'Les messages, exercices et corrigés de ce membre apparaîtront ici.',
    },
    documents: {
      title: 'Aucun document',
      description: own
        ? 'Les documents que vous partagez apparaîtront ici.'
        : 'Les documents partagés par ce membre apparaîtront ici.',
    },
    questions: {
      title: 'Aucune question',
      description: own
        ? 'Vos questions et leurs réponses apparaîtront ici.'
        : 'Les questions de ce membre apparaîtront ici.',
    },
    reponses: {
      title: 'Aucune réponse',
      description: own
        ? 'Vos réponses aux autres élèves apparaîtront ici.'
        : 'Les réponses de ce membre aux autres élèves apparaîtront ici.',
    },
  }
}

/**
 * Publications, documents, questions et réponses d'un membre d'AfriLearn : « Mes contributions »
 * (`own`) et la page publique d'un membre. Un membre ne voit que les contenus actifs des autres.
 */
export function LearnContributions({
  author,
  own,
}: {
  author: LearnAuthor
  own: boolean
}) {
  const [tab, setTab] = useState<TabId>('publications')
  useLocalStore(learnStore)
  const { publications, questions, documents, answers } = getContributions(author, own)

  const counts: Record<TabId, number> = {
    publications: publications.length,
    documents: documents.length,
    questions: questions.length,
    reponses: answers.length,
  }
  const chips = TABS.map((item) => ({
    ...item,
    label: `${item.label} (${counts[item.id]})`,
  }))
  const empty = emptyCopy(own)

  return (
    <>
      <FilterChips
        label={own ? 'Mes contributions' : `Contributions de ${author.name}`}
        items={chips}
        value={tab}
        onChange={setTab}
      />

      <section aria-label={TABS.find((item) => item.id === tab)?.label} className="py-3">
        {counts[tab] === 0 ? (
          <EmptyState
            icon={GraduationCap}
            tone="info"
            title={empty[tab].title}
            description={empty[tab].description}
            className="py-10"
          />
        ) : null}

        {tab === 'publications' || tab === 'questions' ? (
          <ul className="divide-y">
            {(tab === 'publications' ? publications : questions).map((post) => (
              <li key={post.id}>
                <p className="px-4 pt-3 text-caption text-muted-foreground">
                  {getTempLevel(post.levelId)?.name}
                </p>
                <LearnPostCard post={post} document={getLearnDocument(post.documentId)} />
              </li>
            ))}
          </ul>
        ) : null}

        {tab === 'documents' ? (
          <ul className="space-y-3 px-4">
            {documents.map((doc) => (
              <li key={doc.id}>
                <p className="pb-1.5 text-caption text-muted-foreground">
                  {getTempLevel(doc.levelId)?.name}
                </p>
                <DocumentCard document={doc} />
              </li>
            ))}
          </ul>
        ) : null}

        {tab === 'reponses' ? (
          <ul className="space-y-3 px-4">
            {answers.map((comment) => {
              const post = getLearnPost(comment.postId)
              return (
                <li
                  key={comment.id}
                  className="space-y-2 rounded-xl border bg-card p-3.5"
                >
                  {post ? (
                    <Link
                      to={paths.learnPost(post.levelId, post.id)}
                      className="flex min-h-11 items-center gap-2 text-caption font-semibold text-muted-foreground hover:text-foreground"
                    >
                      <FileText className="size-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 truncate">
                        En réponse à : {post.title ?? post.content}
                      </span>
                    </Link>
                  ) : null}
                  <p className="text-body">{comment.content}</p>
                  <p className="text-caption text-muted-foreground">
                    {comment.timeLabel}
                  </p>
                </li>
              )
            })}
          </ul>
        ) : null}
      </section>
    </>
  )
}
