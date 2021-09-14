import React, { useState, useEffect, useRef } from 'react';
import CryptoJS from 'crypto-js';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';
import { CircularProgress } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import ReCAPTCHA from 'react-google-recaptcha';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { GraphQueries } from '../../service/graphQL/GraphQueries';
import errorMessages from '../../config/errorMessages.json';
import freeTrialRegistrationCSS from './freeTrialRegistration.module.scss';
import kineLogo from '../../assets/images/Kine-Logo.png';
import kineP1 from '../../assets/images/kineP1.svg';
import kineP2 from '../../assets/images/kineP2.svg';
import kineP3 from '../../assets/images/kineP3.svg';
import info from '../../assets/images/info.svg';
import SnackBarMsg from '../../components/SnackBarMsg/SnackBarMsg';
import verifiedIcon from '../../assets/images/verifiedIcon.svg';
import kineConfig from '../../config/kineConfig.json';
import kineApiKeys from '../../config/kineApiKeys.json';
import kineTexts from '../../config/kineTexts.json';

const CssTextField = withStyles({
  root: {
    '& .MuiInput-underline::after': {
      borderBottom: 'none',
    },
    '& .MuiFormLabel-root': {
      color: 'black',
      fontSize: '13px',
      fontFamily: 'app-font-medium',
      margin: '-4px 0 0 20px',
    },
    '& .MuiInputLabel-shrink': {
      color: '#3E3E3E',
      fontFamily: 'app-font-regular',
      paddingTop: '9px',
    },
    '& .MuiInput-underline::before': {
      borderBottom: 'none !important',
    },
    '& .MuiFormControl-root': {
      margin: '-10px 0 0 0 !important',
    },
    '& .MuiInputBase-input': {
      margin: '-3px 0 0 0',
      fontSize: '14px',
      fontFamily: 'app-font-medium',
    },
  },
})(TextField);

const useStyles = makeStyles(() => ({
  root: {
    '& .MuiInput-underline::after': {
      borderBottom: 'none',
    },
    '& .MuiFormLabel-root': {
      color: '#ff0000',
      fontSize: '13px',
      fontFamily: 'app-font-medium',
      margin: '-4px 0 0 20px',
    },
    '& .MuiInputLabel-shrink': {
      color: '#ff0000',
      fontFamily: 'app-font-regular',
      paddingTop: '9px',
    },
    '& .MuiInput-underline::before': {
      borderBottom: 'none !important',
    },
    '& .MuiFormControl-root': {
      margin: '-10px 0 0 0 !important',
    },
    '& .MuiInputBase-input': {
      margin: '-3px 0 0 0',
      fontSize: '14px',
      fontFamily: 'app-font-medium',
      color: '#ff0000',
    },
  },
}));

