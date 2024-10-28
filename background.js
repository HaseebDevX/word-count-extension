chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    //console.log(`Tab ${tabId} updated:`, tab);
    // Add your logic here
  }
});

var stripeTabId = "";

chrome.runtime.onInstalled.addListener(async (install) => {
  //console.log("Extension installed", install);
  // reloadAllTabsOnStartUp();
  chrome.storage.local.set({
    startup: "documents",
    progressbar_source: "pinned",
    writing_streak: "any_word",
  });

  //chrome.storage.local.remove(["documents", "dailyWordCounts", "weeklyWordCounts"])
  chrome.storage.local.get(
    ["wordCountSetting", "progressBarSetting"],
    function (result) {
      ////console.log(JSON.stringify(result));
      let wordCountSetting = false;
      let progressBarSetting = true;
      if (result.wordCountSetting == "true") {
        wordCountSetting = result.wordCountSetting;
      }
      if (result.progressBarSetting == "true") {
        progressBarSetting = result.progressBarSetting;
      }

      chrome.storage.local.set({
        wordCountSetting: wordCountSetting,
        progressBarSetting: progressBarSetting,
      });
    }
  );

  const alarm = await chrome.alarms.get("syncing");

  if (!alarm) {
    // 5 seconds interval
    await chrome.alarms.create("syncing", { periodInMinutes: 0.0833335 });
  }

  /* // Set an alarm to reset the daily word count at midnight
  const resetAlarm = await chrome.alarms.get("resetDailyWordCount")
  if (!resetAlarm) {
    await chrome.alarms.create("resetDailyWordCount", {
      when: new Date().setHours(24, 0, 0, 0),
      periodInMinutes: 1440, // 24 hours
    })
  }*/
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Haseeb action",request)
  if (request.action === "getOutline") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // Check if tabs array has any element
      if (tabs && tabs.length > 0) {
        const activeTab = tabs[0].id;
        console.log(activeTab);

        chrome.scripting.executeScript(
          {
            target: { tabId: activeTab },
            files: ["content.js"],
          },
          () => {
            chrome.tabs.sendMessage(
              activeTab,
              { action: "fetchOutline" },
              function (response) {
                sendResponse(response);
              }
            );
          }
        );
      } else {
        console.error("No active tab found.");
        sendResponse({ error: "No active tab found" });
      }
    });
    return true; // Required for async sendResponse
  }
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "refreshPage") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const activeTab = tabs[0].id;
      chrome.scripting.executeScript(
        {
          target: { tabId: activeTab },
          func: () => window.location.reload(), // Correctly pass the function here
        },
        () => {
          sendResponse({ status: "refreshed" });
        }
      );
    });
    return true; // Keeps the sendResponse channel open
  }
});

function getTodayDate() {
  let date = new Date();
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);

  return `${year}-${month}-${day}`;
}

function getTodayDateAndTime() {
  let date = new Date();
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  const hours = ("0" + date.getHours()).slice(-2);
  const minutes = ("0" + date.getMinutes()).slice(-2);
  const seconds = ("0" + date.getSeconds()).slice(-2);

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
// Reaload all tab on startup
function reloadAllTabsOnStartUp() {
  chrome.windows.getAll({ populate: true }, function (windows) {
    windows.forEach((window) => {
      if (window.type == "normal") {
        window.tabs.forEach((tab) => {
          // if (
          //   tab.url &&
          //   (tab.url.indexOf('facebook') != -1 ||
          //     tab.url.indexOf('/groups/') != -1)
          // ) {
          chrome.tabs.reload(tab.id);
          // }
        });
      }
    });
  });
}

 

chrome.action.onClicked.addListener(function (tab) {
  ////console.log(tab);
  chrome.tabs.sendMessage(tab.id, { action: "openSidePanel" });
});

chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name == "syncing") {
    // syncDocuments();
  } /*else if (alarm.name == "resetDailyWordCount") {
    resetDailyWordCount()
  }*/
});

