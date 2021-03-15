/********************************************************************
 * Globals
 ********************************************************************/
const BASE_URL = "http://javalin-1.duckdns.org:7000";
let roles;
let statuses;
let users;
let expenses = [];
let filteredExpenses = [];
let statistics = {
  approved: 0,
  denied: 0,
  pending: 0,
  total: 0,
  approved_amt: 0,
  denied_amt: 0,
  pending_amt: 0,
  total_amt: 0,
  approved_pct: 0,
  denied_pct: 0,
  pending_pct: 0,
};

rank = {
  0: "Gilderoy Lockhart",
  10: "Peter Pettigrew",
  20: "Professor Trelawney",
  30: "Ron Weasley",
  40: "Hermoine Granger",
  50: "Harry Potter",
  60: "Severus Snape",
  70: "Bellatrix Lestrange",
  80: "Lord Voldemort",
  90: "Albus Dumbledore",
};

fate = {
  0: "Win the Quidditch World Cup",
  10: "Weekend at Hogsmeade",
  20: "Aced your NEWTs and get promoted to Auror",
  30: "Win the Triwizard Tournament",
  40: "Detention with Dolores Umbridge",
  50: "Forced to consume a box of earwax flavored Every Flavor Beans",
  60: "Locked up in Azkaban",
  70: "One thousand whomps from the Whomping Willow",
  80: "An hour of torture from the Cruciatus Curse",
  90: "Death by Avada Kedavra",
};

// sortOptions: key => sort direction (asc/dsc)
let sortOptions = {
  "sort-emp-dir": "",
  "sort-sub-dir": "",
  "sort-stat-dir": "",
};
// Toasts
let toastElList;
let toastList;
let toastSuccess;
let toastError;

/********************************************************************
 * Selectors
 ********************************************************************/
const avatarImg = document.getElementById("avatar");
const logoutLink = document.getElementById("logout-link");
const expenseTableBody = document.getElementById("expense-table-body");
const userGreeting = document.getElementById("user-greeting");
const userRoleDisp = document.getElementById("user-role-disp");
const userStatusMsg = document.getElementById("user-status-msg");
const loadingSpinner = document.getElementById("loading-spinner");
const btnCreateExpense = document.getElementById("btn-create-expense");
const btnRefreshTable = document.getElementById("btn-refresh-table");
const statLi = document.getElementById("stat-li");

// Views
const expenseView = document.getElementById("expense-view");
const statsView = document.getElementById("stats-view");

// Search box
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");

// Table
const thEmp = document.getElementById("th-emp");
const thSub = document.getElementById("th-sub");
const thStat = document.getElementById("th-stat");
const sortEmpDir = document.getElementById("sort-emp-dir");
const sortSubDir = document.getElementById("sort-sub-dir");
const sortStatDir = document.getElementById("sort-stat-dir");

// Modal - Edit
const inputExpId = document.getElementById("input-expId");
const inputFname = document.getElementById("input-fname");
const inputLname = document.getElementById("input-lname");
const inputEmail = document.getElementById("input-email");
const inputAmount = document.getElementById("input-amount");
const inputSubmittedAt = document.getElementById("input-submitted-at");
const inputMgrFname = document.getElementById("input-mgr-fname");
const inputMgrLname = document.getElementById("input-mgr-lname");
const inputMgrEmail = document.getElementById("input-mgr-email");
const inputStatus = document.getElementById("input-status");
const inputReviewedAt = document.getElementById("input-reviewed-at");
const inputReason = document.getElementById("input-reason");
// Modal - Delete
const modDelInputId = document.getElementById("mod-del-input-id");
const modDelConfirmId = document.getElementById("mod-del-confirm-id");
const modDelConfirmUser = document.getElementById("mod-del-confirm-user");
// Modal - Create
const modalCreateInputAmount = document.getElementById(
  "modal-create-input-amount"
);

// Toasts
const toastSuccessHdr = document.getElementById("toast-success-hdr");
const toastSuccessMsg = document.getElementById("toast-success-msg");
const toastErrorHdr = document.getElementById("toast-error-hdr");
const toastErrorMsg = document.getElementById("toast-error-msg");

