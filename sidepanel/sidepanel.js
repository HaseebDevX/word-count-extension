// Initialize Firebase
var progressChart = null;
var weeklyChart = null;
let emptyMsg = "No documents available";
// var signupLink = "https://buy.stripe.com/test_cN2bKIecraLXaLScMM?prefilled_email=";
// var customerPortalLink = "https://billing.stripe.com/p/login/test_28o29cgwT6yh7gQ3cc";

var signupLink = "https://buy.stripe.com/aEUcQw9Y56yd8dW4gg?prefilled_email=";
var customerPortalLink =
  "https://billing.stripe.com/p/login/3cs6qYeOlg8A6BybII";
var trialTimeinterval = "";
// Create a shadow root
const shadowHost = document.createElement("div");
shadowHost.id = "shadow-host";
document.body.appendChild(shadowHost);
const shadowRoot = shadowHost.attachShadow({ mode: "open" });

// Create the action button and its components
const actionBtn = document.createElement("div");
actionBtn.id = "wc_btn";
const actionIconWrap = document.createElement("span");
actionIconWrap.id = "wc_icon-wrap";
const actionIcon = document.createElement("img");
actionIcon.src = chrome.runtime.getURL("assets/pencil.png");
actionIcon.alt = "Word Count";
const actionHoverIcon = document.createElement("img");
actionHoverIcon.src = chrome.runtime.getURL("assets/arrow.png");
actionHoverIcon.alt = "Word Count";
actionHoverIcon.className = "wc_action-hover";
actionHoverIcon.style.display = "none";
const loaderWrap = document.createElement("div");
loaderWrap.id = "wc_progress-circle";
loaderWrap.className = "wc_first-half";
const loaderInner = document.createElement("div");
loaderInner.id = "wc_progress-inner";
const loaderLeft = document.createElement("div");
loaderLeft.id = "wc_progress-inner-left";
const loaderRight = document.createElement("div");
loaderRight.id = "wc_progress-inner-right";

let isLoginInProgress = false;
let storyDetailsPageOpened = false;

actionIconWrap.appendChild(actionIcon);
actionIconWrap.appendChild(actionHoverIcon);
actionBtn.appendChild(actionIconWrap);
loaderInner.appendChild(loaderLeft);
loaderInner.appendChild(loaderRight);
loaderWrap.appendChild(loaderInner);
actionBtn.appendChild(loaderWrap);

document.body.appendChild(actionBtn);

function applyStyleToOuterSpinner() {
  const mainLoader = shadowRoot.querySelector("#loading-overlay-main");
  if (mainLoader) {
    Object.assign(mainLoader.style, {
      position: "absolute",
      top: "0px",
      left: "0px",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      display: "none",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "9999",
    });
    const spinner = mainLoader.querySelector(".spinner");
    if (spinner) {
      Object.assign(spinner.style, {
        width: "50px",
        height: "50px",
        border: "5px solid #f3f3f3",
        borderTop: "5px solid #3498db",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      });
    }
  }
}

function applyFreeTrialStyles(freeTrialElement, mode) {
  if (!freeTrialElement) return;
  const isStatsMode = mode === "stats";
  freeTrialElement.style.marginTop = isStatsMode ? "60px" : "";
  //freeTrialElement.style.backgroundColor = isStatsMode ? 'white' : '';

  // Apply styles to loading overlay
  const loadingOverlay = freeTrialElement.querySelector("#loading-overlay");
  if (loadingOverlay && !isLoginInProgress) {
    Object.assign(loadingOverlay.style, {
      position: "absolute",
      top: "0px",
      left: "0px",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      display: "none",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "9999",
    });
  }

  // Apply styles to spinner
  const spinner = freeTrialElement.querySelector(".spinner");
  if (spinner) {
    Object.assign(spinner.style, {
      width: "50px",
      height: "50px",
      border: "5px solid #f3f3f3",
      borderTop: "5px solid #3498db",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    });
  }

  // Apply keyframes for spinner
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = `
      @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
      }
  `;
  document.head.appendChild(styleSheet);

  // Apply padding to free-trial-container
  const freeTrialContainer = freeTrialElement.querySelector(
    ".free-trial-container"
  );
  if (freeTrialContainer) {
    freeTrialContainer.style.padding = isStatsMode ? "40px" : "";
  }

  // Apply styles to free trial message
  const freeTrialMessage = freeTrialElement.querySelector(".free-trial");
  if (freeTrialMessage) {
    Object.assign(freeTrialMessage.style, {
      paddingBottom: "5px",
      marginBottom: "20px",
      lineHeight: "normal",
      fontSize: isStatsMode ? "20px" : "14px",
    });
  }

  // Apply styles to list items
  const listItems = freeTrialElement.querySelectorAll("#features-list li");
  listItems.forEach((li) => {
    li.style.fontSize = isStatsMode ? "16px" : "14px";
  });

  // Apply styles to the free trial terms
  const trialTerms = freeTrialElement.querySelectorAll("p");
  if (trialTerms.length > 0) {
    trialTerms[0].style.lineHeight = "10px";
    trialTerms[0].style.marginTop = isStatsMode ? "40px" : "20px";
    trialTerms[0].style.fontSize = isStatsMode ? "20px" : "16px";

    trialTerms[1].style.lineHeight = "3px";
    trialTerms[1].style.fontSize = isStatsMode ? "13px" : "11px";
    trialTerms[1].style.fontStyle = "italic";
    trialTerms[1].style.fontWeight = "bold";
    trialTerms[1].style.margin = "0px";

    trialTerms[2].style.lineHeight = "3px";
    trialTerms[2].style.fontSize = isStatsMode ? "13px" : "11px";
    trialTerms[2].style.fontStyle = "italic";
    trialTerms[2].style.fontWeight = "bold";
  }

  // Apply styles to Sign in with Google button
  const googleSignInButton = freeTrialElement.querySelector("#sign-in-google");
  if (googleSignInButton) {
    const img = googleSignInButton.querySelector("img");
    if (img) {
      img.style.width = "20px";
      img.style.height = isStatsMode ? "20px" : "16px";
      img.style.marginRight = "10px";
    }
    const buttonText = googleSignInButton.querySelector(".button-text");
    if (buttonText) {
      buttonText.style.lineHeight = "10px";
      buttonText.style.fontSize = isStatsMode ? "16px" : "14px";
    }
  }

  // Apply styles to Learn More button
  const learnMoreButton = freeTrialElement.querySelector("#learn-more");
  if (learnMoreButton) {
    const learnMoreText = learnMoreButton.querySelector("span");
    if (learnMoreText) {
      learnMoreText.style.lineHeight = "20px";
      learnMoreText.style.fontSize = isStatsMode ? "16px" : "14px";
    }
  }
}

let currentUser = null;

setInterval(function () {
  chrome.runtime.sendMessage({ action: "syncDocs" });
}, 5000);

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

chrome.runtime.sendMessage({ type: "current-user" }).then((user) => {
  currentUser = user;
  chrome.runtime.sendMessage({
    action: "getUserData",
    email: currentUser?.email,
  });
  console.log("Current User: ", currentUser);
  checkCurrentUser();
  // chrome.storage.local.set({user:currentUser});
});



async function checkCurrentUser() {
  const statsContent = shadowRoot.querySelector("#stats-content");
  const statsContentMain = shadowRoot.querySelector("#content-stats");
  const statsTabElement = shadowRoot.querySelector("#tab-stats");
  const loadingOverlay = shadowRoot.querySelector("#loading-overlay");

  const freeTrial = shadowRoot.querySelector("#wc_free_trial");
  const googleProfile = shadowRoot.querySelector("#sign-in-google-profile");

  const logout = shadowRoot.querySelector("#wc_logout");
  const manageBtn = shadowRoot.querySelector("#wc_manageSubscription");
  if (currentUser !== null) {
    shadowRoot.querySelector("#username-display").innerHTML =
      "Account : " + currentUser.email;
  }
  if (!currentUser) {
    console.log("there is no current user");
    if (statsTabElement.classList.contains("active")) {
      applyFreeTrialStyles(freeTrial, "stats");
      freeTrial.style.display = "block";
      await sleep(1000);
      loadingOverlay.style.display = "none";
    }
    if (!statsTabElement.classList.contains("active")) {
      statsContent.style.display = "none";
    }
    logout.style.display = "none";
    manageBtn.style.display = "none";
  } else {
    if (statsTabElement.classList.contains("active")) {
      loadingOverlay.style.display = "none";
      statsContent.style.display = "block";
      statsContentMain.style.display = "block";
      freeTrial.style.display = "none";
    }
    logout.style.display = "block";
    manageBtn.style.display = "block";
    googleProfile.style.display = "none";
    shadowRoot.querySelector("#username-display").style.display = "block";
  }
  createCalendarInShadowDOM();
}

function formatNumberWithCommas(number) {
  return parseInt(number).toLocaleString("en-US");
}

// Center the progress circle vertically and align it to the right
function positionActionBtn() {
  const actionBtn = document.getElementById("wc_btn");
  $("#wc_progress-circle").hide(); //initially hide the progress bar
  chrome.storage.local.get(
    ["buttonPosition", "documents", "status"],
    function (result) {
      if (result.documents && result.documents != "") {
        updateButtonProgress(result.documents);
      }
      if (
        result.buttonPosition &&
        result.buttonPosition.top &&
        result.buttonPosition.left
      ) {
        actionBtn.style.top = result.buttonPosition.top;
        actionBtn.style.right = result.buttonPosition.left;
      } else {
        // const viewportHeight = window.innerHeight;
        // const circleSize = actionBtn.offsetHeight;
        actionBtn.style.top = "275px";
        actionBtn.style.right = "100px"; // Adjust this value for horizontal positioning
      }
      if (result.status && result.status == "off") {
        $("#wc_btn").removeClass("wc_visible");
      } else {
        $("#wc_btn").addClass("wc_visible");
      }
    }
  );
}

// Position the action button initially
positionActionBtn();

// Reposition the action button when the window is resized
window.addEventListener("resize", positionActionBtn);

// Make the progress circle draggable
let isDragging = false;
let dragStarted = false;
let offsetX, offsetY;
let leftPos = "";
let topPos = "";

// Make the progress circle draggable
actionBtn.addEventListener("mousedown", function (event) {
  isDragging = true;
  dragStarted = false;
  const rect = actionBtn.getBoundingClientRect();
  offsetX = event.clientX - rect.left;
  offsetY = event.clientY - rect.top;
});

document.addEventListener("mousemove", onMouseMove);
document.addEventListener("mouseup", onMouseUp);

function onMouseMove(event) {
  if (isDragging) {
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;

    // Calculate new positions
    let leftPosTemp = event.clientX - offsetX;
    let topPosTemp = event.clientY - offsetY;

    // Ensure the button stays within the window bounds
    if (leftPosTemp < 0) leftPosTemp = 0;
    if (topPosTemp < 0) topPosTemp = 0;
    if (leftPosTemp + 75 > windowWidth) {
      leftPosTemp = windowWidth - 75;
    }
    if (topPosTemp + 75 > windowHeight) {
      topPosTemp = windowHeight - 75;
    }

    leftPos = windowWidth - (leftPosTemp + actionBtn.offsetWidth) + "px";
    topPos = topPosTemp + "px";

    actionBtn.style.right = leftPos;
    actionBtn.style.top = topPos;

    dragStarted = true;
  }
}

function onMouseUp() {
  if (isDragging) {
    if (leftPos !== "" && topPos !== "") {
      chrome.storage.local.set({
        buttonPosition: { left: leftPos, top: topPos },
      });
    }
  }
  isDragging = false;
}

actionBtn.addEventListener("click", function (event) {
  if (dragStarted) {
    event.preventDefault();
    event.stopPropagation();
    dragStarted = false;
  }
});

actionBtn.ondragstart = function () {
  return false;
};

