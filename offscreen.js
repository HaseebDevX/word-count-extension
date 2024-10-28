// This URL must point to the public site
const _URL = "https://wordcount-chrome-extension.web.app/signInWithPopup.html"
const iframe = document.createElement("iframe")
iframe.src = _URL
document.documentElement.appendChild(iframe)
chrome.runtime.onMessage.addListener(handleChromeMessages)

function handleChromeMessages(message, sender, sendResponse) {
  console.log("handleChromeMessages", message)
  // Extensions may have an number of other reasons to send messages, so you
  // should filter out any that are not meant for the offscreen document.
  if (message.target !== "offscreen") {
    console.log("message target is not offscreen")
    return false
  }

  function handleIframeMessage({ data }) {
    console.log("handleIframeMessagee", data)
    if (!data) {
      console.log("no data")
      return null
    }
    try {
      console.log("data", data)
      data = JSON.parse(data)
      console.log("data", data)
      self.removeEventListener("message", handleIframeMessage)

      sendResponse(data)
    } catch (e) {
      console.log(`json parse failed - ${e.message}`)
    }
  }

  globalThis.addEventListener("message", handleIframeMessage, false)

  // Initialize the authentication flow in the iframed document. You must set the
  // second argument (targetOrigin) of the message in order for it to be successfully
  // delivered.

  if (message.type === "firebase-auth") {
    console.log("firebase-auth message is sent")
    iframe.contentWindow.postMessage({ initAuth: true }, new URL(_URL).origin)
  } else if (message.type === "sign-out") {
    console.log("signout message is sent")
    console.log("signout message is sent")
    iframe.contentWindow.postMessage({ signOut: true }, new URL(_URL).origin)
  } else if (message.type === "current-user") {
    console.log("current-user message is sent")
    console.log("iframe ", iframe)
    iframe.contentWindow.postMessage(
      { currentUser: true },
      new URL(_URL).origin
    )
  }

  return true
}
