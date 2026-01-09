/**
 * MainWP Add-on Panel Injection Script
 * Injects an "at a glance" info panel into the TOC sidebar area
 * Handles React hydration timing and SPA navigation
 */
(function() {
  'use strict';

  // Debug mode - set to true to enable console logging
  var DEBUG = false;
  function log() {
    if (DEBUG) console.log.apply(console, ['[addon-panel]'].concat(Array.prototype.slice.call(arguments)));
  }

  // Category pages that should NOT show the panel
  var categoryPages = [
    '/add-ons/overview',
    '/add-ons/bundles',
    '/add-ons/administrative',
    '/add-ons/agency',
    '/add-ons/analytics',
    '/add-ons/backups',
    '/add-ons/client',
    '/add-ons/development',
    '/add-ons/monitoring',
    '/add-ons/performance',
    '/add-ons/posts-pages',
    '/add-ons/security',
    '/add-ons/updates'
  ];

  // Check if current page should show the panel
  function isAddonPage() {
    var path = window.location.pathname.replace(/\/$/, '');
    if (!path.includes('/add-ons/')) return false;
    return !categoryPages.some(function(page) {
      return path === page;
    });
  }

  // Read addon data from data attributes
  function readAddonData(dataEl) {
    return {
      title: dataEl.dataset.title || '',
      purchaseUrl: dataEl.dataset.purchaseUrl || '',
      pricingTier: dataEl.dataset.pricingTier || 'pro',
      bundle: dataEl.dataset.bundle || '',
      addonType: dataEl.dataset.addonType || 'extension',
      version: dataEl.dataset.version || '',
      developer: dataEl.dataset.developer || 'MainWP',
      changelogUrl: dataEl.dataset.changelogUrl || '',
      videoUrl: dataEl.dataset.videoUrl || '',
      requirements: dataEl.dataset.requirements || '',
      integratesWith: dataEl.dataset.integratesWith || '',
      thirdPartyPlugin: dataEl.dataset.thirdPartyPlugin || '',
      ownedBy: dataEl.dataset.ownedBy || 'Jestart LLC',
      privacyUrl: dataEl.dataset.privacyUrl || 'https://mainwp.com/mainwp-plugin-privacy-policy/'
    };
  }

  // Main initialization
  function init() {
    log('init() - path:', window.location.pathname, 'isAddonPage:', isAddonPage());

    // Remove existing panel if navigating away from add-on page
    var existingPanel = document.querySelector('.addon-panel');
    if (existingPanel && !isAddonPage()) {
      log('Removing panel (not on add-on page)');
      existingPanel.remove();
      return;
    }

    if (!isAddonPage()) return;

    var dataEl = document.getElementById('addon-data');
    if (!dataEl) {
      log('No addon-data element found, waiting...');
      waitForElement('#addon-data', function() { init(); }, 10000);
      return;
    }

    var data = readAddonData(dataEl);
    waitForToc(function(tocContainer) {
      insertPanel(tocContainer, data);
    });
  }

  // Wait for TOC using MutationObserver
  function waitForToc(callback) {
    var tocContainer = document.getElementById('table-of-contents');
    var tocList = tocContainer && tocContainer.querySelector('ul');

    if (tocList) {
      log('TOC ready immediately');
      callback(tocContainer);
      return;
    }

    log('Waiting for TOC with MutationObserver');
    var startTime = Date.now();
    var timeout = 10000; // 10 second max

    var observer = new MutationObserver(function() {
      var toc = document.getElementById('table-of-contents');
      var list = toc && toc.querySelector('ul');

      if (list) {
        observer.disconnect();
        log('TOC ready after', Date.now() - startTime, 'ms');
        callback(toc);
      } else if (Date.now() - startTime > timeout) {
        observer.disconnect();
        log('Timeout waiting for TOC');
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(function() { observer.disconnect(); }, timeout);
  }

  // Wait for any element
  function waitForElement(selector, callback, timeout) {
    var startTime = Date.now();
    var observer = new MutationObserver(function() {
      if (document.querySelector(selector)) {
        observer.disconnect();
        callback();
      } else if (Date.now() - startTime > timeout) {
        observer.disconnect();
        log('Timeout waiting for', selector);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(function() { observer.disconnect(); }, timeout);
  }

  // Insert panel after TOC
  function insertPanel(tocContainer, data) {
    if (tocContainer.querySelector('.addon-panel')) {
      log('Panel already exists');
      return;
    }

    var tocList = tocContainer.querySelector('ul');
    if (!tocList) {
      log('No TOC list found');
      return;
    }

    tocList.insertAdjacentElement('afterend', buildAddonPanel(data));
    log('Panel inserted');
  }

  // Watch for panel removal (React re-renders) with throttling
  function watchForPanelRemoval() {
    var pending = false;

    var observer = new MutationObserver(function() {
      if (pending) return; // Throttle rapid calls
      if (isAddonPage() && !document.querySelector('.addon-panel')) {
        pending = true;
        log('Panel was removed, re-injecting...');
        setTimeout(function() {
          init();
          pending = false;
        }, 50);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    log('Panel removal watcher active');
  }

  // Handle SPA navigation
  function setupNavigationHandlers() {
    var currentUrl = window.location.href;

    function handleNavigation() {
      var newUrl = window.location.href;
      if (newUrl !== currentUrl) {
        currentUrl = newUrl;
        log('Navigation detected:', newUrl);
        // Delay to let React render new page content
        setTimeout(init, 150);
      }
    }

    // Intercept History API
    var pushState = history.pushState;
    history.pushState = function() {
      pushState.apply(this, arguments);
      handleNavigation();
    };

    var replaceState = history.replaceState;
    history.replaceState = function() {
      replaceState.apply(this, arguments);
      handleNavigation();
    };

    window.addEventListener('popstate', handleNavigation);
    log('Navigation handlers installed');
  }

  function buildAddonPanel(data) {
    var panel = createElement('div', 'addon-panel');

    // CTA Card
    var ctaCard = createElement('div', 'addon-panel__cta-card');

    var ctaButton = createElement('a', 'addon-panel__cta-button');
    ctaButton.href = data.purchaseUrl || '#';
    ctaButton.textContent = 'GET THIS ADD-ON';
    ctaCard.appendChild(ctaButton);

    var bundleNote = createElement('p', 'addon-panel__bundle-note');
    var checkmark = createElement('span', 'addon-panel__checkmark');
    checkmark.textContent = '✓ ';
    bundleNote.appendChild(checkmark);
    bundleNote.appendChild(document.createTextNode(
      data.bundle ? 'Available in the ' + data.bundle : 'Available now'
    ));
    ctaCard.appendChild(bundleNote);

    panel.appendChild(ctaCard);

    // Tag Pills Grid
    var tagsGrid = createElement('div', 'addon-panel__tags');

    // Pricing tier pill
    var pricingPill = createElement('span', 'addon-panel__tag addon-panel__tag--outline');
    pricingPill.textContent = data.pricingTier === 'free' ? 'Free' : 'Pro';
    tagsGrid.appendChild(pricingPill);

    // Type pill
    var typePill = createElement('span', 'addon-panel__tag addon-panel__tag--filled');
    typePill.textContent = data.addonType === 'integration' ? 'Integration' : 'Extension';
    tagsGrid.appendChild(typePill);

    // Version pill (clickable if changelog URL exists)
    var versionPill = createElement('span', 'addon-panel__tag');
    var versionLabel = createElement('span', 'addon-panel__tag-label');
    versionLabel.textContent = 'Version';
    if (data.changelogUrl) {
      var versionLink = createElement('a', 'addon-panel__tag-value addon-panel__version-link');
      versionLink.href = data.changelogUrl;
      versionLink.target = '_blank';
      versionLink.textContent = data.version || 'N/A';
      var linkIcon = createElement('span', 'addon-panel__link-icon-small');
      linkIcon.textContent = ' ↗';
      versionLink.appendChild(linkIcon);
      versionPill.appendChild(versionLabel);
      versionPill.appendChild(versionLink);
    } else {
      var versionValue = createElement('span', 'addon-panel__tag-value');
      versionValue.textContent = data.version || 'N/A';
      versionPill.appendChild(versionLabel);
      versionPill.appendChild(versionValue);
    }
    tagsGrid.appendChild(versionPill);

    // Developer pill
    var devPill = createElement('span', 'addon-panel__tag');
    var devLabel = createElement('span', 'addon-panel__tag-label');
    devLabel.textContent = 'Developer';
    var devValue = createElement('span', 'addon-panel__tag-value');
    devValue.textContent = data.developer || 'MainWP';
    devPill.appendChild(devLabel);
    devPill.appendChild(devValue);
    tagsGrid.appendChild(devPill);

    panel.appendChild(tagsGrid);

    // Data Privacy Info Box - only show for integrations (third-party companies)
    if (data.addonType === 'integration') {
      var infoBox = createElement('div', 'addon-panel__info addon-panel__info--privacy');
      var infoContent = createElement('div', 'addon-panel__info-content');

      // Integrates with [Service] by [Company]
      var serviceName = data.integratesWith || data.thirdPartyPlugin;
      var companyName = data.ownedBy || 'Jestart LLC';

      var integratesItem = createElement('div', 'addon-panel__info-item');
      var integratesIcon = createElement('span', 'addon-panel__info-item-icon');
      integratesIcon.textContent = '⚡';
      var integratesText = createElement('span', 'addon-panel__info-item-text');

      if (serviceName) {
        integratesText.textContent = 'Integrates with ' + serviceName + ' by ' + companyName;
      } else {
        integratesText.textContent = 'Service by ' + companyName;
      }

      integratesItem.appendChild(integratesIcon);
      integratesItem.appendChild(integratesText);
      infoContent.appendChild(integratesItem);

      // Privacy Policy link
      var privacyItem = createElement('div', 'addon-panel__info-item');
      var privacyIcon = createElement('span', 'addon-panel__info-item-icon');
      privacyIcon.textContent = '📝';
      var privacyLink = createElement('a', 'addon-panel__info-item-link');
      privacyLink.href = data.privacyUrl;
      privacyLink.target = '_blank';
      privacyLink.textContent = (data.ownedBy || 'Developer') + ' Privacy Policy';
      privacyItem.appendChild(privacyIcon);
      privacyItem.appendChild(privacyLink);
      infoContent.appendChild(privacyItem);

      infoBox.appendChild(infoContent);
      panel.appendChild(infoBox);
    }

    // 101 Video (if available)
    if (data.videoUrl) {
      var videoHeader = createElement('h4', 'addon-panel__section-header');
      videoHeader.textContent = '101 Video';
      panel.appendChild(videoHeader);

      var videoLinks = createElement('div', 'addon-panel__links');
      var videoLink = createElement('a', 'addon-panel__link');
      videoLink.href = data.videoUrl;
      videoLink.target = '_blank';
      var videoIcon = createElement('span', 'addon-panel__link-icon');
      videoIcon.textContent = '🎬';
      videoLink.appendChild(videoIcon);
      videoLink.appendChild(document.createTextNode(' Watch Tutorial'));
      videoLinks.appendChild(videoLink);
      panel.appendChild(videoLinks);
    }

    // Additional Info (if available)
    if (data.requirements || data.additionalInfo) {
      var additionalHeader = createElement('h4', 'addon-panel__section-header');
      additionalHeader.textContent = 'Additional Info';
      panel.appendChild(additionalHeader);

      var additionalText = createElement('p', 'addon-panel__additional-text');
      additionalText.textContent = data.additionalInfo || data.requirements;
      panel.appendChild(additionalText);
    }

    return panel;
  }

  // Helper function to create elements safely
  function createElement(tag, className) {
    var el = document.createElement(tag);
    if (className) {
      el.className = className;
    }
    return el;
  }

  // Expose for debugging
  window.__addonPanelInit = init;

  // Initialize
  setupNavigationHandlers();
  watchForPanelRemoval();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
