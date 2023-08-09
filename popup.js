const th = t => Object.assign(document.createElement("th"), { textContent: t });
const td = (textContent, object) =>
  Object.assign(document.createElement("td"), { textContent }, object);

const updateLimitTableElement = ({
  tableElement,
  limitEntries,
  currentUserId,
  unixNow,
}) => {
  // Remove all child elements of the table element
  while (tableElement.firstChild) {
    tableElement.removeChild(tableElement.firstChild);
  }

  tableElement.append(
    ...limitEntries.map(([key, obj]) => {
      if (obj.userId !== currentUserId) return;

      const resetsAfter = obj.reset - unixNow;
      const beforeReset = resetsAfter > 0;

      const tr = document.createElement("tr");
      tr.id = key;
      Object.entries(obj).forEach(
        ([name, value]) => (tr.dataset[name] = value)
      );

      tr.append(
        th(obj.endpoint),
        td(beforeReset ? obj.remaining : "-"),
        td("/"),
        td(obj.limit),
        td(beforeReset ? "Resets after" : "Reset at", {
          className: "align-left",
        }),
        td(beforeReset ? formatSeconds(resetsAfter) : ""),
        td(beforeReset ? `(${unix2hhmm(obj.reset)})` : obj.reset)
      );
      return tr;
    })
  );
};

const receiveMessage = ({ name, data }) => {
  if (name === "allTables") {
    const unixNow = (Date.now() / 1000) | 0;

    updateLimitTableElement({
      tableElement: document.getElementById("limit-table"),
      limitEntries: Object.entries(data.tables.limit)
        .sort(
          ([, { endpoint: a }], [, { endpoint: b }]) => (
            ((a = a.replaceAll("/", "\uFFFF")),
            (b = b.replaceAll("/", "\uFFFF"))),
            a < b ? -1 : a > b ? 1 : 0
          )
        )
        .sort(
          ([, { reset: a }], [, { reset: b }]) =>
            (b - unixNow > 0) - (a - unixNow > 0) // Endpoints that have been reset are shown behind
        ),
      currentUserId: data.currentUserId,
      unixNow,
    });

    const screenName = data.tables.screenName[data.currentUserId];

    document.getElementById("user").textContent =
      screenName ?? data.currentUserId ?? "unknown";
  }
};

const formatSeconds = sec => {
  let min = (sec / 60) | 0;
  let hr = (min / 60) | 0;

  return min ? (hr ? hr`${hr}h${min % 60}min` : `${min} min`) : `<1 min`;
};

const unix2hhmm = unix => {
  const date = new Date(1000 * unix);
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
};

chrome.runtime.onMessage.addListener(receiveMessage);

const requestTables = () => {
  chrome.runtime.sendMessage({ name: "requestTables" });
};

document
  .getElementById("reload-button")
  .addEventListener("click", requestTables);

requestTables();
