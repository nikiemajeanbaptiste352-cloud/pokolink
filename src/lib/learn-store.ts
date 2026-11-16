/**
 * Contenu AfriLearn local (posts, documents, commentaires, likes).
 * Pont « Moi » ↔ fil ↔ page membre publique. À remplacer par l’API.
 */
import { createId } from '@/lib/ids'
import { createLocalStore } from '@/lib/local-store'
import { TEMP_LEARN_ME } from '@/lib/placeholder-learn'
import { getProfile } from '@/lib/profile-store'
import type {
  LearnAuthor,
  LearnComment,
  LearnDocument,
  LearnFileType,
  LearnPost,
  LearnPostType,
} from '@/types/learn'

export interface LearnLocalState {
  posts: LearnPost[]
  documents: LearnDocument[]
  comments: LearnComment[]
  /** Ids de posts likés par l’utilisateur connecté. */
  likedPostIds: string[]
  /** Ids de commentaires likés. */
  likedCommentIds: string[]
}

const EMPTY: LearnLocalState = {
  posts: [],
  documents: [],
  comments: [],
  likedPostIds: [],
  likedCommentIds: [],
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isPost(value: unknown): value is LearnPost {
  return isRecord(value) && typeof value.id === 'string' && typeof value.content === 'string'
}

function isComment(value: unknown): value is LearnComment {
  return isRecord(value) && typeof value.id === 'string' && typeof value.postId === 'string'
}

function isDoc(value: unknown): value is LearnDocument {
  return isRecord(value) && typeof value.id === 'string' && typeof value.title === 'string'
}

export const learnStore = createLocalStore<LearnLocalState>(
  'africonnect.learn.v1',
  (raw) => {
    if (!isRecord(raw)) return { ...EMPTY, posts: [], documents: [], comments: [], likedPostIds: [], likedCommentIds: [] }
    return {
      posts: Array.isArray(raw.posts) ? raw.posts.filter(isPost) : [],
      documents: Array.isArray(raw.documents) ? raw.documents.filter(isDoc) : [],
      comments: Array.isArray(raw.comments) ? raw.comments.filter(isComment) : [],
      likedPostIds: Array.isArray(raw.likedPostIds)
        ? raw.likedPostIds.filter((id): id is string => typeof id === 'string')
        : [],
      likedCommentIds: Array.isArray(raw.likedCommentIds)
        ? raw.likedCommentIds.filter((id): id is string => typeof id === 'string')
        : [],
    }
  },
)

/** Auteur « moi » : profil connecté (plus le placeholder figé). */
export function getLearnMeAuthor(): LearnAuthor {
  const profile = getProfile()
  const handle = profile.handle.replace(/^@/, '')
  return {
    id: TEMP_LEARN_ME.id,
    name: profile.name,
    handle,
    role: TEMP_LEARN_ME.role,
    ...(profile.avatarSrc ? { avatarSrc: profile.avatarSrc } : {}),
  }
}

export function getLocalLearnPosts(): readonly LearnPost[] {
  return learnStore.get().posts
}

export function getLocalLearnComments(): readonly LearnComment[] {
  return learnStore.get().comments
}

export function getLocalLearnDocuments(): readonly LearnDocument[] {
  return learnStore.get().documents
}

export function getLocalLearnPost(id: string | undefined): LearnPost | undefined {
  if (!id) return undefined
  return learnStore.get().posts.find((post) => post.id === id)
}

export function getLocalLearnDocument(id: string | undefined): LearnDocument | undefined {
  if (!id) return undefined
  return learnStore.get().documents.find((doc) => doc.id === id)
}

function fileTypeFromName(name: string): LearnFileType {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (ext === 'docx' || ext === 'doc') return 'docx'
  return 'image'
}

export function addLearnPost(input: {
  levelId: string
  type: LearnPostType
  title?: string
  content: string
  file?: { name: string; size: number } | null
}): LearnPost {
  const author = getLearnMeAuthor()
  const id = createId()
  let documentId: string | undefined
  const state = learnStore.get()

  if (input.file) {
    documentId = createId()
    const doc: LearnDocument = {
      id: documentId,
      levelId: input.levelId,
      title: input.title?.trim() || input.file.name,
      description: input.content.slice(0, 160),
      kind: input.type === 'corrige' ? 'corrige' : input.type === 'examen' ? 'examen' : 'cours',
      fileType: fileTypeFromName(input.file.name),
      fileSize: input.file.size,
      downloadsCount: 0,
      isPopular: false,
      author,
      timeLabel: 'À l’instant',
    }
    state.documents = [doc, ...state.documents]
  }

  const post: LearnPost = {
    id,
    levelId: input.levelId,
    author,
    type: input.type,
    ...(input.title?.trim() ? { title: input.title.trim() } : {}),
    content: input.content.trim(),
    timeLabel: 'À l’instant',
    status: 'active',
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    ...(documentId ? { documentId } : {}),
    ...(input.type === 'question' ? { isAnswered: false } : {}),
  }

  learnStore.set({
    ...state,
    posts: [post, ...state.posts],
    documents: state.documents,
  })
  return post
}

export function addLearnComment(input: {
  postId: string
  content: string
  parentId?: string | null
}): LearnComment {
  const author = getLearnMeAuthor()
  const comment: LearnComment = {
    id: createId(),
    postId: input.postId,
    author,
    content: input.content.trim(),
    timeLabel: 'À l’instant',
    parentId: input.parentId ?? null,
    likesCount: 0,
  }
  const state = learnStore.get()
  const posts = state.posts.map((post) => {
    if (post.id !== input.postId) return post
    return {
      ...post,
      commentsCount: post.commentsCount + 1,
      ...(post.type === 'question' ? { isAnswered: true } : {}),
    }
  })
  learnStore.set({
    ...state,
    comments: [comment, ...state.comments],
    posts,
  })
  return comment
}

export function toggleLearnPostLike(postId: string): boolean {
  const state = learnStore.get()
  const liked = state.likedPostIds.includes(postId)
  const likedPostIds = liked
    ? state.likedPostIds.filter((id) => id !== postId)
    : [...state.likedPostIds, postId]
  const posts = state.posts.map((post) =>
    post.id === postId
      ? {
          ...post,
          likesCount: Math.max(0, post.likesCount + (liked ? -1 : 1)),
        }
      : post,
  )
  learnStore.set({ ...state, likedPostIds, posts })
  return !liked
}

export function isLearnPostLiked(postId: string): boolean {
  return learnStore.get().likedPostIds.includes(postId)
}

export function toggleLearnCommentLike(commentId: string): boolean {
  const state = learnStore.get()
  const liked = state.likedCommentIds.includes(commentId)
  const likedCommentIds = liked
    ? state.likedCommentIds.filter((id) => id !== commentId)
    : [...state.likedCommentIds, commentId]
  const comments = state.comments.map((comment) =>
    comment.id === commentId
      ? {
          ...comment,
          likesCount: Math.max(0, comment.likesCount + (liked ? -1 : 1)),
        }
      : comment,
  )
  learnStore.set({ ...state, likedCommentIds, comments })
  return !liked
}

export function isLearnCommentLiked(commentId: string): boolean {
  return learnStore.get().likedCommentIds.includes(commentId)
}
