// Google Button Text Fix Utility
// This script removes unwanted text from Google OAuth buttons

export const fixGoogleButtonText = () => {
  // Wait for Google button to load and then clean it up
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          // Find Google button elements
          const googleButtons = node.querySelectorAll('[data-testid*="google"], .gsi-material-button, iframe[src*="accounts.google.com"]');
          googleButtons.forEach(cleanGoogleButton);
          
          // Also check if the node itself is a Google button
          if (node.matches && (node.matches('[data-testid*="google"]') || node.matches('.gsi-material-button'))) {
            cleanGoogleButton(node);
          }
        }
      });
    });
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Also clean existing buttons
  setTimeout(() => {
    cleanAllGoogleButtons();
  }, 1000);

  // Clean again after a longer delay
  setTimeout(() => {
    cleanAllGoogleButtons();
  }, 3000);
};

const cleanGoogleButton = (button) => {
  if (!button) return;

  try {
    // Remove title attribute that shows "Opens in new tab"
    if (button.title) {
      button.removeAttribute('title');
    }

    // Remove aria-label if it contains unwanted text
    if (button.getAttribute('aria-label') && button.getAttribute('aria-label').includes('tab')) {
      button.removeAttribute('aria-label');
    }

    // Clean iframe content if accessible
    if (button.tagName === 'IFRAME') {
      try {
        const iframeDoc = button.contentDocument || button.contentWindow.document;
        if (iframeDoc) {
          const elements = iframeDoc.querySelectorAll('*');
          elements.forEach(el => {
            if (el.title && el.title.includes('tab')) {
              el.removeAttribute('title');
            }
            if (el.textContent && el.textContent.includes('Opens in new tab')) {
              el.textContent = el.textContent.replace('Opens in new tab', '').trim();
            }
          });
        }
      } catch (e) {
        // Cross-origin iframe, can't access content
      }
    }

    // Clean direct text content
    const textNodes = getTextNodes(button);
    textNodes.forEach(textNode => {
      if (textNode.textContent.includes('Opens in new tab')) {
        textNode.textContent = textNode.textContent.replace('Opens in new tab', '').trim();
      }
      if (textNode.textContent.includes('. Opens in new tab')) {
        textNode.textContent = textNode.textContent.replace('. Opens in new tab', '').trim();
      }
    });

    // Clean all child elements
    const allElements = button.querySelectorAll('*');
    allElements.forEach(el => {
      if (el.title && (el.title.includes('tab') || el.title.includes('Opens'))) {
        el.removeAttribute('title');
      }
      if (el.getAttribute('aria-label') && el.getAttribute('aria-label').includes('tab')) {
        el.removeAttribute('aria-label');
      }
    });

  } catch (error) {
  }
};

const getTextNodes = (element) => {
  const textNodes = [];
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let node;
  while ((node = walker.nextNode())) {
    textNodes.push(node);
  }
  
  return textNodes;
};

const cleanAllGoogleButtons = () => {
  // Find all possible Google button selectors
  const selectors = [
    '[data-testid*="google"]',
    '.gsi-material-button',
    'iframe[src*="accounts.google.com"]',
    'div[role="button"][aria-label*="Google"]',
    'button[aria-label*="Google"]',
    '[title*="Google"]'
  ];

  selectors.forEach(selector => {
    try {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach(cleanGoogleButton);
    } catch (e) {
    }
  });
};

// Auto-start the fix when imported
if (typeof window !== 'undefined') {
  // Start immediately
  fixGoogleButtonText();
  
  // Also start on DOM content loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixGoogleButtonText);
  }
  
  // Start on window load as backup
  window.addEventListener('load', () => {
    setTimeout(fixGoogleButtonText, 500);
  });
}
