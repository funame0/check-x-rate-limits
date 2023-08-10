const formatTimeMessage = (hr, min) => {
  if (hr) {
    return chrome.i18n.getMessage("time_hmin", [hr, min]);
  } else if (min) {
    return chrome.i18n.getMessage("time_min", [min]);
  } else {
    return chrome.i18n.getMessage("time_lessthan1min");
  }
};

const sec2hmin = sec => {
  let min = Math.floor(sec / 60);
  let hr = Math.floor(min / 60);
  min %= 60;
  return [hr, min];
};

const createCell = (tagName, textContent, className) => {
  const cell = document.createElement(tagName);
  cell.textContent = textContent;
  if (className) {
    cell.className = className;
  }
  return cell;
};

const clearTableChildren = tableElement => {
  while (tableElement.firstChild) {
    tableElement.removeChild(tableElement.firstChild);
  }
};

const createRow = (obj, currentUnixtime) => {
  const resetsAfter = obj.reset - currentUnixtime;
  const beforeReset = resetsAfter > 0;

  const tr = document.createElement("tr");

  Object.entries(obj).forEach(([name, value]) => (tr.dataset[name] = value));

  tr.append(
    createCell("th", obj.endpoint, beforeReset ? "semibold" : "regular"),
    createCell("td", beforeReset ? obj.remaining : "-"),
    createCell("td", "/"),
    createCell("td", obj.limit),
    createCell(
      "td",
      beforeReset ? chrome.i18n.getMessage("reset_after") : "",
      "align-left"
    ),
    createCell(
      "td",
      beforeReset ? formatTimeMessage(...sec2hmin(resetsAfter)) : ""
    ),
    createCell(
      "td",
      beforeReset ? `(${unix2hhmm(obj.reset)})` : unix2hhmm(obj.reset),
      "align-center"
    )
  );

  return tr;
};

const updateLimitTableElement = ({
  tableElement,
  limitValues,
  currentUserId,
  currentUnixtime,
}) => {
  clearTableChildren(tableElement);

  const rows = limitValues
    .filter(obj => obj.userId === currentUserId)
    .sort(
      (a, b) =>
        (b.reset - currentUnixtime > 0) - (a.reset - currentUnixtime > 0) ||
        a.endpoint.startsWith("/") - b.endpoint.startsWith("/") ||
        a.endpoint.localeCompare(b.endpoint)
    )
    .map(obj => createRow(obj, currentUnixtime));

  tableElement.append(...rows);
};

const receiveMessage = ({ name, data }) => {
  if (name === "allTables") {
    const currentUnixtime = Math.floor(Date.now() / 1000);

    const tableElement = document.getElementById("limit-table");
    const limitValues = Object.values(data.tables.limit);

    updateLimitTableElement({
      tableElement,
      limitValues,
      currentUserId: data.currentUserId,
      currentUnixtime,
    });

    const screenName = data.tables.screenName[data.currentUserId];

    document.getElementById("user").textContent =
      screenName ?? data.currentUserId ?? "unknown";
  }
};

const unix2hhmm = unixtime => {
  const date = new Date(1000 * unixtime);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

chrome.runtime.onMessage.addListener(receiveMessage);

const requestTables = () => {
  chrome.runtime.sendMessage({ name: "requestTables" });
};

document
  .getElementById("reload-button")
  .addEventListener("click", requestTables);

requestTables();
