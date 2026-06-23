import { getMembers } from './actions';
import MembersClient from './MembersClient';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function MembersPage({ searchParams }: { searchParams: { page?: string, search?: string } }) {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || '';
  
  const [data, plans] = await Promise.all([
    getMembers(page, 20, search),
    prisma.membershipPlan.findMany({ orderBy: { price: 'asc' } })
  ]);
  
  return <MembersClient 
    initialMembers={data.members} 
    total={data.total} 
    totalPages={data.totalPages} 
    currentPage={page} 
    searchQuery={search} 
    plans={plans}
  />;
}
