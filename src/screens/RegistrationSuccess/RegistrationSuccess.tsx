import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { Helmet } from 'react-helmet';
import kineConfig from '../../config/kineConfig.json';
import kineApiKeys from '../../config/kineApiKeys.json';
import { GraphQueries } from '../../service/graphQL/GraphQueries';
import errorMessages from '../../config/errorMessages.json';
import successMessage from '../../config/successMessages.json';
import SnackBarMsg from '../../components/SnackBarMsg/SnackBarMsg';
import registrationSuccessCss from './registrationSuccess.module.scss';
import mailIbox from '../../assets/images/mailbox.svg';
import kineLogo from '../../assets/images/Kine-Logo.png';

function RegistrationSuccess() {
  const { userdet } = useParams();
  const navigate = useNavigate();
  const [showToastMsg, setShowToastMsg] = useState({ val: false, msg: '', type: '' });
  const [userDetails, setUserDetails] = useState({
    lastName: '',
    firstName: '',
    emailAddress: '',
    from: '',
  });
  useEffect(() => {
    try {
      const decoded = JSON.parse(atob(userdet));
      setUserDetails(decoded);
    } catch {
      navigate('/freetrial');
    }
  }, []);

  // function verifyEmail() {
  //   window.open('https://mail.google.com/mail/u/0/?tab=rm&ogbl#search/%5BKine.ai%5D+Verify+your+email+to+start+using+Kine.');
  // }

  function resendEmail() {
    const keyVal = Math.floor(Math.random() * 10);
    const jtoken = {
      emailAddress: userDetails.emailAddress,
    };
    const hash = CryptoJS.HmacSHA512(JSON.stringify(jtoken), Object.values(kineApiKeys)[keyVal]);
    const hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
    try {
      GraphQueries.resendEmail(userDetails.emailAddress, `${kineConfig.HMACType}:${hashInBase64}`, CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(Object.keys(kineApiKeys)[keyVal])))
        .then((response) => {
          if (response.data.graphQLErrors) {
            if (response.data.graphQLErrors[0].extensions.message === 'Mail ID not exist') {
              setShowToastMsg({ val: true, msg: errorMessages.inValidUser, type: 'error' });
            } else {
              setShowToastMsg({ val: true, msg: errorMessages.userVerified, type: 'error' });
            }
          } else {
            setShowToastMsg({ val: true, msg: successMessage.reSendEmail, type: 'success' });
          }
        });
    } catch (e) {
      // console.log(e);
    }
  }

  function reenterEmail() {
    if (userDetails.from === 'free') {
      navigate(`/freetrial/${userdet}`);
    } else {
      navigate(`/paidsubscription/${userdet}`);
    }
  }

  function resetMessage() {
    setShowToastMsg({ val: false, msg: '', type: '' });
  }

  return (
    <>
      <Helmet>
        <title>Kine - Registered Successfully</title>
      </Helmet>
      {showToastMsg.val ? <SnackBarMsg message={showToastMsg} callback={resetMessage} /> : null}
      <img src={kineLogo} alt="" className={registrationSuccessCss.kineLogo} />
      <div className={registrationSuccessCss.registrationContainer}>
        <div className={registrationSuccessCss.registrationHolder}>
          <div className={registrationSuccessCss.holderPadding}>
            <div className={registrationSuccessCss.flexHolder}>
              <div className={registrationSuccessCss.flexHoldercolumn}>
                <div className={registrationSuccessCss.flexCircle}>
                  <p className={registrationSuccessCss.stepsNumberText}>
                    2/2
                  </p>
                </div>
                <p className={registrationSuccessCss.pageHeader}>
                  Great
                  {' '}
                  {userDetails.firstName}
                  ,
                </p>
                <p className={registrationSuccessCss.pageHeader}>
                  Check your inbox
                </p>
              </div>
              <img src={mailIbox} alt="" className={registrationSuccessCss.mailbox} />
            </div>
            <p className={registrationSuccessCss.textDetails}>
              We‘ve sent a mail to
              <br />
              <span className={registrationSuccessCss.appColorBold}>
                {userDetails.emailAddress}
              </span>
              <br />
              with a link to verify and acctivate your account.
              <br />
              It will expire shortly, so verify soon.
            </p>
            {/* <button className={registrationSuccessCss.registerButton}
            type="button"
            onClick={() => verifyEmail()}>
            Go to verification email
            </button> */}
          </div>
          <div className={registrationSuccessCss.footer}>
            <button type="button" className={registrationSuccessCss.resendButton} onClick={() => resendEmail()}>Resend Email</button>
            <p className={registrationSuccessCss.wrongText}>Change your email</p>
            <button type="button" className={registrationSuccessCss.editButton} onClick={() => reenterEmail()}>Edit Email</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default RegistrationSuccess;
