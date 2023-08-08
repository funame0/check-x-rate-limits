let limitData = {},
  screenNameData = {},
  currentUserId;

chrome.storage.local.get(null, items => {
  limitData = Object.assign(items.limitData, limitData);
  screenNameData = Object.assign(items.screenNameData, screenNameData);
  currentUserId ??= items.currentUserId;
});

const update = ({ url, responseHeaders }) => {
  let endpoint = new URL(url).pathname;
  if (endpoint.includes("graphql"))
    endpoint = endpoint.substring(endpoint.lastIndexOf("/") + 1);

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

  chrome.cookies.get({ url: "https://twitter.com/", name: "twid" }, twid => {
    if (twid == null) console.warn('Cookie "twid" not found.');
    const userId = twid?.value?.match(/\d+$/)?.[0];

    limitData[userId + " " + endpoint] = {
      endpoint,
      limit,
      reset,
      remaining,
      userId,
    };
    currentUserId = userId;
    chrome.storage.local.set({ limitData, currentUserId });
  });
};

chrome.webRequest.onResponseStarted.addListener(
  update,
  {
    urls: ["*://*.twitter.com/*"],
  },
  ["responseHeaders"]
);

chrome.runtime.onMessage.addListener(({ name, ...request }) => {
  if (name === "requestLimitData") {
    chrome.runtime.sendMessage({
      name: "returnLimitData",
      limitData,
      screenNameData,
      currentUserId,
    });
  } else if (name === "screenNameData") {
    screenNameData = Object.assign(screenNameData, request.screenNameData);
    chrome.storage.local.set({ screenNameData });
  }
});