function syncDocuments() {
  chrome.storage.local.get(["documents"]).then((result) => {
    if (result.documents != undefined && result.documents != "") {
      result.documents.map(function (item) {
        scrapDocInfo(item.url, "sync");
      });
    }
  });
}
/*
function resetDailyWordCount() {
  const today = new Date().toISOString().split("T")[0]
  chrome.storage.local.get(["dailyWordCounts"], function (result) {
    let dailyWordCounts = result.dailyWordCounts || {}
    dailyWordCounts[today] = 0
    chrome.storage.local.set({ dailyWordCounts: dailyWordCounts })
  })
}
*/
function replaceHexWithCharacters(inputString) {
  return inputString.replace(/\\u([\d\w]{4})/gi, function (match, grp) {
    return String.fromCharCode(parseInt(grp, 16));
  });
}
function replaceNewlineWithSpace(inputString) {
  return inputString.replace(/\n/g, " ");
}
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action == "getDocInfo") {
    scrapDocInfo(message.url, "new");
  } else if (message.action == "openTab") {
    chrome.tabs.create({ url: message.url });
  } else if (message.action == "updateDayWiseRecords") {
    createDayWiseArray(message.updatedStats, false);
  } else if (message.action == "syncDocs") {
    console.log("syncDocuments")
    syncDocuments();
  } else if (message.action == "getUserData") {
    ////console.log("ABC", "abc")
    getUserData({ email: message.email }, true);
  } else if (message.action == "openStripeTab") {
    chrome.storage.local.get(["user"], function (res) {
      let url = message.url;
      if (res.user) {
        url = url + res.user.email;
      }

      chrome.tabs.create({ url: url, active: true }, function (tabs) {
        stripeTabId = tabs.id;
        chrome.tabs.onUpdated.addListener(stripeTabListener);
      });
    });
  } else if (message.action == "openCustomerPortal") {
    chrome.tabs.create({ url: message.url, active: true }, function (tabs) {
      ////console.log(tabs)
    });
  } else if (message.action == "updateRecordsAsPerSetting") {
    createDayWiseArray(message.dailyStats, false);
    console.log("message.dailyStats", message.dailyStats);
  }
});

function stripeTabListener(tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" && tabId == stripeTabId) {
    chrome.tabs.sendMessage(stripeTabId, {
      action: "disableStripeEmailField",
    });
    chrome.tabs.onUpdated.removeListener(stripeTabListener);
  }
}

