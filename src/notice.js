const notice = document.querySelector('#inauguration-notice');
const noticeButton = document.querySelector('.inauguration-notice-link');

if (typeof notice?.showModal === 'function' && noticeButton) {
  const seenKey = 'tangamja-inauguration-2-seen';
  const hiddenKey = 'tangamja-inauguration-2-hidden-day';
  const message = notice.querySelector('.inauguration-notice__body');
  const closeForm = notice.querySelector('#inauguration-close');
  noticeButton.hidden = false;

  function localDay() {
    const now = new Date();
    return [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('-');
  }

  function readDay(storage, key) {
    try {
      return window[storage].getItem(key);
    } catch {
      return null;
    }
  }

  function rememberDay(storage, key) {
    try {
      window[storage].setItem(key, localDay());
    } catch {
      // Keep the notice usable when browser storage is blocked.
    }
  }

  function showNotice() {
    if (notice.open) return;
    notice.showModal();
    message.scrollTop = 0;
    rememberDay('sessionStorage', seenKey);
  }

  noticeButton.addEventListener('click', showNotice);
  closeForm.addEventListener('submit', (event) => {
    if (event.submitter?.value === 'hide-today') rememberDay('localStorage', hiddenKey);
  });
  notice.addEventListener('close', () => {
    if (!notice.open) noticeButton.focus({ preventScroll: true });
  });

  const today = localDay();
  const hiddenToday = readDay('localStorage', hiddenKey) === today;
  const seenToday = readDay('sessionStorage', seenKey) === today;
  if (!location.hash && !hiddenToday && !seenToday) showNotice();
}
