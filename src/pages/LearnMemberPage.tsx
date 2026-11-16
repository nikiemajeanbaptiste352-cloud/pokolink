import { MessageCircle, Share2, UserCheck, UserPlus } from 'lucide-react'
import { useParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { PageHeader } from '@/components/common/PageHeader'
import { ProfileWelcome } from '@/components/common/ProfileWelcome'
import { PublicProfileHeader } from '@/components/common/PublicProfileHeader'
import { ROLE_LABEL } from '@/components/learn/learn-utils'
import { LearnContributions } from '@/components/learn/LearnContributions'
import { LearnMemberCommerceBlock } from '@/components/learn/LearnMemberCommerceBlock'
import { FlashMessage } from '@/components/pro/shared'
import { Button } from '@/components/ui/button'
import { useStartConversation } from '@/hooks/use-conversations'
import { useFollowing } from '@/hooks/use-following'
import { useLocalStore } from '@/hooks/use-local-store'
import { useShare } from '@/hooks/use-share'
import {
  getLearnMemberCommerceStats,
  getLearnMemberContentStats,
  isLearnOwnHandle,
} from '@/lib/afrilearn-member-stats'
import { getContributions } from '@/lib/learn-contributions'
import { learnStore } from '@/lib/learn-store'
import { learnMemberContext, learnMemberRecipient } from '@/lib/messaging-contexts'
import { getTempMember } from '@/lib/placeholder-learn'
import { paths } from '@/routes/paths'
import type { LearnAuthor } from '@/types/learn'

import { NotFoundPage } from './NotFoundPage'

/** Page publique d'un membre d'AfriLearn : ce qu'il a publié, partagé et répondu. */
export function LearnMemberPage() {
  const { handle } = useParams()
  const member = getTempMember(handle)
  if (!member) return <NotFoundPage />
  return <MemberView member={member} />
}

function MemberView({ member }: { member: LearnAuthor }) {
  const own = isLearnOwnHandle(member.handle)
  useLocalStore(learnStore)
  const [following, toggleFollowing] = useFollowing(`learn:${member.handle}`)
  const startConversation = useStartConversation()
  const { message, share } = useShare()
  getContributions(member, own)
  const content = getLearnMemberContentStats(member, own)
  const commerce = getLearnMemberCommerceStats(member.handle)
  const role = ROLE_LABEL[member.role]

  return (
    <>
      <ProfileWelcome
        name={member.name}
        eyebrow="AfriLearn"
        subtitle={role ?? 'Membre'}
        avatarSrc={member.avatarSrc}
      />
      <PageHeader
        title="Membre AfriLearn"
        leading={<BackLink to={paths.learn} label="AfriLearn" history />}
      />
      <FlashMessage message={message} />

      <PublicProfileHeader
        name={member.name}
        handle={member.handle}
        avatar={member.avatarSrc}
        subtitle={role ?? 'Membre'}
        stats={[
          {
            label: 'Publications',
            value: String(content.publications),
          },
          { label: 'Documents', value: String(content.documents) },
          {
            label: commerce.productsPublished > 0 ? 'Produits' : 'Réponses',
            value: String(
              commerce.productsPublished > 0
                ? commerce.productsPublished
                : content.answers,
            ),
          },
        ]}
        actions={
          <>
            {!own ? (
              <>
                <Button
                  size="sm"
                  variant={following ? 'outline' : 'default'}
                  aria-pressed={following}
                  onClick={toggleFollowing}
                  className="flex-1"
                >
                  {following ? (
                    <UserCheck aria-hidden="true" />
                  ) : (
                    <UserPlus aria-hidden="true" />
                  )}
                  {following ? 'Abonné' : 'Suivre'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    startConversation({
                      recipient: learnMemberRecipient(member),
                      context: learnMemberContext(member),
                    })
                  }
                >
                  <MessageCircle aria-hidden="true" />
                  Message
                </Button>
              </>
            ) : null}
            <Button
              size="sm"
              variant="outline"
              className={own ? 'flex-1' : undefined}
              onClick={() => void share(paths.learnMember(member.handle), member.name)}
            >
              <Share2 aria-hidden="true" />
              Partager
            </Button>
          </>
        }
      />

      <LearnMemberCommerceBlock handle={member.handle} />

      <LearnContributions author={member} own={own} />
    </>
  )
}