/********************************************************************
 * Listeners
 ********************************************************************/
logoutLink.addEventListener("click", logout);
btnRefreshTable.addEventListener("click", refreshTable);
searchBtn.addEventListener("click", (e) => {
  e.preventDefault();
  buildExpenseTable();
});
thEmp.addEventListener("click", () => {
  applySort("sort-emp-dir");
  buildExpenseTable();
});
thSub.addEventListener("click", () => {
  applySort("sort-sub-dir");
  buildExpenseTable();
});
thStat.addEventListener("click", () => {
  applySort("sort-stat-dir");
  buildExpenseTable();
});

/********************************************************************
 * Functions
 ********************************************************************/

/********** Toggle View *********/
function toggleView(view) {
  if (view === "stats") {
    expenseView.style.display = "none";
    statsView.style.display = "block";
  } else {
    statsView.style.display = "none";
    expenseView.style.display = "block";
  }
}

/********** Toasts *********/
function initializeToasts() {
  toastElList = [].slice.call(document.querySelectorAll(".toast"));
  toastList = toastElList.map(function (toastEl) {
    return new bootstrap.Toast(toastEl);
  });
  toastSuccess = toastList[0];
  toastError = toastList[1];
}

function showToastSuccess(msg, hdr) {
  toastSuccessMsg.innerHTML = msg;
  if (hdr) {
    toastSuccessHdr.innerHTML = hdr;
  } else {
    toastSuccessHdr.innerHTML = "Expecto Patronum!";
  }
  toastSuccess.show();
}

function showToastError(msg, hdr) {
  toastErrorMsg.innerHTML = msg;
  if (hdr) {
    toastErrorHdr.innerHTML = hdr;
  } else {
    toastErrorHdr.innerHTML = "Avada Kedavra!";
  }
  toastError.show();
}

/********** Utility Functions *********/
/**
 * Sets or unsets the loading animation.
 *
 * @param {function(boolean): void} loading
 */
function setLoading(loading) {
  if (loading) {
    loadingSpinner.classList.add("spinner-border");
  } else {
    loadingSpinner.classList.remove("spinner-border");
  }
}

/**
 * Returns a random integer between start (inclusive) and end (inclusive).
 */
function genRandomInt(start, end) {
  start = Math.ceil(start);
  end = Math.floor(end);
  return Math.floor(Math.random() * (end - start + 1)) + start;
}

function generateAvatarImg() {
  let randInt = genRandomInt(1, 9);
  avatarImg.src = `images/avatar${randInt}.jpg`;
}

function objToDate(o) {
  return new Date(
    o.dateTime.date.year,
    o.dateTime.date.month - 1,
    o.dateTime.date.day,
    o.dateTime.time.hour,
    o.dateTime.time.minute,
    o.dateTime.time.second
  );
}

function parseDateObj(o) {
  let d = objToDate(o);
  // Force JS to accept it as UTC.
  let z = new Date(d + " UTC");
  return z.toLocaleString("en-US", { timeZoneName: "short" });
}

let formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

function centsToCurrency(cents) {
  const dollars = cents * 0.01;
  return formatter.format(dollars);
}

function applySearch() {
  const searchTerm = searchInput.value;
  if (!searchTerm) {
    filteredExpenses = [];
    return;
  }
  const regexp = new RegExp(searchTerm, "i");
  filteredExpenses = expenses.filter((expense) => {
    let user = users.find((u) => u.id === expense.employeeId);
    let status = statuses.find((s) => s.id === expense.statusId);
    let amount = centsToCurrency(expense.amountInCents);
    let submittedAt = parseDateObj(expense.submittedAt);
    let reviewedBy = "";
    if (expense.managerId) {
      manager = users.find((u) => u.id === expense.managerId);
      reviewedBy = `${manager.email} ${manager.fname} ${manager.lname}`;
    }
    let reviewedAt = "";
    if (expense.mgrReviewedAt) {
      reviewedAt = parseDateObj(expense.mgrReviewedAt);
    }
    let reason = "";
    if (expense.reason) {
      reason = expense.reason;
    }
    if (
      regexp.test(user.fname) ||
      regexp.test(user.lname) ||
      regexp.test(user.email) ||
      regexp.test(status.statusName) ||
      regexp.test(amount) ||
      regexp.test(submittedAt) ||
      regexp.test(reviewedBy) ||
      regexp.test(reviewedAt) ||
      regexp.test(reason)
    ) {
      return expense;
    }
  });
}

