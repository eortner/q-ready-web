/* ==========================================================================
   Q-Readiness i18n — lightweight translation engine
   ========================================================================== */
(function () {
  'use strict';

  var supported = ['en', 'ja'];
  var defaultLang = 'en';
  var storageKey = 'qreadiness_lang';

  var I18n = {
    currentLang: defaultLang,
    strings: {},

    init: function () {
      var lang = this.detect();
      this.load(lang);
    },

    detect: function () {
      var saved = localStorage.getItem(storageKey);
      if (saved && supported.indexOf(saved) !== -1) return saved;
      var browser = (navigator.language || '').split('-')[0];
      if (supported.indexOf(browser) !== -1) return browser;
      return defaultLang;
    },

    load: function (lang) {
      var self = this;
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'locales/' + lang + '.json', true);
      xhr.onload = function () {
        if (xhr.status === 200) {
          self.strings = JSON.parse(xhr.responseText);
          self.currentLang = lang;
          self.apply();
          localStorage.setItem(storageKey, lang);
        }
      };
      xhr.send();
    },

    switchTo: function (lang) {
      this.load(lang);
    },

    t: function (key) {
      var parts = key.split('.');
      var val = this.strings;
      for (var i = 0; i < parts.length; i++) {
        if (!val) return key;
        val = val[parts[i]];
      }
      return val || key;
    },

    apply: function () {
      var self = this;
      var elements = document.querySelectorAll('[data-i18n]');
      for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        var key = el.getAttribute('data-i18n');
        var val = self.t(key);
        if (val) el.innerHTML = val;
      }
      var ph = document.querySelectorAll('[data-i18n-placeholder]');
      for (var j = 0; j < ph.length; j++) {
        var el2 = ph[j];
        var k2 = el2.getAttribute('data-i18n-placeholder');
        var v2 = self.t(k2);
        if (v2) el2.setAttribute('placeholder', v2);
      }
      var attrs = document.querySelectorAll('[data-i18n-aria]');
      for (var k = 0; k < attrs.length; k++) {
        var el3 = attrs[k];
        var k3 = el3.getAttribute('data-i18n-aria');
        var v3 = self.t(k3);
        if (v3) el3.setAttribute('aria-label', v3);
      }
      var sel = document.getElementById('langSelect');
      if (sel) sel.value = self.currentLang;
      document.documentElement.lang = self.currentLang;
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    I18n.init();
  });

  window.I18n = I18n;
})();
