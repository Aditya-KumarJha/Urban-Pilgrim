import Highlights from "../../components/admin/Highlights"
import ImageSliderAdmin from "../../components/admin/ImageSliderAdmin"
import TitleDescriptionEditor from "../../components/admin/TitleDescriptionEditor"

function Admin() {
  return (
    <>
        <ImageSliderAdmin />
        <TitleDescriptionEditor />
        <Highlights />
    </>
  )
}

export default Admin