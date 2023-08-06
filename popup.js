const formatElapsedSeconds = sec => {
  let min = (sec / 60) | 0;
  let hr = (min / 60) | 0;

  return min ? (hr ? hr`${hr}h${min % 60}min` : `${min} min`) : `<1 min`;
};

const unix2hhmm = unix => {
  const date = new Date(1000 * unix);
  return `${date.getHours()}:${date.getMinutes()}`;
};

chrome.runtime.onMessage.addListener(({ name, data }) => {
  if (name === "returnLimitData") {
    const content = document.createElement("div");
    content.setAttribute("id", "content");

    const table = document.createElement("table");

    data.forEach(({ limit, reset, remaining }, endpoint) => {
      const tr = document.createElement("tr");

      const th = document.createElement("th");
      const tds = [...Array(6)].map(() => document.createElement("td"));

      th.textContent = endpoint;
      tds[0].textContent = remaining;
      tds[1].textContent = `/`;
      tds[2].textContent = limit;
      tds[3].textContent = "Resets after";
      tds[4].textContent = formatElapsedSeconds(
        reset - ((Date.now() / 1000) | 0)
      );
      tds[5].textContent = `(${unix2hhmm(reset)})`;

      tr.append(th, ...tds);
      table.appendChild(tr);
    });

    content.appendChild(table);

    document.getElementById("content").replaceWith(content);
  }
});

const requestLimitData = () => {
  chrome.runtime.sendMessage({ name: "requestLimitData" });
};

requestLimitData();
