const store = {
  tables: {
    limit: {},
    screenName: {},
  },
  currentUserId: null,
};

const loadStoredData = () => {
  chrome.storage.local.get(null, items => {
    store.tables.limit = Object.assign(
      items.tables?.limit ?? {},
      store.tables.limit
    );
    store.tables.screenName = Object.assign(
      items.tables?.screenName ?? {},
      store.tables.screenName
    );
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

      store.tables.limit[userId + " " + endpoint] = {
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

chrome.runtime.onMessage.addListener(({ name, data }) => {
  if (name === "requestTables") {
    chrome.runtime.sendMessage({
      name: "allTables",
      data: store,
    });
  } else if (name === "screenNameTable") {
    store.tables.screenName = Object.assign(
      store.tables.screenName,
      data.tables.screenName
    );
    chrome.storage.local.set({ tables: store.tables });
  }
});
