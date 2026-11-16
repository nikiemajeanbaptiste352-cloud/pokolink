/**
 * Lecture AfriLearn : placeholders + contenu local (pont Moi ↔ fil ↔ membre public).
 */
import {
  getLocalLearnComments,
  getLocalLearnDocument,
  getLocalLearnDocuments,
  getLocalLearnPost,
  getLocalLearnPosts,
} from '@/lib/learn-store'
import {
  getTempComments as getPlaceholderComments,
  getTempDocument as getPlaceholderDocument,
  getTempDocuments as getPlaceholderDocuments,
  getTempPost as getPlaceholderPost,
  getTempPosts as getPlaceholderPosts,
  TEMP_LEARN_COMMENTS,
  TEMP_LEARN_DOCUMENTS,
  TEMP_LEARN_POSTS,
} from '@/lib/placeholder-learn'
import type { LearnAuthor, LearnComment, LearnDocument, LearnPost } from '@/types/learn'

function mergeById<T extends { id: string }>(
  local: readonly T[],
  temp: readonly T[],
): T[] {
  const seen = new Set(local.map((item) => item.id))
  return [...local, ...temp.filter((item) => !seen.has(item.id))]
}

function withLocalCommentOverlay(post: LearnPost): LearnPost {
  if (getLocalLearnPost(post.id)) return post
  const extra = getLocalLearnComments().filter((c) => c.postId === post.id).length
  if (!extra) return post
  return {
    ...post,
    commentsCount: post.commentsCount + extra,
    ...(post.type === 'question' ? { isAnswered: true } : {}),
  }
}

export function getLearnPosts(levelId: string): readonly LearnPost[] {
  const local = getLocalLearnPosts().filter(
    (post) =>
      post.levelId === levelId && (post.status === 'active' || post.author.id === 'me'),
  )
  return mergeById(local, getPlaceholderPosts(levelId)).map(withLocalCommentOverlay)
}

export function getLearnPost(id: string | undefined): LearnPost | undefined {
  if (!id) return undefined
  const local = getLocalLearnPost(id)
  if (local) return local
  const temp = getPlaceholderPost(id)
  return temp ? withLocalCommentOverlay(temp) : undefined
}

export function getLearnDocuments(levelId: string): readonly LearnDocument[] {
  const local = getLocalLearnDocuments().filter((doc) => doc.levelId === levelId)
  return mergeById(local, getPlaceholderDocuments(levelId))
}

export function getLearnDocument(id: string | undefined): LearnDocument | undefined {
  if (!id) return undefined
  return getLocalLearnDocument(id) ?? getPlaceholderDocument(id)
}

export function getLearnComments(postId: string): readonly LearnComment[] {
  const local = getLocalLearnComments().filter((comment) => comment.postId === postId)
  return mergeById(local, getPlaceholderComments(postId))
}

/** Contenus d’un membre (privé : tout ; public : actifs seulement). */
export function getLearnContributions(author: LearnAuthor, own: boolean) {
  const posts = mergeById(getLocalLearnPosts(), TEMP_LEARN_POSTS).filter(
    (post) => post.author.handle === author.handle && (own || post.status === 'active'),
  )
  const documents = mergeById(getLocalLearnDocuments(), TEMP_LEARN_DOCUMENTS).filter(
    (doc) => doc.author.handle === author.handle,
  )
  const answers = mergeById(getLocalLearnComments(), TEMP_LEARN_COMMENTS).filter(
    (comment) => comment.author.handle === author.handle,
  )
  return {
    publications: posts.filter((post) => post.type !== 'question'),
    questions: posts.filter((post) => post.type === 'question'),
    documents,
    answers,
  }
}
