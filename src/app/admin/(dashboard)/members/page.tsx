import { getMembers } from './actions';
import MembersClient from './MembersClient';

export const dynamic = 'force-dynamic';

export default async function MembersPage() {
  const members = await getMembers();
  return <MembersClient initialMembers={members} />;
}
