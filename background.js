const limitData = {};

const updateLimitMap = ({ url, responseHeaders }) => {
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
    const userid = twid?.value?.match(/\d+$/)?.[0];

    limitData[userid + " " + endpoint] = {
      endpoint,
      limit,
      reset,
      remaining,
      userid,
    };
    limitData.$userid = userid;
  });
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
      limitData,
    });
  } else if (name === "screenNames") {
    screenNameData = Object.assign(screenNameData, data);
  }
});
