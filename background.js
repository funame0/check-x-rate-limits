const tables = {
  limit: {},
  screenName: {},
};
let currentUserId;

chrome.storage.local.get(null, items => {
  tables.limit = Object.assign(items.tables.limit ?? {}, tables.limit);
  tables.screenName = Object.assign(
    items.tables.screenName ?? {},
    tables.screenName
  );
  currentUserId ??= items.currentUserId;
});

const updateData = ({ url, responseHeaders }) => {
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

    tables.limit[userId + " " + endpoint] = {
      endpoint,
      limit,
      reset,
      remaining,
      userId,
    };
    currentUserId = userId;
    chrome.storage.local.set({
      tables,
      currentUserId,
    });
  });
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
      data: {
        tables,
        currentUserId,
      },
    });
  } else if (name === "screenNameTable") {
    tables.screenName = Object.assign(
      tables.screenName,
      data.tables.screenName
    );
    chrome.storage.local.set({ tables });
  }
});