function scrapDocInfo(url, type) {
  fetch(url)
    .then((response) => response.text())
    .then(async (text) => {
      let oriText = text;
      // Define the regular expression pattern with global flag
      //let patterns = /DOCS_modelChunk = \[\{(.+?)\},{"ty"/g;
      // const patterns = /"ty":"[^"]*","(?:sugid":"[^"]*"|ibi":[^,]*),"s":"(.*?)"/g;
      const patterns =
        /"ty":"is{1,2}","(?:sugid":"[^"]*","?|ibi":[^,]*,"?)*"s":"(.*?)"/g;

      // Array to store all extracted texts
      let extractedTexts = [];

      // Execute the regular expression and extract the text for all matches
      let matchs;
      while ((matchs = patterns.exec(text)) !== null) {
        // Extracted text is in the first capturing group (match[1])
        let extractedTextss = matchs[1];
        extractedTexts.push(extractedTextss);
      }

      // Output all extracted texts
      //  //console.log(extractedTexts);

      // Define the regular expression pattern to match the value of the "s" key
      let pattern = /"s":"(.*?)"/;

      // Array to store extracted values of "s"
      let sValues = [];

      // Iterate through the array and extract the value of "s" from each element
      extractedTexts.forEach((text) => {
        // Execute the regular expression and extract the value of "s"
        let match = pattern.exec(text);
        if (match) {
          // Extracted value is in the first capturing group (match[1])
          let sValue = match[1];
          sValues.push(sValue);
        } else {
          // //console.log("Pattern not found in:", text);
        }
      });

      // Output the extracted values of "s"
      // //console.log(sValues);
      let combinedString = extractedTexts.join("");

      // Output the combined string
      // //console.log(combinedString);
      text = combinedString;
      let words = text.match(/\b\w+\b/g);
      
 
      // Count the words
      let wordCounte = words ? words.length : 0;

      // //console.log(wordCounte);

      // //console.log(text);

      let extractedText = text;

      extractedText = extractedText.trim();

      extractedText = extractedText.replace(/\\n/g, " ");
      extractedText = extractedText.replace(/\\t/g, " ");
      extractedText = extractedText.replace(/\\f/g, " ");
      extractedText = extractedText.replace(/\\u000b/g, " ");
      extractedText = extractedText.replace(/\*/g, "");
      // //console.log(extractedText);
      extractedText = extractedText.replace(/\\u[0-9a-fA-F]{4}/g, " ");
      // extractedText = extractedText.split(',').join(' ');
      // extractedText = extractedText.split(':').join(' ');
      // extractedText = extractedText.split(';').join(' ');
      // extractedText = extractedText.split('/').join(' ');

      const charactersToReplace = [
        ".",
        ",",
        "/",
        "<",
        ">",
        "?",
        ";",
        "‘",
        ":",
        "“",
        "[",
        "]",
        "\\",
        "{",
        "}",
        "|",
        "!",
        "@",
        "#",
        "$",
        "%",
        "^",
        "&",
        "*",
        "(",
        ")",
        "-",
        "+",
        "=",
      ];

      // Create a regular expression that matches any of these characters
      const replaceRegex = new RegExp(
        `[${charactersToReplace.join("\\")}]`,
        "g"
      );

      // Replace matching characters with blank spaces
      extractedText = extractedText.replace(replaceRegex, " ");
      // //console.log(extractedText);

      extractedText = extractedText.split(/\s+/);
      extractedText = extractedText.filter((item) => item !== "");

      var wordCount = extractedText.length;

      var documentName = "";
      var countDocWords = 0;

      countDocWords = wordCount;
      text = oriText;
      var documentId = extractDocumentId(url);

      var ogDescriptionIndex = text.indexOf('<meta property="og:title"');

      // If the meta tag is found
      if (ogDescriptionIndex !== -1) {
        var contentStartIndex = text.indexOf('content="', ogDescriptionIndex);
        var contentEndIndex = text.indexOf('"', contentStartIndex + 9); // 9 is the length of 'content="'

        // Extract the content attribute value
        documentName = text.substring(contentStartIndex + 9, contentEndIndex);
      }

      updateDailyStats(documentId, countDocWords, type);

      /*const counts = store.counts || {}
      const today = new Date().toISOString().split("T")[0]
      if (counts[today]) {
        if (counts[today][documentId]) {
          counts[today][documentId].push(countDocWords)
          counts[today][documentId] = Array.from(
            new Set(counts[today][documentId])
          )
        } else {
          counts[today][documentId] = [countDocWords]
        }
      } else {
        counts[today] = {
          [documentId]: [countDocWords],
        }
      }

      //console.log('counts');
      //console.log(counts); 
      await chrome.storage.local.set({ counts: counts })

      const dailyWordsSum = await sumAllDailyWordCount()
      const dailyGoal = store.dailyGoal || 0
      const writingStreakType = store.writing_streak || "any_word"
      const customWordCount = store.custom_word_count || 0

      if (writingStreakType === "any_word") {
        if (dailyWordsSum > 0) {
          const events = store.events || []
          const today = new Date().toISOString().split("T")[0]
          if (!events.includes(today)) {
            events.push(today)
            chrome.storage.local.set({ events: events })
          }
        }
      } else if (writingStreakType === "reached_daily") {
        if (dailyWordsSum >= dailyGoal) {
          const events = store.events || []
          const today = new Date().toISOString().split("T")[0]
          if (!events.includes(today)) {
            events.push(today)
            chrome.storage.local.set({ events: events })
          }
        }
      } else if (writingStreakType === "custom") {
        if (dailyWordsSum > customWordCount) {
          const events = store.events || []
          const today = new Date().toISOString().split("T")[0]
          if (!events.includes(today)) {
            events.push(today)
            chrome.storage.local.set({ events: events })
          }
        }
      }*/

      var documentData = {
        id: documentId,
        url: url,
        title: documentName,
        wordCount: countDocWords,
        goal: "",
        pinned: false,
      };

      chrome.storage.local.get(["documents"]).then((result) => {
        if (result.documents == undefined || result.documents == "") {
          documentData.pinned = true; // if its first documnent then pin it by default
          chrome.storage.local.set({ documents: [documentData] });
        } else {
          let existingDocs = result.documents;
          //check new doc is already saved or not
          let dIndex = existingDocs.findIndex((x) => x.id == documentData.id);
          if (dIndex >= 0) {
            documentData.goal = existingDocs[dIndex].goal; //update rest changes except the goal
            documentData.pinned = existingDocs[dIndex].pinned; //update rest changes except the pin
            existingDocs[dIndex] = documentData;
          } else {
            existingDocs.push(documentData);
          }

          chrome.storage.local.set({ documents: existingDocs });
        }
      });
    })
    .catch((error) => console.error("Error fetching document:", error));
}