function applySort(sortKey, sortDir) {
  if (sortDir) {
    sortOptions[sortKey] = sortDir;
  } else {
    // Check if there is an active sort on specified column.
    if (sortOptions[sortKey] === "" || sortOptions[sortKey] === "dsc") {
      sortOptions[sortKey] = "asc";
      document.getElementById(
        sortKey
      ).innerHTML = ` <i class="bi bi-chevron-up"></i>`;
    } else {
      sortOptions[sortKey] = "dsc";
      document.getElementById(
        sortKey
      ).innerHTML = ` <i class="bi bi-chevron-down"></i>`;
    }
  }

  for (const key in sortOptions) {
    if (key !== sortKey) {
      sortOptions[key] = "";
      document.getElementById(key).innerHTML = "";
    }
  }
  switch (sortKey) {
    case "sort-emp-dir":
      expenses.sort((a, b) => {
        let userA = users.find((u) => u.id === a.employeeId).fname;
        let userB = users.find((u) => u.id === b.employeeId).fname;
        if (sortOptions[sortKey] === "asc") {
          return userA > userB ? 1 : userA === userB ? 0 : -1;
        } else {
          return userA > userB ? -1 : userA === userB ? 0 : 1;
        }
      });
      break;
    case "sort-sub-dir":
      expenses.sort((a, b) => {
        let _a = objToDate(a.submittedAt).getTime();
        let _b = objToDate(b.submittedAt).getTime();
        if (sortOptions[sortKey] === "asc") {
          return _a - _b;
        } else {
          return _b - _a;
        }
      });
      break;
    case "sort-stat-dir":
      expenses.sort((a, b) => {
        let statA = statuses.find((s) => s.id === a.statusId).statusName;
        let statB = statuses.find((s) => s.id === b.statusId).statusName;
        if (sortOptions[sortKey] === "asc") {
          return statA > statB ? 1 : statA === statB ? 0 : -1;
        } else {
          return statA > statB ? -1 : statA === statB ? 0 : 1;
        }
      });
      break;
    default:
      break;
  }
}

function calcStatistics() {
  statistics = {
    approved: 0,
    denied: 0,
    pending: 0,
    total: 0,
    approved_amt: 0,
    denied_amt: 0,
    pending_amt: 0,
    total_amt: 0,
    approved_pct: 0,
    denied_pct: 0,
    pending_pct: 0,
  };
  expenses.forEach((expense) => {
    statistics.total++;
    statistics.total_amt += expense.amountInCents;
    switch (expense.statusId) {
      case 1:
        statistics.pending++;
        statistics.pending_amt += expense.amountInCents;
        break;
      case 2:
        statistics.approved++;
        statistics.approved_amt += expense.amountInCents;
        break;
      case 3:
        statistics.denied++;
        statistics.denied_amt += expense.amountInCents;
        break;
      default:
        break;
    }
  });
  if (statistics.total === 0) {
    return;
  }
  // Append the HTML template to DOM elements.
  for (const key of ["pending", "approved", "denied"]) {
    let pct = ((statistics[key] / statistics.total) * 100).toFixed(0);
    statistics[`${key}_pct`] = pct;
    document.getElementById(`sc-${key}-prog`).innerHTML = `
      <div class="progress-bar fs-6" role="progressbar" style="width: ${pct}%;" aria-valuenow="${pct}"
        aria-valuemin="0" aria-valuemax="100">${pct}%</div
    `;
    document.getElementById(
      `sc-${key}-text`
    ).innerText = `${statistics[key]} out of ${statistics.total}`;
    document.getElementById(`sc-amt-${key}`).innerText = centsToCurrency(
      statistics[`${key}_amt`]
    );
  }
  document.getElementById("sc-amt-total").innerText = centsToCurrency(
    statistics.total_amt
  );
  for (const score of [90, 80, 70, 60, 50, 40, 30, 20, 10, 0]) {
    if (statistics.approved_pct >= score) {
      document.getElementById("sc-amt-rank").innerText = rank[score];
      break;
    }
  }
  for (const score of [90, 80, 70, 60, 50, 40, 30, 20, 10, 0]) {
    if (statistics.denied_pct >= score) {
      document.getElementById("sc-amt-fate").innerText = fate[score];
      break;
    }
  }
}

