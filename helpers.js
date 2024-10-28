/*
const updateDailyStats = (callback) => {
  findSumDailyWordCount().then((t) => {
    //console.log("ttt is ", t);
    //const day = shadowRoot.querySelector(`[data-calendar-day="${event.date}"]`);
    const hostElement = document.querySelector("#shadow-host");

    if (!hostElement) {
      console.error("Host element not found.");
      return;
    }
    const shadowRoot = hostElement.shadowRoot;
    shadowRoot.querySelector("#word-count").textContent = t || "0";
    let goal = 0;
    // #progress-percentage
    chrome.storage.local.get().then((result) => {
      const documents = result.documents;
      const counts = result.counts;

      // find current document
      const currentCount = t;

      //console.log("currentCount", currentCount);

      goal = result.dailyGoal || 0;

      if (callback) {
        callback(currentCount, goal);
      }
    });
  });
};*/

const saveToStorage = (key, value) => {
  chrome.storage.local.set({ [key]: value }, () => {
    //console.log(`Saved ${key} with value ${value}`);
  });
};

const updateElement = (key, elementId, callback) => {
  // Fetch initial value from chrome.storage.local
  chrome.storage.local.get([key], function (result) {
    $(`#${elementId}`).text(result[key] || "0");
  });

  // Listen for changes in chrome.storage.local
  chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (namespace === "local" && changes[key]) {
      if (callback) {
        $(`#${elementId}`).text(callback(changes[key].newValue));
      } else {
        $(`#${elementId}`).text(changes[key].newValue);
      }
    }
  });
};

function clearCalendarEvents() {
  const days = document.querySelectorAll(".vcal-date--active");
  for (const day of days) {
    day.classList.remove("vcal-date--active");
    day.textContent = day.querySelector("span").textContent;
  }
}

async function setCalendarEvents(events, dailyGoal = 0) {
  clearCalendarEvents();
  //console.log("events" + dailyGoal);
  //console.log(events);

  const store = await chrome.storage.local.get()
  const counts = store.counts || {}
  const writingStreakType = store.writing_streak || "any_word"
  const customWordCount = store.custom_word_count || 0
  let partialDays = true;
  if(store.partialDaysSetting){
    partialDays = store.partialDaysSetting;
  }

  //console.log('partialDays', partialDays)
  //console.log('partialDay', store)
  var status = 0;

  for (const event of events) {
    //console.log(event.date);
    //console.log(event.value);
    const date = new Date(event.date);
       
    status = 0;
    if(event.value > 0) {
      if(writingStreakType == "any_word"){
          status = 1;
      } else if(writingStreakType == "reached_daily") {
        if (event.value >= dailyGoal) {
          status = 1;
        }
      } else if(writingStreakType == "custom"){
        if(event.value >= customWordCount){
          status = 1;
        }
      }
    } else {
      status = -1;
    }

    //console.log("customWordCount"+customWordCount);
    //console.log(writingStreakType + " "+status);

    const hostElement = document.querySelector("#shadow-host");

    if (!hostElement) {
      console.error("Host element not found.");
      return;
    }
    const shadowRoot = hostElement.shadowRoot;
  
    const day = shadowRoot.querySelector(`[data-calendar-day="${event.date}"]`);
    const CurrentDate = date.getDate(); 
   // const day = document.querySelector(`[data-calendar-day="${event.date}"]`);
    if (day) {
      
            // Extract the day part
     //       const day = date.getDate();
            
            // Display the day part in the div with id "date-display"
            
      if (status == 1) {
        //console.log("AAAAA")
        const span = document.createElement("span");
        span.textContent = CurrentDate;
   
        span.style.overflowWrap = "normal";
        span.style.color = "#fff";
        span.style.backgroundColor = "#52A1BD";
        span.style.borderRadius = "50%";
        span.style.fontSize = "10px";
        span.style.width = "20.2px";
        span.style.height = "20.2px";       
        day.textContent = "";
        day.appendChild(span);
        const tooltip = document.createElement("span");
        tooltip.classList.add("tooltips");
        tooltip.textContent = event.value + " words";
        day.appendChild(tooltip);
        day.classList.add("vcal-date--active");
      } else if (status == 0 && (partialDays == "true" || partialDays == true)) {

        //console.log("BBBBB")
        const span = document.createElement("span");
        span.textContent = CurrentDate;
      
        span.style.overflowWrap = "normal";
        span.style.color = "#52A1BD";
        // span.style.backgroundColor = "#fff";
        span.style.border = "2px solid #52A1BD";
        span.style.borderRadius = "50%";
        span.style.fontSize = "10px";
        span.style.width = "17px";
        span.style.height = "17px";
        day.textContent = "";
        day.appendChild(span);
        const tooltip = document.createElement("span");
        tooltip.classList.add("tooltips");
        tooltip.textContent = event.value + " words";
        day.appendChild(tooltip);
        day.classList.add("vcal-date--active");
      } else {
        //console.log("CCCCC")
        day.textContent = "";
        day.textContent = CurrentDate;
      }
    }
  }
  // calendarTooptip();
}

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