function countWords(text) {
  var words = text.match(/\b\w+\b/g);
  return words ? words.length : 0;
}

// Function to extract document ID from Google Docs URL
function extractDocumentId(url) {
  // Split the URL by '/' to get individual parts
  var urlParts = url.split("/");

  // Find the index of the part containing 'document' keyword
  var docIndex = urlParts.indexOf("d");

  // Extract the document ID from the part after 'document'
  var docId = urlParts[docIndex + 1];

  // Return the extracted document ID
  return docId;
}
/*
// Function to update the daily and weekly word counts
function updateWordCounts(countDocWords) {
  updateDailyWordCount(countDocWords);
}
*/

/*
function updateDailyWordCount(countDocWords) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]; // 'YYYY-MM-DD' format

  chrome.storage.local.get(["dailyWordCounts"], function (result) {
    let dailyWordCounts = result.dailyWordCounts || {};
    // Update daily word count
    if (dailyWordCounts[todayStr]) {
      dailyWordCounts[todayStr] += countDocWords;
    } else {
      dailyWordCounts[todayStr] = countDocWords;
    }

    chrome.storage.local.set({
      dailyWordCounts: dailyWordCounts,
    });

    updateWeeklyWordCount(dailyWordCounts);
  });
}
*/

/*
// Function to update the weekly word count
function updateWeeklyWordCount(dailyWordCounts) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]; // 'YYYY-MM-DD' format
  const startOfWeek = getStartDateOfWeek(today);
  // Generate label in 'MM/DD' format
  const weekLabel = `${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()}`;

  chrome.storage.local.get(["weeklyWordCounts"], function (result) {
    let weeklyWordCounts = result.weeklyWordCounts || {};

    // Initialize the weekly word count if not already present
    if (!weeklyWordCounts[weekLabel]) {
      weeklyWordCounts[weekLabel] = dailyWordCounts[todayStr];
    }

    // Calculate the total words for the current week
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    let weeklyTotal = 0;

    for (let dateStr in dailyWordCounts) {
      const date = new Date(dateStr);
      if (date >= startOfWeek && date <= endOfWeek) {
        weeklyTotal += dailyWordCounts[dateStr];
      }
    }

    // Update the weekly word count
    weeklyWordCounts[weekLabel] = weeklyTotal;

    chrome.storage.local.set({
      weeklyWordCounts: weeklyWordCounts,
    });
  });
}
*/
/*
// Function to get the start date of the week for a given date
function getStartDateOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday being the start of the week
  return new Date(date.setDate(diff));
}
*/
// firebase
const OFFSCREEN_DOCUMENT_PATH = "/offscreen.html";

// A global promise to avoid concurrency issues
let creating;

// Chrome only allows for a single offscreenDocument. This is a helper function
// that returns a boolean indicating if a document is already active.
async function hasDocument() {
  // Check all windows controlled by the service worker to see if one
  // of them is the offscreen document with the given path
  const matchedClients = await clients.matchAll();
  return matchedClients.some(
    (c) => c.url === chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH)
  );
}

async function setupOffscreenDocument(path) {
  // If we do not have a document, we are already setup and can skip
  if (!(await hasDocument())) {
    // create offscreen document
    if (creating) {
      await creating;
    } else {
      creating = chrome.offscreen.createDocument({
        url: path,
        reasons: [chrome.offscreen.Reason.DOM_SCRAPING],
        justification: "authentication",
      });
      await creating;
      creating = null;
    }
  }
  return true;
}

async function closeOffscreenDocument() {
  if (!(await hasDocument())) {
    return;
  }
  await chrome.offscreen.closeDocument();
}