let wcext_sidebar =
  `
  <style>
   #wcext_sidebar{
   display:none;
   }  
</style>
<div id="wcext_sidebar" class="" style="
   width: 100% !important;
   position: fixed !important;
   right: 0px;
   top: 0px !important;
   height: 100vh !important;
   letter-spacing: 0.3px;
   z-index: 999999999999999 !important;
   ">
   <div style="height: 100vh;">
   <div id="loading-overlay-main" style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        ">
        <div class="spinner" style="
          position: absolute;
          top: 45%;
          left: 45%;
          width: 50px;
          height: 50px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          "></div>
    </div>
      <div style="
         display: flex;
         gap: 10px;
         background: white;height: 33.4px;">
         <div class="tabs">
            <div id="tab-documents" class="active">DOCUMENTS</div>
            <div id="tab-stats">STATS</div>
            <div class="dropdown">
               <div id="tab-more">
                  MORE
                  <svg class="arrow-down-outline" width="16" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="#b2b2b2"
                  </svg>
                  <div class="dropdown-content">
                     <!--<div class="more-dropdown" id="tab-rawdata">
                        RAW DATA                    
                          <svg fill="#52A1BD" style="padding-left:10px" height="16px" width="16px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
                              viewBox="0 0 503.607 503.607" xml:space="preserve">
                            <g>
                              <g>
                                <path d="M494.114,54.314l-8.838-6.631c-8.184-6.136-19.884-4.524-26.087,3.592l-14.286,18.625l-1.141-0.906
                                  c-1.788-1.435-4.088-2.056-6.337-1.771c-2.266,0.294-4.314,1.502-5.666,3.349l-3.19,4.331l-29.981-7.504
                                  c-3.299-0.823-6.74,0.411-8.763,3.122l-18.482,24.752v-11.34c0-2.224-0.89-4.356-2.459-5.934L293.335,2.459
                                  C291.765,0.89,289.633,0,287.4,0H10.425C5.792,0,2.032,3.76,2.032,8.393v486.82c0,4.642,3.76,8.393,8.393,8.393H362.95
                                  c4.633,0,8.393-3.752,8.393-8.393V267.7l115.813-153.533c2.736-3.618,2.09-8.763-1.452-11.6l-2.51-2.014l14.789-20.203
                                  C504.01,72.116,502.273,60.441,494.114,54.314z M371.343,123.333l28.588-38.291l17.886,4.474l-46.474,63.161V123.333z
                                  M295.802,28.655l46.886,46.886h-46.886V28.655z M222.721,153.541c3.273-3.273,8.586-3.273,11.868,0l10.282,10.29l36.092-43.302
                                  c2.963-3.559,8.251-4.037,11.818-1.074c3.559,2.971,4.037,8.259,1.074,11.826l-41.967,50.361c-1.511,1.805-3.71,2.904-6.068,3.005
                                  c-0.126,0.008-0.252,0.008-0.378,0.008c-2.224,0-4.356-0.881-5.934-2.459l-16.787-16.787
                                  C219.439,162.136,219.439,156.823,222.721,153.541z M178.294,377.705H77.573c-4.633,0-8.393-3.752-8.393-8.393
                                  c0-4.633,3.76-8.393,8.393-8.393h100.721c4.633,0,8.393,3.76,8.393,8.393C186.688,373.953,182.927,377.705,178.294,377.705z
                                  M178.294,276.984H77.573c-4.633,0-8.393-3.752-8.393-8.393c0-4.633,3.76-8.393,8.393-8.393h100.721
                                  c4.633,0,8.393,3.76,8.393,8.393C186.688,273.232,182.927,276.984,178.294,276.984z M178.294,176.262H77.573
                                  c-4.633,0-8.393-3.752-8.393-8.393c0-4.633,3.76-8.393,8.393-8.393h100.721c4.633,0,8.393,3.76,8.393,8.393
                                  C186.688,172.51,182.927,176.262,178.294,176.262z M245.819,285.369c-0.126,0.008-0.252,0.008-0.378,0.008
                                  c-2.224,0-4.356-0.881-5.934-2.459l-16.787-16.787c-3.282-3.273-3.282-8.586,0-11.868c3.273-3.273,8.586-3.273,11.868,0
                                  l10.282,10.29l36.092-43.302c2.963-3.559,8.251-4.046,11.818-1.074c3.559,2.971,4.037,8.259,1.074,11.826l-41.967,50.361
                                  C250.377,284.168,248.178,285.268,245.819,285.369z M270.068,350.519l-3.76-2.795l11.088-33.616l21.705,16.166L270.068,350.519z
                                  M311.171,316.122l-26.137-17.719l9.72-13.052l25.147,19.347L311.171,316.122z M330.09,291.353l-25.306-19.473l10.114-13.564
                                  l25.768,19.196L330.09,291.353z M350.855,264.175l-25.936-19.322l10.106-13.564l26.406,19.028L350.855,264.175z M371.629,236.972
                                  l-26.574-19.154l10.064-13.513l26.909,19.045L371.629,236.972z M393.284,210.743l-28.815-20.388l5.246-7.126v-0.008l70.379-95.66
                                  l28.756,23.015L393.284,210.743z M484.436,70.429l-14.269,19.498l-12.12-9.569l14.462-18.877c0.646-0.839,1.847-1.007,2.694-0.369
                                  l8.83,6.622C484.881,68.373,485.066,69.573,484.436,70.429z"/>
                              </g>
                            </g>
                            </svg>
                        </div>-->
                     <div class="more-dropdown" id="tab-profile">
                        MY PROFILE
                        <svg fill="#52A1BD" width="16px" height="16px" style="padding-left:10px" viewBox="0 0 24 24" id="user-3" data-name="Flat Color" xmlns="http://www.w3.org/2000/svg" class="icon flat-color">
                           <path id="primary" d="M21,20a2,2,0,0,1-2,2H5a2,2,0,0,1-2-2,8,8,0,0,1,1.79-5,2,2,0,0,1,2.67-.39,8.07,8.07,0,0,0,9.07,0,2,2,0,0,1,2.68.39A8,8,0,0,1,21,20Zm-9-6A6,6,0,1,0,6,8,6,6,0,0,0,12,14Z" style="fill: #52A1BD;"></path>
                        </svg>
                     </div>
                     <div class="more-dropdown" id="tab-contact">
                        CONTACT US
                        <svg style="padding-left:10px" height="16px" width="16px" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                           <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                              <g id="mail-filled-white" fill="#52A1BD" transform="translate(42.686667, 85.339333)">
                                 <path d="M3.55271368e-14,28.7 L213.333914,220.70134 L426.667,28.701 L426.667248,341.333608 L0.00058094128,341.333608 L3.55271368e-14,28.7 Z M394.776,1.42108547e-14 L213.333914,163.285608 L31.89,1.42108547e-14 L394.776,1.42108547e-14 Z" id="Combined-Shape">
                                 </path>
                              </g>
                           </g>
                        </svg>
                     </div>
                     <div class="more-dropdown" id="tab-settings">
                        SETTINGS
                        <svg fill="#52A1BD" style="padding-left:10px" height="16px" width="16px" viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="0.00024000000000000003">
                           <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                           <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                           <g id="SVGRepo_iconCarrier">
                              <path fill-rule="evenodd" clip-rule="evenodd" d="M13.9838 2.54161C14.0711 2.71093 14.0928 2.92777 14.1361 3.36144C14.2182 4.1823 14.2593 4.59274 14.4311 4.81793C14.649 5.10358 15.0034 5.25038 15.3595 5.20248C15.6402 5.16472 15.9594 4.90352 16.5979 4.38113C16.9352 4.10515 17.1038 3.96716 17.2853 3.90918C17.5158 3.83555 17.7652 3.84798 17.9872 3.94419C18.162 4.01994 18.3161 4.17402 18.6243 4.4822L19.5178 5.37567C19.8259 5.68385 19.98 5.83794 20.0558 6.01275C20.152 6.23478 20.1644 6.48415 20.0908 6.71464C20.0328 6.89612 19.8948 7.06478 19.6188 7.4021C19.0964 8.0406 18.8352 8.35984 18.7975 8.64056C18.7496 8.99662 18.8964 9.35102 19.182 9.56893C19.4072 9.74072 19.8176 9.78176 20.6385 9.86385C21.0722 9.90722 21.2891 9.92891 21.4584 10.0162C21.6734 10.1272 21.841 10.3123 21.9299 10.5373C22 10.7145 22 10.9324 22 11.3682V12.6319C22 13.0676 22 13.2855 21.93 13.4626C21.841 13.6877 21.6734 13.8729 21.4583 13.9838C21.289 14.0711 21.0722 14.0928 20.6386 14.1361L20.6386 14.1361C19.818 14.2182 19.4077 14.2592 19.1825 14.4309C18.8967 14.6489 18.7499 15.0034 18.7979 15.3596C18.8357 15.6402 19.0968 15.9593 19.619 16.5976C19.8949 16.9348 20.0328 17.1034 20.0908 17.2848C20.1645 17.5154 20.152 17.7648 20.0558 17.9869C19.98 18.1617 19.826 18.3157 19.5179 18.6238L18.6243 19.5174C18.3162 19.8255 18.1621 19.9796 17.9873 20.0554C17.7652 20.1516 17.5159 20.164 17.2854 20.0904C17.1039 20.0324 16.9352 19.8944 16.5979 19.6184L16.5979 19.6184C15.9594 19.096 15.6402 18.8348 15.3595 18.7971C15.0034 18.7492 14.649 18.896 14.4311 19.1816C14.2593 19.4068 14.2183 19.8173 14.1362 20.6383C14.0928 21.0722 14.0711 21.2891 13.9837 21.4585C13.8728 21.6735 13.6877 21.8409 13.4628 21.9299C13.2856 22 13.0676 22 12.6316 22H11.3682C10.9324 22 10.7145 22 10.5373 21.9299C10.3123 21.841 10.1272 21.6734 10.0162 21.4584C9.92891 21.2891 9.90722 21.0722 9.86385 20.6385C9.78176 19.8176 9.74072 19.4072 9.56892 19.182C9.35101 18.8964 8.99663 18.7496 8.64057 18.7975C8.35985 18.8352 8.04059 19.0964 7.40208 19.6189L7.40206 19.6189C7.06473 19.8949 6.89607 20.0329 6.71458 20.0908C6.4841 20.1645 6.23474 20.152 6.01272 20.0558C5.8379 19.9801 5.6838 19.826 5.37561 19.5178L4.48217 18.6243C4.17398 18.3162 4.01988 18.1621 3.94414 17.9873C3.84794 17.7652 3.8355 17.5159 3.90913 17.2854C3.96711 17.1039 4.10511 16.9352 4.3811 16.5979C4.90351 15.9594 5.16471 15.6402 5.20247 15.3594C5.25037 15.0034 5.10357 14.649 4.81792 14.4311C4.59273 14.2593 4.1823 14.2182 3.36143 14.1361C2.92776 14.0928 2.71093 14.0711 2.54161 13.9838C2.32656 13.8728 2.15902 13.6877 2.07005 13.4627C2 13.2855 2 13.0676 2 12.6318V11.3683C2 10.9324 2 10.7144 2.07008 10.5372C2.15905 10.3123 2.32654 10.1272 2.54152 10.0163C2.71088 9.92891 2.92777 9.90722 3.36155 9.86384H3.36155H3.36156C4.18264 9.78173 4.59319 9.74068 4.81842 9.56881C5.10395 9.35092 5.2507 8.99664 5.20287 8.64066C5.16514 8.35987 4.90385 8.04052 4.38128 7.40182C4.10516 7.06435 3.96711 6.89561 3.90914 6.71405C3.83557 6.48364 3.848 6.23438 3.94413 6.01243C4.01988 5.83754 4.17403 5.68339 4.48233 5.37509L5.37565 4.48177L5.37566 4.48177C5.68385 4.17357 5.83795 4.01947 6.01277 3.94373C6.23478 3.84753 6.48414 3.8351 6.71463 3.90872C6.89612 3.9667 7.06481 4.10472 7.4022 4.38076C8.04061 4.9031 8.35982 5.16427 8.64044 5.20207C8.99661 5.25003 9.35113 5.10319 9.56907 4.81742C9.74077 4.59227 9.78181 4.18195 9.86387 3.36131C9.90722 2.92776 9.9289 2.71098 10.0162 2.5417C10.1271 2.32658 10.3123 2.15898 10.5374 2.07001C10.7145 2 10.9324 2 11.3681 2H12.6318C13.0676 2 13.2855 2 13.4627 2.07005C13.6877 2.15902 13.8728 2.32656 13.9838 2.54161ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" fill="#52A1BD"/>
                           </g>
                        </svg>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
      <div id="panel-body" class="content custom-scroll">
         <div id="content-documents">
            <div style="padding: 0px 13px; display: flex; flex-direction:column; justify-content:space-between">
               <div id="wc_docsWrapper"></div>
               <div style="background:#000">
                  <div id="wc_totalWordsCountWrap" style="
                     position: absolute;
                     bottom: 95px;
                     width: calc(100%);
                     left: 0px;
                     ">
                     <div style="
                        background: #ffffff;
                        text-align: center;
                        margin: auto;
                        width: 145px;
                        padding: 5px 0px;
                        border: 1px solid #fff;
                        border-radius: 5px;
                        ">
                        <div style="
                           margin-bottom: 3px;
                           font-size: 10px;
                           font-weight: 500;
                           color:#000000;
                           font-family: 'UbuntuMedium' !important;
                           ">
                           TOTAL WORDS
                        </div>
                        <div id="wc_totalWordsCount" style="font-size: 17px;font-weight: 500;color:#000000; font-family: Ubuntu;">0</div>
                     </div>
                  </div>
                  <div id="wc_addDocWrap" style="bottom: 55px">
                     <button id="wc_addDoc" style=" font-family: Ubuntu;font-size: 16px;
                        font-weight:normal;
                        line-height: 20px;
                        letter-spacing: 0.3px;
                        width: 80%;
                        ">Add Current Document</button>
                     <button id="wc_linkDoc" style=" font-family: Ubuntu;font-size: 16px;
                        font-weight:normal;
                        line-height: 20px;
                        letter-spacing: 0.3px;
                        width: 80%;
                        ">Linked <img src="${chrome.runtime.getURL(
                          "assets/check.png"
                        )}" width="12px" height="12px"></button>
                  </div>
               </div>
            </div>
         </div>
         <div id = "content-story" style="display:none; ">
         </div>
         <div id="wc_free_trial" style="display: none; ">
            <div id="loading-overlay" style="
               position: absolute;
               top: 0;
               left: 0;
               width: 100%;
               height: 100%;
               background-color: rgba(255, 255, 255, 0.7);
               display: flex;
               justify-content: center;
               align-items: center;
               z-index: 9999;
               ">
               <div class="spinner" style="
                  width: 50px;
                  height: 50px;
                  border: 5px solid #f3f3f3;
                  border-top: 5px solid #3498db;
                  border-radius: 50%;
                  animation: spin 1s linear infinite;
                  "></div>
            </div>
            <style>
               @keyframes spin {
               0% { transform: rotate(0deg); }
               100% { transform: rotate(360deg); }
               }
            </style>
            <div class="free-trial-container">
               <div style="padding-bottom: 30px;line-height: normal; font-size: 18px;" class="free-trial">Sign Up to unlock more features like...</div>
               <ul id="features-list">
                  <li>Daily word count tracker</li>
                  <li>Weekly word count tracker</li>
                  <li>Week-to-Week comparison</li>
                  <li>Writing Streak</li>
               </ul>
               <p style="line-height: 10px;margin-top: 20px;font-size: 16px;">14 DAY FREE TRIAL</p>
               <p style="line-height: 3px;font-size: 11px; font-style:italic; font-weight:bold ;margin: 0px">No Credit Card need to sign up</p>
               <p style="line-height: 3px;font-size: 11px; font-style: italic; font-weight:bold">Continue for $3/month after free trial</p>
               <button id="sign-in-google" class="sign-in-button">
               <img src="${chrome.runtime.getURL(
                 "assets/google.png"
               )}" alt="" style="width: 20px; height: 16px; margin-right: 10px;">
               <span class="button-text" style="line-height: 10px;font-size: 14px;">Sign in with Google</span>
               </button>
               <a href="https://authornote.com/learnmore" class="author_note" target="_blank">
               <button id="learn-more" class="learn-more-button"><span style="line-height: 20px;font-size: 14px;">Learn More</span></button>
               </a>
            </div>
         </div>
         <div id="wc_free_trial_expired" style="display: none;">
            <div id="loading-overlay" style="
               position: absolute;
               top: 0;
               left: 0;
               width: 100%;
               height: 100%;
               background-color: rgba(255, 255, 255, 0.7);
               display: flex;
               justify-content: center;
               align-items: center;
               z-index: 9999;
               display: none;
               ">
               <div class="spinner" style="
                  width: 50px;
                  height: 50px;
                  border: 5px solid #f3f3f3;
                  border-top: 5px solid #3498db;
                  border-radius: 50%;
                  animation: spin 1s linear infinite;
                  "></div>
            </div>
            <style>
               @keyframes spin {
               0% { transform: rotate(0deg); }
               100% { transform: rotate(360deg); }
               }
            </style>
            <div class="free-trial-container">
              <div style="padding-bottom: 30px;line-height: normal; font-size: 18px;" class="free-trial">Unlock more features like...</div>
                <ul id="features-list">
                  <li>Section/Chapter word count breakdown</li>
                  <li>Daily word count tracker</li>
                  <li>Weekly word count tracker</li>
                  <li>Week-to-Week comparison</li>
                  <li>Writing Streak</li>
                </ul>
                <p style="line-height: 10px;margin-top: 20px;font-size: 16px; display:none;">14 DAY FREE TRIAL</p>
                <p style="line-height: 3px;font-size: 11px; font-style:italic; font-weight:bold ;margin: 0px;display:none;">No Credit Card need to sign up</p>
                <p style="line-height: 3px;font-size: 11px; font-style: italic; font-weight:bold;display:none;">Continue for $3/month after free trial</p>
                <button id="sign-in-google" style="display:none;" class="sign-in-button">
                <img src="${chrome.runtime.getURL(
                  "assets/google.png"
                )}" alt="" style="width: 20px; height: 16px; margin-right: 10px;">
                <span class="button-text" style="line-height: 10px;font-size: 14px;">Sign in with Google</span>
                </button>
                <p style="line-height: 3px;font-size: 11px; font-style: italic; font-weight:bold;">$3/month</p>
                <button class="trial-subscribe-btn trial-expire-subscribe">Subscribe</button>
                <a href="https://authornote.com/learnmore" class="author_note" target="_blank">
                <button id="learn-more" class="learn-more-button"><span style="line-height: 20px;font-size: 14px;">Learn More</span></button>
                </a>
            </div>
         </div>
         <div id="content-stats" style="display:none;">
            <div id="wc_overlay" style="display: none;">
               <div class="free-trial-container">
                  <div style="padding-bottom: 30px;line-height: normal; font-size: 18px;" class="free-trial">Unlock more features like...</div>
                  <ul id="features-list">
                     <li>Section/Chapter word count breakdown</li>
                     <li>Daily word count tracker</li>
                     <li>Weekly word count tracker</li>
                     <li>Week-to-Week comparison</li>
                     <li>Writing Streak</li>
                  </ul>
                  <p style="line-height: 10px;margin-top: 20px;font-size: 16px; display:none;">14 DAY FREE TRIAL</p>
                  <p style="line-height: 3px;font-size: 11px; font-style:italic; font-weight:bold ;margin: 0px;display:none;">No Credit Card need to sign up</p>
                  <p style="line-height: 3px;font-size: 11px; font-style: italic; font-weight:bold;display:none;">Continue for $3/month after free trial</p>
                  <button id="sign-in-google" style="display:none;" class="sign-in-button">
                  <img src="${chrome.runtime.getURL(
                    "assets/google.png"
                  )}" alt="" style="width: 20px; height: 16px; margin-right: 10px;">
                  <span class="button-text" style="line-height: 10px;font-size: 14px;">Sign in with Google</span>
                  </button>
                  <p style="line-height: 3px;font-size: 11px; font-style: italic; font-weight:bold;">$3/month</p>
                  <button class="trial-subscribe-btn trial-expire-subscribe">Subscribe</button>
                  <a href="https://authornote.com/learnmore" class="author_note" target="_blank">
                  <button id="learn-more" class="learn-more-button"><span style="line-height: 20px;font-size: 14px;">Learn More</span></button>
                  </a>
               </div>
            </div>
            <div id="stats-content">
               <div class="word-count-container">
                  <select id="filter-startup" >
                     <option value="documents"> All Documents</option>
                  </select>
                  <div class="word-count-header wc_mt_daily">
                     <div class="line"></div>
                     <span class="content-header">DAILY</span>
                     <div class="line"></div>
                  </div>
                  <div class="word-count-body">
                     <div class="word-today">
                        <span class="content-text">Words today</span>
                        <span id="word-count" class="count">0</span>
                     </div>
                     <div class="daily-goal">
                        <p style="min-width: max-content;padding-right: 10px;" class="content-text">Daily Goal</p>  
                        <div id="progress-wrapper" style="display:flex; width: 100%;">
                           <div id="daily-progress-bar-wrapper" style="display:none; background-color:  #C9DFE4; border-radius: 15px; height: 10px; margin-top: 2px;">
                              <div id="daily-progress-bar" style="background-color: #52A1BD; color: white; height: 10px; text-align: right; font-weight: normal; font-size: 20px; border-radius: 15px;"></div>
                           </div>
                           <span id="progress-percentage" style="display:none; font-size:13px;">0%</span>
                           <input id="daily-goal-input" type="text" placeholder="Enter goal" 
                              style=" height: 20px; width:80%; margin-left: 10px; border: 1px solid #52A1BD; border-radius: 5px; padding: 5px; display: none;"/>
                           <span id="daily-goal-label" style='width:100%;text-decoration: underline; color: #52A1BD; cursor:pointer; text-align:right;'>Add goal</span>
                           <span id="update-goal-label" style='display:none;width:100%; cursor:pointer; justify-content: flex-end; align-items: center;'>
                              <svg id="update-goal-label" fill="#52A1BD" width="16px" height="16px" viewBox="0 0 24.00 24.00" xmlns="http://www.w3.org/2000/svg" stroke="#52A1BD" stroke-width="0.00024000000000000003">
                                 <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                                 <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                                 <g id="SVGRepo_iconCarrier">
                                    <path d="M18.111,2.293,9.384,11.021a.977.977,0,0,0-.241.39L8.052,14.684A1,1,0,0,0,9,16a.987.987,0,0,0,.316-.052l3.273-1.091a.977.977,0,0,0,.39-.241l8.728-8.727a1,1,0,0,0,0-1.414L19.525,2.293A1,1,0,0,0,18.111,2.293ZM11.732,13.035l-1.151.384.384-1.151L16.637,6.6l.767.767Zm7.854-7.853-.768.767-.767-.767.767-.768ZM3,5h8a1,1,0,0,1,0,2H4V20H17V13a1,1,0,0,1,2,0v8a1,1,0,0,1-1,1H3a1,1,0,0,1-1-1V6A1,1,0,0,1,3,5Z"/>
                                 </g>
                              </svg>
                              <p id="update-goal-label-text" style="font-size:14px; font-weight:bold; margin:0px; margin-left:5px "></p>
                           </span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            <div class="word-count-container">
               <div class="word-count-header wc_mt_weekly">
                  <div class="line"></div>
                  <span class="content-header">WEEKLY</span>
                  <div class="line"></div>
               </div>
               <div class="word-count-body">
                  <div class="word-weekly">
                     <span class="content-text">Words this week</span>
                     <span id="weekly-count" class="count">0</span>
                  </div>
                  <div id="chartContainer">
                     <canvas id="weekly-bar-chart"></canvas>
                  </div>
               </div>
            </div>
            <div class="writing-streak-container">
               <div class="word-count-header wc_mt_streak">
                  <div class="line"></div>
                  <span class="content-header" style="min-width: max-content;">WRITING STREAK</span>
                  <div class="line"></div>
               </div>
               <div class="writing-streak-body">
                  <div class="streak-info">
                     <div class="streak-current" style="padding: 8px 0px;margin-bottom: 8px;">
                        <span class="content-text">Current Writing Streak <span style="font-style: italic; margin-left: 5px;">(in days)</span></span>
                        <span style="margin-top: 0px;">
                        <span id="current-streak" class="count"></span>
                        </span>
                     </div>
                     <div class="streak-longest" style="padding: 8px 0px;margin-bottom:18px;">
                        <span class="content-text">Longest Writing Streak <span style="font-style: italic; margin-left: 5px;">(in days)</span></span>
                        <span style="margin-top: 0px;">
                        <span id="longest-streak" class="count"></span>
                        </span>
                     </div>
                  </div>
                  <div id="calendar-container"></div>
               </div>
            </div>
         </div>
         <div id="trial-counter-wrap" style="display:none;">
            <div class="trial-remaining-days">
               <div class="trial-end-label">Trial ends in</div>
               <div class="trial-counter">
                  <span id="trial-days"></span> days
                  <span id="trial-hours"></span> hours
                  <span id="trial-minutes"></span> minutes
               </div>
            </div>
            <div class="trial-subscribe-btn-wrap">
               <button class="trial-subscribe-btn">Subscribe</button>
            </div>
         </div>
      </div>
      <div id="content-settings" class="custom-scroll" style="display:none;">
         <div class="settings-section">
            <div class="word-count-header wc_mt_daily" style="line-height:15px;">
               <div class="line"></div>
               <span class="content-header">GENERAL</span>
               <div class="line"></div>
            </div>
            <div class="setting-item">
               <label for="startup" class="content-text">Choose which tab to show on start up</label>
               <select id="startup" >
                  <option value="documents">Documents</option>
                  <option value="stats">Stats</option>
               </select>
            </div>
         </div>
         <div class="settings-section" style = "margin-bottom: 15px">
            <div class="word-count-header wc_mt_daily">
               <div class="line"></div>
               <span class="content-header">DOCS TAB</span>
               <div class="line"></div>
            </div>
            <div style="
               display: flex;
               padding: 0px 5px;
               margin-bottom: 10px;
               justify-content: space-between;
               align-items: center;
               ">
               <div class="content-text" style="width: 80%;color:#000000; font-weight:bold">Show current word count only</div>
               <div>
                  <label style="
                     position: relative;
                     display: inline-block;
                     height: 20px;
                     width: 40px;
                     ">
                  <input type="checkbox" class="wc_setng_input" id="wc_wordCountSetting" style="opacity: 0; width: 0; height: 0;">
                  <span class="wc_setng_slider wc_setng_round" style="
                     position: absolute;
                     cursor: pointer;
                     top: 0;
                     left: 0;
                     right: 0;
                     bottom: 0;
                     background-color: #ccc;
                     -webkit-transition: .4s;
                     transition: .4s;
                     border-radius: 34px;
                     "></span>
                  </label>
               </div>
            </div>
            <div style="
               display: flex;
               padding: 0px 5px;
               margin-bottom: 10px;
               justify-content: space-between;
               align-items: center;
               " class="showProgressSettingWrap">
               <div class="content-text" style="width: 80%;color:#000000;font-weight:bold">Show progress bar</div>
               <div>
                  <label style="
                     position: relative;
                     display: inline-block;
                     height: 20px;
                     width: 40px;
                     ">
                  <input type="checkbox" class="wc_setng_input" id="wc_progressBarSetting" style="opacity: 0; width: 0; height: 0;">
                  <span class="wc_setng_slider wc_setng_round" style="
                     position: absolute;
                     cursor: pointer;
                     top: 0;
                     left: 0;
                     right: 0;
                     bottom: 0;
                     background-color: #ccc;
                     -webkit-transition: .4s;
                     transition: .4s;
                     border-radius: 34px;
                     "></span>
                  </label>
               </div>
            </div>
         </div>
         <div class="settings-section">
            <div class="word-count-header wc_mt_daily">
               <div class="line"></div>
               <span class="content-header">STATS TAB</span>
               <div class="line"></div>
            </div>
            <div style="display: flex;padding: 0px 5px;margin-bottom: 10px;justify-content: space-between;margin-top:15px; align-items: center;" class="negativeWordSettingWrap">
               <div class="content-text" style="width: 80%;color:#000000; font-weight:bold">
                  Allow negative word counts
               </div>
               <div>
                  <label style="position: relative;display: inline-block;height: 20px;width: 40px; ">
                  <input type="checkbox" class="wc_setng_input" id="wc_negativeWordSetting" style="opacity: 0; width: 0; height: 0;">
                  <span class="wc_setng_slider wc_setng_round" style="position: absolute;
                     cursor: pointer;top: 0;left: 0;right: 0;bottom: 0;background-color: #ccc;-webkit-transition: .4s;transition: .4s;border-radius: 34px;"></span>
                  </label>
               </div>
            </div>
            <div class="setting-item">
               <label for="writing_streak" class="content-text" style="margin-top:5px">Word count needed to count in Writing Streak</label>
               <select id="writing_streak" >
                  <option value="any_word" class="content-text">Any word count increase (+)</option>
                  <option value="any_all" class="content-text">Any word count change (+/-)</option>
                  <option value="reached_daily" class="content-text">Reached daily writing goal</option>
               </select>
            </div>
            <div class="word-count-input-parent" style="display:flex; justify-content: end; align-items:center; width:100%;height:26px;" style="display:none;">
               <input type="text" class="word-count-input" >
               <span class="word-count-label">words</span>
            </div>
            <div style="display: flex;padding: 0px 5px;margin-bottom: 10px;justify-content: space-between;margin-top:15px;" class="showPartialSettingWrap">
               <!--<div class="content-text" style="width: 80%;color:#000000;line-height:18px;">
                  Outline any days with a word count change (+/-)
                  </div>
                  <div>
                  <label style="position: relative;display: inline-block;height: 20px;width: 40px;">
                  <input type="checkbox" class="wc_setng_input" id="wc_partialDaysSetting" style="opacity: 0; width: 0; height: 0;">
                  <span class="wc_setng_slider wc_setng_round" style="position: absolute;
                     cursor: pointer;top: 0;left: 0;right: 0;bottom: 0;background-color: #ccc;-webkit-transition: .4s;transition: .4s;border-radius: 34px;"></span>
                  </label>
                  </div>-->
            </div>
         </div>
      </div>
      <div id="content-contact" class="custom-scroll" style="display:none;">
         <div class="settings-section">
            <div class="word-count-header wc_mt_daily">
               <div class="line"></div>
               <span class="content-header">CONTACT US</span>
               <div class="line"></div>
            </div>
            <div class="place-center">
               <label for="startup" class="content-text label-center">Do you have questions? Suggestions? Issues?</label>
               <label for="startup" class="content-text label-center">We want to hear from you</label>
            </div>
            <div class='contact-icons'>
               <div><img src="` +
  chrome.runtime.getURL("assets/email.png") +
  `" style="width:36px;height:36px;"></div>
               <div><img src="` +
  chrome.runtime.getURL("assets/twitter.png") +
  `" style="width:36px;height:36px;"></div>
               <div><img src="` +
  chrome.runtime.getURL("assets/inster.png") +
  `" style="width:36px;height:36px;"></div>
            </div>
         </div>
         <div class="settings-section">
            <div class="word-count-header wc_mt_daily">
               <div class="line"></div>
               <span class="content-header">FREQUENTLY ASKED QUESTIONS</span>
               <div class="line"></div>
            </div>
            <div class="place-center">
               <button id="faq" class="faq-button" style="display: block;">FAQ</button>
            </div>
         </div>
      </div>
      <div id="content-profile" class="custom-scroll" style="display:none;">
         <div class="settings-section">
            <div class="word-count-header wc_mt_daily">
               <div class="line"></div>
               <span class="content-header">MY PROFILE</span>
               <div class="line"></div>
            </div>
         </div>
         <div style="display:flex; flex-direction:column; width: 100%; align-items: center">
            <div for="startup" id="username-display" style="text-align:center; margin-bottom:40px; font-size:16px; font-weight:bold"></div>
            <button id="sign-in-google-profile" class="sign-in-button">
            <img src="${chrome.runtime.getURL(
              "assets/google.png"
            )}" alt="" style="width: 20px; height: 20px; margin-right: 10px;">
            <span class="button-text" style="line-height: 10px;font-size: 16px;">Sign in with Google</span>
            </button>
            <button id="wc_manageSubscription" class="learn-more-button" style="display: none; margin:10px 0px">Subscription</button>
            <button id="wc_logout" class="learn-more-button" style="display: none; margin:10px 0px">Logout</button>
         </div>
      </div>
      <div id="content-rowdata" class="custom-scroll" style="display:none;">
         <div class="settings-section" style="display:flex; flex-direction:column; align-items:center">
            <div class="word-count-header wc_mt_daily">
               <div class="line"></div>
               <span class="content-header">RAW DATA</span>
               <div class="line"></div>
            </div>
            <div id="stats-content" style="width:90%">
               <div class="word-count-container">
                  <select id="filter-startup-rawdata" >
                     <option value="documents">All Documents</option>
                  </select>
               </div>
            </div>
            <div id="wc_rawDataWrapper">
            </div>
            <div id="wc_addRawWrap">
               <button id="wc_addRaw" style=" font-family: Ubuntu;font-size: 16px;
                  display: flex;
                  justify-content: center;
                  align-items:center;
                  cursor: pointer;
                  font-weight:normal;
                  line-height: 20px;
                  letter-spacing: 0.3px;
                  width: 80%;
                  ">
                  <svg id="daily-goal-label" fill="#52A1BD" width="16px" height="16px" viewBox="0 0 24.00 24.00" xmlns="http://www.w3.org/2000/svg" stroke="#52A1BD" stroke-width="0.00024000000000000003">
                     <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                     <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                     <g id="SVGRepo_iconCarrier">
                        <path d="M18.111,2.293,9.384,11.021a.977.977,0,0,0-.241.39L8.052,14.684A1,1,0,0,0,9,16a.987.987,0,0,0,.316-.052l3.273-1.091a.977.977,0,0,0,.39-.241l8.728-8.727a1,1,0,0,0,0-1.414L19.525,2.293A1,1,0,0,0,18.111,2.293ZM11.732,13.035l-1.151.384.384-1.151L16.637,6.6l.767.767Zm7.854-7.853-.768.767-.767-.767.767-.768ZM3,5h8a1,1,0,0,1,0,2H4V20H17V13a1,1,0,0,1,2,0v8a1,1,0,0,1-1,1H3a1,1,0,0,1-1-1V6A1,1,0,0,1,3,5Z"/>
                     </g>
                  </svg>
                  Edit Data
               </button>
            </div>
         </div>
         <div class="settings-section" id="wc_addManual">
            <div class="word-count-header wc_mt_daily">
               <div class="line"></div>
               <span class="content-header">ADD WORD COUNT DATA</span>
               <div class="line"></div>
            </div>
            <div id="stats-content">
               <div class="word-count-container">
                  <select id="filter-startup-add" >
                     <option value="documents">Select a document</option>
                  </select>
               </div>
               <div class="word-count-container">
                  <input type="date" id="manualDate"></input>
               </div>
               <div class="word-count-container" style="position:relative">
                  <input id="manualWord" type="number"></input>
               </div>
            </div>
            <div id="wc_DoneRawWrap">
               <button id="wc_DoneRaw" style=" font-family: Ubuntu;font-size: 16px;
                  display: flex;
                  justify-content: center;
                  align-items:center;
                  cursor: pointer;
                  font-weight:normal;
                  line-height: 20px;
                  letter-spacing: 0.3px;
                  width: 80%;
                  "> Done Editing</button>
            </div>
         </div>
      </div>
   </div>
   <!--<div style="display:flex; align-items:center;gap:6px;    position: absolute;
      bottom: 0;  width: 100%; right: 10px; justify-content:end; ">
      <a href="mailto:mikeaheck@gmail.com" target="_blank" >
         <svg 
            id="mail_icon"
            xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-mail-filled" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M22 7.535v9.465a3 3 0 0 1 -2.824 2.995l-.176 .005h-14a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-9.465l9.445 6.297l.116 .066a1 1 0 0 0 .878 0l.116 -.066l9.445 -6.297z" stroke-width="0" fill="#b3b3b3" />
            <path d="M19 4c1.08 0 2.027 .57 2.555 1.427l-9.555 6.37l-9.555 -6.37a2.999 2.999 0 0 1 2.354 -1.42l.201 -.007h14z" stroke-width="0" fill="#b3b3b3" />
         </svg>
      </a>
      <a href="https://x.com/authornotehq" target="_blank" >
      </a>
      </div>-->
</div>
  `;

