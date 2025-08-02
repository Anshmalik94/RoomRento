import React, { useEffect, useState } from "react";
import "animate.css";
import './InstallPWAButton.css';

function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstallStatus = () => {
      // Check for standalone mode (PWA installed)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // Check for iOS standalone mode
      const isIOSStandalone = window.navigator.standalone === true;
      // Check if app was installed before (using localStorage)
      const wasInstalled = localStorage.getItem('roomrento-pwa-installed') === 'true';
      
      const installed = isStandalone || isIOSStandalone || wasInstalled;
      setIsInstalled(installed);
      
      if (installed) {
        setShowButton(false);
        setShowIosPrompt(false);
        return true;
      }
      return false;
    };

    // Initial check
    if (checkInstallStatus()) {
      return;
    }

    // Handle install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Handle app installed event
    const appInstalledHandler = () => {
      setIsInstalled(true);
      setShowButton(false);
      setShowIosPrompt(false);
      localStorage.setItem('roomrento-pwa-installed', 'true');
    };
    window.addEventListener('appinstalled', appInstalledHandler);

    // Handle iOS prompt
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    const isInStandaloneMode = "standalone" in window.navigator && window.navigator.standalone;
    const iosPromptSeen = localStorage.getItem('roomrento-ios-prompt-seen') === 'true';
    
    if (isIos && !isInStandaloneMode && !isInstalled && !iosPromptSeen) {
      setShowIosPrompt(true);
    }

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e) => {
      if (e.matches) {
        setIsInstalled(true);
        setShowButton(false);
        setShowIosPrompt(false);
        localStorage.setItem('roomrento-pwa-installed', 'true');
      }
    };
    mediaQuery.addListener(handleDisplayModeChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener('appinstalled', appInstalledHandler);
      mediaQuery.removeListener(handleDisplayModeChange);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          // Mark as installed when user accepts
          setIsInstalled(true);
          localStorage.setItem('roomrento-pwa-installed', 'true');
        }
        setDeferredPrompt(null);
        setShowButton(false);
      });
    }
  };

  const handleIosPromptClose = () => {
    setShowIosPrompt(false);
    // Mark iOS prompt as seen to avoid showing again
    localStorage.setItem('roomrento-ios-prompt-seen', 'true');
  };

  return (
    <div className="pwa-install-container">
      {!isInstalled && showButton && (
        <div className="animate__animated animate__fadeInUp pwa-install-button-wrapper" style={{ animationDuration: "1s" }}>
          <button 
            className="btn pwa-install-btn shadow-lg rounded-pill px-4 py-3 d-flex align-items-center gap-2" 
            onClick={handleInstallClick}
          >
            <i className="bi bi-download"></i>
            <span>Install RoomRento App</span>
          </button>
        </div>
      )}

      {!isInstalled && showIosPrompt && (
        <div className="animate__animated animate__fadeInUp" style={{ animationDuration: "1s" }}>
          <div className="alert alert-info ios-install-prompt shadow-sm rounded-4 position-relative" role="alert">
            <button 
              type="button" 
              className="btn-close position-absolute top-0 end-0 m-2" 
              aria-label="Close"
              onClick={handleIosPromptClose}
            ></button>
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-phone text-primary fs-4"></i>
              <strong>Install RoomRento on iPhone</strong>
            </div>
            <p className="mb-0 small">
              Tap <i className="bi bi-share"></i> <strong>Share</strong> and select{" "}
              <strong>Add to Home Screen</strong> for the best experience.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default InstallPWAButton;
