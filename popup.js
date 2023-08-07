const formatElapsedSeconds = sec => {
  let min = (sec / 60) | 0;
  let hr = (min / 60) | 0;

  return min ? (hr ? hr`${hr}h${min % 60}min` : `${min} min`) : `<1 min`;
};

const unix2hhmm = unix => {
  const date = new Date(1000 * unix);
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
};

chrome.runtime.onMessage.addListener(
  ({ name, limitData, screenNameData, currentUserId }) => {
    if (name === "returnLimitData") {
      const screenName = screenNameData[currentUserId];

      document.getElementById("user").textContent =
        screenName == null ? currentUserId ?? "unknown" : "@" + screenName;

      const table = document.createElement("table");
      table.setAttribute("id", "table");

      const fragment = document.createDocumentFragment();

      Object.entries(limitData)
        .sort(([, { endpoint: a }], [, { endpoint: b }]) =>
          a < b ? -1 : a > b ? 1 : 0
        )
        .forEach(([key, { endpoint, limit, reset, remaining, userId }]) => {
          if (userId !== currentUserId) return;

          const tr = document.createElement("tr");

          const th = document.createElement("th");
          const tds = [...Array(6)].map(() => document.createElement("td"));

          const resetsAfter = reset - ((Date.now() / 1000) | 0);

          th.textContent = endpoint;
          tds[1].textContent = `/`;
          tds[2].textContent = limit;
          if (resetsAfter > 0) {
            tds[0].textContent = remaining;
            tds[3].textContent = "Resets after";
            tds[4].textContent = formatElapsedSeconds(resetsAfter);
          } else {
            tds[3].textContent = "Reset at";
          }
          tds[3].classList.add("align-left");
          tds[5].textContent = `(${unix2hhmm(reset)})`;

          tr.append(th, ...tds);
          (resetsAfter > 0 ? table : fragment).appendChild(tr);
        });

      table.appendChild(fragment);

      document.getElementById("table").replaceWith(table);
    }
  }
);

const requestLimitData = () => {
  chrome.runtime.sendMessage({ name: "requestLimitData" });
};

document
  .getElementById("reload-button")
  .addEventListener("click", requestLimitData);

requestLimitData();
