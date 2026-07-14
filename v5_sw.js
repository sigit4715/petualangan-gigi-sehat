/* Petualangan Gigi Sehat — Service Worker registration + PWA install prompt
 * Loaded from index.html (or any page) to enable offline support,
 * show an "Install app" banner, and display an online/offline indicator.
 */
(function () {
  'use strict';

  // --- 1. Register the service worker -------------------------------------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js')
        .then(function (registration) {
          console.log('[GigiSehat] Service worker registered:', registration.scope);
        })
        .catch(function (error) {
          console.warn('[GigiSehat] Service worker registration failed:', error);
        });
    });
  }

  // --- 2. PWA install prompt / banner -------------------------------------
  var deferredPrompt = null;
  var installBanner = null;

  function buildInstallBanner() {
    if (installBanner) return installBanner;

    var banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Pasang aplikasi');
    banner.innerHTML =
      '<span class="pwa-banner-emoji">🦷</span>' +
      '<span class="pwa-banner-text">Pasang <b>Petualangan Gigi Sehat</b> di layar utama!</span>' +
      '<button type="button" id="pwa-install-yes">Pasang</button>' +
      '<button type="button" id="pwa-install-no" aria-label="Tutup">✕</button>';

    // Styles
    var style = document.createElement('style');
    style.textContent =
      '#pwa-install-banner{' +
      'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);' +
      'z-index:1500;display:flex;align-items:center;gap:10px;' +
      'max-width:90vw;padding:10px 14px;border-radius:16px;' +
      'background:#FF6B9D;color:#fff;font-family:sans-serif;font-size:14px;' +
      'box-shadow:0 6px 20px rgba(255,107,157,.45);}' +
      '.pwa-banner-emoji{font-size:22px;}' +
      '#pwa-install-banner button{' +
      'border:none;border-radius:10px;padding:6px 12px;cursor:pointer;' +
      'font-size:13px;font-weight:bold;}' +
      '#pwa-install-yes{background:#fff;color:#FF6B9D;}' +
      '#pwa-install-no{background:transparent;color:#fff;font-size:16px;}';
    document.head.appendChild(style);

    document.body.appendChild(banner);

    banner.querySelector('#pwa-install-yes').addEventListener('click', function () {
      hideBanner();
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function () {
          deferredPrompt = null;
        });
      }
    });
    banner.querySelector('#pwa-install-no').addEventListener('click', hideBanner);

    installBanner = banner;
    return banner;
  }

  function showBanner() {
    buildInstallBanner();
    if (installBanner) installBanner.style.display = 'flex';
  }

  function hideBanner() {
    if (installBanner) installBanner.style.display = 'none';
  }

  window.addEventListener('beforeinstallprompt', function (event) {
    // Prevent the mini-infobar from appearing on mobile.
    event.preventDefault();
    deferredPrompt = event;
    showBanner();
  });

  window.addEventListener('appinstalled', function () {
    deferredPrompt = null;
    hideBanner();
    console.log('[GigiSehat] App installed');
  });

  // --- 3. Online / offline visual indicator -------------------------------
  var statusDot = null;

  function buildStatusIndicator() {
    if (statusDot) return statusDot;

    var el = document.createElement('div');
    el.id = 'pwa-conn-status';
    el.title = 'Status koneksi';
    var style = document.createElement('style');
    style.textContent =
      '#pwa-conn-status{' +
      'position:fixed;top:12px;left:12px;right:auto;z-index:1500;' +
      'display:flex;align-items:center;gap:6px;' +
      'padding:6px 10px;border-radius:999px;' +
      'font-family:sans-serif;font-size:12px;font-weight:bold;' +
      'color:#fff;background:#34C759;box-shadow:0 2px 8px rgba(0,0,0,.2);' +
      'transition:background .2s ease;}' +
      '#pwa-conn-status.offline{background:#FF3B30;}' +
      '#pwa-conn-status .dot{' +
      'width:8px;height:8px;border-radius:50%;background:#fff;}';
    document.head.appendChild(style);
    el.innerHTML = '<span class="dot"></span><span class="label">Online</span>';
    document.body.appendChild(el);
    statusDot = el;
    return el;
  }

  function updateOnlineStatus() {
    buildStatusIndicator();
    var label = statusDot.querySelector('.label');
    if (navigator.onLine) {
      statusDot.classList.remove('offline');
      label.textContent = 'Online';
    } else {
      statusDot.classList.add('offline');
      label.textContent = 'Offline';
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  document.addEventListener('DOMContentLoaded', updateOnlineStatus);
  // In case DOMContentLoaded already fired.
  if (document.readyState !== 'loading') updateOnlineStatus();
})();
