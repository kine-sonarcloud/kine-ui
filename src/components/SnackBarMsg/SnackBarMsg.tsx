import React, { useState, useEffect } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { makeStyles, Theme } from '@material-ui/core/styles';

function SnackBarMsg(props: any) {
  const {
    message,
    callback,
  } = props;
  const [showToastMsg, setShowToastMsg] = useState({ val: true, msg: '', type: '' });

  useEffect(() => {
    setShowToastMsg({
      val: message.val,
      msg: message.msg,
      type: message.type,
    });
  }, []);

  function Alert(alertprops: AlertProps) {
    // eslint-disable-next-line
    return <MuiAlert elevation={6} variant="filled" {...alertprops} />;
  }

  const alertStyles = makeStyles((theme: Theme) => ({
    root: {
      width: '100%',
      '& > * + *': {
        marginTop: theme.spacing(2),
        backgroundColor: '#424242',
      },
    },
  }));
  const alertclasses = alertStyles();

  return (
    <>
      <div className={alertclasses.root}>
        <Snackbar
          open={showToastMsg.val}
          autoHideDuration={4000}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          onClose={() => {
            setShowToastMsg({ val: false, msg: '', type: 'success' });
            callback();
          }}
        >
          {showToastMsg.type === 'success' ? (
            <Alert
              severity="success"
              style={{ backgroundColor: '#32cd32', color: '#fff' }}
              onClose={() => {
                setShowToastMsg({ val: false, msg: '', type: '' });
                callback();
              }}
            >
              {showToastMsg.msg}
            </Alert>
          ) : (
            <Alert
              severity="warning"
              style={{ backgroundColor: '#f4473c', color: '#fff' }}
              onClose={() => {
                setShowToastMsg({ val: false, msg: '', type: '' });
                callback();
              }}
            >
              {showToastMsg.msg}
            </Alert>
          )}
        </Snackbar>
      </div>
    </>
  );
}

export default SnackBarMsg;
