import { BrowserRouter, Route, Routes } from "react-router-dom";

// General Components
import Home from "./components/home/Home";
import Events from "./components/events/Events";
import Chat from "./components/Chat/Chat.jsx";
import SplashScreen from "./components/SplashScreen/SplashScreen.jsx";

// Organizer Components
import AddNew from "./components/organizer/AddNew.jsx";
import Login from "./components/organizer/login page/Login.jsx";
import SignUp from "./components/organizer/signup page/Signup";
import Scan from "./components/organizer/scan.jsx";
import OrgMaps from "./components/organizer/OrganizerEventsMaps.jsx";
import OrganizerEvents from "./components/organizer/OrganizerEvents.jsx";
import OrganizerProfile from "./components/organizer/OrganizerProfile.jsx";
import EventDetailsOrg from "./components/organizer/EventDetailsOrg.jsx";
import OrganizerChatList from "./components/organizer/OrganizerChatList.jsx";
import OrganizerChat from "./components/organizer/OrganizerChat.jsx";
import EditEvent from './components/organizer/EditEvents.jsx'

// User Components
import RegisterEvent from "./components/user/RegisterEvent/RegisterEvent.jsx";
import LLogin from "./components/user/Login/login.jsx";
import SSignup from "./components/user/Login/Signup.jsx";
import UserMaps from "./components/user/Map/EventsMap.jsx";
import AfterRegistration from "./components/user/AfterRegistration/AfterRegistration.jsx";
import UserProfile from "./components/user/UserProfile/UserProfile.jsx";
import RegisteredEvents from "./components/user/RegisteredEvents/RegisteredEvents.jsx";
import AllEvents from "./components/user/allevents/AllEvents.jsx";
import RewardPoints from "./components/user/RewardPoints/RewardPoints.jsx";
import Redeem from "./components/user/Redeem/Redeem.jsx";

 function App() {


  return (
    <>


      {/* Routing Setup */}
      <BrowserRouter>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/events" element={<Events />} />
          {/* <Route path="/registerevent" element={<RegisterEvent />} /> */}
          <Route path="/userlogin" element={<LLogin />} />
          <Route path="/usersignup" element={<SSignup />} />
          <Route path="/usermaps" element={<UserMaps />} />
          <Route path="/allevents" element={<AllEvents />} />
          <Route path="/userprofile" element={<UserProfile />} />
          <Route path="/registerevent/:id" element={<RegisterEvent />} />
          <Route path="/organizer/profile" element={<OrganizerProfile />} />
        <Route path="/organizer/events" element={<OrganizerEvents />} />
        <Route path="/organizer/event/:id" element={<EventDetailsOrg />} />
        <Route path="/edit/:id" element={<EditEvent />} />
        <Route path="/organizenew" element={<AddNew />} />
        <Route path="/organizerlogin" element={<Login />} />
        <Route path="/orgmaps" element={<OrgMaps />} />
        <Route path="/organizersignup" element={<SignUp />} />
          <Route path="/scan" element={<Scan />} />
          <Route path = "/registeredevents" element={<RegisteredEvents/>}/>
          <Route path="/afterregistration/:eventId/:attendeeId" element={<AfterRegistration/>} />
          <Route path="/chat/:organizerId/:eventId/:attendeeId" element={<Chat />} />
          <Route path="/organizer/event/:eventId/chat" element={<OrganizerChatList />} />
          <Route path="/organizer/chat/:eventId/:attendeeId" element={<OrganizerChat />} />
          <Route path="/rewardpoints/:attendee_id" element={<RewardPoints />} />  
          <Route path="/" element={<SplashScreen />} />
          <Route path="/redeem/:event_id/:attendee_id" element={<Redeem />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
