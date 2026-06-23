import { getMembers } from './actions';
import MembersClient from './MembersClient';

export const dynamic = 'force-dynamic';

export default async function MembersPage() {
  const result = await getMembers(1, 20);
  return <MembersClient initialMembers={result.members} initialTotalPages={result.totalPages} />;
}
