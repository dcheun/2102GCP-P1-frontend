// Globals
const BASE_URL = "http://javalin-1.duckdns.org:7000";

// Selectors
const inputEmail = document.getElementById("inputEmail");
const inputPassword = document.getElementById("inputPassword");
const signinBtn = document.getElementById("signinBtn");
const authFailAlert = document.getElementById("alert-fail");

// Listeners
signinBtn.addEventListener("click", auth);

// Functions

// Authenticate user.
async function auth(e) {
  authFailAlert.style.display = "none";
  setBtnLumos();
  // Prevent page from reloading.
  e.preventDefault();
  const data = {
    username: inputEmail.value,
    password: inputPassword.value,
  };
  const res = await fetch(`${BASE_URL}/users/login`, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (res.status !== 200) {
    unsetBtnLumos();
    loginFail();
    return;
  }
  const jwt = await res.json(); // get jwt
  localStorage.setItem("2102GCP_P1_jwt", jwt["2102GCP_P1_jwt"]);
  unsetBtnLumos();
  goToMain();
}

// Switch to main dashboard.
function goToMain() {
  window.location.href = "../index.html";
}

function loginFail() {
  authFailAlert.style.display = "block";
}

function setBtnLumos() {
  signinBtn.style.opacity = 0.6;
  signinBtn.innerHTML = `<span class="spinner-grow spinner-grow-sm mb-1" role="status" aria-hidden="true"></span>
  LUMOS`;
}

function unsetBtnLumos() {
  signinBtn.style.opacity = 1;
  signinBtn.innerHTML = "Sign in";
}
