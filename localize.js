document.querySelectorAll("[data-localize]").forEach(element => {
  element.textContent = chrome.i18n.getMessage(element.textContent);
});
