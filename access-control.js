// Доступ к приложению — 180 дней с первого входа на этом устройстве.
(function () {
  var KEY = 'startpit-first-access';
  var MAX_DAYS = 180;
  var now = Date.now();
  var first = null;
  try { first = localStorage.getItem(KEY); } catch (e) {}
  if (!first) {
    try { localStorage.setItem(KEY, String(now)); } catch (e) {}
    return;
  }
  var daysPassed = (now - parseInt(first, 10)) / 86400000;
  if (daysPassed > MAX_DAYS && !/expired\.html$/.test(location.pathname)) {
    location.replace('expired.html');
  }
})();
