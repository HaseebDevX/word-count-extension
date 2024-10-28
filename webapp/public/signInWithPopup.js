// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA10Hld07noh3yzl3Fn4o6kjrt463gTopQ",
  authDomain: "wordcount-chrome-extension.firebaseapp.com",
  databaseURL: "https://wordcount-chrome-extension-default-rtdb.firebaseio.com",
  projectId: "wordcount-chrome-extension",
  storageBucket: "wordcount-chrome-extension.appspot.com",
  messagingSenderId: "586875510421",
  appId: "1:586875510421:web:ddeb0e96770c55bfce459c",
  measurementId: "G-5PBMQHSTQ1"
};

const app = initializeApp(firebaseConfig)
const auth = getAuth()

// #signInWithPopup
document.querySelector("#signInWithPopup").addEventListener("click", () => {
  console.log("signing in with popup")

  signInWithPopup(auth, new GoogleAuthProvider())
    .then((result) => {
      console.log(result)
    })
    .catch((error) => {
      console.error(error)
    })
})

// This code runs inside of an iframe in the extension's offscreen document.
// This gives you a reference to the parent frame, i.e. the offscreen document.
// You will need this to assign the targetOrigin for postMessage.
const PARENT_FRAME = document.location.ancestorOrigins[0]

// This demo uses the Google auth provider, but any supported provider works.
// Make sure that you enable any provider you want to use in the Firebase Console.
// https://console.firebase.google.com/project/_/authentication/providers
const PROVIDER = new GoogleAuthProvider()

function sendResponse(result) {
  console.log("sendResponse", result)
  globalThis.parent.self.postMessage(JSON.stringify(result), PARENT_FRAME)
}

globalThis.addEventListener("message", function ({ data }) {
  if (data.initAuth) {
    // Opens the Google sign-in page in a popup, inside of an iframe in the
    // extension's offscreen document.
    // To centralize logic, all respones are forwarded to the parent frame,
    // which goes on to forward them to the extension's service worker.
    signInWithPopup(auth, PROVIDER).then(sendResponse).catch(sendResponse)
  } else if (data.signOut) {
    signOut(auth)
      .then((res) => {
        console.log("signOut", res)
        return sendResponse({
          success: true,
        })
      })
      .catch((error) => {
        sendResponse({
          success: false,
          error: error.message,
        })
      })
  } else if (data.currentUser) {
    console.log("currentUser")
    const unsub = auth.onAuthStateChanged((user) => {
      console.log("onAuthStateChanged", user)
      unsub()
      sendResponse(user)
    })
  }
})