/********** JWT/Auth Functions *********/
function checkJWT() {
  if (localStorage.getItem("2102GCP_P1_jwt") === null) {
    goToLogin();
  }
}

function goToLogin() {
  window.location.href = "pages/signin.html";
}

function logout() {
  localStorage.removeItem("2102GCP_P1_jwt");
  goToLogin();
}

function getToken() {
  checkJWT();
  return localStorage.getItem("2102GCP_P1_jwt");
}

/********** Misc User Functions *********/

function setUserGreeting() {
  const token = getToken();
  const userId = JSON.parse(window.atob(token.split(".")[1])).sub;
  const roleId = JSON.parse(window.atob(token.split(".")[1])).role;
  const user = users.find((u) => u.id === userId);
  userGreeting.innerHTML = `Hello, ${user.fname}`;
  if (roleId === 2) {
    userRoleDisp.innerHTML = "Manager";
  } else {
    userRoleDisp.innerHTML = "Employee";
  }
  showToastSuccess(
    `Welcome, ${user.fname} ${user.lname}!`,
    "Wingardium Leviosa!"
  );
  if (roleId === 2) {
    // Managers do not need to create expense.
    btnCreateExpense.style.display = "none";
  }
}

function setUserStatusMsg() {
  const pending = expenses.filter((e) => e.statusId === 1);
  if (pending.length > 0) {
    userStatusMsg.innerHTML = "👋 You have pending expenses... ☝️🧹🧙";
  } else {
    userStatusMsg.innerHTML =
      "✔️ You have no pending expenses. 👍👏👌🔥👊❤️✨😊";
  }
}

function statusToBadgeClassType(status) {
  switch (status) {
    case "APPROVED":
      return "bg-success";
    case "DENIED":
      return "bg-danger";
    case "PENDING":
    default:
      return "bg-warning";
  }
}

function genEditModalContent(expenseId) {
  const token = getToken();
  const roleId = JSON.parse(window.atob(token.split(".")[1])).role;

  const expense = expenses.find((e) => e.id === expenseId);
  const user = users.find((u) => u.id === expense.employeeId);

  // Managers can edit more fields.
  if (roleId === 2) {
    inputStatus.disabled = false;
    inputReason.disabled = false;
  } else {
    inputStatus.disabled = true;
    inputReason.disabled = true;
  }

  inputExpId.innerHTML = expense.id;
  inputFname.value = user.fname;
  inputLname.value = user.lname;
  inputEmail.value = user.email;
  inputAmount.value = (expense.amountInCents * 0.01).toFixed(2);
  inputSubmittedAt.value = parseDateObj(expense.submittedAt);

  inputMgrFname.value = "";
  inputMgrLname.value = "";
  inputMgrEmail.value = "";
  if (expense.managerId) {
    manager = users.find((u) => u.id === expense.managerId);
    inputMgrFname.value = manager.fname;
    inputMgrLname.value = manager.lname;
    inputMgrEmail.value = manager.email;
  }
  inputStatus.value = expense.statusId;
  inputReviewedAt.value = "";
  if (expense.reviewedAt) {
    inputReviewedAt.value = parseDateObj(expense.mgrReviewedAt);
  }
  inputReason.value = "";
  if (expense.reason) {
    inputReason.value = expense.reason;
  }
}

function genDeleteModalContent(expenseId) {
  const expense = expenses.find((e) => e.id === expenseId);
  const user = users.find((u) => u.id === expense.employeeId);

  modDelInputId.innerHTML = expense.id;
  modDelConfirmId.innerHTML = expense.id;
  modDelConfirmUser.innerHTML = `${user.fname} ${user.lname}`;
}

