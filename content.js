const makeScreenNameTable = () => {
  const initialState = Array.from(document.scripts)
    .find(script => script.text.includes("__INITIAL_STATE__"))
    ?.text.match(/{.+?}(?=;)/)?.[0];

  if (initialState != null) {
    try {
      return Object.fromEntries(
        Object.entries(
          JSON.parse(initialState)?.entities?.users?.entities ?? {}
        ).map(([k, v]) => [k, "@" + v.screen_name])
      );
    } catch (e) {
      console.error(e);
    }
  }
  return {};
};

chrome.runtime.sendMessage({
  name: "screenNameTable",
  data: {
    tables: {
      screenName: makeScreenNameTable(),
    },
  },
});
