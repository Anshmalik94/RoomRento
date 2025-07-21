import React from 'react';

function GreetingMessage({ userInfo, isLoggedIn }) {
  if (!isLoggedIn || !userInfo.name) {
    return null;
  }

  return (
    <div className="greeting-message py-2 px-3 mb-3" style={{
      background: 'linear-gradient(135deg, #6f42c1 0%, #8b5cf6 100%)',
      borderRadius: '8px',
      color: 'white',
      fontSize: '0.9rem',
      textAlign: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <i className="bi bi-hand-index me-2"></i>
      Hi {userInfo.name}! Welcome back to RoomRento
    </div>
  );
}

export default GreetingMessage;