function showOrHideLoader(show) {
  if (show) {
    const loaderDiv = shadowRoot.querySelector("#loading-overlay");
    loaderDiv.style.display = "block";
    const spinnerDiv = loaderDiv.querySelector(".spinner");
    spinnerDiv.style.position = "absolute";
    spinnerDiv.style.top = "45%";
    spinnerDiv.style.left = "45%";
    isLoginInProgress = true;
  } else {
    const loaderDiv = shadowRoot.querySelector("#loading-overlay");
    loaderDiv.style.display = "none";
    const spinnerDiv = loaderDiv.querySelector(".spinner");
    spinnerDiv.style.position = "";
    spinnerDiv.style.top = "";
    spinnerDiv.style.left = "";
    isLoginInProgress = false;
    location.reload();
  }
}

if (shadowRoot.querySelector("#wcext_sidebar") == null) {
  shadowRoot.innerHTML += wcext_sidebar;

  // add click listener to google sign in #wc_signin
  shadowRoot
    .querySelector("#sign-in-google")
    .addEventListener("click", function () {
      // Show loading spinner and disable the button
      shadowRoot.querySelector("#sign-in-google").disabled = true;
      shadowRoot.querySelector(".button-text").textContent = "Signing in...";

      //console.log("sign in clicked");

      showOrHideLoader(true);

      chrome.runtime
        .sendMessage({ type: "firebase-auth" })
        .then((result) => {
          if (result.user) {
            currentUser = result.user;
            shadowRoot.querySelector("#wc_logout").style.display = "block";
            shadowRoot.querySelector("#wc_manageSubscription").style.display =
              "block";
            // shadowRoot.querySelector("#loading-overlay").style.display = "none";

            shadowRoot.querySelector("#wc_free_trial").style.display = "none";
            shadowRoot.querySelector("#wc_free_trial_expired").style.display =
              "none";
            shadowRoot.querySelector("#sign-in-google-profile").style.display =
              "none";

            if (
              shadowRoot
                .querySelector("#tab-stats")
                .classList.contains("active")
            ) {
              shadowRoot.querySelector("#content-stats").style.display =
                "block";
              prepareGraphAndChartData();
              shadowRoot.querySelector("#stats-content").style.display =
                "block";
            } else if (
              shadowRoot
                .querySelector("#tab-documents")
                .classList.contains("active")
            ) {
              initStoryPage(globalPanelElement, globalSiteTitle);
            }
          } else {
            alert("Sign in failed. Please contact support.");
          }

          // Hide loading spinner and enable the button
          shadowRoot.querySelector("#sign-in-google").disabled = false;
          shadowRoot.querySelector(".button-text").textContent =
            "Sign in with Google";
        })
        .catch((error) => {
          console.error("sign-in error", error);

          // Hide loading spinner and enable the button in case of error
          shadowRoot.querySelector("#sign-in-google").disabled = false;
          shadowRoot.querySelector(".button-text").textContent =
            "Sign in with Google";
        });
    });
  shadowRoot
    .querySelector("#sign-in-google-profile")
    .addEventListener("click", function () {
      // Show loading spinner and disable the button
      shadowRoot.querySelector("#sign-in-google-profile").disabled = true;
      shadowRoot.querySelector(
        "#sign-in-google-profile .button-text"
      ).textContent = "Signing in...";

      //console.log("sign in clicked");
      showOrHideLoader(true);
      chrome.runtime
        .sendMessage({ type: "firebase-auth" })
        .then((result) => {
          if (result.user) {
            currentUser = result.user;
            shadowRoot.querySelector("#wc_logout").style.display = "block";
            shadowRoot.querySelector("#wc_manageSubscription").style.display =
              "block";
            // shadowRoot.querySelector("#loading-overlay").style.display = "none";
            shadowRoot.querySelector("#stats-content").style.display = "block";
            shadowRoot.querySelector("#wc_free_trial").style.display = "none";
            shadowRoot.querySelector("#wc_free_trial_expired").style.display =
              "none";
            shadowRoot.querySelector(
              "#sign-in-google-profile"
            ).disabled = false;
            shadowRoot.querySelector(
              "#sign-in-google-profile .button-text"
            ).textContent = "Sign in with Google";
            shadowRoot.querySelector("#sign-in-google-profile").style.display =
              "none";
            shadowRoot.querySelector("#content-stats").style.display = "block";
            shadowRoot.querySelector("#username-display").innerHTML =
              "Account : " + currentUser.email;
            prepareGraphAndChartData();
          } else {
            alert("Sign in failed. Please contact support.");
          }

          // Hide loading spinner and enable the button
          shadowRoot.querySelector("#sign-in-google-profile").disabled = false;
          shadowRoot.querySelector(".button-text").textContent =
            "Sign in with Google";
        })
        .catch((error) => {
          console.error("sign-in error", error);

          // Hide loading spinner and enable the button in case of error
        });
    });

  shadowRoot.querySelector("#wc_logout").addEventListener("click", function () {
    // change the button text to "Logging out..."
    shadowRoot.querySelector("#wc_logout").textContent = "Logging out...";
    chrome.runtime.sendMessage({ type: "signout" }).then((result) => {
      //console.log("signout result", result);
      currentUser = null;
      shadowRoot.querySelector("#wc_logout").style.display = "none";
      shadowRoot.querySelector("#wc_manageSubscription").style.display = "none";
      shadowRoot.querySelector("#stats-content").style.display = "none";
      shadowRoot.querySelector("#loading-overlay").style.display = "none";
      shadowRoot.querySelector("#wc_free_trial").style.display = "block";
      shadowRoot.querySelector("#wc_free_trial_expired").style.display = "none";
      shadowRoot.querySelector("#trial-counter-wrap").style.display = "none";
      shadowRoot.querySelector("#sign-in-google-profile").style.display =
        "flex";
      shadowRoot.querySelector("#username-display").innerHTML = "";
      shadowRoot.querySelector("#username-display").style.display = "none";
      shadowRoot.querySelector("#wc_logout").textContent = "Sign out";
      chrome.storage.local.set({ user: "" });
    });
  });

  shadowRoot
    .querySelector("#wc_manageSubscription")
    .addEventListener("click", function () {
      // change the button text to "Logging out..."

      chrome.runtime.sendMessage({
        action: "openCustomerPortal",
        url: customerPortalLink,
      });
    });
}

$(document).on("click", "#wc_btn", function () {
  // document.body.classList.add('body-transform');

  // let windowWidth = window.innerWidth;
  // windowWidth = windowWidth - 310;
  // document.querySelectorAll('div').forEach(function(element) {
  //   element.style.maxWidth = windowWidth+"px";
  // });
  initializeSidebar();
});
function addShadowEventListeners() {
  // Close sidebar
  shadowRoot.addEventListener("click", function (event) {
    //console.log(event);
    if (
      event.target.matches(".closewcext_sidebar img") ||
      event.target.matches(".closewcext_sidebar .closeExtImgWrap")
    ) {
      // document.body.classList.remove('body-transform');
      // document.querySelectorAll('div').forEach(function(element) {
      //   element.style.maxWidth = "";
      // });
      shadowRoot.querySelector("#wcext_sidebar").classList.remove("visible");
      document.querySelector("#wc_btn").classList.remove("wc_sidebarOpened");
      chrome.storage.local.get(["documents"], function (result) {
        if (result.documents && result.documents != "") {
          updateButtonProgress(result.documents);
        }
      });
    }
  });

  // Tab documents
  shadowRoot.addEventListener("click", function (event) {
    if (event.target.id === "tab-documents") {
      storyDetailsPageOpened = false;
      shadowRoot.querySelector("#content-documents").style.display = "block";
      shadowRoot.querySelector("#content-stats").style.display = "none";
      shadowRoot.querySelector("#content-story").style.display = "none";
      shadowRoot.querySelector("#content-story").innerHTML = "";
      shadowRoot.querySelector("#content-settings").style.display = "none";
      shadowRoot.querySelector("#content-contact").style.display = "none";
      shadowRoot.querySelector("#content-profile").style.display = "none";
      shadowRoot.querySelector("#content-rowdata").style.display = "none";

      Array.from(shadowRoot.querySelectorAll(".tabs div")).forEach((tab) => {
        tab.classList.remove("active");
      });
      event.target.classList.add("active");
      shadowRoot.querySelector("#wc_free_trial").style.display = "none";
      shadowRoot.querySelector("#wc_free_trial_expired").style.display = "none";
      Array.from(shadowRoot.querySelectorAll(".content")).forEach((content) => {
        content.style.display = "block";
      });
    }
  });

  // Tab stats
  shadowRoot.addEventListener("click", function (event) {
    if (event.target.id === "tab-stats") {
      initializeStats();
      shadowRoot.querySelector("#content-story").style.display = "none";
      shadowRoot.querySelector("#content-story").innerHTML = "none";

      // Deactivate all tabs and activate the clicked tab
      shadowRoot.querySelectorAll(".tabs div").forEach((tab) => {
        tab.classList.remove("active");
      });
      event.target.classList.add("active");

      // Hide all content sections and display all elements with class 'content'
      const contentIdsToHide = [
        "#content-documents",
        "#content-settings",
        "#content-contact",
        "#content-profile",
        "#content-rowdata",
      ];
      contentIdsToHide.forEach(
        (id) => (shadowRoot.querySelector(id).style.display = "none")
      );
      shadowRoot.querySelectorAll(".content").forEach((content) => {
        content.style.display = "block";
      });

      // Check current user
      checkCurrentUser();

      // Fetch data and set chart events
      chrome.storage.local
        .get(["dayWiseRecord", "dailyGoal"])
        .then((result) => setChartEvents(result.dayWiseRecord))
        .catch((error) => console.error("Error fetching storage data:", error));

      // Add event listener to #filter-startup if it exists
      const filterStartupElement = shadowRoot.querySelector("#filter-startup");
      if (filterStartupElement) {
        filterStartupElement.addEventListener("change", function () {
          const selectedOption = this.querySelector("option:checked");
          const id = selectedOption ? selectedOption.id : null;
          const value = this.value;
          let updatedStats = {};

          if (value !== "documents") {
            chrome.storage.local
              .get(["dailyStats"])
              .then((result) => {
                const dailyStats = result.dailyStats || {};
                Object.keys(dailyStats).forEach((day) => {
                  let dayDocs = dailyStats[day];
                  updatedStats[day] = dayDocs[id];
                  const difference =
                    updatedStats[day] &&
                    updatedStats[day][1] !== undefined &&
                    updatedStats[day][0] !== undefined
                      ? updatedStats[day][1] - updatedStats[day][0]
                      : 0;
                  updatedStats[day] = difference;
                });
                setChartEvents(updatedStats);
              })
              .catch((error) =>
                console.error("Error fetching daily stats:", error)
              );
          } else {
            chrome.storage.local
              .get(["dayWiseRecord", "dailyGoal"])
              .then((result) => setChartEvents(result.dayWiseRecord))
              .catch((error) =>
                console.error("Error fetching storage data:", error)
              );
          }
        });
      } else {
        console.error("#filter-startup element not found");
      }
    }
  });

  // Tab settings
  shadowRoot.addEventListener("click", function (event) {
    if (event.target.id === "tab-settings") {
      shadowRoot.querySelector("#content-documents").style.display = "none";
      shadowRoot.querySelector("#content-stats").style.display = "none";
      shadowRoot.querySelector("#content-contact").style.display = "none";
      shadowRoot.querySelector("#content-profile").style.display = "none";
      shadowRoot.querySelector("#content-rowdata").style.display = "none";
      Array.from(shadowRoot.querySelectorAll(".content")).forEach((content) => {
        content.style.display = "none";
      });
      shadowRoot.querySelector("#content-settings").style.display = "block";
      Array.from(shadowRoot.querySelectorAll(".tabs div")).forEach((tab) => {
        tab.classList.remove("active");
      });
      checkCurrentUser();
      event.target.classList.add("active");
    }
  });
  shadowRoot.addEventListener("click", function (event) {
    if (event.target.id === "tab-contact") {
      shadowRoot.querySelector("#content-documents").style.display = "none";
      shadowRoot.querySelector("#content-stats").style.display = "none";
      shadowRoot.querySelector("#content-settings").style.display = "none";
      shadowRoot.querySelector("#content-profile").style.display = "none";
      shadowRoot.querySelector("#content-rowdata").style.display = "none";
      Array.from(shadowRoot.querySelectorAll(".content")).forEach((content) => {
        content.style.display = "none";
      });
      shadowRoot.querySelector("#content-contact").style.display = "block";
      Array.from(shadowRoot.querySelectorAll(".tabs div")).forEach((tab) => {
        tab.classList.remove("active");
      });
      checkCurrentUser();
      event.target.classList.add("active");
    }
  });
  shadowRoot.addEventListener("click", function (event) {
    if (event.target.id === "tab-profile") {
      shadowRoot.querySelector("#content-documents").style.display = "none";
      shadowRoot.querySelector("#content-stats").style.display = "none";
      shadowRoot.querySelector("#content-settings").style.display = "none";
      shadowRoot.querySelector("#content-contact").style.display = "none";
      shadowRoot.querySelector("#content-rowdata").style.display = "none";
      Array.from(shadowRoot.querySelectorAll(".content")).forEach((content) => {
        content.style.display = "none";
      });
      shadowRoot.querySelector("#content-profile").style.display = "block";
      Array.from(shadowRoot.querySelectorAll(".tabs div")).forEach((tab) => {
        tab.classList.remove("active");
      });
      checkCurrentUser();
      event.target.classList.add("active");
    }
  });
  shadowRoot.addEventListener("click", function (event) {
    if (event.target.id === "tab-rawdata") {
      shadowRoot.querySelector("#content-documents").style.display = "none";
      shadowRoot.querySelector("#content-stats").style.display = "none";
      shadowRoot.querySelector("#content-settings").style.display = "none";
      shadowRoot.querySelector("#content-contact").style.display = "none";
      shadowRoot.querySelector("#content-profile").style.display = "none";
      Array.from(shadowRoot.querySelectorAll(".content")).forEach((content) => {
        content.style.display = "none";
      });
      shadowRoot.querySelector("#content-rowdata").style.display = "block";
      Array.from(shadowRoot.querySelectorAll(".tabs div")).forEach((tab) => {
        tab.classList.remove("active");
      });
      checkCurrentUser();
      event.target.classList.add("active");
    }
  });

  // Add document
  shadowRoot.addEventListener("click", function (event) {
    if (event.target.id === "wc_addDoc") {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        let url = tabs[0].url;
        console.log(url);
        if (url.indexOf("docs.google.com/document/") == -1) {
          console.log("hh");
          return false;
        } else {
          shadowRoot.querySelector("#wc_linkDoc").style.display = "block";
          shadowRoot.querySelector("#wc_addDoc").style.display = "none";
        }

        chrome.runtime.sendMessage({ action: "getDocInfo", url: url });
        
      });
    }
  });

  // shadowRoot.querySelector("#wc_addRaw").addEventListener("click", () => {

  //   const closeIcons = shadowRoot.querySelectorAll("#wc_rawDataWrapper .wc_rawDelete");

  //   closeIcons.forEach(icon => {
  //     icon.style.display = "block"; // Show all close icons
  //   });
  //   shadowRoot.querySelector("#wc_addRaw").style.display ="none";
  //   shadowRoot.querySelector("#wc_addManual").style.display = "block";
  // });
  // shadowRoot.querySelector("#wc_DoneRawWrap").addEventListener("click", () => {

  //   const closeIcons = shadowRoot.querySelectorAll("#wc_rawDataWrapper .wc_rawDelete");

  //   closeIcons.forEach(icon => {
  //     icon.style.display = "none"; // Show all close icons
  //   });
  //   shadowRoot.querySelector("#wc_addRaw").style.display ="block";
  //   shadowRoot.querySelector("#wc_addManual").style.display = "none";
  // });

  shadowRoot.addEventListener("input", function (event) {
    const dateInput = event.target.value.trim();
    const wordInput = shadowRoot.querySelector("#manualWord");
    if (dateInput) {
      wordInput.style.display = "block";
    }
  });

  shadowRoot.addEventListener("click", function (event) {
    if (
      event.target.matches(".wc_delete") ||
      event.target.matches(".wc_delete img") ||
      event.target.matches(".wc_delete span")
    ) {
      let id = event.target.parentElement.getAttribute("data-id");

      chrome.storage.local.get(["documents"]).then((result) => {
        if (result.documents != undefined && result.documents != "") {
          let data = result.documents;
          let index = data.findIndex((x) => x.id == id);

          data.splice(index, 1);
          if (data.length == 0) {
            chrome.storage.local.set({ documents: "" }).then(() => {
              removeDocFromDailyStats(id);
            });
          } else {
            if (index == 0) {
              data[0].pinned = true;
            }
            chrome.storage.local.set({ documents: data }).then(() => {
              removeDocFromDailyStats(id);
            });
          }
        }
      });
    }
  });

  shadowRoot.addEventListener("click", function (event) {
    if (
      event.target.matches(".wc_floatingMenu") ||
      event.target.matches(".wc_floatingMenu div") ||
      event.target.matches(".wc_floatingMenu span") ||
      event.target.matches(".wc_floatingMenu img")
    ) {
      //do nothing
    } else {
      let menus = shadowRoot.querySelectorAll(".wc_floatingMenu");
      menus.forEach(function (element) {
        element.classList.remove("wc_openedMenu");
      });
    }
  });

  // Open document
  shadowRoot.addEventListener("click", function (event) {
    if (
      event.target.matches(".wc_external") ||
      event.target.matches(".wc_external img") ||
      event.target.matches(".wc_external span")
    ) {
      let id = event.target.getAttribute("data-id");
      chrome.storage.local.get(["documents"]).then((result) => {
        let data = result.documents;
        let index = data.findIndex((x) => x.id == id);
        let url = data[index].url;
        chrome.runtime.sendMessage({ action: "openTab", url: url });
        let menus = shadowRoot.querySelectorAll(".wc_floatingMenu");
        menus.forEach(function (element) {
          element.classList.remove("wc_openedMenu");
        });
      });
      shadowRoot.querySelector("#wc_addDoc").style.display = "none";
      shadowRoot.querySelector("#wc_linkDoc").style.display = "block";
    }
  });

  shadowRoot.addEventListener("click", function (event) {
    if (
      event.target.matches(".wc_openMenu") ||
      event.target.matches(".wc_openMenu img")
    ) {
      let docAction = event.target.closest(".wc_docAction");
      if (docAction) {
        let menus = shadowRoot.querySelectorAll(".wc_floatingMenu");
        menus.forEach(function (element) {
          element.classList.remove("wc_openedMenu");
        });
      }
      let menu = docAction.querySelector(".wc_floatingMenu");
      if (menu) {
        menu.classList.add("wc_openedMenu");
      }
    }
  });

  // Add event listener to shadowRoot
  // shadowRoot.addEventListener("click", function(event) {
  //   if (event.target.id === "tab-rawdata") {
  //       const calculateDifference = (arr) => arr.length >= 2 ? arr[1] - arr[0] : 0;

  //       chrome.storage.local.get(['dailyStats']).then((result) => {
  //           const dailyStats = result.dailyStats || {};
  //           const transformedData = {};

  //           for (const [date, entries] of Object.entries(dailyStats)) {
  //               transformedData[date] = {};
  //               for (const [key, values] of Object.entries(entries)) {
  //                   transformedData[date][key] = calculateDifference(values);
  //               }
  //           }

  //           renderRawDataAll(transformedData);

  //       }).catch((error) => {
  //           console.error('Error retrieving dailyStats:', error);
  //       });

  //       // Ensure this event listener is only added once
  //       const filterStartUpRawDataEl = shadowRoot.querySelector('#filter-startup-rawdata');
  //       if (!filterStartUpRawDataEl.classList.contains('listener-added')) {
  //           filterStartUpRawDataEl.classList.add('listener-added');

  //           filterStartUpRawDataEl.addEventListener('change', function () {
  //               shadowRoot.querySelector("#wc_addRaw").style.display = 'block';
  //               shadowRoot.querySelector("#wc_addManual").style.display = 'none';

  //               const selectedOption = this.options[this.selectedIndex];
  //               const id = selectedOption?.id;
  //               const value = this.value;
  //               let updatedStats = {};

  //               if (value === 'documents') {
  //                   // Copy options from #filter-startup-rawdata to #filter-startup-add except the 'documents' option
  //                   const filterStartUpAddEl = shadowRoot.querySelector('#filter-startup-add');
  //                   filterStartUpAddEl.innerHTML = ''; // Clear the current options

  //                   Array.from(filterStartUpRawDataEl.options).forEach(option => {
  //                       if (option.value !== 'documents') {
  //                           const newOption = document.createElement('option');
  //                           newOption.value = option.value;
  //                           newOption.id = option.id;
  //                           newOption.text = option.text;
  //                           filterStartUpAddEl.add(newOption);
  //                       }
  //                   });

  //                   chrome.storage.local.get(['dailyStats']).then((result) => {
  //                       const dailyStats = result.dailyStats || {};
  //                       const transformedData = {};

  //                       for (const [date, entries] of Object.entries(dailyStats)) {
  //                           transformedData[date] = {};
  //                           for (const [key, values] of Object.entries(entries)) {
  //                               transformedData[date][key] = calculateDifference(values);
  //                           }
  //                       }
  //                       renderRawDataAll(transformedData);
  //                   }).catch((error) => {
  //                       console.error('Error retrieving dailyStats:', error);
  //                   });

  //               } else {
  //                   // Filter and process stats as before
  //                   shadowRoot.querySelector('#filter-startup-add').innerHTML = `<option value="${value}" id="${id}">${value}</option>`;

  //                   chrome.storage.local.get(['dailyStats']).then((result) => {
  //                       const dailyStats = result.dailyStats || {};
  //                       Object.keys(dailyStats).forEach((day) => {
  //                           let dayDocs = dailyStats[day] || {};
  //                           updatedStats[day] = dayDocs[id];

  //                           let difference = (updatedStats[day] && updatedStats[day][1] !== undefined && updatedStats[day][0] !== undefined)
  //                               ? (updatedStats[day][1] - updatedStats[day][0])
  //                               : 0;

  //                           updatedStats[day] = difference;
  //                       });

  //                       renderRawDataEach(updatedStats, id);
  //                   }).catch((error) => {
  //                       console.error('Error retrieving dailyStats:', error);
  //                   });
  //               }
  //           });
  //       }
  //   }
  // });

  // Toggle settings
  shadowRoot.addEventListener("click", function (event) {
    if (event.target.id === "wc_setting_icon") {
      shadowRoot.querySelector("#wc_setting_wrapper").toggle();
    }
  });

  // Word count setting change
  shadowRoot.addEventListener("change", function (event) {
    if (event.target.id === "wc_wordCountSetting") {
      let wc_wordCountSetting = shadowRoot.querySelector(
        "#wc_wordCountSetting"
      ).checked;
      if (wc_wordCountSetting) {
        shadowRoot.querySelector(".showProgressSettingWrap").style.display =
          "none";
      } else {
        shadowRoot.querySelector(".showProgressSettingWrap").style.display =
          "flex";
      }
      chrome.storage.local.set(
        { wordCountSetting: wc_wordCountSetting },
        function () {
          renderWithNewSettings();
        }
      );
    }
  });

  // Progress bar setting change
  shadowRoot.addEventListener("change", function (event) {
    if (event.target.id === "wc_progressBarSetting") {
      let wc_progressBarSetting = shadowRoot.querySelector(
        "#wc_progressBarSetting"
      ).checked;
      chrome.storage.local.set(
        { progressBarSetting: wc_progressBarSetting },
        function () {
          renderWithNewSettings();
        }
      );
    }
  });

  shadowRoot.addEventListener("change", function (event) {
    if (event.target.id === "wc_partialDaysSetting") {
      let wc_partialDaysSetting = shadowRoot.querySelector(
        "#wc_partialDaysSetting"
      ).checked;
      chrome.storage.local.set({
        partialDaysSetting: String(wc_partialDaysSetting),
      });
    }
  });

  shadowRoot.addEventListener("change", function (event) {
    if (event.target.id === "wc_negativeWordSetting") {
      let wc_negativeWordSetting = shadowRoot.querySelector(
        "#wc_negativeWordSetting"
      ).checked;
      chrome.storage.local.set({
        negativeWordSetting: String(wc_negativeWordSetting),
      });
    }
  });

  // Add goal link
  shadowRoot.addEventListener("click", function (event) {
    if (event.target.matches(".wc_addGoalLink")) {
      const docWords = event.target.closest(".wc_docWords");
      const docInfo = event.target.closest(".wc_docInfo");
      const docStats = event.target.closest(".wc_docStats");
      docWords.style.display = "none";
      docInfo.classList.add("editing");
      docStats.querySelector(".wc_docGoalUpdate").style.display = "flex";
      docStats.querySelector(".wc_goal_input").focus();
    }
  });

  // Update goal link
  shadowRoot.addEventListener("click", function (event) {
    if (event.target.matches(".wc_updateGoalLink")) {
      const docWords = event.target.closest(".wc_docWords");
      const docInfo = event.target.closest(".wc_docInfo");
      const docStats = event.target.closest(".wc_docStats");

      docWords.style.display = "none";
      docInfo.classList.add("editing");
      docStats.querySelector(".wc_docGoalUpdate").style.display = "flex";
      docStats.querySelector(".wc_goal_input").focus();
    }
  });

  // Goal input blur
  shadowRoot.addEventListener(
    "blur",
    function (event) {
      if (event.target.matches(".wc_goal_input")) {
        const value = event.target.value;
        const docStats = event.target.closest(".wc_docStats");
        const id = docStats.getAttribute("data-id");

        chrome.storage.local.get(["documents"]).then((result) => {
          let existingDocs = result.documents;
          let dIndex = existingDocs.findIndex((x) => x.id == id);
          existingDocs[dIndex].goal = value;
          chrome.storage.local.set({ documents: existingDocs }).then(() => {
            renderWithNewSettings(); // Refresh UI manually
          });
        });
      }
    },
    true
  ); // useCapture = true to capture blur events

  // Goal input keydown
  shadowRoot.addEventListener("keydown", function (event) {
    if (
      event.target.matches(".wc_goal_input") ||
      event.target.matches(".word-count-input") ||
      event.target.matches("#daily-goal-input")
    ) {
      if (event.which === 13) {
        event.target.blur();
      }
    }
  });

  // Pin action
  shadowRoot.addEventListener("click", function (event) {
    if (
      event.target.matches(".wc_rawDelete") ||
      event.target.matches(".wc_rawDelete svg")
    ) {
      let id = event.target.getAttribute("data-id");
      let date = event.target.getAttribute("data-day");
      chrome.storage.local.get(["dailyStats"]).then((result) => {
        if (result.dailyStats) {
          let data = result.dailyStats;

          // Ensure the date exists in dailyStats
          if (data[date]) {
            // Remove the specified id from the data for the given date
            if (data[date][id]) {
              removeDocFromDailyStatsEach(date, id);
            } else {
              console.warn(`ID ${id} does not exist for date ${date}.`);
            }
          } else {
            console.warn(`Date ${date} does not exist in dailyStats.`);
          }
        } else {
          console.warn("No dailyStats data found.");
        }
      });
    }
  });

  // Goal input validation
  shadowRoot.addEventListener("input", function (event) {
    if (
      event.target.matches(".wc_goal_input") ||
      event.target.matches(".word-count-input") ||
      event.target.matches("#daily-goal-input")
    ) {
      let inputValue = event.target.value;
      if (!/^\d*$/.test(inputValue)) {
        event.target.value = inputValue.replace(/[^\d]/g, "");
      }
    }
  });

  shadowRoot.addEventListener("click", function (event) {
    if (
      event.target.id === "update-goal-label" ||
      event.target.id === "daily-goal-label" ||
      event.target.id === "update-goal-label-text"
    ) {
      let progressWrapper = shadowRoot.getElementById("progress-wrapper");
      progressWrapper.classList.add("wc_hovered");
      setTimeout(function () {
        $(shadowRoot).find("#daily-goal-input").focus();
      }, 100);
    }
  });

  
  shadowRoot.addEventListener("click", function (event) {
     console.log("Event ID here----", event.target.id)
    if (
      event.target.id === "wc_subscribe-button" ||
      event.target.matches(".trial-subscribe-btn")
    ) {
      chrome.runtime.sendMessage({
        action: "openStripeTab",
        url: signupLink,
      });
    }
  });
}

