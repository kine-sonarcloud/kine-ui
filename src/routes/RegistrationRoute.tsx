import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FreeTrialRegistration from '../screens/FreeTrial/FreeTrialRegistration';
import PaidSubscription from '../screens/PaidSubscription/PaidSubscription';
import RegistrationSuccess from '../screens/RegistrationSuccess/RegistrationSuccess';

function RegistrationRoute() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<FreeTrialRegistration />} />
          <Route path="/freetrial" element={<FreeTrialRegistration />} />
          <Route path="/freetrial/:userdet" element={<FreeTrialRegistration />} />
          <Route path="/paidsubscription" element={<PaidSubscription />} />
          <Route path="/paidsubscription/:userdet" element={<PaidSubscription />} />
          <Route path="/verifyemail/:userdet" element={<RegistrationSuccess />} />
        </Routes>
      </Router>
    </div>
  );
}

export default RegistrationRoute;
