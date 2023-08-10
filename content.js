const extractInitialState = () => {
  const initialStateMatch = Array.from(document.scripts)
    .find(script => script.text.includes("__INITIAL_STATE__"))
    ?.text.match(/{.+?}(?=;)/)?.[0];

  if (initialStateMatch) {
    try {
      const initialState = JSON.parse(initialStateMatch);
      return initialState;
    } catch (e) {
      console.error(e);
    }
  }
  return {};
};

const makeScreenNameTable = () => {
  const screenNameTable = {};
  const initialState = extractInitialState();
  const entities = initialState?.entities?.users?.entities || {};

  if (entities) {
    for (const [key, { screen_name }] of Object.entries(entities)) {
      screenNameTable[key] = "@" + screen_name;
    }
  }

  return screenNameTable;
};

chrome.runtime.sendMessage({
  name: "screenNameTable",
  data: {
    tables: {
      screenName: makeScreenNameTable(),
    },
  },
});