function buildExpenseTable(needSort) {
  const token = getToken();
  const roleId = JSON.parse(window.atob(token.split(".")[1])).role;
  if (needSort) {
    // Check if sorting is needed.
    let sortKey;
    for (const key in sortOptions) {
      if (sortOptions[key]) {
        sortKey = key;
        break;
      }
    }
    if (sortKey) {
      applySort(sortKey, sortOptions[sortKey]);
    } else {
      // Sort expenses by pending.
      expenses.sort((a, b) => a.statusId - b.statusId);
    }
  }

  applySearch();
  let _expenses;
  if (filteredExpenses.length !== 0) {
    _expenses = filteredExpenses;
  } else {
    _expenses = expenses;
  }
  let tableBodyTemplate = "";
  _expenses.forEach((expense) => {
    let user = users.find((u) => u.id === expense.employeeId);
    let status = statuses.find((s) => s.id === expense.statusId);
    let statusBadgeClass = statusToBadgeClassType(status.statusName);
    let amount = centsToCurrency(expense.amountInCents);
    let submittedAt = parseDateObj(expense.submittedAt);
    let reviewedBy = "";
    // Use for disabling the action buttons for expenses that have already been reviewed.
    // Affects employees only.
    let disabledEdit = "";
    let disabledDelete = "";
    // Use for toggling modals.
    let toggleEditModal = `data-bs-toggle="modal" data-bs-target="#modal"`;
    let toggleDeleteModal = `data-bs-toggle="modal" data-bs-target="#modal-delete"`;
    if (expense.managerId) {
      manager = users.find((u) => u.id === expense.managerId);
      reviewedBy = `<a href="mailto:${manager.email}">${manager.fname} ${manager.lname}</a>`;
      if (roleId != 2) {
        disabledEdit = "disabled";
        disabledDelete = "disabled";
        toggleEditModal = "";
        toggleDeleteModal = "";
      }
    }
    let reviewedAt = "";
    if (expense.mgrReviewedAt) {
      reviewedAt = parseDateObj(expense.mgrReviewedAt);
    }
    let reason = "";
    if (expense.reason) {
      reason = expense.reason;
    }
    tableBodyTemplate += `
    <tr>
    <td>${expense.id}</td>
    <td class="text-center"><a href="mailto:${user.email}">
        ${user.fname} ${user.lname}
      </a></td>
    <td class="td-text-right">${amount}</td>
    <td>${submittedAt}</td>
    <td><span class="badge ${statusBadgeClass}">${status.statusName}</span></td>
    <td>${reviewedBy}</td>
    <td>${reviewedAt}</td>
    <td>${reason}</td>
    <td class="text-center">
      <button class="btn btn-icon btn-icon-edit ${disabledEdit}"
        onclick="genEditModalContent(${expense.id})" ${toggleEditModal} ${disabledEdit}>
          <i class="bi bi-pencil"></i>
      </button>
      <button class="btn btn-icon btn-icon-delete ${disabledDelete}"
        onclick="genDeleteModalContent(${expense.id})" ${toggleDeleteModal} ${disabledDelete}>
          <i class="bi bi-trash"></i>
      </button>
    </td>
    </tr>
    `;
  });
  expenseTableBody.innerHTML = tableBodyTemplate;
  calcStatistics();
  setUserStatusMsg();
}

/********** API Functions *********/