// Call the function to add event listeners
addShadowEventListeners();

function getGoalPercentage(words, goal) {
  let percent = Math.floor((parseInt(words) / parseInt(goal)) * 100);
  if (percent > 100) {
    percent = 100;
  } else if (percent < 0) {
    percent = 0;
  }
  return percent;
}

function getAddUpdateGoalLink(goal, extraClass = "") {
  if (goal == "") {
    return `<span class="wc_addGoalLink" style=" font-weight: 410;
     font-family: Ubuntu;
    font-size: 12px;
">Add Goal</span>`;
  } else {
    return `<span class="wc_updateGoalLink ${extraClass}" style=" font-weight: 410;
     font-family: Ubuntu;
    font-size: 12px;">Update Goal</span>`;
  }
}

// Event listener for Add Goal button
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("wc_addGoalLink")) {
    let wrapper = event.target.closest(".daily-goal-wrapper");
    wrapper.querySelector(".wc_docGoalUpdate").style.display = "flex";
    wrapper.querySelector(".wc_goal_input").focus();
    event.target.style.display = "none";
  }
});

// Event listener for Update Goal button
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("wc_updateGoalLink")) {
    let wrapper = event.target.closest(".daily-goal-wrapper");
    wrapper.querySelector(".wc_docGoalUpdate").style.display = "flex";
    wrapper.querySelector(".wc_goal_input").focus();
    event.target.style.display = "none";
  }
});

function renderListing(docs, showWordCountOnly, showProgressBar) {
  if (docs === undefined || docs === "") {
    docs = [];
  }

  // Find the host element that contains the shadow DOM
  const hostElement = document.querySelector("#shadow-host");

  if (!hostElement) {
    console.error("Host element not found.");
    return;
  }

  // Access the shadow root of the host element
  const shadowRoot = hostElement.shadowRoot;

  if (!shadowRoot) {
    console.error("Shadow root not found.");
    return;
  }

  // Define CSS styles as a string for DocsWrapper HTML
  const cssStyles = `
    .wc_docWrap {
      padding: 10px 0 31px 0;
      margin: 6px 4px;
      border: 2px solid transparent;
      border-radius:2px;
      cursor: pointer;
    }
    .wc_docInfo {
      cursor: pointer;
    }
    .wc_docTitleDisplayed {
      color: #000000;
      font-size: 13px;
      line-height: 18px;
      cursor: pointer;
    }
    .wc_docStats {
      margin-top:8px;
      cursor: pointer;
    }
    .wc_docWords {
      font-weight: 500;
      cursor: pointer;
    }
    .wc_docWordsProgressWrap {
      position: relative;
      cursor: pointer;
      
    }
    .wc_docWordsProgress {
      background-color: #C9DFE4;
      width: 65%;
      border-radius: 15px;
      cursor: pointer;

    }
    .wc_docWordsProgress div {
      background-color: #52A1BD;
      color: white;
      cursor: pointer;

    }
.wc_docWordsProgressWrap span {
      font-size: 14px;
      position: absolute;
      left:65%;font-weight: normal;
      margin-top: -14px;
      padding-left: 2px;
      color: #000000;
      font-family: Ubuntu;
      line-height: normal;
      cursor: pointer;
      padding-top:2.5px;
    }

    .wc_docWords span {
      font-size: 14px;
      position: absolute;
      left:65%;font-weight: normal;
      margin-top: -14px;
      padding-left: 4px;
      color: #000000;
      font-family: Ubuntu;
      line-height: normal;
      cursor: pointer;
    }
    .wc_docGoalUpdate {
      display: none;
      align-items: center;
      cursor: pointer;
    }
    .wc_goal_input {
      color: #000000;
      font-family: Ubuntu;
      width: 90px;
      font-size: 12px !important;
      border: 1px solid #dddddd;
      padding-left: 2px;
      height: 16px;
    }
    .wc_addGoalNumber{
     cursor: pointer;
    }
     .wc_addGoalText{
     cursor: pointer;
    }

    .wc_docWrap:hover {
      border: 2px solid #b8d6e0;
      background-color: #f1f5f6;
      border-radius: 6px;
      cursor: pointer;
    }
      .wc_docTitle{
        font-size: 0px;
      }

      .wc_wordsAndGoal{
      cursor: pointer;
      }
    
  `;

  // Create a <style> element and add CSS styles to it
  const styleElement = document.createElement("style");
  styleElement.textContent = cssStyles;
  shadowRoot.appendChild(styleElement);

  // Clear existing content inside the shadow DOM
  const wcDocsWrapper = shadowRoot.querySelector("#wc_docsWrapper");
  const wcTotalWordsCountWrap = shadowRoot.querySelector(
    "#wc_totalWordsCountWrap"
  );
  const wcSelectWrapper = shadowRoot.querySelector("#filter-startup");
  const wcSelectWrapperRaw = shadowRoot.querySelector(
    "#filter-startup-rawdata"
  );
  const wcSelectWrapperEdit = shadowRoot.querySelector("#filter-startup-add");
  wcSelectWrapper.innerHTML = "";
  wcDocsWrapper.innerHTML = ""; // Clear previous content
  wcTotalWordsCountWrap.style.display = docs.length > 0 ? "block" : "none"; // Show/hide total words count

  let totalWordsCount = 0;
  // Build HTML for each document item
  let docHtml = "";
  docs.forEach((item) => {
    totalWordsCount += item.wordCount;
    const clipTitle = (str, maxLen) =>
      str.length <= maxLen
        ? str
        : str.slice(0, str.slice(0, maxLen).lastIndexOf(" ")) + "...";
    const clippedTitle = clipTitle(item.title, 40);

    docHtml += `
      <div class="wc_docWrapOuter"> <!-- Outer wrapper for each document -->
        <div class="wc_docWrap">
          <div class="wc_docInfo">
            <div class="wc_docTitle">${item.title}</div>
            <div class="wc_docTitleDisplayed">${clippedTitle}</div>
            <div class="wc_docStats" data-id="${item.id}">`; // Opening wc_docStats div
    if (showWordCountOnly) {
      docHtml += `
      <span>${formatNumberWithCommas(item.wordCount)} words</span>
        <div class="wc_docWords">
        </div>
      `;
    } else if (showProgressBar) {
      if (item.goal === "") {
        // Display "No goal added" if no goal is set
        docHtml += `
            <span class = "wc_addGoalNumber" style="color: #000000; font-family: Ubuntu;">
              ${formatNumberWithCommas(item.wordCount)} words
            </span>
            <span class = "wc_addGoalText" style="font-style:italic; color: #52a1bd; font-family: Ubuntu; margin-left: 10px"> Add Goal</span>
        `;
      } else {
        docHtml += `
          <div class="wc_docWordsProgressWrap">
            <div class="wc_docWordsProgress" style="background-color: #C9DFE4; border-radius: 15px;">
              <div class = "wc_docFill" style="background-color: #52A1BD; color: white; height: 10px; border-radius: 15px; width: ${getGoalPercentage(
                item.wordCount,
                item.goal
              )}%;"></div>
            </div>
            <span style="font-size: 14px; color: #000000; font-family: Ubuntu; position: absolute; margin-left: 10px;">${getGoalPercentage(
              item.wordCount,
              item.goal
            )}%</span>
       
          </div>
         `;
      }
    } else {
      if (item.goal == "") {
        docHtml += `
            <span class= "wc_wordsAndGoal" style="color: #000000; font-family: Ubuntu">
              ${formatNumberWithCommas(item.wordCount)} words
            </span>
            ${getAddUpdateGoalLink(item.goal)}
        `;
      } else {
        docHtml += `
            <span class= "wc_wordsAndGoal" style="color: #000000; font-family: Ubuntu;">
              ${formatNumberWithCommas(
                item.wordCount
              )} / ${formatNumberWithCommas(item.goal)} words
            </span>
        `;
      }
    }

    docHtml += `
          </div> <!-- Close wc_docStats -->
        </div> <!-- Close wc_docInfo -->
      </div> <!-- Close wc_docWrap -->
    </div> <!-- Close wc_docWrapOuter -->
    `;
  });

  // Update the HTML content of the respective wrappers
  wcDocsWrapper.innerHTML = docHtml;

  let selectHtml = "";
  let selectsAddHtml = "";

  selectHtml += '<option value="documents"> All Documents</option>';
  
  docs.forEach((item) => {
    selectHtml += `<option value="${item.title}" id="${item.id}">${item.title}</option>`;
    selectsAddHtml += selectHtml;
  });
  
  wcSelectWrapper.innerHTML = selectHtml;
  wcSelectWrapperRaw.innerHTML = selectHtml;
  wcSelectWrapperEdit.innerHTML = selectsAddHtml;

  // Handle the case when there are no documents
  if (docs.length === 0) {
    wcDocsWrapper.innerHTML = `
    <div style="font-size: 14px; color: #000; background: transparent; font-weight: normal;">
      ${emptyMsg}
    </div>
  `;
  }

  // Update total words count
  let formattedNumber = formatNumberWithCommas(totalWordsCount);
  shadowRoot.querySelector("#wc_totalWordsCount").innerHTML = formattedNumber;

  // Ensure the event listener is added only once
  if (!wcDocsWrapper.classList.contains("click-listener-added")) {
    wcDocsWrapper.classList.add("click-listener-added");

    wcDocsWrapper.addEventListener("click", function (event) {
      // Stop the event from bubbling up to prevent multiple calls
      event.stopPropagation();
      storyDetailsPageOpened = true;

      //console.log(event.target.classList);
      if (
        event.target.classList.contains("wc_docWrap") ||
        event.target.classList.contains("wc_docTitle") ||
        event.target.classList.contains("wc_docWords") ||
        event.target.classList.contains("wc_docStats") ||
        event.target.classList.contains("wc_docFill") ||
        event.target.classList.contains("wc_docWordsProgress") ||
        event.target.classList.contains("wc_addGoalNumber") ||
        event.target.classList.contains("wc_addGoalText") ||
        event.target.classList.contains("wc_docTitleDisplayed") ||
        event.target.classList.contains("wc_wordsAndGoal")
      ) {
        // Get the title of the clicked document
        let docTitle = event.target
          .closest(".wc_docWrap")
          .querySelector(".wc_docTitle").textContent;
        let contentDocumentBody =
          shadowRoot.getElementById("content-documents");
        //console.log("contentBody", contentDocumentBody);
        contentDocumentBody.style.display = "none";
        shadowRoot.querySelector("#content-documents").style.display = "none";
        shadowRoot.querySelector("#content-stats").style.display = "none";
        shadowRoot.querySelector("#content-story").style.display = "block";
        shadowRoot.querySelector("#content-settings").style.display = "none";
        shadowRoot.querySelector("#content-contact").style.display = "none";
        shadowRoot.querySelector("#content-profile").style.display = "none";
        shadowRoot.querySelector("#content-rowdata").style.display = "none";

        isStoryPanelOpen = true;
        globalPanelElement = shadowRoot.getElementById("content-story");
        globalSiteTitle = docTitle;
        globalPanelElement.style.display = "block";
        console.log("This is #1");
        // Pass the title to the initStoryPage function
        initStoryPage(globalPanelElement, docTitle);
      }
    });
  }
}

// async function renderRawDataAll(docs) {

//   if (docs === undefined || docs === "") {
//     docs = [];
//   }

//   console.log('invoke');
//   // Find the host element that contains the shadow DOM
//   const hostElement = document.querySelector("#shadow-host");

//   if (!hostElement) {
//     console.error("Host element not found.");
//     return;
//   }

//   // Access the shadow root of the host element
//   const shadowRoot = hostElement.shadowRoot;

//   if (!shadowRoot) {
//     console.error("Shadow root not found.");
//     return;
//   }

//   const sums = {};
//   for (const [date, values] of Object.entries(docs)) {
//     const sum = Object.values(values).reduce((acc, val) => acc + val, 0);
//     sums[date] = sum;
//   }

//   const wcRawDataWrapper = shadowRoot.querySelector("#wc_rawDataWrapper");

//   if (!wcRawDataWrapper) {
//     console.error("#wc_rawDataWrapper element not found.");
//     return;
//   }

//   wcRawDataWrapper.innerHTML = "";
//   let docsHtml = `<div class="wc_rawDataWrap">`;

//   const documents = await chrome.storage.local.get(["documents"]).then(result => result.documents);

//   console.log('docs', docs)
//   for (const [date, values] of Object.entries(docs)) {
//     const sum = sums[date];
//    if (sum && sum !==0){
//     let docHtml = `<div class="wc_rawWrapper"><div class="wc_rawInfo">
//                     <div class="wc_rawDate">${date}</div>
//                     <div class="wc_rawWords">${sum} words</div></div>`;

//     for (const [id, number] of Object.entries(values)) {
//       if (number && number !==0) {
//       const document = documents.find(doc => doc.id === id)?.title || "Unknown Title";

//       let color = (number >= 0) ? '#52A1BD' : 'red';
//       docHtml += `<div class="wc_rawWrap"><div class="wc_rawInfoWrap">
//                     <div class="wc_rawTitle">${document}</div>
//                     <div class="wc_rawCount" style="color: ${color}; font-weight:bold">${number}</div>
//                     </div>
//                     <div class="wc_rawDelete" data-id="${id}" data-day="${date}">
//                      <svg class="close-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                       <circle cx="12" cy="12" r="10" stroke="#b3b3b3" stroke-width="2" fill="white" />
//                       <path d="M8 8L16 16" stroke="#b3b3b3" stroke-width="2" stroke-linecap="round" />
//                       <path d="M16 8L8 16" stroke="#b3b3b3" stroke-width="2" stroke-linecap="round" />
//                     </svg>
//                     </div>
//                   </div>`;
//           }
//         }

//     docHtml += `</div>`;
//     docsHtml += docHtml;
//       }
//   }

//   docsHtml += `</div>`;
//   wcRawDataWrapper.innerHTML = docsHtml;
// }

// async function renderRawDataEach(docs, id) {
//   if (docs === undefined || docs === "") {
//     docs = [];
//   }

//   // Find the host element that contains the shadow DOM
//   const hostElement = document.querySelector("#shadow-host");

//   if (!hostElement) {
//     console.error("Host element not found.");
//     return;
//   }

//   // Access the shadow root of the host element
//   const shadowRoot = hostElement.shadowRoot;

//   if (!shadowRoot) {
//     console.error("Shadow root not found.");
//     return;
//   }

//   const wcRawDataWrapper = shadowRoot.querySelector("#wc_rawDataWrapper");

//   if (!wcRawDataWrapper) {
//     console.error("#wc_rawDataWrapper element not found.");
//     return;
//   }

//   wcRawDataWrapper.innerHTML = "";
//   let docsHtml = `<div class="wc_rawDataWrap">`;