function FreeTrialRegistration(props: any) {
  const { userdet } = useParams();
  const navigate = useNavigate();
  const fNameFocus = useRef(null);
  const lNameFocus = useRef(null);
  const emailFocus = useRef(null);
  const passwordFocus = useRef(null);
  const [state, setState] = useState({
    fName: '',
    lName: '',
    email: '',
    password: '',
  });
  const [emailError, setEmailError] = useState('');
  const [fNameError, setfNameError] = useState('');
  const [lNameError, setlNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isEmailActive, setIsEmailActive] = useState(false);
  const [isFNameActive, setIsFNameActive] = useState(false);
  const [isLNameActive, setIsLNameActive] = useState(false);
  const [isPasswordActive, setIsPasswordActive] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showToastMsg, setShowToastMsg] = useState({ val: false, msg: '', type: '' });
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [reCaptchaExpired, setReCaptchaExpired] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const validateMailRegExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  // @ts-ignore
  const invalidMailDomains = /^([\w-\\.]+@(?!gmail.com)(?!yahoo.com)(?!aol.com)(?!outlook.com)(?!icloud.com)(?!zohomail.com)(?!hotmail.com)(?!zoho.com)(?!protonmail.com)(?!mail.com)([\w-]+\.)+[\w-]{2,4})?$/;
  const recaptchaRef = React.createRef();
  function handleCaptchaChange(value: any) {
    if (value === null) {
      setReCaptchaExpired(true);
    } else {
      setReCaptchaExpired(false);
    }
  }
  const classes = useStyles();
  useEffect(() => {
    if (Object.keys(props).length !== 0) {
      setState({
        ...state, fName: props.fName, lName: props.lName, email: props.email,
      });
    }
    // @ts-ignore
    fNameFocus.current.focus();
    if (userdet !== null || userdet !== undefined) {
      try {
        const decoded = JSON.parse(atob(userdet));
        setState({
          ...state, fName: decoded.firstName, lName: decoded.lastName, email: decoded.emailAddress,
        });
      } catch {
        navigate('/freetrial');
      }
    }
  }, []);

  function validateAllInputs() {
    if (emailVerified && state.fName.length > 1 && state.fName !== '' && state.lName !== '' && validateMailRegExp.test(state.email) && invalidMailDomains.test(state.email) && state.password.length >= kineConfig.pwdlen) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }

  useEffect(() => {
    const delayValidateDebounceFn = setTimeout(() => {
      validateAllInputs();
    }, 1000);
    return () => clearTimeout(delayValidateDebounceFn);
    // eslint-disable-next-line
  }, [state, emailVerified]);

  async function verifyEmail() {
    const keyVal = Math.floor(Math.random() * 10);
    const jtoken = {
      emailAddress: state.email,
    };
    const hash = CryptoJS.HmacSHA512(JSON.stringify(jtoken), Object.values(kineApiKeys)[keyVal]);
    const hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
    try {
      GraphQueries.verifyEmail(state.email, `${kineConfig.HMACType}:${hashInBase64}`, CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(Object.keys(kineApiKeys)[keyVal])))
        .then((response) => {
          if (response.data.verifyEmail === false) {
            setEmailVerified(true);
          } else {
            setEmailError(errorMessages.emailExists);
            setEmailVerified(false);
          }
        });
    } catch {
      // console.log(e);
    }
  }

  function validateEmail() {
    if (state.email !== '' && !validateMailRegExp.test(state.email)) {
      setEmailError(errorMessages.invalidEmail);
      setEmailVerified(false);
    } else if (
      !invalidMailDomains.test(state.email)
    ) {
      setEmailError(errorMessages.invalidWorkEmail);
      setEmailVerified(false);
    } else {
      verifyEmail();
      setEmailError('');
    }
  }

  useEffect(() => {
    // console.log('qweqweqwe');
    if (state.fName.length < 2 && state.fName.length !== 0) {
      const delayEmailDebounceFn = setTimeout(() => {
        setfNameError(errorMessages.invalidFirstName);
      }, 1000);
      return () => clearTimeout(delayEmailDebounceFn);
    }
    return setfNameError('');
    // eslint-disable-next-line
  }, [state.fName]);

  useEffect(() => {
    // console.log('qweqweqwe');
    if (state.email.length >= 1) {
      const delayEmailDebounceFn = setTimeout(() => {
        validateEmail();
      }, 1000);
      return () => clearTimeout(delayEmailDebounceFn);
    }
    return (setEmailError(''), setEmailVerified(false));
    // eslint-disable-next-line
  }, [state.email]);

  function capitalizeFirstLetter(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function handleKeyPress(event: any, type: string) {
    // console.log('qweqweqwe');
    const keyPressed = event.key;
    if (type === 'fName' && /[^A-Za-z'‘]/.test(keyPressed)) {
      event.preventDefault();
    }
    if (type === 'lName' && /[^A-Za-z'‘]/.test(keyPressed)) {
      event.preventDefault();
    }
    if (type === 'password' && keyPressed === ' ') {
      event.preventDefault();
    }
  }

  function handleInputChange(event: any, type: string) {
    // console.log('qweqweqwe');
    let newVal = event.target.value;
    if (type === 'email') {
      if (event.target.value.charAt(0) !== ' ') {
        setIsEmailActive(true);
        newVal = newVal.replace(' ', '').trim();
      }
    } else if (type === 'password') {
      setIsPasswordActive(true);
      newVal = newVal.replace(' ', '').trim();
    } else if (type === 'fName') {
      setIsFNameActive(true);
      if (newVal.length >= 1) {
        newVal = capitalizeFirstLetter(newVal);
      }
      if (newVal.length > 50 || newVal.charAt(0) === '‘' || newVal.charAt(0) === "'" || ((newVal.match(/‘/g) || []).length + (newVal.match(/'/g) || []).length) > 1) {
        newVal = state.fName;
      } else {
        newVal = newVal.replace(/[^A-Za-z'‘]/ig, '').trim();
      }
    } else if (type === 'lName') {
      setIsLNameActive(true);
      if (newVal.length >= 1) {
        newVal = capitalizeFirstLetter(newVal);
      }
      if (newVal.length > 50) {
        newVal = state.lName;
      } else {
        newVal = newVal.replace(/[^A-Za-z'‘]/ig, '').trim();
      }
    }
    setState({ ...state, [type]: newVal });
  }

  function onBlurCheck(type: string) {
    if (type === 'email') {
      setIsEmailActive(false);
    } else if (type === 'fName') {
      if (state.fName === '') {
        setfNameError('');
        setlNameError('');
        setPasswordError('');
      }
      setIsFNameActive(false);
    } else if (type === 'lName') {
      setIsLNameActive(false);
    } else if (type === 'password') {
      setIsPasswordActive(false);
    }
  }

  async function registerUser() {
    const keyVal = Math.floor(Math.random() * 10);
    const jtoken = {
      firstName: state.fName,
      lastName: state.lName,
      emailAddress: state.email.toLowerCase(),
      pwd: state.password,
      trial: true,
    };
    const hash = CryptoJS.HmacSHA512(JSON.stringify(jtoken), Object.values(kineApiKeys)[keyVal]);
    const hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
    GraphQueries.registerUser(state.fName, state.lName, state.email.toLowerCase(), state.password, true, `${kineConfig.HMACType}:${hashInBase64}`, CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(Object.keys(kineApiKeys)[keyVal])))
      .then((response) => {
        // @ts-ignore
        if (response.data.graphQLErrors) {
          setShowToastMsg({ val: true, msg: errorMessages.grapqlError, type: 'error' });
          setIsLoading(false);
        } else {
          const val = response.data.subscribe;
          val.from = 'free';
          const encoded = btoa(JSON.stringify(val));
          navigate(`/verifyemail/${encoded}`);
          setIsLoading(false);
        }
      });
  }

  async function checkRecaptcha() {
    if (emailVerified && state.fName !== '' && state.lName !== '' && validateMailRegExp.test(state.email) && invalidMailDomains.test(state.email) && state.password.length >= kineConfig.pwdlen) {
      if (reCaptchaExpired) {
        // @ts-ignore
        const newtoken = await recaptchaRef.current.executeAsync();
        if (newtoken != null) {
          setIsLoading(true);
          registerUser();
        }
      } else {
        setIsLoading(true);
        registerUser();
      }
    }
  }

  function goToLogin() {
    window.open(kineConfig.kineCapsule);
  }

  const InfoTooltip = withStyles(() => ({
    arrow: {
      color: '#3e3e3e',
    },
    tooltip: {
      backgroundColor: '#3e3e3e',
      color: '#fff',
      fontSize: 12,
      width: '160px',
      padding: '10px',
      border: 'none',
    },
  }))(Tooltip);

  function resetMessage() {
    setShowToastMsg({ val: false, msg: '', type: '' });
  }

  return (
    <>
      <Helmet>
        <title>Kine - Free Trial Registration</title>
      </Helmet>
      {showToastMsg.val ? <SnackBarMsg message={showToastMsg} callback={resetMessage} /> : null}
      <div>
        <ReCAPTCHA
          // @ts-ignore
          ref={recaptchaRef}
          size="invisible"
          sitekey="6LcFPWQaAAAAAJu97GiPmQRkwXfvrCeZxcASC08S"
          onChange={(e: any) => {
            handleCaptchaChange(e);
          }}
        />
      </div>
      <img src={kineLogo} alt="" className={freeTrialRegistrationCSS.kineLogo} />
      <div className={freeTrialRegistrationCSS.registrationContainer}>
        <div className={freeTrialRegistrationCSS.registrationHolder}>
          <div className={freeTrialRegistrationCSS.flexHolder}>
            <div className={freeTrialRegistrationCSS.aboutKine}>
              <div className={freeTrialRegistrationCSS.aboutKineHolder}>
                <p className={freeTrialRegistrationCSS.aboutKineSubHeader}>
                  Ship higher quality software faster.
                </p>
                <p className={freeTrialRegistrationCSS.aboutKineSubHeader}>
                  Retain your best talent.
                </p>
                <p className={freeTrialRegistrationCSS.aboutKineDescription}>
                  {kineTexts.aboutKineDescription}
                </p>
                <div className={`${freeTrialRegistrationCSS.flexHolder} ${freeTrialRegistrationCSS.aboutKinePointsHolder}`}>
                  <img src={kineP1} alt="" className={freeTrialRegistrationCSS.kineApps} />
                  <p className={freeTrialRegistrationCSS.aboutKinePoints}> Intelligent nudges</p>
                </div>
                <div className={`${freeTrialRegistrationCSS.flexHolder} ${freeTrialRegistrationCSS.aboutKinePointsHolder}`}>
                  <img src={kineP2} alt="" className={freeTrialRegistrationCSS.kineApps} />
                  <p className={freeTrialRegistrationCSS.aboutKinePoints}>
                    Self-driven work culture
                  </p>
                </div>
                <div className={`${freeTrialRegistrationCSS.flexHolder} ${freeTrialRegistrationCSS.aboutKinePointsHolder}`}>
                  <img src={kineP3} alt="" className={freeTrialRegistrationCSS.kineApps} />
                  <p className={freeTrialRegistrationCSS.aboutKinePoints}>
                    Real time project insights
                  </p>
                </div>
                <div className={`${freeTrialRegistrationCSS.flexHolder} ${freeTrialRegistrationCSS.aboutKinePointsHolder}`}>
                  <img src={kineP1} alt="" className={freeTrialRegistrationCSS.kineApps} />
                  <p className={freeTrialRegistrationCSS.aboutKinePoints}>
                    Artificial Intelligence based appraisals
                  </p>
                </div>
              </div>
            </div>
            <div className={freeTrialRegistrationCSS.kineFields}>
              <div className={freeTrialRegistrationCSS.kineFieldsHolder}>
                <div className={freeTrialRegistrationCSS.flexHolder}>
                  <div className={freeTrialRegistrationCSS.flexCircle}>
                    <p className={freeTrialRegistrationCSS.stepsNumberText}>
                      1/
                      <span className={freeTrialRegistrationCSS.appColor}>2</span>
                    </p>
                  </div>
                  <div>
                    <p className={freeTrialRegistrationCSS.stepsHeader}>Get Started</p>
                    <p className={freeTrialRegistrationCSS.stepsText}>Free for up to 25 users</p>
                  </div>
                </div>
                <div style={{ margin: '25px 0 0 0' }}>
                  <div className={freeTrialRegistrationCSS.flexHolderSpaceBetween}>
                    <div className={`${freeTrialRegistrationCSS.labelFlexHolder}`}>
                      <CssTextField
                        // eslint-disable-next-line
                        className={fNameError !== '' ? `${freeTrialRegistrationCSS.fNameError} ${classes.root}` : isFNameActive ? `${freeTrialRegistrationCSS.fNameInputFocus}` : `${freeTrialRegistrationCSS.fNameInput}`}
                        value={state.fName}
                        id="fname"
                        label={(isFNameActive || state.fName.length > 0)
                          ? 'First Name'
                          : (
                            <span>
                              <p className={freeTrialRegistrationCSS.mandatoryFields}> * </p>
                              First Name
                              {isFNameActive}
                            </span>
                          )}
                        inputRef={fNameFocus}
                        inputProps={{ maxLength: 50 }}
                        onFocus={() => setIsFNameActive(true)}
                        onBlur={() => onBlurCheck('fName')}
                        onChange={(e) => {
                          handleInputChange(e, 'fName');
                        }}
                        onKeyPress={(event) => {
                          if (event.key === 'Enter') {
                            // @ts-ignore
                            lNameFocus.current.focus();
                          } else {
                            handleKeyPress(event, 'fName');
                          }
                        }}
                        disabled={isLoading}
                      />
                      <p className={freeTrialRegistrationCSS.errorText}>
                        {fNameError}
                      </p>
                    </div>
                    <div className={freeTrialRegistrationCSS.labelFlexHolder}>
                      <CssTextField
                        // eslint-disable-next-line
                        className={lNameError !== '' ? `${freeTrialRegistrationCSS.fNameError} ${classes.root}` : isLNameActive ? `${freeTrialRegistrationCSS.lNameInputFocus}` : `${freeTrialRegistrationCSS.lNameInput}`}
                        value={state.lName}
                        id="lName"
                        label={(isLNameActive || state.lName.length > 0)
                          ? 'Last Name'
                          : (
                            <span>
                              <p className={freeTrialRegistrationCSS.mandatoryFields}> * </p>
                              Last Name
                            </span>
                          )}
                        inputRef={lNameFocus}
                        onFocus={() => setIsLNameActive(true)}
                        onBlur={() => onBlurCheck('lName')}
                        onChange={(e) => {
                          handleInputChange(e, 'lName');
                        }}
                        onKeyPress={(event) => {
                          if (event.key === 'Enter') {
                            // @ts-ignore
                            emailFocus.current.focus();
                          } else {
                            handleKeyPress(event, 'lName');
                          }
                        }}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
                <div style={{ margin: '30px 0 0 0' }}>
                  <div className={freeTrialRegistrationCSS.labelFlexHolder}>
                    <CssTextField
                      // eslint-disable-next-line
                      className={emailError !== '' ? `${freeTrialRegistrationCSS.emailInputError} ${classes.root}` : isEmailActive ? `${freeTrialRegistrationCSS.emailInputFocus}` : `${freeTrialRegistrationCSS.emailInput}`}
                      value={state.email}
                      id="email"
                      label={(isEmailActive || state.email.length > 0)
                        ? 'Work Email'
                        : (
                          <span>
                            <p className={freeTrialRegistrationCSS.mandatoryFields}> * </p>
                            Work Email
                          </span>
                        )}
                      inputRef={emailFocus}
                      onFocus={() => setIsEmailActive(true)}
                      onBlur={() => onBlurCheck('email')}
                      onChange={(e) => {
                        handleInputChange(e, 'email');
                      }}
                      onKeyPress={(event) => {
                        if (event.key === 'Enter') {
                          // @ts-ignore
                          passwordFocus.current.focus();
                        }
                      }}
                      disabled={isLoading}
                    />
                    <img src={info} alt="" className={freeTrialRegistrationCSS.infoImg} />
                    <InfoTooltip
                      placement="top-end"
                      title={(
                        <div>
                          <p style={{ margin: '5px 0 0 0', color: '#fff', fontSize: '12px' }}>Verification mail shall be sent to this email.</p>
                        </div>
                      )}
                      arrow
                    >
                      <img src={info} alt="" className={freeTrialRegistrationCSS.infoImg} />
                    </InfoTooltip>
                    {emailVerified ? <img src={verifiedIcon} alt="" className={freeTrialRegistrationCSS.verifiedIcon} /> : null }
                    <p className={freeTrialRegistrationCSS.errorText}>
                      {emailError}
                      {emailError === errorMessages.emailExists ? (
                        <button type="button" className={freeTrialRegistrationCSS.loginButton} onClick={() => goToLogin()}>
                          Login
                        </button>
                      ) : null}
                    </p>
                  </div>
                </div>
                <div style={{ margin: '30px 0 0 0' }}>
                  <div className={freeTrialRegistrationCSS.labelFlexHolder}>
                    <CssTextField
                      // eslint-disable-next-line
                      className={passwordError !== '' ? `${freeTrialRegistrationCSS.emailInputError} ${classes.root}` : isPasswordActive ? `${freeTrialRegistrationCSS.emailInputFocus}` : `${freeTrialRegistrationCSS.emailInput}`}
                      value={state.password}
                      id="password"
                      label={(isPasswordActive || state.password.length > 0)
                        ? 'Password (Min 16 characters)'
                        : (
                          <span>
                            <p className={freeTrialRegistrationCSS.mandatoryFields}> * </p>
                            Password (Min 16 characters)
                          </span>
                        )}
                      inputRef={passwordFocus}
                      type={showPassword ? 'text' : 'password'}
                      onFocus={() => setIsPasswordActive(true)}
                      onBlur={() => onBlurCheck('password')}
                      onChange={(e) => {
                        handleInputChange(e, 'password');
                      }}
                      onKeyPress={(event) => {
                        if (event.key === 'Enter') {
                          checkRecaptcha();
                        } else {
                          handleKeyPress(event, 'password');
                        }
                      }}
                      disabled={isLoading}
                    />
                    <button
                      className={!showPassword
                        ? freeTrialRegistrationCSS.showPassword
                        : freeTrialRegistrationCSS.hidePassword}
                      onClick={() => { setShowPassword(!showPassword); }}
                      type="button"
                      aria-label="Show/Hide Password"
                    />
                  </div>
                </div>
                {isLoading ? (
                  <button className={freeTrialRegistrationCSS.registerButtonLoading} type="button">
                    <CircularProgress style={{ color: '#fff' }} size={30} />
                  </button>
                ) : (
                  <button className={buttonDisabled ? freeTrialRegistrationCSS.registerButtonDisabled : freeTrialRegistrationCSS.registerButton} type="button" onClick={() => { checkRecaptcha(); }}>
                    Get started today
                  </button>
                )}
                <p className={freeTrialRegistrationCSS.termsText}>
                  By clicking on Get started today, you agree to
                </p>
                <p className={freeTrialRegistrationCSS.termsText}>
                  Kine
                  <span> </span>
                  <span className={freeTrialRegistrationCSS.textUnderline}>Terms of Service</span>
                  <span> </span>
                  and
                  <span> </span>
                  <span className={freeTrialRegistrationCSS.textUnderline}>Privacy Policy</span>
                </p>
                <p className={freeTrialRegistrationCSS.signinText}>
                  Already have an account?
                  <span> </span>
                  <button type="button" onClick={() => goToLogin()} className={freeTrialRegistrationCSS.signinButton}>Sign In</button>
                </p>
              </div>
              <div>
                <div className={freeTrialRegistrationCSS.cardHolder}>
                  <div className={freeTrialRegistrationCSS.flexHolderStart}>
                    <p className={freeTrialRegistrationCSS.cardText}>Free 30 Day Trial</p>
                    <p className={freeTrialRegistrationCSS.cardTextCenter}> | </p>
                    <p className={freeTrialRegistrationCSS.cardText}>No Credit Card Needed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FreeTrialRegistration;