function getAuth() {
  return new Promise(async (resolve, reject) => {
    const auth = await chrome.runtime.sendMessage({
      type: "firebase-auth",
      target: "offscreen",
    });
    auth?.name !== "FirebaseError" ? resolve(auth) : reject(auth);
  });
}
function getUser() {
  return new Promise(async (resolve, reject) => {
    const user = await chrome.runtime.sendMessage({
      type: "current-user",
      target: "offscreen",
    });
    //console.log("getUser", user);
    user?.name !== "FirebaseError" ? resolve(user) : reject(user);
  });
}

function signOut() {
  return new Promise(async (resolve, reject) => {
    const res = await chrome.runtime.sendMessage({
      type: "sign-out",
      target: "offscreen",
    });
    res?.name !== "FirebaseError" ? resolve(res) : reject(res);
  });
}

async function firebaseSignout() {
  await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);

  const res = await signOut()
    .then((res) => {
      //console.log("signout", res);
      return res;
    })
    .catch((err) => {
      console.error(err);
      return err;
    })
    .finally(closeOffscreenDocument);

  return res;
}

async function firebaseAuth() {
  await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);

  const auth = await getAuth()
    .then((auth) => {
      //console.log("User Authenticated", auth);
      if (auth) {
        // reload the page
        // chrome.tabs.query({ active: true }, function (tabs) {
        //   chrome.tabs.update(tabs[0].id, { url: tabs[0].url })
        // })
      }
      return auth;
    })
    .catch((err) => {
      if (err.code === "auth/operation-not-allowed") {
        console.error(
          "You must enable an OAuth provider in the Firebase" +
            " console in order to use signInWithPopup. This sample" +
            " uses Google by default."
        );
      } else {
        console.error(err);
        return err;
      }
    })
    .finally(closeOffscreenDocument);

  return auth;
}

async function firebaseUser() {
  await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);

  const user = await getUser()
    .then((user) => {
      //console.log("firebaseuser", user);
      return user;
    })
    .catch((err) => {
      console.error(err);
      return err;
    })
    .finally(closeOffscreenDocument);

  return user;
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  //console.log("bg message", message);
  if (message.type === "firebase-auth") {
    firebaseAuth().then((res) => {
      if (res.user) {
        getUserData(res.user);
      }
      sendResponse(res);
    });
  } else if (message.type === "signout") {
    firebaseSignout().then((res) => {
      sendResponse(res);
    });
  } else if (message.type === "current-user") {
    // create offscreen document
    firebaseUser().then((res) => {
      sendResponse(res);
    });
  }
  return true;
});

let isCheck = false;

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  const url = tab.url;
  if (url.includes("https://wordcount-chrome-extension.firebaseapp.com"))
    isCheck = true;

  if (url.includes("https://accounts.google.com/o/oauth2/auth/")) {
    if (isCheck) {
      isCheck = false;
      chrome.windows.update(tab.windowId, { focused: true });
    }
  }
});
/*
function findDailyWordOfDocument(arr) {
  return arr[arr.length - 1] - arr[0];
}

async function findSumDailyWordCount() {
  const today = new Date().toISOString().split("T")[0];
  const result = await chrome.storage.local.get();

  const todayData = result.counts?.[today];
  if (!todayData) {
    return [];
  }

  const keys = Object.keys(todayData);
  let sum = 0;

  keys.forEach((id) => {
    const arr = todayData[id] || [0];
    let innerSum = arr[arr.length - 1] - arr[0];
    sum += innerSum;
  });

  return sum;
}
*/
/*
const sumAllDailyWordCount = async () => {
  const store = await chrome.storage.local.get(["counts"]);

  const counts = store.counts || {};

  const today = new Date().toISOString().split("T")[0];

  const obj = counts[today];

  const keys = Object.keys(obj);

  let sum = 0;
  for (const key of keys) {
    sum += obj[key][obj[key].length - 1] - obj[key][0];
  }

  //console.log("sum", sum);
  return sum;
};
*/
const saveToStorage = (key, value) => {
  chrome.storage.local.set({ [key]: value }, () => {
    //console.log(`Saved ${key} with value ${value}`);
  });
};