//   const documents = await chrome.storage.local.get(["documents"]).then(result => result.documents.find(doc => doc.id === id)?.title || "Unknown Title");

//   for (const [date, values] of Object.entries(docs)) {
//     if (values !== 0 && values){
//       let docHtml = `<div class="wc_rawWrapper"><div class="wc_rawInfo">
//                       <div class="wc_rawDate">${date}</div>
//                       <div class="wc_rawWords">${values} words</div></div>`;
//       let color = (values >= 0) ? '#52A1BD' : 'red';
//       docHtml += `<div class="wc_rawWrap"><div class="wc_rawInfoWrap">
//                     <div class="wc_rawTitle">${documents}</div>
//                     <div class="wc_rawCount" style="color: ${color}; font-weight:bold">${values}</div>
//                     </div>
//                     <div class="wc_rawDelete" data-id="${id}" data-day="${date}">
//                     <svg class="close-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                       <circle cx="12" cy="12" r="10" stroke="#b3b3b3" stroke-width="2" fill="white" />
//                       <path d="M8 8L16 16" stroke="#b3b3b3" stroke-width="2" stroke-linecap="round" />
//                       <path d="M16 8L8 16" stroke="#b3b3b3" stroke-width="2" stroke-linecap="round" />
//                     </svg>
//                     </div>
//                   </div>`;
//       docHtml += `</div>`;
//       docsHtml += docHtml;
//     }
//   }

//   docsHtml += `</div>`;
//   wcRawDataWrapper.innerHTML = docsHtml;
// }

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

const id = extractDocumentId(window.location.href);

const $shadow = $(shadowRoot);

$shadow.find("#daily-goal-input").on("blur", function () {
  let goal = $(this).val();
  let title = shadowRoot.querySelector("#filter-startup").value;

  // Get existing dailyGoal data, update it with the new goal, and then save it
  chrome.storage.local
    .get(["dailyGoal"])
    .then((result) => {
      let dailyGoalData = result.dailyGoal || {};

      // Update the dailyGoal data with the new id and goal
      dailyGoalData[title] = Number(goal);

      // Save the updated dailyGoal data to storage
      return chrome.storage.local.set({ dailyGoal: dailyGoalData });
    })
    .then(() => {
      // Call the function to initialize stats rerender
      initializeStatsRerender();

      // Remove the class from progressWrapper
      let progressWrapper = shadowRoot.getElementById("progress-wrapper");
      progressWrapper.classList.remove("wc_hovered");
    })
    .catch((error) => {
      console.error("Error saving daily goal:", error);
    });
});

$("#daily-goal-input").on("keydown", function (event) {
  if (event.which === 13) {
    $(this).blur();
  }
});


chrome.storage.onChanged.addListener(async (changes, namespace) => {
  console.log("changes", changes);
  if (changes.documents) {
    chrome.storage.local
      .get(["wordCountSetting", "progressBarSetting"])
      .then((result) => {
        renderListing(
          changes.documents.newValue,
          result.wordCountSetting,
          result.progressBarSetting
        );
      });

     const ele=  $(shadowRoot).find("#word-line").hide();
     ele.forEach(element => {
      console.log("element", element)
      element.style.display ='none'
      });

    if (isStoryPanelOpen && storyDetailsPageOpened) {
      const tabInfo = await getActiveTabInfo();
      const currentSiteTitle = tabInfo.title.replace(" - Google Docs", "");
      globalPanelElement = shadowRoot.getElementById("content-story");
      updateOutlineData([globalPanelElement, currentSiteTitle]);

    } else {
      updateOutlineData([]);
    }
    updateButtonProgress(changes.documents.newValue);
  }

  if (changes.dailyGoal) {
  }
  if (changes.buttonPosition) {
    let updatesPos = changes.buttonPosition.newValue;
    if (updatesPos.left) {
      actionBtn.style.right = updatesPos.left;
    }
    if (updatesPos.top) {
      actionBtn.style.top = updatesPos.top;
    }
  }

  if (changes.status) {
    if (changes.status.newValue == "on") {
      $("#wc_btn").addClass("wc_visible");
      $("#wc_btn").addClass("animation"); // to add animation
    } else {
      $("#wc_btn").removeClass("wc_visible");
    }
  }

  if (changes.wordCountSetting) {
    if (changes.wordCountSetting.newValue) {
      $("#wc_progress-circle").hide();
    } else {
      $("#wc_progress-circle").show();
    }
  }

  if (changes.dayWiseRecord) {
    if (shadowRoot.querySelector("#tab-stats").classList.contains("active")) {
      setChartEvents(changes.dayWiseRecord.newValue);
    }
    initializeStats();
  }
  if (changes.writing_streak || changes.custom_word_count) {
    initializeStats();
  }

  if (changes.user) {
    updateUserInfo(changes.user.newValue);
    showOrHideLoader(false);
  }
  if (changes.detectChangeInContent) {
    chrome.storage.local.get(["user"]).then((result) => {
      updateUserInfo(result.user);
    });
  }

  if (changes.negativeWordSetting) {
    //console.log("negativeWordSetting settings updated")
    chrome.storage.local.get(["dailyStats"]).then((result) => {
      let dailyStats = result.dailyStats || {};
      chrome.runtime.sendMessage({
        action: "updateRecordsAsPerSetting",
        dailyStats: dailyStats,
      });
    });
  }

  if (changes.startup) {
    // console.log('startup', changes.startup.newValue)
    $(shadowRoot).find("#startup").val(changes.startup.newValue);
  }
  if (changes.progressbar_source) {
    // console.log('progressbar_source', changes.progressbar_source.newValue)
    $(shadowRoot)
      .find("#progressbar_source")
      .val(changes.progressbar_source.newValue);

    if (changes.progressbar_source.newValue) {
      chrome.storage.local.get(["documents"], function (result) {
        if (result.documents && result.documents != "") {
          updateButtonProgress(result.documents);
        }
      });
    }
  }
  if (changes.wordCountSetting) {
    // console.log('wordCountSetting', )
    let wcWordCountSetting = shadowRoot.querySelector("#wc_wordCountSetting");
    if (wcWordCountSetting) {
      wcWordCountSetting.checked = changes.wordCountSetting.newValue;
    }

    if (changes.wordCountSetting.newValue) {
      shadowRoot.querySelector(".showProgressSettingWrap").style.display =
        "none";
    } else {
      shadowRoot.querySelector(".showProgressSettingWrap").style.display =
        "flex";
    }
    renderWithNewSettings();
  }
  if (changes.progressBarSetting) {
    // console.log('progressBarSetting', changes.progressBarSetting.newValue);
    let wcProgressBarSetting = shadowRoot.querySelector(
      "#wc_progressBarSetting"
    );
    if (wcProgressBarSetting) {
      wcProgressBarSetting.checked = changes.progressBarSetting.newValue;
    }
  }
  if (changes.negativeWordSetting) {
    // console.log('negativeWordSetting', changes.negativeWordSetting.newValue)
    let wcNegativeWordSetting = shadowRoot.querySelector(
      "#wc_negativeWordSetting"
    );
    if (changes.negativeWordSetting.newValue == "false") {
      wcNegativeWordSetting.checked = false;
    } else {
      wcNegativeWordSetting.checked = true;
    }
  }
  if (changes.partialDaysSetting) {
    // console.log('partialDaysSetting', changes.partialDaysSetting.newValue)
    let wcPartialDaysSetting = shadowRoot.querySelector(
      "#wc_partialDaysSetting"
    );
    if (changes.partialDaysSetting.newValue == "false") {
      wcPartialDaysSetting.checked = false;
    } else {
      wcPartialDaysSetting.checked = true;
    }
  }
  if (changes.writing_streak) {
    console.log("writing_streak", changes.writing_streak.newValue);
    let newStreakSettings = changes.writing_streak.newValue;
    $(shadowRoot).find("#writing_streak").val(newStreakSettings);
    let wordCountInputParent = shadowRoot.querySelector(
      ".word-count-input-parent"
    );
    let showPartialSettingWrapElement = shadowRoot.querySelector(
      ".showPartialSettingWrap"
    );

    if (newStreakSettings == "any_word") {
      showPartialSettingWrapElement.style.display = "none";
      wordCountInputParent.style.display = "none";
    } else if (newStreakSettings == "reached_daily") {
      showPartialSettingWrapElement.style.display = "flex";
      wordCountInputParent.style.display = "none";
    } else if (newStreakSettings == "any_all") {
      showPartialSettingWrapElement.style.display = "none";
      wordCountInputParent.style.display = "none";
    }
  }
  if (changes.custom_word_count) {
    // console.log('custom_word_count', changes.custom_word_count.newValue)
    $(shadowRoot)
      .find(".word-count-input")
      .val(changes.custom_word_count.newValue);
  }
  if (changes.user) {
    currentUser = changes.user.newValue;
    checkCurrentUser();
  }

  // if (changes.dailyStats) {
  //   const newValue = changes.dailyStats.newValue;
  //   const result = {};

  //   // Iterate over each date in newValue
  //   for (const date in newValue) {
  //       result[date] = {};

  //       // Iterate over each key for the given date
  //       for (const key in newValue[date]) {
  //           const values = newValue[date][key];
  //           // Calculate the difference between the second and first values
  //           const difference = values[1] - values[0];
  //           result[date][key] = difference;
  //       }
  //   }

  //   renderRawDataAll(result);
  // }
  prepareGraphAndChartData();
});

function updateUserInfo(userData) {
  if (userData == "") {
    return false;
  }
  if (userData.plan_id == "" || userData.plan_id == null) {
    //console.log('bbb')
    let creationDate = new Date(userData.created_at);
    let trialEndDate = creationDate.setDate(creationDate.getDate() + 14);
    //console.log('trialEndDate', new Date(trialEndDate))
    trialEndDate = new Date(trialEndDate);
    clearInterval(trialTimeinterval);
    trialCountdown(trialEndDate);
    trialTimeinterval = setInterval(function () {
      trialCountdown(trialEndDate);
    }, 60 * 1000);
    // //console.log(trialTimeinterval)
  }
}

function initializeStats() {
  // Retrieve all data from Chrome storage
  chrome.storage.local.get().then(function (storage) {
    console.log("document", storage.dailyGoal);
    // Extract the day-wise record and daily goal data
    let dayWiseCount = storage?.dayWiseRecord || {};
    let dailyGoal = storage?.dailyGoal || {}; // Ensure dailyGoal is an object

    // Get other necessary values
    let writingStreakType = storage?.writing_streak || "any_word";
    let customWordCount = storage?.custom_word_count || 0;

    // Example of how to use a specific key (like 'documents') if it exists
    let documents = "documents"; // This key should be defined based on your use case
    let specificDailyGoal = dailyGoal[documents] || 0;

    // Update the stats based on the retrieved data
    setDailyStats(dayWiseCount, specificDailyGoal);
    setWeeklyStats(dayWiseCount);
    setCurrentStreak(
      dayWiseCount,
      specificDailyGoal,
      writingStreakType,
      customWordCount
    );
    setLongestStreak(
      dayWiseCount,
      specificDailyGoal,
      writingStreakType,
      customWordCount
    );
    prepareGraphAndChartData();

    // Handle change event on the filter
  });
}
shadowRoot
  .querySelector("#filter-startup")
  .addEventListener("change", function () {
    const id = $(this).find("option:selected").attr("id");
    const value = $(this).val();
    chrome.storage.local.get().then(function (storage) {
      console.log("filter", storage.dailyGoal);

      let writingStreakType = storage?.writing_streak || "any_word";
      let customWordCount = storage?.custom_word_count || 0;
      let dailyGoal = storage?.dailyGoal || {};
      let dayWiseCount = storage?.dayWiseRecord || {};
      let updatedStats = {};
      if (value !== "documents") {
        // Fetch and process dailyStats if the value is not 'documents'
        const dailyStats = storage?.dailyStats || {};
        let writingStreakType = storage?.writing_streak || "any_word";
        let customWordCount = storage?.custom_word_count || 0;

        let array = Object.keys(dailyStats);
        array.forEach((day) => {
          let dayDocs = dailyStats[day];
          updatedStats[day] = dayDocs[id];

          let difference =
            updatedStats[day] &&
            updatedStats[day][1] !== undefined &&
            updatedStats[day][0] !== undefined
              ? updatedStats[day][1] - updatedStats[day][0]
              : 0;
          updatedStats[day] = difference;
        });

        let dayWiseCount = updatedStats || {};
        let dailyGoalForValue = dailyGoal[value] || 0;

        setDailyStats(dayWiseCount, dailyGoalForValue);
        setWeeklyStats(dayWiseCount);
        setCurrentStreak(
          dayWiseCount,
          dailyGoalForValue,
          writingStreakType,
          customWordCount
        );
        setLongestStreak(
          dayWiseCount,
          dailyGoalForValue,
          writingStreakType,
          customWordCount
        );
        prepareGraphAndChartDataDemo(dayWiseCount, dailyGoalForValue);
      } else {
        // Process the case where value is 'documents'
        let dayWiseCount = storage?.dayWiseRecord || {};
        let dailyGoalForDocuments = dailyGoal[value] || 0;

        setDailyStats(dayWiseCount, dailyGoalForDocuments);
        setWeeklyStats(dayWiseCount);
        setCurrentStreak(
          dayWiseCount,
          dailyGoalForDocuments,
          writingStreakType,
          customWordCount
        );
        setLongestStreak(
          dayWiseCount,
          dailyGoalForDocuments,
          writingStreakType,
          customWordCount
        );
        prepareGraphAndChartDataDemo(dayWiseCount, dailyGoalForDocuments);
      }
    });
  });
function initializeStatsRerender() {
  // Retrieve all data from Chrome storage
  chrome.storage.local
    .get()
    .then((storage) => {
      let writingStreakType = storage?.writing_streak || "any_word";
      let customWordCount = storage?.custom_word_count || 0;
      const value = shadowRoot?.querySelector("#filter-startup")?.value;
      const selectElement = shadowRoot.querySelector("#filter-startup");
      const selectedOption = selectElement?.querySelector("option:checked");
      const id = selectedOption?.getAttribute("id");

      let updatedStats = {};

      // Fetch dailyGoal first
      chrome.storage.local
        .get(["dailyGoal"])
        .then((dailyGoalResult) => {
          const dailyGoal = dailyGoalResult.dailyGoal || {};

          if (value !== "documents") {
            // Fetch and process dailyStats if the value is not 'documents'
            chrome.storage.local
              .get(["dailyStats"])
              .then((dailyStatsResult) => {
                const dailyStats = dailyStatsResult.dailyStats || {};

                let array = Object.keys(dailyStats);
                array.forEach((day) => {
                  let dayDocs = dailyStats[day] || {};
                  updatedStats[day] = dayDocs[id];

                  let difference =
                    updatedStats[day] &&
                    updatedStats[day][1] !== undefined &&
                    updatedStats[day][0] !== undefined
                      ? updatedStats[day][1] - updatedStats[day][0]
                      : 0;
                  updatedStats[day] = difference;
                });

                let dayWiseCount = updatedStats || {};
                let dailyGoalForValue = dailyGoal[value] || 0; // Ensure dailyGoal is defined

                setDailyStats(dayWiseCount, dailyGoalForValue);
                setWeeklyStats(dayWiseCount);
                setCurrentStreak(
                  dayWiseCount,
                  dailyGoalForValue,
                  writingStreakType,
                  customWordCount
                ); // Ensure writingStreakType, customWordCount are defined
                setLongestStreak(
                  dayWiseCount,
                  dailyGoalForValue,
                  writingStreakType,
                  customWordCount
                ); // Ensure writingStreakType, customWordCount are defined
                prepareGraphAndChartDataDemo(dayWiseCount, dailyGoalForValue);
              })
              .catch((error) => {
                console.error(
                  "Error fetching dailyStats from Chrome Storage:",
                  error
                );
              });
          } else {
            // Process the case where value is 'documents'
            let dayWiseCount = storage.dayWiseRecord || {};
            let dailyGoalForDocuments = dailyGoal["documents"] || 0; // Enclose 'documents' in quotes

            setDailyStats(dayWiseCount, dailyGoalForDocuments);
            setWeeklyStats(dayWiseCount);
            setCurrentStreak(
              dayWiseCount,
              dailyGoalForDocuments,
              writingStreakType,
              customWordCount
            ); // Ensure writingStreakType, customWordCount are defined
            setLongestStreak(
              dayWiseCount,
              dailyGoalForDocuments,
              writingStreakType,
              customWordCount
            ); // Ensure writingStreakType, customWordCount are defined
            prepareGraphAndChartData();
          }
        })
        .catch((error) => {
          console.error("Error fetching dailyGoal from Chrome Storage:", error);
        });
    })
    .catch((error) => {
      console.error("Error fetching data from Chrome Storage:", error);
    });
}

function setDailyStats(dayWiseRecord, dailyGoal) {
  console.log(dailyGoal);
  let wordsToday = 0;
  let today = getDate();
  if (dayWiseRecord && dayWiseRecord[today]) {
    wordsToday = dayWiseRecord[today];
  }

  if (dailyGoal != 0) {
    let progressWrapper = shadowRoot.getElementById("progress-wrapper");
    progressWrapper.classList.add("hover-visible");

    let filled = getGoalPercentage(wordsToday, dailyGoal);
    let dailyGoalElement = shadowRoot.getElementById("daily-goal-label");
    dailyGoalElement.style.display = "none";

    let dailyGoalProgress = shadowRoot.getElementById(
      "daily-progress-bar-wrapper"
    );
    dailyGoalProgress.style.display = "block";

    let dailyGoalProgressPercent =
      shadowRoot.getElementById("daily-progress-bar");
    dailyGoalProgressPercent.style.width = filled + "%";

    let dailyGoalPercentage = shadowRoot.getElementById("progress-percentage");
    dailyGoalPercentage.textContent = filled + "%";
    dailyGoalPercentage.style.display = "block";

    shadowRoot.getElementById("daily-goal-input").value = dailyGoal;
    shadowRoot.getElementById("update-goal-label-text").innerHTML =
      dailyGoal + " words";
  } else {
    let progressWrapper = shadowRoot.getElementById("progress-wrapper");
    progressWrapper.classList.remove("hover-visible");

    let dailyGoalElement = shadowRoot.getElementById("daily-goal-label");
    dailyGoalElement.style.display = "block";

    let dailyGoalProgress = shadowRoot.getElementById(
      "daily-progress-bar-wrapper"
    );
    dailyGoalProgress.style.display = "none";

    let dailyGoalPercentage = shadowRoot.getElementById("progress-percentage");
    dailyGoalPercentage.style.display = "none";
  }

  shadowRoot.getElementById("word-count").textContent = wordsToday;
}

function setWeeklyStats(dayWiseRecord) {
  let weeklyWordCounts = getWeeklyWordCounts(dayWiseRecord);
  let currentWeek = getDate(getStartOfWeek());
  let currentWeekCount = 0;
  if (weeklyWordCounts[currentWeek]) {
    currentWeekCount = weeklyWordCounts[currentWeek];
  }
  shadowRoot.getElementById("weekly-count").textContent = currentWeekCount;
}

function setCurrentStreak(
  dayWiseCount,
  dailyGoal,
  writingStreakType,
  customWordCount
) {
  let currentStreak = getCurrentStreak(
    dayWiseCount,
    dailyGoal,
    writingStreakType,
    customWordCount
  );
  shadowRoot.getElementById("current-streak").textContent = currentStreak;
}

function setLongestStreak(
  dayWiseCount,
  dailyGoal,
  writingStreakType,
  customWordCount
) {
  let longestStreak = getLongestStreak(
    dayWiseCount,
    dailyGoal,
    writingStreakType,
    customWordCount
  );
  shadowRoot.getElementById("longest-streak").textContent = longestStreak;
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "openSidePanel") {
    //console.log("button clicked")
    // $("#wcext_sidebar").removeClass("visible");
    let wcextSidebarElement = shadowRoot.querySelector("#wcext_sidebar");
    if (wcextSidebarElement) {
      wcextSidebarElement.classList.remove("visible");
    }
    let status = "";
    if ($("#wc_btn").hasClass("wc_sidebarOpened")) {
      $("#wc_btn").removeClass("wc_sidebarOpened");
    }
    if ($("#wc_btn").hasClass("wc_visible")) {
      status = "off";
    } else {
      status = "on";
      chrome.storage.local.get(["buttonPosition"], function (result) {
        if (
          result.buttonPosition &&
          result.buttonPosition.top &&
          result.buttonPosition.left
        ) {
          let position = result.buttonPosition;
          position.top = "275px";
          position.left = "100px";
          chrome.storage.local.set({ buttonPosition: position });
        }
      });
    }
    chrome.storage.local.set({ status: status });
  } else if (message.action == "disableStripeEmailField") {
    //console.log("Disable email field")

    const EmailFieldInterval = setInterval(function () {
      if (document.getElementById("email") !== null) {
        // If element exists, clear the interval and set it to readOnly
        clearInterval(EmailFieldInterval);
        const emailInput = document.getElementById("email");
        emailInput.readOnly = true;
        //console.log('Email input field is now read-only.');
      }
    }, 500);
  }
});

function renderWithNewSettings() {
  chrome.storage.local
    .get(["documents", "wordCountSetting", "progressBarSetting"])
    .then((result) => {
      renderListing(
        result.documents,
        result.wordCountSetting,
        result.progressBarSetting
      );
    });
}
function loadScripts() {
  return Promise.all([
    loadScript(chrome.runtime.getURL("calendar.js")),
    loadScript(chrome.runtime.getURL("chart.js")),
  ]);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
function loadStyles() {
  return Promise.all([
    loadStyle(chrome.runtime.getURL("content.css")),
    loadStyle(chrome.runtime.getURL("calendar.css")),
  ]);
}

function loadStyle(href) {
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = href;
    link.onload = resolve;
    link.onerror = reject;
    shadowRoot.appendChild(link);
  });
}

function loadCustomFont() {
  return new Promise((resolve, reject) => {
    try {
      const regularFontUrl = chrome.runtime.getURL("fonts/Ubuntu-Regular.ttf");
      const mediumFontUrl = chrome.runtime.getURL("fonts/Ubuntu-Medium.ttf");
      const styleSheet = `
        @font-face {
          font-family: 'Ubuntu';
          src: url('${regularFontUrl}') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
        @font-face {
          font-family: 'UbuntuMedium';
          src: url('${mediumFontUrl}') format('truetype');
          font-weight: 500;
          font-style: normal;
        }
        body #wcext_sidebar {
          font-family: 'Ubuntu', sans-serif;
        }
      `;

      const styleEl = document.createElement("style");
      styleEl.textContent = styleSheet;
      document.head.appendChild(styleEl);

      // Resolve the promise after appending the style element
      resolve("Fonts loaded and style appended");
    } catch (error) {
      // Reject the promise if an error occurs
      reject(error);
    }
  });
}

storyRoot = "";

