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

const removeOldData = sec => {
  for (const [key, obj] of Object.entries(store.limitTable)) {
    if (Math.floor(Date.now() / 1000) - obj.reset >= sec) {
      delete store.limitTable[key];
    }
  }
};

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
  const limit = getHeaderValue(responseHeaders, "x-rate-limit-limit");
  if (limit != null) {
    const reset = getHeaderValue(responseHeaders, "x-rate-limit-reset");
    const remaining = getHeaderValue(responseHeaders, "x-rate-limit-remaining");

    if (reset != null && remaining != null) {
      const endpoint = extractEndpointFromURL(url);

      chrome.cookies.get(
        { url: "https://twitter.com/", name: "twid" },
        twid => {
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
        }
      );
    }
  }
};

chrome.webRequest.onHeadersReceived.addListener(
  updateData,
  {
    urls: ["*://*.twitter.com/*"],
  },
  ["responseHeaders"]
);

chrome.runtime.onMessage.addListener(request => {
  if (request.name === "removeOldData") {
    removeOldData(request.data);
  }
});
