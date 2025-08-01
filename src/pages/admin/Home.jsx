import FooterSection from "../../components/admin/home/FooterSection"
import Highlights from "../../components/admin/home/Highlights"
import ImageSliderAdmin from "../../components/admin/home/ImageSliderAdmin"
import NavbarSection from "../../components/admin/home/NavbarSection"
import TestimonialsEdit from "../../components/admin/home/TestimonialsEdit"
import TitleDescriptionEditor from "../../components/admin/home/TitleDescriptionEditor"

function Home() {
  return (
    <>
      <ImageSliderAdmin />
      <TitleDescriptionEditor />
      <Highlights />
      <NavbarSection />
      <FooterSection />
      <TestimonialsEdit />
    </>
  )
}

export default Home