import React, { useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import './ToastMessage.css';

const ToastMessage = ({ show, onClose, message, type = 'info', duration = 4000 }) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const getToastVariant = () => {
    switch (type) {
      case 'success':
        return 'success';
      case 'danger':
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  };

  const getToastIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'danger':
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getHeaderText = () => {
    switch (type) {
      case 'success':
        return 'Success';
      case 'danger':
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'info':
      default:
        return 'Info';
    }
  };

  return (
    <ToastContainer 
      position="top-end" 
      className="toast-container-custom p-3"
    >
      <Toast 
        show={show} 
        onClose={onClose}
        bg={getToastVariant()}
        className="text-white"
      >
        <Toast.Header>
          <span className="me-2" style={{ fontSize: '16px' }}>{getToastIcon()}</span>
          <strong className="me-auto">{getHeaderText()}</strong>
          <small>just now</small>
        </Toast.Header>
        <Toast.Body>
          {message}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default ToastMessage;