function initializeSidebar() {
  // Find the host element that contains the shadow DOM
  const hostElement = document.querySelector("#shadow-host");

  if (!hostElement) {
    console.error("Host element not found.");
    return;
  }

  // Access the shadow root of the host element
  const shadowRoot = hostElement.shadowRoot;

  if (!shadowRoot) {
    console.error("Shadow root not found.");
    return;
  }

  // Initialize sidebar elements within the shadow DOM
  const wcextSidebar = shadowRoot.querySelector("#wcext_sidebar");
  if (!wcextSidebar) {
    console.error("#wcext_sidebar not found within shadow DOM.");
    return;
  }

  loadScripts();
  loadStyles();
  loadCustomFont();
  const wcWordCountSetting = shadowRoot.querySelector("#wc_wordCountSetting");
  const wcProgressBarSetting = shadowRoot.querySelector(
    "#wc_progressBarSetting"
  );
  const wcPartialDaysSetting = shadowRoot.querySelector(
    "#wc_partialDaysSetting"
  );

  const wcNegativeWordSetting = shadowRoot.querySelector(
    "#wc_negativeWordSetting"
  );

  // Example of setting properties
  if (wcWordCountSetting) {
    wcWordCountSetting.checked = false;
  }

  if (wcProgressBarSetting) {
    wcProgressBarSetting.checked = false;
  }

  if (wcPartialDaysSetting) {
    wcPartialDaysSetting.checked = true;
  }

  if (wcNegativeWordSetting) {
    wcNegativeWordSetting.checked = true;
  }

  // Example of fetching data from Chrome storage and updating UI
  chrome.storage.local.get(
    [
      "documents",
      "wordCountSetting",
      "progressBarSetting",
      "startup",
      "partialDaysSetting",
      "user",
      "writing_streak",
      "negativeWordSetting",
    ],
    async (result) => {
      //console.log("ABC", "a")
      if (result.user && result.user != "") {
        //console.log("ABC", "ab")
        chrome.runtime.sendMessage({
          action: "getUserData",
          email: result.user.email,
        });
      }
      if (result.wordCountSetting) {
        if (wcWordCountSetting) {
          wcWordCountSetting.checked = true;
        }
        // Example of hiding an element within shadow DOM
        const showProgressSettingWrap = shadowRoot.querySelector(
          ".showProgressSettingWrap"
        );
        if (showProgressSettingWrap) {
          showProgressSettingWrap.style.display = "none";
        }
      }
      if (result.progressBarSetting) {
        if (wcProgressBarSetting) {
          wcProgressBarSetting.checked = true;
        }
      }

      if (result.partialDaysSetting && result.partialDaysSetting == "false") {
        wcPartialDaysSetting.checked = false;
      }

      if (result.negativeWordSetting && result.negativeWordSetting == "false") {
        wcNegativeWordSetting.checked = false;
      }

      const showPartialSettingWrapElement = shadowRoot.querySelector(
        ".showPartialSettingWrap"
      );
      if (result.writing_streak == "any_word") {
        showPartialSettingWrapElement.style.display = "none";
      } else {
        showPartialSettingWrapElement.style.display = "flex";
      }
      // Example of manipulating elements based on data
      if (!result.documents || result.documents === "") {
        const wcDocsWrapper = shadowRoot.querySelector("#wc_docsWrapper");
        storyRoot = wcDocsWrapper;
        if (wcDocsWrapper) {
          wcDocsWrapper.innerHTML = `
          <div style='font-size: 14px !important; color: #000 !important; background: transparent !important; font-weight: normal !important;'>
            ${emptyMsg}
          </div>`;
        }
        const wcTotalWordsCountWrap = shadowRoot.querySelector(
          "#wc_totalWordsCountWrap"
        );
        if (wcTotalWordsCountWrap) {
          wcTotalWordsCountWrap.style.display = "none";
        }
      } else {
        // Example of calling a function to render listing
        renderListing(
          result.documents,
          result.wordCountSetting,
          result.progressBarSetting
        );
      }
      // Example of clicking tabs based on startup data
      if (result.startup === "documents") {
        const tabDocuments = shadowRoot.querySelector("#tab-documents");
        if (tabDocuments) {
          tabDocuments.click();
        }
      } else if (result.startup === "stats") {
        const tabStats = shadowRoot.querySelector("#tab-stats");
        if (tabStats) {
          tabStats.click();
        }
      }
    }
  );

  // initial URL check, get the current active tab url
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs || tabs.length === 0) {
      console.error("No active tabs found.");
      return;
    }

    let url = tabs[0].url;
    console.log(url);

    // Make sure shadowRoot is defined
    if (typeof shadowRoot === "undefined") {
      console.error("shadowRoot is not defined");
      return;
    }

    const wcAddDoc = shadowRoot.querySelector("#wc_addDoc");
    const wcLinkDoc = shadowRoot.querySelector("#wc_linkDoc");

    if (!wcAddDoc || !wcLinkDoc) {
      console.error("Required elements not found in shadowRoot");
      return;
    }

    if (url.indexOf("docs.google.com/document/d") === -1) {
      wcAddDoc.disabled = true;
    }
  });

  chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;

      let tab = tabs[0];
      let url = tab.url;
      console.log(url);

      if (url.indexOf("docs.google.com/document/d") === -1) {
        updateNonDocsUI();
      } else {
        chrome.storage.local.get(["documents"]).then((result) => {
          let data = result.documents || [];

          const match = data.find((doc) => {
            const docId = extractGoogleDocsId(url);
            return doc.url.includes(docId);
          });
          let siteTitle = "";

          if (match) {
            siteTitle = match.title;
            updateDocsUI(true);
            console.log("Tab Changed. ABout to initStory: ", siteTitle);
            initStoryPage(globalPanelElement, siteTitle);
          } else {
            updateDocsUI(false);
          }
        });
      }
    });
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) return;

        let tab = tabs[0];
        let url = tab.url;
        console.log(url);

        if (url.indexOf("docs.google.com/document/d") === -1) {
          updateNonDocsUI();
        } else {
          chrome.storage.local.get(["documents"]).then((result) => {
            let data = result.documents || [];
            const match = data.find((doc) => {
              const docId = extractGoogleDocsId(url);
              return doc.url.includes(docId);
            });
            console.log(data);

            if (match) {
              updateDocsUI(true);
            } else {
              updateDocsUI(false);
            }
          });
        }
      });
    }
  });

  function updateNonDocsUI() {
    const wcAddDoc = shadowRoot.querySelector("#wc_addDoc");
    const wcLinkDoc = shadowRoot.querySelector("#wc_linkDoc");
    if (wcAddDoc) {
      wcAddDoc.style.display = "block";
      wcAddDoc.disabled = true;
      wcLinkDoc.style.display = "none";
    }
  }

  function updateDocsUI(isMatched) {
    const wcAddDoc = shadowRoot.querySelector("#wc_addDoc");
    const wcLinkDoc = shadowRoot.querySelector("#wc_linkDoc");

    

    if (isMatched) {
      console.log("TURNING ON LINK DOC");
      wcLinkDoc.style.display = "block";
      wcAddDoc.style.display = "none";
    } else {
      console.log("TURNING OFF LINK DOC");
      wcAddDoc.style.display = "block";
      wcAddDoc.disabled = false;
      wcLinkDoc.style.display = "none";
    }
  }

  // Example of manipulating classes within shadow DOM
  const wcextSidebarElement = shadowRoot.querySelector("#wcext_sidebar");
  if (wcextSidebarElement) {
    wcextSidebarElement.classList.add("visible");
  }

  const wcBtnElement = document.querySelector("#wc_btn");
  if (wcBtnElement) {
    wcBtnElement.classList.add("wc_sidebarOpened");
    wcBtnElement.classList.remove("animation");
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;

    let tab = tabs[0];
    let url = tab.url;
    console.log(url);

    if (url.indexOf("docs.google.com/document/d") === -1) {
      updateNonDocsUI();
    } else {
      chrome.storage.local.get(["documents"]).then((result) => {
        let data = result.documents || [];
        const match = data.find((doc) => {
          const docId = extractGoogleDocsId(url);
          return doc.url.includes(docId);
        });

        if (match) {
          updateDocsUI(true);
        } else {
          updateDocsUI(false);
        }
      });
    }
  });
}

function extractGoogleDocsId(url) {
  const regex = /\/d\/([a-zA-Z0-9_-]+)\//;
  const match = url.match(regex);
  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
}

// Call the function when DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeSidebar();
});

function updateButtonProgress(docs) {
  chrome.storage.local.get(["progressbar_source"]).then((result) => {
    const progressbarSource = result.progressbar_source;

    if (progressbarSource === "pinned" && docs !== "") {
      let pinnedFound = false;
      $.each(docs, function (index, item) {
        if (item.pinned && item.goal !== "") {
          pinnedFound = true;
          let percentage = getGoalPercentage(item.wordCount, item.goal);
          updateProgressCircle(percentage);
        }
      });
      if (!pinnedFound) {
        $("#wc_progress-circle").hide();
      }
    } else if (progressbarSource === "daily_word") {
      updateButtonProgressDailyGoal();
    } else {
      $("#wc_progress-circle").hide();
    }
  });
}

function updateButtonProgressDailyGoal() {
  const percentage = getProgressPercentage();
  updateProgressCircle(percentage);
}

function getProgressPercentage() {
  // Get the text content of the span within the shadowRoot
  const percentageText = shadowRoot.getElementById(
    "progress-percentage"
  ).textContent;

  // Extract the number part by removing the percentage symbol
  const percentageNumber = parseFloat(percentageText.replace("%", ""));

  return percentageNumber;
}

const progress = getProgressPercentage();
//console.log(progress)

function updateProgressCircle(percentage) {
  let filled = percentage * 3.6;
  if (percentage <= 50) {
    $("#wc_progress-circle").addClass("wc_first-half");
  } else {
    $("#wc_progress-circle").removeClass("wc_first-half");
  }
  if (percentage === 100) {
    $("#wc_progress-inner-left").css("background-color", "#0fb600");
    $("#wc_progress-inner-right").css("border-color", "#0fb600");
  } else {
    $("#wc_progress-inner-left").css("background-color", "#d87474");
    $("#wc_progress-inner-right").css("border-color", "#d87474");
  }
  $("#wc_progress-inner-right").css("transform", "rotate(" + filled + "deg)");
  $("#wc_progress-circle").show();
}

function findCurrentWeekIndex(startWeekDates) {
  var currentDate = new Date();
  var currentWeekIndex = -1;

  for (var i = 0; i < startWeekDates.length; i++) {
    var startDate = new Date(startWeekDates[i]);
    var endDate = new Date(startWeekDates[i]);
    endDate.setDate(endDate.getDate() + 6); // Add 6 days to get the end date of the week

    if (
      getDate(currentDate) >= getDate(startDate) &&
      getDate(currentDate) <= getDate(endDate)
    ) {
      currentWeekIndex = i;
      break;
    }
  }

  return currentWeekIndex;
}

// get end and start of date
function getStartAndEndOfWeek(dateString) {
  let date = new Date(dateString);
  let dayOfWeek = date.getDay();

  let daysToSubtract = dayOfWeek;

  let startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - daysToSubtract);

  let endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  let startOfWeekFormatted = `${
    startOfWeek.getMonth() + 1
  }/${startOfWeek.getDate()}`;
  let endOfWeekFormatted = `${endOfWeek.getMonth() + 1}/${endOfWeek.getDate()}`;

  return [startOfWeekFormatted, endOfWeekFormatted];
}

function setChartEvents(dayWiseRecord) {
  let weeklyWordCounts = {};
  if (dayWiseRecord) {
    weeklyWordCounts = getWeeklyWordCounts(dayWiseRecord);
  }
  let last7Weeks = getLast7Weeks();

  let finalWeeklyData = {};
  last7Weeks.map((week) => {
    finalWeeklyData[week] = weeklyWordCounts[week] ? weeklyWordCounts[week] : 0;
  });

  // Get the current date
  const currentWeekIndex = findCurrentWeekIndex(last7Weeks);
  let labels = [];
  let labelValues = [];

  for (const [date, value] of Object.entries(finalWeeklyData)) {
    //console.log("date"+date);
    let labelDate = new Date(date);
    const day = labelDate.getDate();
    const month = labelDate.getMonth() + 1; // getMonth() returns 0-based index
    const year = labelDate.getFullYear();
    const formattedDate = `${month}-${day}-${year}`;
    //console.log(formattedDate);
    // let dateArray = formattedDate.split('-');
    labels.push(`${month}/${day}`);

    let positiveValue = value;
    /* if(value < 0){
      positiveValue = 0;
    }*/
    labelValues.push(positiveValue);
  }

  const weeklyCtx = shadowRoot
    .getElementById("weekly-bar-chart")
    .getContext("2d");

  if (weeklyChart) {
    weeklyChart.destroy();
  }

  weeklyChart = new Chart(weeklyCtx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Words per week",
          data: labelValues,
          //  height:"300px"
          //backgroundColor: "#0097b2",
        },
      ],
    },
    options: {
      tooltips: {
        callbacks: {
          title: function (tooltipItems, data) {
            let dateString = tooltipItems[0].xLabel;

            let year = new Date().getFullYear();
            let fullDateString = `${dateString}/${year}`;

            let dateObject = new Date(fullDateString);

            let [startOfWeek, endOfWeek] = getStartAndEndOfWeek(dateObject);
            return startOfWeek + " - " + endOfWeek;
          },
          label: function (tooltipItem, data) {
            return tooltipItem.yLabel + " words";
            if (tooltipItem.yLabel > 1) {
              tooltipItem.yLabel += " words";
            } else {
              tooltipItem.yLabel += " word";
            }
            return tooltipItem.yLabel;
          },
        },
      },
      scales: {
        yAxes: [
          {
            // display:false,
            ticks: {
              beginAtZero: true,
              suggestedMin: 10,
              // max: 6000,
              // beginAtZero: true,
              //  stepSize: 1000,
              fontColor: "black",
              fontSize: 10,
              fontFamily: "Ubuntu",
              minRotation: 0,
              maxRotation: 0,
            },
            scaleLabel: {
              display: false,
              labelString: "Number of Words",
              fontColor: "#52A1BD",
            },
          },
        ],
        xAxes: [
          {
            gridLines: {
              display: false, // Hide y-axis grid lines
            },
            ticks: {
              // fontWeight:'bold',
              fontSize: 10,
              fontFamily: "Ubuntu",
              minRotation: 0,
              maxRotation: 0,
            },
            gridLines: {
              offsetGridLines: true, // Offsets grid lines to align with bars
            },
            scaleLabel: {
              display: false,
              labelString: "Weeks",
              fontColor: "#52A1BD", // Set x-axis title color to blue
            },
          },
        ],
      },
      legend: {
        labels: {
          fontColor: "#52A1BD", // Set legend label color to blue
          // Set legend label font size
          boxWidth: 0,
          //padding:0,

          generateLabels: function (chart) {
            const data = chart.data;
            if (data.datasets.length) {
              return data.datasets.map((dataset, i) => ({
                text: dataset.label,
                fillStyle: "transparent", // This makes the legend box transparent
                hidden: !chart.isDatasetVisible(i),
                lineCap: dataset.borderCapStyle,
                lineDash: dataset.borderDash,
                lineDashOffset: dataset.borderDashOffset,
                lineJoin: dataset.borderJoinStyle,
                lineWidth: dataset.borderWidth,
                strokeStyle: "#f4f4f4",
                pointStyle: "line", // This makes the legend use a line style
                datasetIndex: i,
              }));
            }
          },
          // usePointStyle: true, // Use point style instead of the box
          //  pointStyle: 'dot'
        },
      },
    },
  });
  weeklyCtx.width = 300;
  weeklyCtx.height = 500;
  if (weeklyChart) {
    let weeklyData = labelValues;
    //console.log("weeklyData"+weeklyData);
    const bordercolors = weeklyData.map((value) =>
      value >= 0 ? "#0097B1" : "#D87474"
    );
    //  const colors = weeklyData.map((value, index) => index === currentWeekIndex ? '#CAE0E4' : '#0097B1' );
    const colors = weeklyData.map((value, index) => {
      if (value < 0) {
        return index === currentWeekIndex ? "#FFF1F1" : "#D87474"; // Colors for negative values
      } else {
        return index === currentWeekIndex ? "#CAE0E4" : "#0097B1"; // Colors for non-negative values
      }
    });

    // const borderStyles = weeklyData.map(value => value  >= 500 ?  'dotted' : 'dotted' );
    weeklyChart.data.labels = labels;
    weeklyChart.data.datasets[0].data = weeklyData;
    //console.log("indexout")
    weeklyChart.data.datasets.forEach((dataset, index) => {
      //console.log("index" + index);
      dataset.backgroundColor = colors; // Set colors based on condition
      dataset.borderColor = bordercolors; // Blue border color for all bars
      dataset.borderWidth = 1; // Set border width
      dataset.borderRadius = 7;
      dataset.top = 3;
    });
  }
  Chart.helpers.each(
    weeklyChart.getDatasetMeta(0).data,
    function (rectangle, index) {
      //console.log("data");
      //console.log(weeklyChart.data.datasets[0].data[index]);

      Chart.elements.Rectangle.prototype.draw = function () {
        var ctx = this._chart.ctx;
        var vm = this._view;
        var left, right, top, bottom, signX, signY, borderSkipped;
        var borderWidth = vm.borderWidth;

        // Get the index of the current bar
        var index = this._index;
        var datasetIndex = this._datasetIndex;
        var value = weeklyChart.data.datasets[0].data[index];

        // Set corner radius conditionally
        var cornerRadius = 5;
        var dashStyle = index == currentWeekIndex ? [5, 2] : [0, 0];
        if (cornerRadius < 0) {
          cornerRadius = 0;
        }

        if (!vm.horizontal) {
          // Bar
          left = vm.x - vm.width / 2;
          right = vm.x + vm.width / 2;
          top = Math.min(vm.y, vm.base);
          bottom = Math.max(vm.y, vm.base);
          signX = 1;
          signY = bottom > top ? 1 : -1;
          borderSkipped = vm.borderSkipped || "bottom";
        } else {
          // Horizontal bar
          left = Math.min(vm.x, vm.base);
          right = Math.max(vm.x, vm.base);
          top = vm.y - vm.height / 2;
          bottom = vm.y + vm.height / 2;
          signX = right > left ? 1 : -1;
          signY = 1;
          borderSkipped = vm.borderSkipped || "left";
        }

        // Canvas doesn't allow us to stroke inside the width so we can
        // adjust the sizes to fit if we're setting a stroke on the line
        if (borderWidth) {
          var barSize = Math.min(
            Math.abs(left - right),
            Math.abs(top - bottom)
          );
          borderWidth = borderWidth > barSize ? barSize : borderWidth;
          var halfStroke = borderWidth / 2;
          // Adjust border widths when line is skinnier than the stroke width
          var borderLeft =
            left + (borderSkipped !== "left" ? halfStroke * signX : 0);
          var borderRight =
            right + (borderSkipped !== "right" ? -halfStroke * signX : 0);
          var borderTop =
            top + (borderSkipped !== "top" ? halfStroke * signY : 0);
          var borderBottom =
            bottom + (borderSkipped !== "bottom" ? -halfStroke * signY : 0);
          // Adjust for radius
          left = borderLeft;
          right = borderRight;
          top = borderTop;
          bottom = borderBottom;
        }

        ctx.beginPath();
        ctx.fillStyle = vm.backgroundColor;
        ctx.strokeStyle = vm.borderColor;
        ctx.lineWidth = borderWidth;

        // Corner points, from bottom-left to bottom-right clockwise
        // | 1 2 |
        // | 0 3 |
        var corners = [
          [left, bottom],
          [left, top],
          [right, top],
          [right, bottom],
        ];

        // Find the first (starting) corner with fallback to 'bottom'
        var borders = ["bottom", "left", "top", "right"];
        var startCorner = borders.indexOf(borderSkipped, 0);
        if (startCorner === -1) {
          startCorner = 0;
        }

        function cornerAt(index) {
          return corners[(startCorner + index) % 4];
        }

        // Draw rectangle from 'startCorner'
        var corner = cornerAt(0);
        ctx.moveTo(corner[0], corner[1]);

        for (var i = 1; i < 4; i++) {
          corner = cornerAt(i);
          nextCornerId = i + 1;
          if (nextCornerId == 4) {
            nextCornerId = 0;
          }

          nextCorner = cornerAt(nextCornerId);

          width = corners[2][0] - corners[1][0];
          height = corners[0][1] - corners[1][1];
          x = corners[1][0];
          y = corners[1][1];

          var radius = cornerRadius;

          // Fix radius being too large
          if (radius > Math.abs(height) / 2) {
            radius = Math.floor(Math.abs(height) / 2);
          }
          if (radius > Math.abs(width) / 2) {
            radius = Math.floor(Math.abs(width) / 2);
          }

          if (value >= 0) {
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.setLineDash(dashStyle);
          } else {
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(
              x + width,
              y + height,
              x + width - radius,
              y + height
            );
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x, y);
            ctx.setLineDash(dashStyle);
          }
        }

        ctx.fill();
        if (borderWidth) {
          ctx.stroke();
        }
      };
    },
    null
  );

  weeklyChart.update();
}

// Function to create the calendar inside shadow DOM
function createCalendarInShadowDOM() {
  const hostElement = document.querySelector("#shadow-host");

  if (!hostElement) {
    return;
  }

  // Access the shadow root of the host element
  const shadowRoot = hostElement.shadowRoot;

  if (!shadowRoot) {
    console.error("Shadow root not found.");
    return;
  }

  // Clear existing content inside the shadow DOM
  const wcDocsWrapper = shadowRoot.querySelector("#calendar-container");

  // const shadowContainer = document.querySelector("#calendar-container").attachShadow({ mode: 'open' });

  // Initialize the Vanilla Calendar inside shadow DOM
  const calendar = new VanillaCalendar(wcDocsWrapper, {
    actions: {
      clickMonth(e, self) {
        prepareGraphAndChartData();
      },
      clickYear(event, self) {
        prepareGraphAndChartData();
      },
      clickArrow(event, self) {
        prepareGraphAndChartData();
      },
    },
    settings: {
      iso8601: false, //false set weekstart with Sunday, true for Monday
      visibility: {
        theme: "light",
        // daysOutside: false,  // disable dates which are outside of current month
      },
      selection: {
        day: false,
      },
    },
    date: {
      max: getDate(),
    },
  });

  calendar.init();
  prepareGraphAndChartData();
}

// Call the function when shadow DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  createCalendarInShadowDOM();
});

const shadowElements = shadowRoot.querySelectorAll(
  '#content-settings select, #content-settings input[type="checkbox"], #content-settings textarea, #writing_streak'
);

