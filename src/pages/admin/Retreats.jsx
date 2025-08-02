import FAQForm from "../../components/admin/pilgrim_retreats/FAQForm";
import FeatureForm from "../../components/admin/pilgrim_retreats/FeatureForm";
import MeetGuideForm from "../../components/admin/pilgrim_retreats/MeetGuideForm";
import MonthlySubscription from "../../components/admin/pilgrim_retreats/MonthlySubscription";
import OneTimePurchase from "../../components/admin/pilgrim_retreats/OneTimePurchase";
import PilgrimRetreatCard from "../../components/admin/pilgrim_retreats/PilgrimRetreatCard";
import ProgramScheduleForm from "../../components/admin/pilgrim_retreats/ProgramScheduleForm";
import RetreatDescription from "../../components/admin/pilgrim_retreats/RetreatDescription";
import SessionForm from "../../components/admin/pilgrim_retreats/SessionForm";

export default function Retreats() {
  return(
    <>
      <PilgrimRetreatCard />
      <MonthlySubscription />
      <OneTimePurchase />
      <SessionForm />
      <FeatureForm />
      <ProgramScheduleForm />
      <RetreatDescription />
      <FAQForm />
      <MeetGuideForm />
    </>
  )
}
