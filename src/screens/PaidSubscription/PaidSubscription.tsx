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
import paidSubscriptionCSS from './paidSubscription.module.scss';
import kineLogo from '../../assets/images/Kine-Logo.png';
import kineP1 from '../../assets/images/kineP1.svg';
import kineP2 from '../../assets/images/kineP2.svg';
import kineP3 from '../../assets/images/kineP3.svg';
import SnackBarMsg from '../../components/SnackBarMsg/SnackBarMsg';
import info from '../../assets/images/info.svg';
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

function PaidSubscription(props: any) {
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
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [reCaptchaExpired, setReCaptchaExpired] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showToastMsg, setShowToastMsg] = useState({ val: false, msg: '', type: '' });
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
        navigate('/paidsubscription');
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
    let newVal = event.target.value;
    if (type === 'email') {
      if (event.target.value.charAt(0) !== ' ') {
        setIsEmailActive(true);
        // newVal = newVal.toLowerCase();
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
      trial: false,
    };
    const hash = CryptoJS.HmacSHA512(JSON.stringify(jtoken), Object.values(kineApiKeys)[keyVal]);
    const hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
    GraphQueries.registerUser(state.fName, state.lName, state.email.toLowerCase(), state.password, false, `${kineConfig.HMACType}:${hashInBase64}`, CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(Object.keys(kineApiKeys)[keyVal])))
      .then((response) => {
        // @ts-ignore
        if (response.data.graphQLErrors) {
          setShowToastMsg({ val: true, msg: errorMessages.grapqlError, type: 'error' });
          setIsLoading(false);
        } else {
          const val = response.data.subscribe;
          val.from = 'paid';
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
        <title>Kine - Registration</title>
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
      <img src={kineLogo} alt="" className={paidSubscriptionCSS.kineLogo} />
      <div className={paidSubscriptionCSS.registrationContainer}>
        <div className={paidSubscriptionCSS.registrationHolder}>
          <div className={paidSubscriptionCSS.flexHolder}>
            <div className={paidSubscriptionCSS.aboutKine}>
              <div className={paidSubscriptionCSS.aboutKineHolder}>
                <p className={paidSubscriptionCSS.aboutKineSubHeader}>
                  Ship higher quality software faster.
                </p>
                <p className={paidSubscriptionCSS.aboutKineSubHeader}>
                  Retain your best talent.
                </p>
                <p className={paidSubscriptionCSS.aboutKineDescription}>
                  {kineTexts.aboutKineDescription}
                </p>
                <div className={`${paidSubscriptionCSS.flexHolder} ${paidSubscriptionCSS.aboutKinePointsHolder}`}>
                  <img src={kineP1} alt="" className={paidSubscriptionCSS.kineApps} />
                  <p className={paidSubscriptionCSS.aboutKinePoints}> Intelligent nudges</p>
                </div>
                <div className={`${paidSubscriptionCSS.flexHolder} ${paidSubscriptionCSS.aboutKinePointsHolder}`}>
                  <img src={kineP2} alt="" className={paidSubscriptionCSS.kineApps} />
                  <p className={paidSubscriptionCSS.aboutKinePoints}>
                    Self-driven work culture
                  </p>
                </div>
                <div className={`${paidSubscriptionCSS.flexHolder} ${paidSubscriptionCSS.aboutKinePointsHolder}`}>
                  <img src={kineP3} alt="" className={paidSubscriptionCSS.kineApps} />
                  <p className={paidSubscriptionCSS.aboutKinePoints}>
                    Real time project insights
                  </p>
                </div>
                <div className={`${paidSubscriptionCSS.flexHolder} ${paidSubscriptionCSS.aboutKinePointsHolder}`}>
                  <img src={kineP1} alt="" className={paidSubscriptionCSS.kineApps} />
                  <p className={paidSubscriptionCSS.aboutKinePoints}>
                    Artificial Intelligence based appraisals
                  </p>
                </div>
              </div>
            </div>
            <div className={paidSubscriptionCSS.kineFields}>
              <div className={paidSubscriptionCSS.kineFieldsHolder}>
                <div className={paidSubscriptionCSS.flexHolder}>
                  <div className={paidSubscriptionCSS.flexCircle}>
                    <p className={paidSubscriptionCSS.stepsNumberText}>
                      1/
                      <span className={paidSubscriptionCSS.appColor}>2</span>
                    </p>
                  </div>
                  <div>
                    <p className={paidSubscriptionCSS.stepsHeader}>Get Started</p>
                  </div>
                </div>
                <div style={{ margin: '25px 0 0 0' }}>
                  <div className={paidSubscriptionCSS.flexHolderSpaceBetween}>
                    <div className={`${paidSubscriptionCSS.labelFlexHolder}`}>
                      <CssTextField
                        // eslint-disable-next-line
                        className={fNameError !== '' ? `${paidSubscriptionCSS.fNameError} ${classes.root}` : isFNameActive ? `${paidSubscriptionCSS.fNameInputFocus}` : `${paidSubscriptionCSS.fNameInput}`}
                        value={state.fName}
                        id="fname"
                        label={(isFNameActive || state.fName.length > 0)
                          ? 'First Name'
                          : (
                            <span>
                              <p className={paidSubscriptionCSS.mandatoryFields}> * </p>
                              First Name
                            </span>
                          )}
                        inputRef={fNameFocus}
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
                      <p className={paidSubscriptionCSS.errorText}>
                        {fNameError}
                      </p>
                    </div>
                    <div className={paidSubscriptionCSS.labelFlexHolder}>
                      <CssTextField
                        // eslint-disable-next-line
                        className={lNameError !== '' ? `${paidSubscriptionCSS.fNameError} ${classes.root}` : isLNameActive ? `${paidSubscriptionCSS.lNameInputFocus}` : `${paidSubscriptionCSS.lNameInput}`}
                        value={state.lName}
                        id="lName"
                        label={(isLNameActive || state.lName.length > 0)
                          ? 'Last Name'
                          : (
                            <span>
                              <p className={paidSubscriptionCSS.mandatoryFields}> * </p>
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
                  <div className={paidSubscriptionCSS.labelFlexHolder}>
                    <CssTextField
                      // eslint-disable-next-line
                      className={emailError !== '' ? `${paidSubscriptionCSS.emailInputError} ${classes.root}` : isEmailActive ? `${paidSubscriptionCSS.emailInputFocus}` : `${paidSubscriptionCSS.emailInput}`}
                      value={state.email}
                      id="email"
                      label={(isEmailActive || state.email.length > 0)
                        ? 'Work Email'
                        : (
                          <span>
                            <p className={paidSubscriptionCSS.mandatoryFields}> * </p>
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
                        } else {
                          handleKeyPress(event, 'email');
                        }
                      }}
                      disabled={isLoading}
                    />
                    <img src={info} alt="" className={paidSubscriptionCSS.infoImg} />
                    <InfoTooltip
                      placement="top-end"
                      title={(
                        <div>
                          {/* <b style={{ fontSize: '10px' }}>WHY EMAIL ADDRESS</b> */}
                          <p style={{ margin: '5px 0 0 0', color: '#fff', fontSize: '12px' }}>Verification mail shall be sent to this email.</p>
                        </div>
                      )}
                      arrow
                    >
                      <img src={info} alt="" className={paidSubscriptionCSS.infoImg} />
                    </InfoTooltip>
                    {emailVerified ? <img src={verifiedIcon} alt="" className={paidSubscriptionCSS.verifiedIcon} /> : null }
                    <p className={paidSubscriptionCSS.errorText}>
                      {emailError}
                      {emailError === errorMessages.emailExists ? (
                        <button type="button" className={paidSubscriptionCSS.loginButton} onClick={() => goToLogin()}>
                          Login
                        </button>
                      ) : null}
                    </p>
                  </div>
                </div>
                <div style={{ margin: '30px 0 0 0' }}>
                  <div className={paidSubscriptionCSS.labelFlexHolder}>
                    <CssTextField
                      // eslint-disable-next-line
                      className={passwordError !== '' ? `${paidSubscriptionCSS.emailInputError} ${classes.root}` : isPasswordActive ? `${paidSubscriptionCSS.emailInputFocus}` : `${paidSubscriptionCSS.emailInput}`}
                      value={state.password}
                      id="password"
                      label={(isPasswordActive || state.password.length > 0)
                        ? 'Password (Min 16 characters)'
                        : (
                          <span>
                            <p className={paidSubscriptionCSS.mandatoryFields}> * </p>
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
                        ? paidSubscriptionCSS.showPassword
                        : paidSubscriptionCSS.hidePassword}
                      onClick={() => { setShowPassword(!showPassword); }}
                      type="button"
                      aria-label="Show/Hide Password"
                    />
                  </div>
                </div>
                {isLoading ? (
                  <button className={paidSubscriptionCSS.registerButtonLoading} type="button">
                    <CircularProgress style={{ color: '#fff' }} size={30} />
                  </button>
                ) : (
                  <button className={buttonDisabled ? paidSubscriptionCSS.registerButtonDisabled : paidSubscriptionCSS.registerButton} type="button" onClick={() => { checkRecaptcha(); }}>
                    Get started today
                  </button>
                )}
                <p className={paidSubscriptionCSS.termsText}>
                  By clicking on Get started today, you agree to
                </p>
                <p className={paidSubscriptionCSS.termsText}>
                  Kine
                  <span> </span>
                  <span className={paidSubscriptionCSS.textUnderline}>Terms of Service</span>
                  <span> </span>
                  and
                  <span> </span>
                  <span className={paidSubscriptionCSS.textUnderline}>Privacy Policy</span>
                </p>
                <p className={paidSubscriptionCSS.signinText}>
                  Already have an account?
                  <span> </span>
                  <button type="button" onClick={() => goToLogin()} className={paidSubscriptionCSS.signinButton}>Sign In</button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PaidSubscription;