shadowElements.forEach((element) => {
  element.addEventListener("change", function () {
    const key = this.id;
    const value = this.type === "checkbox" ? this.checked : this.value;
    const wordCountInputParent = shadowRoot.querySelector(
      ".word-count-input-parent"
    );

    const showPartialSettingWrapElement = shadowRoot.querySelector(
      ".showPartialSettingWrap"
    );
    //console.log("key" + key + " " + value);
    if (key === "writing_streak" && value === "custom") {
      prepareGraphAndChartData();
      wordCountInputParent.style.display = "block";
    } else if (key === "writing_streak" && value != "custom") {
      wordCountInputParent.style.display = "none";
    }

    if (key === "writing_streak") {
      if (value == "any_word") {
        showPartialSettingWrapElement.style.display = "none";
      } else {
        showPartialSettingWrapElement.style.display = "flex";
      }
    }
    saveToStorage(key, value);
  });
});

// Goal input blur
shadowRoot.addEventListener(
  "blur",
  function (event) {
    if (event.target.matches(".word-count-input")) {
      const value = event.target.value;
      const key = "custom_word_count";
      //console.log("word-count-input"+ value)
      saveToStorage(key, Number(value));
      prepareGraphAndChartData();
    }
  },
  true
);

$("#progressbar_source, #startup").on("change", function () {
  const key = this.id;
  const value = $(this).val();
  saveToStorage(key, value);

  if (key === "progressbar_source") {
    chrome.storage.local.get(["documents"], function (result) {
      if (result.documents && result.documents != "") {
        updateButtonProgress(result.documents);
      }
    });
  }
});
chrome.storage.local
  .get(["writing_streak", "custom_word_count", "startup", "progressbar_source"])
  .then((result) => {
    const { writing_streak, custom_word_count } = result;
    $(shadowRoot).find("#writing_streak").val(writing_streak);

    const wordCountInputParent = shadowRoot.querySelector(
      ".word-count-input-parent"
    );

    if (writing_streak === "custom") {
      wordCountInputParent.style.display = "block";
    } else {
      wordCountInputParent.style.display = "none";
    }
    $(shadowRoot).find("#startup").val(result.startup);
    $(shadowRoot).find("#progressbar_source").val(result.progressbar_source);

    if (result.progressbar_source) {
      chrome.storage.local.get(["documents"], function (result) {
        if (result.documents && result.documents != "") {
          updateButtonProgress(result.documents);
        }
      });
    }
  });

function removeDocFromDailyStats(id) {
  console.log("invoked");
  chrome.storage.local.get(["dailyStats"]).then((result) => {
    const dailyStats = result.dailyStats || {};
    let array = Object.keys(dailyStats);
    updatedStats = {};
    array.map((day) => {
      let dayDocs = dailyStats[day]; // contains doc1 data and doc2 data
      delete dayDocs[id];
      updatedStats[day] = dayDocs;
    });
    chrome.storage.local.set({ dailyStats: updatedStats }, function () {
      chrome.runtime.sendMessage({
        action: "updateDayWiseRecords",
        updatedStats: updatedStats,
      });
    });
  });
}

async function removeDocFromDailyStatsEach(date, id) {
  try {
    // Ensure that date and id are valid
    if (!date || !id) {
      console.error("Invalid date or id");
      return;
    }

    // Fetch the current state from storage
    const result = await chrome.storage.local.get(["dailyStats"]);
    let dailyStats = result.dailyStats || {};
    let updatedStats = {};
    // Ensure the date exists in dailyStats
    if (dailyStats[date]) {
      // Remove the specified id from the data for the given date
      delete dailyStats[date][id];

      // If the date has no more data, remove the date entry entirely
      if (Object.keys(dailyStats[date]).length === 0) {
        delete dailyStats[date];
      }
      // Update the storage with the modified data
      await chrome.storage.local.set({ dailyStats });

      // Confirm that the data was saved successfully
      chrome.storage.local.get(["dailyStats"], function (result) {
        if (chrome.runtime.lastError) {
          console.error(
            "Error getting data after save:",
            chrome.runtime.lastError
          );
        } else {
          updatedStats = result.dailyStats;
        }
      });

      // Send message to update day-wise records after storage is successfully set
      chrome.runtime.sendMessage({
        action: "updateDayWiseRecords",
        updatedStats: updatedStats,
      });
    } else {
      console.warn(`Date ${date} does not exist in dailyStats.`);
    }
  } catch (error) {
    console.error("Error removing document from daily stats:", error);
  }
}

function trialCountdown(endDate) {
  //console.log('trialCountdown called')

  //console.log(endDate);
  let total = Date.parse(endDate) - Date.parse(new Date());
  //console.log(total);
  let seconds = Math.floor((total / 1000) % 60);
  let minutes = Math.floor((total / 1000 / 60) % 60);
  let hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  let days = Math.floor(total / (1000 * 60 * 60 * 24));

  shadowRoot.getElementById("trial-days").textContent = days;
  shadowRoot.getElementById("trial-hours").textContent = hours;
  shadowRoot.getElementById("trial-minutes").textContent = minutes;

  if (days < 0 && hours < 0 && minutes < 0) {
    // trial completed overlay
    shadowRoot.getElementById("wc_overlay").style.display = "block";
    shadowRoot.getElementById("trial-counter-wrap").style.display = "none";
    shadowRoot.getElementById("wc_addDocWrap").style.bottom = "40px";
  } else {
    shadowRoot.getElementById("trial-counter-wrap").style.display = "flex";
  }
}

// Story Page

let currentSiteUrl = "";
let currentSiteTitle = "";

function getActiveTabInfo() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      let activeTab = tabs[0];
      resolve({
        url: activeTab.url,
        title: activeTab.title,
      });
    });
  });
}

// Function to create the progress bar
function createProgressBar(completedPercentage) {
  const progressBarContainer = document.createElement("div");
  progressBarContainer.className = "wc_docWordsProgress";
  progressBarContainer.style.backgroundColor = "#C9DFE4";
  progressBarContainer.style.borderRadius = "15px";
  progressBarContainer.style.margin = "12px auto 3px auto"; // Center the progress bar with auto margins
  progressBarContainer.style.width = "80%"; // Set a width to better control centering

  const progressBar = document.createElement("div");
  progressBar.style.backgroundColor = "#52A1BD";
  progressBar.style.color = "white";
  progressBar.style.height = "10px";
  progressBar.style.borderRadius = "15px";
  progressBar.style.width = `${completedPercentage}%`;

  progressBarContainer.appendChild(progressBar);
  return progressBarContainer;
}

// Function to add the progress bar to the storyPanel
function addProgressBarToStoryPanel(completedPercentage, panelElement) {
  if (completedPercentage > 0) {
    if (completedPercentage > 100) completedPercentage = 100;
  } else {
    completedPercentage = 0;
  }
  const progressBar = createProgressBar(completedPercentage);
  panelElement.appendChild(progressBar); // Adds the progress bar
  progressBar.style.display = "None";
  return progressBar;
}

// Function to add the document title to the panel
async function addSiteTitle(title, panelElement) {
  const titleElement = document.createElement("div");

  titleElement.style.fontSize = "14px";
  titleElement.style.fontWeight = "bold";
  titleElement.style.textAlign = "center"; // Center align the title
  titleElement.style.color = "black";
  titleElement.style.marginTop = "50px";
  titleElement.style.lineHeight = "1.3";
  titleElement.textContent = title;

  panelElement.appendChild(titleElement);
}

// Function to add the word count below the progress bar
async function addWordCount(
  matchingDocument,
  headerElement,
  progressBarElement
) {
  const updateDocumentGoal = (newGoal) => {
    chrome.storage.local.get(["documents"]).then((result) => {
      const documents = result.documents || [];

      const document = documents.find(
        (doc) => doc.id === matchingDocument["id"]
      );

      if (document) {
        if (!isNaN(newGoal)) document.goal = newGoal;
        else document.goal = "";

        chrome.storage.local.set({ documents }).then(() => {
          console.log(`Document goal updated to ${newGoal}`);
        });
      }
    });
  };

  let showProgressBarStory = false;

  wordCount = matchingDocument["wordCount"];
  totalWords = matchingDocument["goal"];

  const wordCountContainer = document.createElement("div");
  wordCountContainer.id = "word-count-container";
  wordCountContainer.style.textAlign = "center";
  wordCountContainer.style.marginBottom = "5px";

  const wordCountElement = document.createElement("div");
  wordCountElement.style.fontSize = "14px";
  wordCountElement.style.color = "black";
  wordCountElement.style.margin = "10px";

  const buttonElement = document.createElement("button");
  buttonElement.style.fontSize = "14px";
  buttonElement.style.color = "#61a5c2";
  buttonElement.style.backgroundColor = "transparent";
  buttonElement.style.border = "2px solid #61a5c2";
  buttonElement.style.borderRadius = "20px";
  buttonElement.style.padding = "10px 20px";
  buttonElement.style.cursor = "pointer";
  buttonElement.style.marginBottom = "10px";
  buttonElement.style.marginTop = "10px";
  buttonElement.style.display = "none";
  buttonElement.style.marginRight = "auto";
  buttonElement.style.marginLeft = "auto";

  if (totalWords && totalWords != 0 && !isNaN(totalWords)) {
    wordCountElement.textContent = `${wordCount.toLocaleString()} / ${totalWords.toLocaleString()} words`;
    buttonElement.textContent = "CHANGE GOAL";
    showProgressBarStory = true;

    // Update existing progress bar if it exists
    let existingProgressBar = headerElement.querySelector(
      ".wc_docWordsProgress"
    );

    if (existingProgressBar) {
      console.log("FOUND: ", existingProgressBar);
      let progressBar = existingProgressBar.firstChild;
      const completedPercentage = (wordCount / totalWords) * 100;
      progressBar.style.width =
        completedPercentage < 100 ? `${completedPercentage}%` : "100%";
      existingProgressBar.style.display = "block"; // Show the progress bar if hidden
    } else {
      console.log("UNABLE FOUND: ", existingProgressBar);
    }

    // Change goal button event listener
    buttonElement.addEventListener("click", () => {
      const inputElement = document.createElement("input");
      inputElement.id = "update-goal-input";
      inputElement.type = "number";
      inputElement.min = "0";
      inputElement.placeholder = "Enter new goal";
      inputElement.style.fontSize = "14px";
      inputElement.style.padding = "5px";
      inputElement.style.marginTop = "13px";
      inputElement.style.borderRadius = "5px";
      inputElement.style.border = "1px solid #61a5c2";
      inputElement.style.textAlign = "center";
      inputElement.value = totalWords.toLocaleString();

      wordCountContainer.replaceChild(inputElement, buttonElement);
      inputElement.focus();

      inputElement.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
          updateGoalCount();
        }
      });

      inputElement.addEventListener("change", updateGoalCount);
      inputElement.addEventListener("blur", updateGoalCount);
      // Goal set function
      function updateGoalCount() {
        totalWords = parseInt(inputElement.value.replace(/,/g, ""));
        updateDocumentGoal(totalWords);
        if (!isNaN(totalWords)) {
          wordCountElement.textContent = `${wordCount.toLocaleString()} / ${totalWords.toLocaleString()} words`;
          wordCountElement.style.display = "block";
        } else {

          wordCountElement.textContent = `${wordCount.toLocaleString()} words`;
          if(currentUser){
            wordCountElement.style.display = "block";
            buttonElement.textContent = "SET GOAL";
          }
        }

        buttonElement.textContent = "CHANGE GOAL";
        wordCountContainer.replaceChild(buttonElement, inputElement);
        inputElement.focus();
        let existingProgressBar = headerElement.querySelector(
          ".wc_docWordsProgress"
        );
        if (existingProgressBar) {
          console.log("FOUND: ", existingProgressBar);
          let progressBar = existingProgressBar.firstChild;
          const completedPercentage = (wordCount / totalWords) * 100;
          progressBar.style.width =
            completedPercentage < 100 ? `${completedPercentage}%` : "100%";
          existingProgressBar.style.display = !isNaN(totalWords)
            ? "block"
            : "none";
          buttonElement.style.display = !isNaN(totalWords) ? "none" : "block";
        }
      }
    });
  } else {
    
// Doc not linked show first time  SET GOAL button this 
      wordCountElement.textContent = `${wordCount.toLocaleString()} words`;
      buttonElement.textContent = "SET GOAL";
  

    buttonElement.addEventListener("click", () => {
      const inputElement = document.createElement("input");
      inputElement.id = "set-goal-input";
      inputElement.type = "number";
      inputElement.min = "0";
      inputElement.placeholder = "Enter goal";
      inputElement.style.fontSize = "14px";
      inputElement.style.padding = "10px";
      inputElement.style.borderRadius = "20px";
      inputElement.style.border = "1px solid #61a5c2";
      inputElement.style.textAlign = "center";
      inputElement.value = "";

      wordCountContainer.replaceChild(inputElement, buttonElement);

      inputElement.focus();

      inputElement.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
          setGoalCount();
        }
      });

      inputElement.addEventListener("change", setGoalCount);
      inputElement.addEventListener("blur", setGoalCount);

      function setGoalCount() {
        totalWords = parseInt(inputElement.value.replace(/,/g, ""));
        updateDocumentGoal(totalWords);
          if (!isNaN(totalWords)) {
            wordCountElement.textContent = `${wordCount.toLocaleString()} / ${totalWords.toLocaleString()} words`;
            wordCountElement.style.display = "block";
          } else {
            wordCountElement.textContent = `${wordCount.toLocaleString()} words`;
            wordCountElement.style.display = "block";
          }
          buttonElement.textContent = "CHANGE GOAL";
          wordCountContainer.replaceChild(buttonElement, inputElement);
      
        let existingProgressBar = headerElement.querySelector(
          ".wc_docWordsProgress"
        );
        if (existingProgressBar) {
          console.log("Progress bar is existing");
          let progressBar = existingProgressBar.firstChild;
          const completedPercentage = (wordCount / totalWords) * 100;
          progressBar.style.width =
            completedPercentage < 100 ? `${completedPercentage}%` : "100%";
          existingProgressBar.style.display = !isNaN(totalWords)
            ? "block"
            : "none";
          buttonElement.style.display = !isNaN(totalWords) ? "none" : "block";
        } else {
          console.error("Progress bar is NOT existing");
        }
      }
    });
  }

  wordCountContainer.appendChild(wordCountElement);
if(currentUser  ){
  wordCountContainer.appendChild(buttonElement);
  headerElement.appendChild(wordCountContainer);
}

  return {
    showProgressBarStory,
    wordCountElement,
    buttonElement,
    wordCountContainer,
  };
}

function checkStoryUser() {
  const documentContent = shadowRoot.querySelector("#content-story");
  const documentContentMain = shadowRoot.querySelector("#content-documents");
  const documentTabElement = shadowRoot.querySelector("#tab-documents");
  const loadingOverlay = shadowRoot.querySelector("#loading-overlay");

  const freeTrial = shadowRoot.querySelector("#wc_free_trial");
  const googleProfile = shadowRoot.querySelector("#sign-in-google-profile");

  const logout = shadowRoot.querySelector("#wc_logout");
  const manageBtn = shadowRoot.querySelector("#wc_manageSubscription");
  if (currentUser !== null) {
    shadowRoot.querySelector("#username-display").innerHTML =
      "Account : " + currentUser.email;
  }
  if (!currentUser) {
    console.log("there is no current story user",!currentUser);
    if (documentTabElement.classList.contains("active")) {

      applyFreeTrialStyles(freeTrial, "documents");
      addOutlineSeparator(globalPanelElement);
      addRemoveButton(globalPanelElement, globalSiteTitle);
       
        freeTrial.style.display = "block";
      
      sleep(1000);
      if (!isLoginInProgress) loadingOverlay.style.display = "none";
    }
    if (!documentTabElement.classList.contains("active")) {
      documentContent.style.display = "none";
    }
    logout.style.display = "none";
    manageBtn.style.display = "none";
    return false;
  } else {
    if (documentTabElement.classList.contains("active")) {
      loadingOverlay.style.display = "none";
      freeTrial.style.display = "none";
    }
    logout.style.display = "block";
    manageBtn.style.display = "block";
    googleProfile.style.display = "none";
    shadowRoot.querySelector("#username-display").style.display = "block";
  }

  return true;
}


async function isTrialExpire() {
  const userData = await chrome.storage.local.get(["user"]);
  if (!userData || !userData.user) return true;
  if (userData.user.plan_id == "" || userData.user.plan_id == null) {
    try {
      const creationDate = new Date(userData?.user?.created_at);
      let trialEndDate = new Date(
        creationDate.setDate(creationDate.getDate() + 14)
      );
      let total = Date.parse(trialEndDate) - Date.parse(new Date());
      //console.log(total);
      let seconds = Math.floor((total / 1000) % 60);
      let minutes = Math.floor((total / 1000 / 60) % 60);
      let hours = Math.floor((total / (1000 * 60 * 60)) % 24);
      let days = Math.floor(total / (1000 * 60 * 60 * 24));
      if (days < 0 && hours < 0 && minutes < 0) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.error("WC Error: ", e);
    }
  } else {
    return false;
  }
}

async function makeStoryHeader(currentSiteTitle, panelElement) {
  let matchingDocument = "";

  // Await the asynchronous operation
  const result = await chrome.storage.local.get(["documents"]);

  console.log("Documents: ", result.documents);
  console.log("current Site Title", currentSiteTitle);

  matchingDocument = result.documents.find((document) =>
    currentSiteTitle.includes(document.title.trim())
  );

  if (matchingDocument) {
    console.log("Current Document: ", matchingDocument);

    const headerElement = document.createElement("div");
    headerElement.classList.add("wc_header");
    headerElement.style.height = "125px";
    headerElement.style.display = "flex";
    headerElement.style.flexDirection = "column";
    headerElement.style.alignItems = "center"; // Center-align content

    const progressContainer = document.createElement("div");
    progressContainer.classList.add("wc_progressContainer");
    progressContainer.style.padding = "1px";
    progressContainer.style.height = "70px";
    progressContainer.style.display = "flex";
    progressContainer.style.flexDirection = "column";
    progressContainer.style.alignItems = "center"; // Center-align progress bar

    // Add the site title to the new div
    addSiteTitle(currentSiteTitle, headerElement);

    headerElement.appendChild(progressContainer);

    let progressBarElement = addProgressBarToStoryPanel(
      (matchingDocument.wordCount / matchingDocument.goal) * 100,
      progressContainer
    );

    // Hide the progress bar initially
    progressBarElement.style.display = "none";

    // If no goal is set, show "Set Goal" button centered
    if (!matchingDocument.goal || isNaN(matchingDocument.goal)) {
      const setGoalButton = document.createElement("button");
      setGoalButton.textContent = "Set Goal";
      setGoalButton.style.fontSize = "14px";
      setGoalButton.style.padding = "10px 20px";
      setGoalButton.style.backgroundColor = "#61a5c2";
      setGoalButton.style.color = "white";
      setGoalButton.style.border = "none";
      setGoalButton.style.borderRadius = "5px";
      setGoalButton.style.cursor = "pointer";
      setGoalButton.style.marginTop = "10px";
      setGoalButton.style.display = "block";
      setGoalButton.style.textAlign = "center"; // Center-align button

      // Append "Set Goal" button to the container
      progressContainer.appendChild(setGoalButton);

      // Set Goal button click logic
      setGoalButton.addEventListener("click", () => {
        const inputElement = document.createElement("input");
        inputElement.type = "number";
        inputElement.min = "0";
        inputElement.placeholder = "Enter goal";
        inputElement.style.fontSize = "14px";
        inputElement.style.padding = "10px";
        inputElement.style.borderRadius = "5px";
        inputElement.style.border = "1px solid #61a5c2";
        inputElement.style.textAlign = "center";
        inputElement.style.marginTop = "10px";

        // Replace "Set Goal" button with input field
        progressContainer.replaceChild(inputElement, setGoalButton);

        inputElement.addEventListener("keypress", (event) => {
          
          if (event.key === "Enter") {
            setGoal();
          }
        });

        inputElement.addEventListener("blur", setGoal);

        function setGoal() {
          const newGoal = parseInt(inputElement.value.replace(/,/g, ""));
          matchingDocument.goal = newGoal;

          // Save the updated goal in storage
          chrome.storage.local.get(["documents"]).then((result) => {
            const documents = result.documents || [];
            const documentToUpdate = documents.find(
              (doc) => doc.id === matchingDocument.id
            );
            if (documentToUpdate) {
              documentToUpdate.goal = newGoal;
              chrome.storage.local.set({ documents });
            }
          });

          // Update the progress bar width and display word count
          const wordCountElement = document.createElement("div");
          wordCountElement.style.fontSize = "14px";
          wordCountElement.style.color = "black";
          wordCountElement.style.margin = "10px";
          wordCountElement.textContent = `${matchingDocument.wordCount.toLocaleString()} / ${newGoal.toLocaleString()} words`;

          const percentage = (matchingDocument.wordCount / newGoal) * 100;
          progressBarElement.firstChild.style.width =
            percentage < 100 ? `${percentage}%` : "100%";

          // Replace input element with updated word count display
          progressContainer.replaceChild(wordCountElement, inputElement);

          // Show the progress bar after goal is set
          progressBarElement.style.display = "block";
          progressBarElement.style.width = "100%";

          // Add "Edit" button (pencil icon) next to the word count after goal is set
          const editButton = document.createElement("button");
          const editIcon = document.createElement("span");
          editIcon.innerHTML = "&#9998;"; // Pencil icon using HTML entity
          editButton.appendChild(editIcon);
          editButton.style.fontSize = "12px";
          editButton.style.marginLeft = "10px";
          editButton.style.padding = "5px 10px";
          editButton.style.backgroundColor = "#61a5c2";
          editButton.style.color = "white";
          editButton.style.border = "none";
          editButton.style.borderRadius = "5px";
          editButton.style.cursor = "pointer";

          
          editButton.addEventListener("click", () => {
            editButton.style.display = "none";
            inputElement.style.display = "block";
            progressContainer.replaceChild(inputElement, wordCountElement);
          });

          
          const wordCountContainer = document.createElement("div");
          wordCountContainer.style.display = "flex";
          wordCountContainer.style.alignItems = "center";
          wordCountContainer.style.justifyContent = "center"; 
          wordCountContainer.appendChild(wordCountElement);
          wordCountContainer.appendChild(editButton);
          progressContainer.appendChild(wordCountContainer);


          
          document.addEventListener("click", (event) => {
            if (!progressContainer.contains(event.target)) {
              updateGoal();
            }
          });

          function updateGoal() {
            const updatedGoal = parseInt(inputElement.value.replace(/,/g, ""));
            matchingDocument.goal = updatedGoal;
            wordCountElement.textContent = `${matchingDocument.wordCount.toLocaleString()} / ${updatedGoal.toLocaleString()} words`;

            
            chrome.storage.local.get(["documents"]).then((result) => {
              const documents = result.documents || [];
              const documentToUpdate = documents.find(
                (doc) => doc.id === matchingDocument.id
              );
              if (documentToUpdate) {
                documentToUpdate.goal = updatedGoal;
                chrome.storage.local.set({ documents });
              }
            });

            
            const percentage = (matchingDocument.wordCount / updatedGoal) * 100;
            progressBarElement.firstChild.style.width =
              percentage < 100 ? `${percentage}%` : "100%";

            
            wordCountContainer.replaceChild(wordCountElement, inputElement);

            
            editButton.style.display = "block";
          }
        }
      });
    } else {
      
      const wordCountElement = document.createElement("div");
      wordCountElement.style.fontSize = "14px";
      wordCountElement.style.color = "black";
      wordCountElement.style.margin = "10px";
      wordCountElement.style.marginTop = "10px";
      wordCountElement.style.marginBottom = "20px";
      wordCountElement.textContent = `${matchingDocument.wordCount.toLocaleString()} / ${matchingDocument.goal.toLocaleString()} words`;

      
      const editButton = document.createElement("button");
      const editIcon = document.createElement("span");
      editIcon.innerHTML = "&#9998;"; 
      editButton.appendChild(editIcon);
      editButton.style.fontSize = "12px";
      editButton.style.marginLeft = "10px";
      editButton.style.padding = "5px 10px";
      editButton.style.backgroundColor = "#61a5c2";
      editButton.style.color = "white";
      editButton.style.border = "none";
      editButton.style.borderRadius = "5px";
      editButton.style.cursor = "pointer";

      
      const wordCountContainer = document.createElement("div");
      wordCountContainer.style.display = "flex";
      wordCountContainer.style.alignItems = "center";
      wordCountContainer.style.justifyContent = "center"; 
      wordCountContainer.appendChild(wordCountElement);
      wordCountContainer.appendChild(editButton);
      progressContainer.appendChild(wordCountContainer);

      
      const percentage = (matchingDocument.wordCount / matchingDocument.goal) * 100;
      progressBarElement.firstChild.style.width =
        percentage < 100 ? `${percentage}%` : "100%";
      progressBarElement.style.display = "block";

      
      editButton.addEventListener("click", () => {
        editButton.style.display = 'none';
        const inputElement = document.createElement("input");
        inputElement.type = "number";
        inputElement.min = "0";
        inputElement.placeholder = "Enter new goal";
        inputElement.style.fontSize = "14px";
        inputElement.style.padding = "5px";
        inputElement.style.marginTop = "10px";
        inputElement.style.borderRadius = "5px";
        inputElement.style.border = "1px solid #61a5c2";
        inputElement.style.textAlign = "center";
        inputElement.value = matchingDocument.goal.toLocaleString();

        
        wordCountContainer.replaceChild(inputElement, wordCountElement);

        
        inputElement.addEventListener("keypress", (event) => {
          if (event.key === "Enter") {
            updateGoal();
          }
        });

        inputElement.addEventListener("blur", updateGoal);

        function updateGoal() {
          const updatedGoal = parseInt(inputElement.value.replace(/,/g, ""));
          matchingDocument.goal = updatedGoal;
          wordCountElement.textContent = `${matchingDocument.wordCount.toLocaleString()} / ${updatedGoal.toLocaleString()} words`;

          chrome.storage.local.get(["documents"]).then((result) => {
            const documents = result.documents || [];
            const documentToUpdate = documents.find(
              (doc) => doc.id === matchingDocument.id
            );
            if (documentToUpdate) {
              documentToUpdate.goal = updatedGoal;
              chrome.storage.local.set({ documents });
            }
          });

          // 
          const percentage = (matchingDocument.wordCount / updatedGoal) * 100;
          progressBarElement.firstChild.style.width =
            percentage < 100 ? `${percentage}%` : "100%";

          
          wordCountContainer.replaceChild(wordCountElement, inputElement);

          
          editButton.style.display = "block";
        }
      });
    }

    
    panelElement.insertBefore(headerElement, panelElement.firstChild);
  } else {
    console.error("Document ", currentSiteTitle, " not found");
    addErrorOutlineData("This document is not added", panelElement);
  }

  return matchingDocument;
}


