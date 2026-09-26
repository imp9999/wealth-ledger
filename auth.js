/* Shared login gate + small formatting helpers used by every page.
   Requires firebase-app-compat.js, firebase-auth-compat.js, firebase-firestore-compat.js,
   and firebase-config.js to be loaded first. */
(function () {
  function initFirebase() {
    if (!firebase.apps.length) {
      firebase.initializeApp(window.WEALTH_FIREBASE_CONFIG);
    }
    return { auth: firebase.auth(), db: firebase.firestore() };
  }

  window.WealthAuth = {
    /**
     * Wires up the login form + auth state listener.
     * onReady(ctx) is called once per successful sign-in, where ctx = {auth, db, user}.
     * Your page should do all of its Firestore reads/writes inside onReady, not before.
     */
    init: function (onReady) {
      var f = initFirebase();
      var gate = document.getElementById("authGate");
      var app = document.getElementById("appRoot");
      var form = document.getElementById("loginForm");
      var emailEl = document.getElementById("loginEmail");
      var passEl = document.getElementById("loginPassword");
      var errEl = document.getElementById("loginError");
      var logoutBtn = document.getElementById("logoutBtn");

      function showApp(user) {
        if (gate) gate.style.display = "none";
        if (app) app.style.display = "";
        if (logoutBtn) logoutBtn.style.display = "";
        onReady({ auth: f.auth, db: f.db, user: user });
      }
      function showGate() {
        if (app) app.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "none";
        if (gate) gate.style.display = "";
      }

      f.auth.onAuthStateChanged(function (user) {
        if (user) showApp(user);
        else showGate();
      });

      if (form) {
        form.addEventListener("submit", function (e) {
          e.preventDefault();
          if (errEl) errEl.textContent = "";
          var submitBtn = form.querySelector('button[type="submit"]');
          if (submitBtn) submitBtn.disabled = true;
          f.auth
            .signInWithEmailAndPassword(emailEl.value.trim(), passEl.value)
            .catch(function () {
              if (errEl) errEl.textContent = "Incorrect email or password.";
            })
            .then(function () {
              if (submitBtn) submitBtn.disabled = false;
            });
        });
      }
      if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
          f.auth.signOut();
        });
      }
    }
  };

  window.WealthUtil = {
    fmtMoney: function (n) {
      if (n === null || n === undefined || isNaN(n)) return "—";
      var neg = n < 0;
      var s = "$" + Math.abs(Number(n)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return neg ? "−" + s : s;
    },
    fmtPct: function (n) {
      return (n > 0 ? "+" : "") + Number(n).toFixed(2) + "%";
    },
    escapeHtml: function (s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }
  };
})();
