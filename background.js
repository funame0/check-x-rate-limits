const store = {
  limitTable: {},
  currentUserId: null,
};

const loadStoredData = () => {
  chrome.storage.local.get(null, items => {
    store.limitTable = Object.assign(items.limitTable ?? {}, store.limitTable);
    store.currentUserId ??= items.currentUserId;
  });
};

loadStoredData();

const extractEndpointFromURL = url => {
  let endpoint = new URL(url).pathname;
  if (endpoint.includes("graphql")) {
    endpoint = endpoint.substring(endpoint.lastIndexOf("/") + 1);
  }

  return endpoint;
};

const getHeaderValue = (headers, name) =>
  headers.find(header => header.name === name)?.value;

const updateData = ({ url, responseHeaders }) => {
  const endpoint = extractEndpointFromURL(url);

  const f =
    s =>
    ({ name }) =>
      name === s;

  const limit = getHeaderValue(responseHeaders, "x-rate-limit-limit");
  const reset = getHeaderValue(responseHeaders, "x-rate-limit-reset");
  const remaining = getHeaderValue(responseHeaders, "x-rate-limit-remaining");

  if (limit != null && reset != null && remaining != null) {
    chrome.cookies.get({ url: "https://twitter.com/", name: "twid" }, twid => {
      if (twid == null) console.warn('Cookie "twid" not found.');
      const userId = twid?.value?.match(/\d+$/)?.[0];

      store.limitTable[userId + " " + endpoint] = {
        endpoint,
        limit,
        reset,
        remaining,
        userId,
      };
      store.currentUserId = userId;
      chrome.storage.local.set(store);
    });
  }
};

chrome.webRequest.onResponseStarted.addListener(
  updateData,
  {
    urls: ["*://*.twitter.com/*"],
  },
  ["responseHeaders"]
);