function addRefreshTime(panelElement, currentSiteTitle, updateCountChange= "deafult value") {
  if (currentUser == null) {
    return;
  }
  
  const refreshContainer = document.createElement("div");
  refreshContainer.style.textAlign = "center";
  refreshContainer.style.marginTop = "40px";

  
  const refreshButton = document.createElement("button");
  refreshButton.id = "refresh-button";
  refreshButton.innerHTML =
    'Refresh <span style="font-size: 18px; margin-left: 5px;">&#8635;</span>';
  refreshButton.style.backgroundColor = "#E0E0E0"; // Adjust the color
  refreshButton.style.border = "none";
  refreshButton.style.borderRadius = "20px";
  refreshButton.style.padding = "10px 20px";
  refreshButton.style.cursor = "pointer";
  refreshButton.style.fontSize = "14px";
  refreshButton.style.color = "#555";
  refreshButton.style.transition =
    "background-color 0.3s ease, color 0.3s ease";

  refreshButton.addEventListener("mouseover", () => {
    refreshButton.style.backgroundColor = "#CCCCCC"; // Hover background color
    refreshButton.style.color = "#333"; // Hover text color
  });

  refreshButton.addEventListener("mouseout", () => {
    refreshButton.style.backgroundColor = "#E0E0E0"; // Default background color
    refreshButton.style.color = "#555"; // Default text color
  });

  refreshButton.addEventListener("click", () => {
    // Create and style the loading message element
    const loadingMessage = document.createElement("div");
    loadingMessage.textContent = "Loading...";
    loadingMessage.style.fontSize = "14px";
    loadingMessage.style.fontWeight = "normal";
    loadingMessage.style.color = "#5A91A5";
    loadingMessage.style.marginTop = "10px";
    loadingMessage.style.textAlign = "center";

    // Append the loading message to the panelElement
    panelElement.appendChild(loadingMessage);

    // Send a message to refresh the page
    chrome.runtime.sendMessage({ action: "refreshPage" });

    // Run the initStoryPage function after a 4-second delay
    setTimeout(() => {
      panelElement.innerHTML = "";
      console.log("This is #2");
      initStoryPage(panelElement, currentSiteTitle);
      // Remove the loading message once the function is called
      panelElement.removeChild(loadingMessage);
    }, 5000);
  });

  // Add the refresh button to the container
  refreshContainer.appendChild(refreshButton);

  // Create the last refresh time element
  const lastRefresh = document.createElement("div");
  lastRefresh.id = "refresh-time";
  lastRefresh.style.color = "#777";
  lastRefresh.style.marginTop = "10px";
  lastRefresh.style.fontSize = "12px";

  const currentTime = new Date();
  lastRefresh.innerHTML = `Updated ${currentTime.toLocaleDateString(undefined, {
    month: "numeric",
    day: "numeric",
  })} ${currentTime.toLocaleTimeString()}`;

  // Create the note element
  const refreshNote = document.createElement("div");
  refreshNote.style.color = "#999";
  refreshNote.style.marginTop = "10px";
  refreshNote.style.fontSize = "10px";
  refreshNote.innerHTML = `
      Outline Details do not update live.<br>
      Refresh browser to update Outline Word Counts.
    `;

  // Add the refresh time and note to the container
  refreshContainer.appendChild(lastRefresh);
  refreshContainer.appendChild(refreshNote);

  // Append the entire refresh feature to the panel element
  panelElement.appendChild(refreshContainer);
}

function removeDocument(title) {
  chrome.storage.local.get(["documents"]).then((result) => {
    const updatedDocuments = result.documents.filter(
      (doc) => doc.title !== title
    );
    chrome.storage.local.set({ documents: updatedDocuments }).then(() => {
      console.log(`Document '${title}' removed`);
      window.location.reload();
      // Optionally, remove the panelElement content or refresh the view
    });
  });
}

function addRemoveButton(panelElement, documentTitle) {
  // Create the remove button
  const removeButton = document.createElement("button");

  removeButton.textContent = "REMOVE";
  removeButton.style.padding = "10px 20px";
  removeButton.style.fontSize = "14px";
  removeButton.style.backgroundColor = "lightgrey"; // Grey background by default
  removeButton.style.color = "white";
  removeButton.style.border = "none";
  removeButton.style.borderRadius = "20px";
  removeButton.style.cursor = "pointer";
  removeButton.style.display = "block";
  removeButton.style.margin = "20px auto";
  removeButton.style.position = "absolute";
  removeButton.style.left = "50%";
  removeButton.style.transform = "translateX(-50%)";
  removeButton.style.bottom = "25px";

  removeButton.addEventListener("mouseover", () => {
    removeButton.style.backgroundColor = "red"; // Light red on hover
  });
  removeButton.addEventListener("mouseout", () => {
    removeButton.style.backgroundColor = "lightgrey"; // Light red on hover
  });

  // Create the dropdown menu container
  const dropdownMenu = document.createElement("div");
  dropdownMenu.style.position = "absolute";
  dropdownMenu.style.bottom = "25px"; // Position above the button
  dropdownMenu.style.left = "50%";
  dropdownMenu.style.transform = "translateX(-50%)";
  dropdownMenu.style.backgroundColor = "white";
  dropdownMenu.style.border = "1px solid #FF3B30";
  dropdownMenu.style.borderRadius = "7px";
  dropdownMenu.style.display = "none"; // Initially hidden
  dropdownMenu.style.boxShadow = "0px 8px 16px 0px rgba(0,0,0,0.2)";
  dropdownMenu.style.zIndex = "1001"; // Ensure it's on top of the button container
  dropdownMenu.style.lineHeight = "1.3";
  dropdownMenu.style.width = "200px";

  // Add the first option: Remove Story Only
  const removeStoryOption = document.createElement("div");
  removeStoryOption.textContent = "REMOVE STORY ONLY";
  removeStoryOption.style.padding = "10px";
  removeStoryOption.style.cursor = "pointer";
  removeStoryOption.style.color = "#FF3B30";
  removeStoryOption.style.fontWeight = "bold";
  removeStoryOption.style.margin = "5px";

  removeStoryOption.addEventListener("mouseover", () => {
    removeStoryOption.style.backgroundColor = "#FFEBEB"; // Light red on hover
  });
  removeStoryOption.addEventListener("mouseout", () => {
    removeStoryOption.style.backgroundColor = "white";
  });

  removeStoryOption.addEventListener("click", () => {
    console.log("Removing story only: ", documentTitle);
    removeDocument(documentTitle);
    dropdownMenu.style.display = "none"; // Close the dropdown
  });

  // Add the second option: Remove Story & Word Count Data
  const removeStoryAndDataOption = document.createElement("div");
  removeStoryAndDataOption.textContent = "REMOVE STORY & WORD COUNT DATA";
  removeStoryAndDataOption.style.padding = "10px";
  removeStoryAndDataOption.style.cursor = "pointer";
  removeStoryAndDataOption.style.color = "#FF3B30";
  removeStoryAndDataOption.style.fontWeight = "bold";
  removeStoryAndDataOption.style.margin = "7px";
  removeStoryAndDataOption.style.lineHeight = "1.3";
  removeStoryAndDataOption.addEventListener("mouseover", () => {
    removeStoryAndDataOption.style.backgroundColor = "#FFEBEB"; // Light red on hover
  });
  removeStoryAndDataOption.addEventListener("mouseout", () => {
    removeStoryAndDataOption.style.backgroundColor = "white";
  });
  removeStoryAndDataOption.addEventListener("click", () => {
    console.log("Removing story and word count data: ", documentTitle);
    chrome.storage.local.get(["documents"]).then((result) => {
      const matchingDocumentId = result.documents.find(
        (doc) => doc.title === documentTitle
      ).id;
      console.log("matchingDocumentId: ", matchingDocumentId);
      removeDocFromDailyStats(matchingDocumentId);
      removeDocument(documentTitle);
    });
    dropdownMenu.style.display = "none"; // Close the dropdown
  });

  dropdownMenu.appendChild(removeStoryOption);
  dropdownMenu.appendChild(removeStoryAndDataOption);

  // Toggle dropdown menu visibility on button click
  removeButton.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevent click from propagating to the document
    dropdownMenu.style.display =
      dropdownMenu.style.display === "none" ? "block" : "none";
  });

  // Close the dropdown when clicking anywhere outside
  document.addEventListener("click", () => {
    dropdownMenu.style.display = "none";
  });

  // Prevent closing dropdown when clicking inside it
  dropdownMenu.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  if (currentUser) {
    removeButton.style.padding = "10px 20px";
    removeButton.style.backgroundColor = "lightgrey";
    removeButton.style.position = "fixed";
    removeButton.style.bottom = "25px";
    removeButton.style.left = "50%";

    removeButton.style.zIndex = "1000"; // Ensure it's on top of other elements
    removeButton.style.transform = "translateX(-50%)";
  }
  // Append elements to the document
  panelElement.appendChild(dropdownMenu);
  panelElement.appendChild(removeButton);
}

function addOutlineSeparator(panelElement) {
  // Create the separator container
  const separatorContainer = document.createElement("div");
  separatorContainer.style.display = "flex";
  separatorContainer.style.alignItems = "center";
  separatorContainer.style.justifyContent = "center";
  separatorContainer.style.margin = "25px 0 20px 0"; // Adjust margin as needed

  // Create the left line
  const line1 = document.createElement("hr");
  line1.style.flexGrow = "1";
  line1.style.height = "1px";
  line1.style.backgroundColor = "gray";
  line1.style.border = "none";
  line1.style.margin = "0 10px"; // Adjust spacing between the text and the lines

  // Create the right line
  const line2 = document.createElement("hr");
  line2.style.flexGrow = "1";
  line2.style.height = "1px";
  line2.style.backgroundColor = "gray";
  line2.style.border = "none";
  line2.style.margin = "0 10px"; // Adjust spacing between the text and the lines

  // Create the separator text
  const separatorText = document.createElement("span");
  separatorText.style.fontSize = "12px";
  separatorText.style.fontWeight = "bold";
  separatorText.style.color = "gray";
  separatorText.textContent = "Outline Word Count".toUpperCase();

  // Append elements to the separator container
  separatorContainer.appendChild(line1);
  separatorContainer.appendChild(separatorText);
  separatorContainer.appendChild(line2);

  console.log("End---",trialCountdown)
  // Append the separator container to the panel element
  if(currentUser ){
    panelElement.appendChild(separatorContainer);
  }

  return separatorContainer;
}

async function addErrorOutlineData(text, panelElement) {
  // Create a container div
  const containerElement = document.createElement("div");
  containerElement.addClass = "errorOutline";

  // Style the container div
  containerElement.style.border = "1px solid #B0E0E6";
  containerElement.style.backgroundColor = "#F0F8FF";
  containerElement.style.borderRadius = "10px";
  containerElement.style.padding = "20px";
  containerElement.style.display = "flex";
  containerElement.style.alignItems = "center";
  containerElement.style.justifyContent = "center";
  containerElement.style.marginTop = "100px";
  containerElement.style.minHeight = "150px"; // Use min-height instead of height

  // Create the error text element
  const errorElement = document.createElement("div");

  // Style the error text element
  errorElement.style.fontSize = "16px";
  errorElement.style.fontWeight = "normal";
  errorElement.style.color = "#5A91A5";
  errorElement.style.textAlign = "center";
  errorElement.style.lineHeight = "1.5"; // Increase line height to prevent overlapping
  errorElement.style.whiteSpace = "normal"; // Allow text to wrap normally
  errorElement.textContent = text;
  // Append the error text to the container
  containerElement.appendChild(errorElement);

  // Append the container to the panel element
  panelElement.appendChild(containerElement);
}

async function addErrorOutlineLink(documentTitle, panelElement) {
  // Fetch the matching document from chrome.storage.local
  chrome.storage.local
    .get(["documents"])
    .then((result) => {
      // Find the document that matches the given title
      const matchingDocument = result.documents.find(
        (doc) => doc.title === documentTitle
      );

      if (!matchingDocument) {
        console.error(`Document with title '${documentTitle}' not found.`);
        return;
      }

      // Get the URL from the matching document
      const documentURL = matchingDocument.url;

      // Create a container div
      const containerElement = document.createElement("div");

      // Style the container div
      containerElement.style.display = "flex";
      containerElement.style.flexDirection = "column";
      containerElement.style.alignItems = "center";
      containerElement.style.justifyContent = "center";
      containerElement.style.marginTop = "20px";

      // Create the error text element
      const errorElement = document.createElement("div");

      // Style the error text element
      errorElement.style.fontSize = "14px";
      errorElement.style.fontWeight = "normal";
      errorElement.style.color = "#b1b1b1"; // Light grey color as per the design
      errorElement.style.textAlign = "center";
      errorElement.style.fontStyle = "italic";
      errorElement.style.lineHeight = "1.5"; // Increase line height to prevent overlapping
      errorElement.style.whiteSpace = "normal"; // Allow text to wrap normally
      errorElement.textContent = "Open document to see outline word count";

      // Create the button element
      const buttonElement = document.createElement("a"); // Changed to <a> for linking to the document URL
      buttonElement.href = documentURL; // Assign the document URL to the button
      buttonElement.target = "_blank"; // Open in a new tab
      buttonElement.textContent = "Open Document";
      buttonElement.style.marginTop = "10px";
      buttonElement.style.padding = "10px 20px";
      buttonElement.style.fontSize = "16px";
      buttonElement.style.fontWeight = "bold";
      buttonElement.style.color = "#5A91A5"; // Blue text color
      buttonElement.style.backgroundColor = "white"; // White background
      buttonElement.style.border = "2px solid #5A91A5"; // Border color matching text
      buttonElement.style.borderRadius = "25px"; // Rounded button
      buttonElement.style.cursor = "pointer";
      buttonElement.style.display = "flex";
      buttonElement.style.alignItems = "center";
      buttonElement.style.textDecoration = "none"; // Remove underline from link
      buttonElement.style.width = "fit-content"; // Button width should fit the content

      // Add the link icon
      const linkIcon = document.createElement("span");
      //linkIcon.textContent = "🔗";
      linkIcon.style.marginLeft = "8px";

      // Append the icon to the button
      buttonElement.appendChild(linkIcon);

      // Add click event listener to the button
      buttonElement.addEventListener("click", () => {
        // Create and style the loading message element
        const loadingMessage = document.createElement("div");
        loadingMessage.textContent = "Loading...";
        loadingMessage.style.fontSize = "14px";
        loadingMessage.style.fontWeight = "normal";
        loadingMessage.style.color = "#5A91A5";
        loadingMessage.style.marginTop = "10px";

        // Append the loading message to the container
        containerElement.appendChild(loadingMessage);

        // Run the initStoryPage function after a 4-second delay
        setTimeout(() => {
          console.log("This is #3");
          initStoryPage(panelElement, matchingDocument.title);
          // Remove the loading message once the function is called
          containerElement.removeChild(loadingMessage);
        }, 4000);
      });

      // Append the error text and button to the container
      containerElement.appendChild(errorElement);
      containerElement.appendChild(buttonElement);

      // Append the container to the panel element
      addRemoveButton(globalPanelElement, globalSiteTitle);
      panelElement.appendChild(containerElement);
    })
    .catch((error) => {
      console.error("Error retrieving documents from storage:", error);
    });
}

async function addIcon(panelElement) {
  const outlineContainer = panelElement;
  const iconElement = document.createElement("div");

  const imgElement = document.createElement("img");
  imgElement.style.width = "30px";
  imgElement.style.height = "30px";
  imgElement.style.backgroundRepeat = "none";
  imgElement.src = "./icons/Favicon.png";

  const textElement = document.createElement("div");
  textElement.textContent = "Google Doc manager";
  textElement.style.fontSize = "18px";
  textElement.style.fontWeight = "bold";
  textElement.style.color = "blue";
  textElement.style.display = "flex";
  textElement.style.justifyContent = "center";
  textElement.style.marginTop = "5px";
  textElement.style.marginLeft = "35px";

  iconElement.appendChild(imgElement);
  iconElement.appendChild(textElement);
  iconElement.style.display = "flex";

  outlineContainer.appendChild(iconElement);
}

isStoryPanelOpen = false;
globalPanelElement = "";
globalSiteTitle = "";

//todo outlines haseeb
function updateOutlineData(uiData) {
  showOrHideGlobalLoader(true);
  setTimeout(() => {
    showOrHideGlobalLoader(false);
  }, 5000);
  chrome.runtime.sendMessage({ action: "getOutline" }, function (response) {
    showOrHideGlobalLoader(false);
    console.log("Received Response from chrome outline : ", response);
    if (response && response.outline) {
      if (isStoryPanelOpen) {
        console.log("uiData.length === 2");
        globalPanelElement = storyPanel = uiData[0];
        globalSiteTitle = currentSiteTitle = uiData[1];
        if (checkStoryUser())
          makeStoryPage(response.outline, storyPanel, currentSiteTitle);
      } else {
        console.log("Story Page is not open");
      }
    } else {
      // addErrorOutlineData("Unable to make outline", globalPanelElement);
      addRemoveButton(globalPanelElement, globalSiteTitle);
    }
  });
}

async function initStoryPage(panelElement, clickedDocumentTitle) {
  try {
    //console.log('Starting main');
    panelElement.innerHTML = "";
    //await addIcon(panelElement);
    const tabInfo = await getActiveTabInfo();
    const currentSiteUrl = tabInfo.url;
    const currentSiteTitle = tabInfo.title.replace(" - Google Docs", "");
    console.log("Current Site Title: ", currentSiteTitle);

    makeStoryHeader(clickedDocumentTitle, panelElement);

    if (!currentSiteUrl.includes("https://docs.google.com/document")) {
      if (checkStoryUser())
        checkTialExpirationAndAct(clickedDocumentTitle, panelElement);
      return;
    }

    if (currentSiteTitle !== clickedDocumentTitle) {
      if (checkStoryUser())
        checkTialExpirationAndAct(clickedDocumentTitle, panelElement);
      return;
    }

    console.log("Site has correct URL");
    updateOutlineData([panelElement, currentSiteTitle]);
  } catch (error) {
    console.error("Error in popup script:", error);
  }
}

async function checkTialExpirationAndAct(clickedDocumentTitle, panelElement) {
  const isTrialPlanExpired = await isTrialExpire();
  addOutlineSeparator(panelElement);
  if (isTrialPlanExpired) {
    showTrialExpired();
    addRemoveButton(panelElement, currentSiteTitle);
    return;
  } else {
    addErrorOutlineLink(clickedDocumentTitle, panelElement);
  }
}

function showTrialExpired() {
  const trialExpiredMsg = shadowRoot.querySelector("#wc_free_trial_expired");
  trialExpiredMsg.style.display = "block";
}

async function showInitLoader() {
  showOrHideGlobalLoader(true);
  await sleep(2000);
  showOrHideGlobalLoader(false);
}

function showOrHideGlobalLoader(flag) {
  const mainLoader = shadowRoot.querySelector("#loading-overlay-main");
  if (!mainLoader) return;
  mainLoader.style.display = flag ? "block" : "none";
}

showInitLoader();
