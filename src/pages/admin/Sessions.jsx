import LiveSessions2 from "../../components/admin/pilgrim_sessions/LiveSessions2";
import RecordedSession2 from "../../components/admin/pilgrim_sessions/RecordedSession2";
import SessionBookingsTable from "../../components/admin/pilgrim_sessions/SessionBookings";

export default function Sessions() {
  return (
    <>
      <LiveSessions2 />
      <RecordedSession2 />
      <SessionBookingsTable />
    </>
  )
}
