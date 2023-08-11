for (const element of document.querySelectorAll("[data-localize]")) {
  // For text nodes
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const { textContent } = node;
      const replacedText = textContent.replace(/__MSG_(.+)__/g, (_, key) =>
        chrome.i18n.getMessage(key)
      );
      if (textContent !== replacedText) {
        node.textContent = replacedText;
      }
    }
  }

  // For attributes
  for (const attr of element.getAttributeNames()) {
    const value = element.getAttribute(attr);
    const replacedValue = value.replace(/__MSG_(.+)__/g, (_, key) =>
      chrome.i18n.getMessage(key)
    );
    if (value !== replacedValue) {
      element.setAttribute(attr, replacedValue);
    }
  }

  element.removeAttribute("data-localize");
}
