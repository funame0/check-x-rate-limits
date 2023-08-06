const limitMap = new Map();

const updateLimitMap = ({ url, responseHeaders }) => {
  const endpoint = new URL(url).pathname;

  const f =
    s =>
    ({ name }) =>
      name === s;

  const limit = responseHeaders.find(f("x-rate-limit-limit"))?.value;
  if (limit == null) return;

  const reset = responseHeaders.find(f("x-rate-limit-reset"))?.value;
  if (reset == null) return;

  const remaining = responseHeaders.find(f("x-rate-limit-remaining"))?.value;
  if (remaining == null) return;

  limitMap.set(endpoint, { limit, reset, remaining });
};

chrome.webRequest.onResponseStarted.addListener(
  updateLimitMap,
  {
    urls: ["*://*.twitter.com/*"],
  },
  ["responseHeaders"]
);

chrome.runtime.onMessage.addListener(({ name }) => {
  if (name === "requestLimitData") {
    chrome.runtime.sendMessage({
      name: "returnLimitData",
      data: limitMap,
    });
  }
});
