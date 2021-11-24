let db;

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;

    db.createObjectStore("pending", {autoIncrement: true});
};

request.onsuccess = event => {
  console.log(`Success! ${event.type}`);

  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = event => {
  console.log("Woops! " + event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");

  store.add(record);
}

function checkDatabase() {
  const db = request.result;

  let transaction = db.transaction([pendingObjectStoreName], `readwrite`);
  let store = transaction.objectStore(pendingObjectStoreName);

  const getAll = store.getAll();

  getAll.onsuccess = () => {
    if (getAll.result.length > 0) {
      fetch(`/api/transaction/bulk`, {
        method: `POST`,
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: `application/json, text/plain, */*`,
          "Content-Type": `application/json`
        }
      })
        .then(response => response.json())
        .then(() => {
          transaction = db.transaction([pendingObjectStoreName], `readwrite`);
          store = transaction.objectStore(pendingObjectStoreName);

          store.clear();
        });
    }
  };
}

function saveRecord(record) {
  const db = request.result;
  const transaction = db.transaction([pendingObjectStoreName], `readwrite`);
  const store = transaction.objectStore(pendingObjectStoreName);

  store.add(record);
}

window.addEventListener(`online`, checkDatabase);