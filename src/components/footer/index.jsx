import "./Footer.css";
import Button from "../../components/ui/button";
import Input_field from "../../components/ui/inputfield";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

function Footer() {

     const uid = "your-unique-id";
     const [footerData, setFooterData] = useState({});

     useEffect(() => {
          const fetchData = async () => {
               try {
                    const slidesRef = doc(db, `homepage/${uid}/footer/links`);
                    const snapshot = await getDoc(slidesRef);

                    if (snapshot.exists()) {
                         const data = snapshot.data();
                         setFooterData(data?.footer || {});
                    } else {
                         console.log("No footer data found in Firestore");
                    }
               } catch (error) {
                    console.error("Error fetching footer data from Firestore:", error);
               }
          };

          fetchData();
     }, []);

     return (
          <footer className="site-footer">
               <div className="footer-container">
                    <div className="footer-tagline">
                         {footerData?.description}
                    </div>

                    <div className="footer-subscribe">
                         <Input_field Type={"email"} Hint={"E-mail address"} />
                         <Button className="!py-5" btn_name={"Subscribe"} />
                    </div>
               </div>

               <div className="footer-links">
                    <h3 className="font-semibold">{footerData?.heading}</h3>
                    { footerData?.links && footerData?.links.length > 0 && (
                         <div className="links-grid">
                              <div>
                                   <a href="/joinusguides">{footerData?.links[0]?.menu}</a>
                                   <a href="/joinusadvisors">{footerData?.links[1]?.menu}</a>
                              </div>
                              <div>
                                   <a href="/whoarewe">{footerData?.links[2]?.menu}</a>
                                   <a href="/whyus">{footerData?.links[3]?.menu}</a>
                              </div>
                              <div>
                                   <a href="#">{footerData?.links[4]?.menu}</a>
                                   <a href="#">{footerData?.links[5]?.menu}</a>
                              </div>
                              <div>
                                   <a href="/contact">{footerData?.links[6]?.menu}</a>
                              </div>
                         </div>
                    )}
               </div>

               <div className="footer-bottom">
                    &copy; {new Date().getFullYear()} Urban Pilgrim. All rights reserved.
               </div>
          </footer>
     );
}

export default Footer;
