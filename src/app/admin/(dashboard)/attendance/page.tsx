import { getAttendances } from './actions';
import AttendanceClient from './AttendanceClient';

export const dynamic = 'force-dynamic';

export default async function AttendancePage() {
  const attendances = await getAttendances();
  return <AttendanceClient initialData={attendances} />;
}