/*
const findLongestStreak = async () => {
  const store = await chrome.storage.local.get();
  const counts = store.counts || {};
  const writingStreakType = store.writing_streak || "any_word";
  const customWordCount = store.custom_word_count || 0;

  const dates = Object.keys(counts).sort();
  let longestStreak = 0;
  let currentStreak = 0;
  let prevDate = null;

  function parseDateString(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day); // month is zero-indexed in JavaScript Date
  }

  function isValidArray(arr) {
    if (arr.length === 0) return false;

    const diff = arr[arr.length - 1] - arr[0];

    switch (writingStreakType) {
      case "any_word":
        return diff > 0;
      case "reached_daily":
        return diff >= customWordCount;
      case "custom":
        return diff > customWordCount;
      default:
        return false;
    }
  }

  dates.forEach((date) => {
    const dateObjects = Object.values(counts[date]);
    const hasValidArrays = dateObjects.some(isValidArray);

    if (hasValidArrays) {
      if (prevDate) {
        const prevDateObj = parseDateString(prevDate);
        const currentDateObj = parseDateString(date);
        const timeDiff = currentDateObj - prevDateObj;
        const daysDiff = timeDiff / (1000 * 3600 * 24);

        if (daysDiff === 1) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }

      prevDate = date;
    } else {
      currentStreak = 0;
      prevDate = null;
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
  });

  return longestStreak;
};

*/

/*
const findCurrentStreak = async () => {
  const store = await chrome.storage.local.get();
  const counts = store.counts || {};
  const writingStreakType = store.writing_streak || "any_word";
  const customWordCount = store.custom_word_count || 0;

  const dates = Object.keys(counts).sort().reverse(); // Sort dates in reverse order
  let currentStreak = 0;
  let prevDate = new Date();

  function parseDateString(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day); // month is zero-indexed in JavaScript Date
  }

  function isValidArray(arr) {
    if (arr.length === 0) return false;

    const diff = arr[arr.length - 1] - arr[0];

    switch (writingStreakType) {
      case "any_word":
        return diff > 0;
      case "reached_daily":
        return diff >= customWordCount;
      case "custom":
        return diff > customWordCount;
      default:
        return false;
    }
  }

  for (const date of dates) {
    const currentDateObj = parseDateString(date);
    const dateObjects = Object.values(counts[date]);
    const hasValidArrays = dateObjects.some(isValidArray);

    const timeDiff = prevDate - currentDateObj;
    const daysDiff = timeDiff / (1000 * 3600 * 24);

    if (hasValidArrays && daysDiff <= 1) {
      currentStreak += 1;
      prevDate = currentDateObj;
    } else {
      break;
    }
  }

  return currentStreak;
};
*/


const prepareGraphAndChartData = () => {
  chrome.storage.local.get(["dayWiseRecord", "dailyGoal"]).then((result) => {
    //console.log("graph and chart data" + result.dailyGoal);
    //console.log(result.dayWiseRecord);
    var dataArray = $.map(result.dayWiseRecord, function (value, key) {
      return {
        date: key,
        value: value,
      };
    });
    //console.log(dataArray);
    setCalendarEvents(dataArray, result.dailyGoal);
   // if(result.dayWiseRecord) {
     
   // }
  });
};

function getWeeklyWordCounts(data){
  const weeklyData = {};

  for (const [date, value] of Object.entries(data)) {
      const startOfWeek = getStartOfWeek(date);
      if (!weeklyData[startOfWeek]) {
          weeklyData[startOfWeek] = 0;
      }
      weeklyData[startOfWeek] += value;
  }
  return weeklyData;
}

