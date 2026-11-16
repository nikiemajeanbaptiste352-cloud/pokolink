import { GraduationCap, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { SectionDivider } from '@/components/common/SectionDivider'
import { SectionHeader } from '@/components/common/SectionHeader'
import { CommentForm } from '@/components/learn/CommentForm'
import { CommentThread } from '@/components/learn/CommentThread'
import { LearnPostCard } from '@/components/learn/LearnPostCard'
import { ReportSheet, type ReportTarget } from '@/components/learn/ReportSheet'
import { buttonVariants } from '@/components/ui/button'
import { useLocalStore } from '@/hooks/use-local-store'
import { getLearnComments, getLearnDocument, getLearnPost } from '@/lib/learn-data'
import { learnStore } from '@/lib/learn-store'
import { getTempLevel } from '@/lib/placeholder-learn'
import { paths } from '@/routes/paths'
import type { LearnComment } from '@/types/learn'

/** Publication complète : texte, document attaché, réponses imbriquées et formulaire de réponse. */
export function LearnPostPage() {
  const { levelId, postId } = useParams()
  useLocalStore(learnStore)
  const level = getTempLevel(levelId)
  const post = getLearnPost(postId)
  const [replyingTo, setReplyingTo] = useState<LearnComment | null>(null)
  const [report, setReport] = useState<ReportTarget | null>(null)

  if (!level || !post || post.levelId !== level.id) {
    return (
      <>
        <PageHeader
          title="Publication"
          leading={
            <BackLink to={levelId ? paths.learnFeed(levelId) : paths.learn} label="Fil" />
          }
        />
        <EmptyState
          icon={GraduationCap}
          tone="info"
          title="Publication introuvable"
          description="Cette publication n’existe pas ou n’est plus disponible."
          action={
            <Link to={paths.learn} className={buttonVariants()}>
              Retour à AfriLearn
            </Link>
          }
          className="py-20"
        />
      </>
    )
  }

  const comments = getLearnComments(post.id)
  const isQuestion = post.type === 'question'
  const sectionTitle = isQuestion ? 'Réponses' : 'Commentaires'

  return (
    <>
      <PageHeader
        title={isQuestion ? 'Question' : 'Publication'}
        leading={<BackLink to={paths.learnFeed(level.id)} label={`Fil ${level.name}`} />}
      />

      <LearnPostCard
        full
        post={post}
        document={getLearnDocument(post.documentId)}
        onReport={
          post.author.id === 'me'
            ? undefined
            : (item) =>
                setReport({
                  type: 'post',
                  label: item.title ?? `Publication de ${item.author.name}`,
                })
        }
      />
      <SectionDivider />

      <section aria-label={sectionTitle} className="space-y-3 py-4">
        <SectionHeader title={`${sectionTitle} (${comments.length})`} />
        {comments.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            tone="info"
            title={isQuestion ? 'Pas encore de réponse' : 'Pas encore de commentaire'}
            description={
              isQuestion
                ? 'Soyez le premier à aider : expliquez la méthode, pas seulement le résultat.'
                : 'Lancez la conversation.'
            }
            className="py-6"
          />
        ) : (
          <CommentThread
            comments={comments}
            replyingToId={replyingTo?.id ?? null}
            onReply={setReplyingTo}
            onReport={(comment) =>
              setReport({
                type: 'comment',
                label: `Commentaire de ${comment.author.name}`,
              })
            }
          />
        )}
      </section>
      <SectionDivider />

      <CommentForm
        postId={post.id}
        isQuestion={isQuestion}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />

      <ReportSheet target={report} onClose={() => setReport(null)} />
    </>
  )
}