async function getAllExpenses() {
  let data;
  const token = getToken();
  let clientId = JSON.parse(window.atob(token.split(".")[1])).sub;
  const roleId = JSON.parse(window.atob(token.split(".")[1])).role;
  // If this is a manager, set client to 0 to pull all expenses.
  if (roleId === 2) {
    clientId = 0;
  }
  try {
    const res = await fetch(`${BASE_URL}/users/${clientId}/expenses`, {
      method: "GET",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    data = await res.json();
    return data;
  } catch (err) {
    console.log(err);
  } finally {
  }
}

async function getAllRoles() {
  let data;
  try {
    const res = await fetch(`${BASE_URL}/user-roles`);
    data = await res.json();
    return data;
  } catch (err) {
    console.log(err);
  } finally {
  }
}

async function getAllStatuses() {
  let data;
  try {
    const res = await fetch(`${BASE_URL}/expense-statuses`);
    data = await res.json();
    return data;
  } catch (err) {
    console.log(err);
  } finally {
  }
}

async function getAllUsers() {
  let data;
  try {
    const res = await fetch(`${BASE_URL}/users`);
    data = await res.json();
    return data;
  } catch (err) {
    console.log(err);
  } finally {
  }
}

async function updateExpense() {
  const token = getToken();
  let userId = JSON.parse(window.atob(token.split(".")[1])).sub;
  const roleId = JSON.parse(window.atob(token.split(".")[1])).role;

  const data = {};
  data.id = Number(inputExpId.innerHTML);
  const expense = expenses.find((e) => e.id === data.id);
  data.amountInCents = inputAmount.value * 100;
  if (roleId === 2) {
    userId = expense.employeeId;
    data.statusId = inputStatus.value;
    data.reason = inputReason.value;
  }
  console.log("Updating", data);
  setLoading(true);
  try {
    const res = await fetch(`${BASE_URL}/users/${userId}/expenses/${data.id}`, {
      method: "PUT",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (res.status !== 200) {
      const message = await res.text();
      throw new Error(`${message} - ${res.status} (${res.statusText})`);
    }
    showToastSuccess(`Expense ${data.id} updated`);
  } catch (err) {
    console.log(err);
    showToastError(`Error updating expense ${data.id}: ${err.message}`);
  } finally {
    expenses = await getAllExpenses();
    buildExpenseTable(true);
    setLoading(false);
  }
}

async function deleteExpense() {
  const token = getToken();
  let userId = JSON.parse(window.atob(token.split(".")[1])).sub;
  const roleId = JSON.parse(window.atob(token.split(".")[1])).role;

  const data = {};
  data.id = Number(modDelInputId.innerHTML);
  const expense = expenses.find((e) => e.id === data.id);
  if (roleId === 2) {
    userId = expense.employeeId;
  }
  setLoading(true);
  try {
    const res = await fetch(`${BASE_URL}/users/${userId}/expenses/${data.id}`, {
      method: "DELETE",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.status !== 200) {
      const message = await res.text();
      throw new Error(`${message} - ${res.status} (${res.statusText})`);
    }
    showToastSuccess(`Expense ${data.id} deleted`);
  } catch (err) {
    console.log(err);
    showToastError(`Error deleting expense ${data.id}: ${err.message}`);
  } finally {
    expenses = await getAllExpenses();
    buildExpenseTable(true);
    setLoading(false);
  }
}

async function createExpense() {
  const token = getToken();
  const userId = JSON.parse(window.atob(token.split(".")[1])).sub;

  const data = {};
  data.id = 0;
  data.amountInCents = modalCreateInputAmount.value * 100;
  data.employeeId = userId;

  setLoading(true);
  try {
    const res = await fetch(`${BASE_URL}/users/${userId}/expenses`, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (res.status !== 200 && res.status !== 201) {
      const message = await res.text();
      throw new Error(`${message} - ${res.status} (${res.statusText})`);
    }
    showToastSuccess("Successfully submitted new expense");
  } catch (err) {
    console.log(err);
    showToastError(`Error submitting new expense ${data.id}: ${err.message}`);
  } finally {
    expenses = await getAllExpenses();
    buildExpenseTable(true);
    setLoading(false);
    modalCreateInputAmount.value = "";
  }
}

async function loadInitialData() {
  setLoading(true);
  try {
    roles = await getAllRoles();
    statuses = await getAllStatuses();
    users = await getAllUsers();
    setUserGreeting();
    expenses = await getAllExpenses();
    await buildExpenseTable(true);
  } catch (err) {
    console.log(err);
    showToastError("Error loading initial data");
  } finally {
    setLoading(false);
  }
}

async function refreshTable() {
  setLoading(true);
  try {
    expenses = await getAllExpenses();
    buildExpenseTable(true);
  } catch (err) {
    console.log(err);
    showToastError("Error refreshing table");
  } finally {
    setLoading(false);
  }
}

// Main
checkJWT();
generateAvatarImg();
initializeToasts();
loadInitialData();