function getLast7Weeks() {
    let startOfCurrentWeek = getStartOfWeek();
    // startOfCurrentWeek = addDaysToDate(startOfCurrentWeek, 7);
    const last7Weeks = [];
    //console.log(startOfCurrentWeek)
    for (let i = 0; i < 7; i++) {
        const weekStart = new Date(startOfCurrentWeek);
        weekStart.setDate(startOfCurrentWeek.getDate() - (i * 7));
        // last7Weeks.push(weekStart.toISOString().split('T')[0]);
        last7Weeks.push(getDate(weekStart));
    }

    return last7Weeks.reverse(); // reverse to have the current week first
}

function getStartOfWeek(date = false) {

    let d = new Date();
    if(date){
      d = new Date(date);
    }
    
    /* const day = d.getDay(); // 0 (Sunday) to 6 (Saturday)
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const startOfWeek = new Date(d.setDate(diff)); */

    const day = d.getDay(); // 0 (Sunday) to 6 (Saturday)
    const diff = d.getDate() - day; // calculate the difference between today and Sunday
    const startOfWeek = new Date(d.setDate(diff));

    if(date){
      return getDate(startOfWeek);
    }else{
      return startOfWeek;
    }
    
}
function addDaysToDate(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getDate(timestamp = false) {
    let date = new Date();
    if(timestamp){
      date = new Date(timestamp);
    }
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    
    return `${year}-${month}-${day}`;
}

function getLongestStreak(data, dailyGoal, writingStreakType, customWordCount){
  //   const data = {
  //     "2024-06-18": 7,
  //     "2024-06-19": 7,
  //     "2024-06-28": 7,
  //     "2024-06-26": 7,
  //     "2024-06-29": 7,
  //     "2024-06-22": 7,
  //     "2024-06-20": 11,
  //     "2024-06-25": 5,
  // };

  let minWords = 0;
  if(writingStreakType == "any_word"){
      minWords = 0;
  } else if(writingStreakType == "reached_daily") {
    if (dailyGoal != 0) {
      minWords = dailyGoal - 1; // here we subtracted 1 because we are using > not >=
    }
  } else if(writingStreakType == "custom"){
    if (customWordCount != 0) {
      minWords = customWordCount - 1; // here we subtracted 1 because we are using > not >=
    }
  }
  // Convert keys to sorted array of dates
  // const dates = Object.keys(data).map(date => new Date(date)).sort((a, b) => a - b);
  const dates = Object.keys(data)
    .filter(date => data[date] > minWords) // Filter based on data value > 10
    .map(date => new Date(date)) // Convert date strings to Date objects
    .sort((a, b) => a - b);

  // Initialize variables for streak calculation
  let longestStreak = 0;
  let currentStreak = 1;
  let lastStreak = 1;
  if(dates.length == 0){
    currentStreak = 0;
  }
  for (let i = 1; i < dates.length; i++) {
      const diffInTime = dates[i].getTime() - dates[i - 1].getTime();
      const diffInDays = diffInTime / (1000 * 3600 * 24);
      if (diffInDays === 1) {
          currentStreak += 1;
      } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
      }

      // Check if it's the last streak
      if (i === dates.length - 1) {
          lastStreak = currentStreak;
      }
  }
  // Update longest streak in case the last streak is the longest
  longestStreak = Math.max(longestStreak, currentStreak);
  return longestStreak;
}

function getCurrentStreak(data, dailyGoal, writingStreakType, customWordCount){
  // const data = {
  //   "2024-06-18": 17,
  //   "2024-06-19": 7,
  //   "2024-06-28": 17,
  //   "2024-06-26": 7,
  //   "2024-06-29": 7,
  //   "2024-06-21": 7,
  //   "2024-06-27": 11,
  //   "2024-06-20": 5  
  // };

  let minWords = 0;
  if(writingStreakType == "any_word"){
      minWords = 0;
  } else if(writingStreakType == "reached_daily") {
    if (dailyGoal != 0) {
      minWords = dailyGoal - 1; // here we subtracted 1 because we are using > not >=
    }
  } else if(writingStreakType == "custom"){
    if (customWordCount != 0) {
      minWords = customWordCount - 1; // here we subtracted 1 because we are using > not >=
    }
  }
  
  const today = new Date();
  let currentDate = new Date(today);
  let daysCount = 0;
  let todayDateString = getDate();
  if (data[todayDateString] && data[todayDateString] > minWords) {
    daysCount = 1
  }

  while (true) {
      currentDate.setDate(currentDate.getDate() - 1);
      const dateString = getDate(currentDate);
      if (data[dateString] && data[dateString] > minWords) {
          daysCount++;
      } else {
          break;
      }
  }

  return daysCount;
}