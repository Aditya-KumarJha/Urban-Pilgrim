import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
// import sessionReducer from "../features/sessionSlice";
// import bookingReducer from "../features/bookingSlice";
import slidesReducer from "../features/home_slices/slidesSlice";
import sectionOneReducer from "../features/home_slices/sectionOneSlice";
import sectionTwoReducer from "../features/home_slices/sectionTwoSlice";
import sectionThreeReducer from "../features/home_slices/sectionThreeSlice";
import sectionFourReducer from "../features/home_slices/sectionFourSlice";
import sectionFiveReducer from "../features/home_slices/sectionFiveSlice";
import sectionSixReducer from "../features/home_slices/sectionSixSlice";
import sectionSevenReducer from "../features/home_slices/sectionSevenSlice";
import sectionEightReducer from "../features/home_slices/sectionEightSlice";
import pilgrimRetreatReducer from "../features/pilgrim_retreat/pilgrimRetreatSlice";
import pilgrimGuidesReducer from "../features/pilgrim_guide/pilgrimGuideSlice";
import pilgrimLiveSessionReducer from "../features/pilgrim_session/liveSessionsSlice"

const store = configureStore({
    reducer: {
        auth: authReducer,
        // sessions: sessionReducer,
        sectionOne: sectionOneReducer,
        sectionTwo: sectionTwoReducer,
        sectionThree: sectionThreeReducer,
        sectionFour: sectionFourReducer,
        sectionFive: sectionFiveReducer,
        sectionSix: sectionSixReducer,
        sectionSeven: sectionSevenReducer,
        sectionEight: sectionEightReducer,
        // booking: bookingReducer,
        slides: slidesReducer,
        pilgrimRetreat: pilgrimRetreatReducer,
        pilgrimGuides: pilgrimGuidesReducer,
        pilgrimLiveSession: pilgrimLiveSessionReducer
    },
});

export default store;