const updateDailyStats = (documentId, words, type) => {
  let today = getTodayDate();
  chrome.storage.local.get(["dailyStats"]).then((result) => {
    const dailyStats = result.dailyStats || {};
    let lastWordCount = words;

    if (type == "sync") {
      lastWordCount = getLastSavedWords(dailyStats, documentId); // get last time save words of previous day
      // //console.log('lastWordCount', lastWordCount, documentId);
      if (
        lastWordCount == 0 &&
        dailyStats[today] &&
        dailyStats[today][documentId]
      ) {
        // if word not found and doc is already there then update the same as we don't need any change in this
        lastWordCount = dailyStats[today][documentId][0];
      } else if (lastWordCount == 0 && !dailyStats[today]) {
        lastWordCount = words;
      }
    }

    if (dailyStats[today]) {
      dailyStats[today][documentId] = [lastWordCount, words];
    } else {
      dailyStats[today] = {
        [documentId]: [lastWordCount, words],
      };
    }

    //console.log(JSON.stringify(dailyStats));
    chrome.storage.local.set({ dailyStats: dailyStats }, function () {
      createDayWiseArray(dailyStats, true);
    });
  });
};

function getLastSavedWords(dailyStats, documentId, acc) {
  const today = new Date();
  for (let i = 1; i < 90; i++) {
    let pastDate = new Date();
    pastDate.setDate(today.getDate() - i);

    let year = pastDate.getFullYear();
    let month = ("0" + (pastDate.getMonth() + 1)).slice(-2);
    let day = ("0" + pastDate.getDate()).slice(-2);

    let formattedDate = `${year}-${month}-${day}`;
    // //console.log(formattedDate, dailyStats[formattedDate], dailyStats[formattedDate].documents[documentId])
    if (dailyStats[formattedDate] && dailyStats[formattedDate][documentId]) {
      return dailyStats[formattedDate][documentId][1];
      break;
    }
  }
  return 0;
}

function createDayWiseArray(dailyStats, today = false) {
  //console.log(dailyStats);
  chrome.storage.local.get(["negativeWordSetting"]).then((result) => {
    let allowNegative = "true";
    if (result.negativeWordSetting && result.negativeWordSetting == "false") {
      allowNegative = "false";
    }

    if (today) {
      let todayDate = getTodayDate();
      let todayDocs = dailyStats[todayDate];
      let docKeys = Object.keys(todayDocs);
      let todayWords = 0;
      docKeys.map((doc) => {
        let differerce = todayDocs[doc][1] - todayDocs[doc][0];
        if (differerce < 0 && allowNegative == "false") {
          differerce = 0;
        }

        todayWords = todayWords + differerce;
      });

      chrome.storage.local.get(["dayWiseRecord"], function (result) {
        if (result.dayWiseRecord) {
          let temp = result.dayWiseRecord;
          temp[todayDate] = todayWords;
          chrome.storage.local.set({ dayWiseRecord: temp });
        } else {
          let temp = {};
          temp[todayDate] = todayWords;
          chrome.storage.local.set({ dayWiseRecord: temp });
        }
      });
    } else {
      let array = Object.keys(dailyStats);
      let dayWiseRecord = {};
      array.map((day) => {
        dayWiseRecord[day] = 0;
        let dayDocs = dailyStats[day]; // contains doc1 data and doc2 data
        let docKeys = Object.keys(dayDocs);
        docKeys.map((doc) => {
          let differerce = dayDocs[doc][1] - dayDocs[doc][0];
          if (differerce < 0 && allowNegative == "false") {
            differerce = 0;
          }
          dayWiseRecord[day] = dayWiseRecord[day] + differerce;
        });
      });
      chrome.storage.local.set({ dayWiseRecord: dayWiseRecord });
    }
  });
}

const getUserData = (user, requestFromContent = false) => {
  //console.log("ABC", "abcd")
  const myHeaders = new Headers();
  myHeaders.append("AUTHOR", "1f67c9916afa55b925355907f638c65e");
  myHeaders.append("Content-Type", "application/json");

  let date = getTodayDateAndTime();
  const raw = JSON.stringify({
    email: user.email,
    date: date,
    name: user.displayName,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch("https://signup.authornote.com/api/?action=getUser", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      if (result.status) {
        //console.log("ABC", "abcde")
        chrome.storage.local.set({ user: result.data });
        if (requestFromContent) {
          chrome.storage.local.set({
            detectChangeInContent: new Date().getUTCMilliseconds(),
          });
        }
      }
    })
    .catch((error) => console.error(error));
};
