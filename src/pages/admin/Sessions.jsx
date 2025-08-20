import LiveSessionForm from "../../components/admin/pilgrim_sessions/LiveSessions";
import LiveSessions2 from "../../components/admin/pilgrim_sessions/LiveSessions2";
import RecordedSessionForm from "../../components/admin/pilgrim_sessions/RecordedSessionForm";
import RecordedSession2 from "../../components/admin/pilgrim_sessions/RecordedSession2";
import SessionBookingsTable from "../../components/admin/pilgrim_sessions/SessionBookings";

export default function Sessions() {
  return (
    <>
      {/* <LiveSessionForm /> */}
      <LiveSessions2 />
      {/* <RecordedSessionForm /> */}
      <RecordedSession2 />
      <SessionBookingsTable />
    </>
  )
}
