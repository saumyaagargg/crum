const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);


/* =========================================================
   API
   ========================================================= */

async function api(path, body) {
  const options = {
    method: body === undefined ? "GET" : "POST"
  };

  if (body !== undefined) {
    options.headers = {
      "Content-Type": "application/json"
    };

    options.body = JSON.stringify(body);
  }

  const res = await fetch(path, options);

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}


/* =========================================================
   SAFE HTML
   ========================================================= */

const esc = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");


const money = (value) =>
  `₹${Number(value).toLocaleString("en-IN")}`;


/* =========================================================
   STATUS FORMATTER
   ========================================================= */

function formatStatus(status) {
  if (!status) {
    return "IDLE";
  }

  return String(status)
    .replaceAll("_", " ")
    .trim()
    .toUpperCase();
}


/* =========================================================
   THEME SYSTEM
   ========================================================= */

const themes = {

  pink: {
    name: "PINK / BLOOM",

    images: {
      main: "/frontend/assets/picture 14.png",
      secondary: "/frontend/assets/picture 15.png",
      decision: "/frontend/assets/picture 16.png"
    }
  },

  blue: {
    name: "BLUE / TEAL / AQUA",

    images: {
      main: "/frontend/assets/picture 17.png",
      secondary: "/frontend/assets/picture 18.png",
      decision: "/frontend/assets/picture 19.png"
    }
  },

  red: {
    name: "RED / ORANGE / EMBER",

    images: {
      main: "/frontend/assets/Picture4.png",
      secondary: "/frontend/assets/Picture13.png",
      decision: "/frontend/assets/picture 20.png"
    }
  }

};


/* =========================================================
   APPLY THEME
   ========================================================= */

function applyTheme(themeName) {

  const theme = themes[themeName];

  if (!theme) {
    return;
  }

  document.documentElement.dataset.theme = themeName;

  const mainImage = $("#heroMainImage");
  const secondaryImage = $("#heroSecondaryImage");
  const decisionImage = $("#decisionImage");

  if (mainImage) {
    mainImage.src = theme.images.main;
    mainImage.alt = `${theme.name} dance visual`;
  }

  if (secondaryImage) {
    secondaryImage.src = theme.images.secondary;
    secondaryImage.alt = `${theme.name} dance detail`;
  }

  if (decisionImage) {
    decisionImage.src = theme.images.decision;
    decisionImage.alt = `${theme.name} decision visual`;
  }

  $$(".theme-btn").forEach((button) => {

    button.classList.toggle(
      "active",
      button.dataset.theme === themeName
    );

  });

  localStorage.setItem("crumTheme", themeName);
}


/* =========================================================
   THEME BUTTONS
   ========================================================= */

$$(".theme-btn").forEach((button) => {

  button.addEventListener("click", () => {

    const themeName = button.dataset.theme;

    applyTheme(themeName);

  });

});


/* =========================================================
   RENDER STATE
   ========================================================= */

function render(state) {

  state = state || {};

  const agent = state.agent || {};
  const stats = state.stats || {};

  const status = formatStatus(agent.status);

  /* -------------------------------------------------------
     AGENT STATUS
     ------------------------------------------------------- */

  const agentStatus = $("#agentStatus");

  if (agentStatus) {
    agentStatus.textContent = status;
  }


  /* -------------------------------------------------------
     METRICS
     ------------------------------------------------------- */

  $("#sourceCount").textContent =
    stats.sourcesMonitored ?? 12;

  $("#evaluated").textContent =
    stats.opportunitiesEvaluated ?? 0;

  $("#coordRuns").textContent =
    stats.coordinationRuns ?? 0;


  /* -------------------------------------------------------
     TASK STATE
     ------------------------------------------------------- */

  $("#taskState").textContent =
    agent.currentTask ||
    (
      status === "MONITORING"
        ? "Monitoring for changes"
        : "Waiting for an intention"
    );


  /* =======================================================
     TIMELINE
     ======================================================= */

  const timeline = $("#timeline");

  const entries = Array.isArray(agent.timeline)
    ? agent.timeline
    : [];

  if (entries.length) {

    timeline.innerHTML = entries
      .map((item) => `

        <div class="timeline-item">

          <div class="timeline-time">
            ${esc(item.time)}
          </div>

          <div>

            <strong>
              ${esc(item.title)}
            </strong>

            <span>
              ${esc(item.detail)}
            </span>

          </div>

        </div>

      `)
      .join("");

  } else {

    timeline.innerHTML = `
      <div class="timeline-empty">
        Save your intention and let Crum work.
      </div>
    `;

  }


  /* =======================================================
     DECISION CARD
     ======================================================= */

  const card = $("#decisionCard");

  const event = agent.event;

  if (agent.decision && event) {

    card.classList.remove("hidden");

    const decisionStatus =
      formatStatus(agent.status || "READY_FOR_APPROVAL");

    card.innerHTML = `

      <div class="decision-status">
        ${esc(decisionStatus)}
      </div>

      <h3>
        ${esc(event.name)}
      </h3>

      <p>
        ${esc(agent.decision.message)}
      </p>

      <div class="decision-meta">

        <div class="meta">
          <b>When</b>
          <br>
          ${esc(event.date)}
          ·
          ${esc(event.time)}
        </div>

        <div class="meta">
          <b>Where</b>
          <br>
          ${esc(event.location)}
        </div>

        <div class="meta">
          <b>Match</b>
          <br>
          ${event.matchScore}/100
        </div>

        <div class="meta">
          <b>Seats</b>
          <br>
          ${event.seatsLeft} remaining
          ·
          ${money(event.price)}
        </div>

      </div>

      ${
        decisionStatus === "READY FOR APPROVAL"
          ? `
            <button
              id="approveBtn"
              class="btn btn-dark approve"
            >
              Approve reservation →
            </button>
          `
          : ""
      }

    `;


    /* -------------------------------------------------------
       APPROVAL
       ------------------------------------------------------- */

    const approveButton = $("#approveBtn");

    if (approveButton) {

      approveButton.onclick = async () => {

        approveButton.disabled = true;

        approveButton.textContent =
          "Approving...";

        try {

          const nextState =
            await api("/api/approve", {});

          render(nextState);

        } catch (error) {

          console.error(error);

          approveButton.disabled = false;

          approveButton.textContent =
            "Approve reservation →";

        }

      };

    }

  } else {

    card.classList.add("hidden");

    card.innerHTML = "";

  }


  /* =======================================================
     CONFIRMATION
     ======================================================= */

  const confirmation = $("#confirmation");

  if (agent.confirmation?.confirmed) {

    confirmation.classList.remove("hidden");

    confirmation.innerHTML = `

      <strong>
        ✓ ${esc(agent.confirmation.message)}
      </strong>

      <br>

      <small>
        Confirmation:
        ${esc(agent.confirmation.id)}
      </small>

    `;

  } else {

    confirmation.classList.add("hidden");

    confirmation.innerHTML = "";

  }

}


/* =========================================================
   HERO BUTTON
   ========================================================= */

$("#heroStart").addEventListener("click", () => {

  $("#intention").scrollIntoView({
    behavior: "smooth"
  });

});


/* =========================================================
   PROFILE FORM
   ========================================================= */

$("#profileForm").addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    const form =
      new FormData(event.currentTarget);


    const styles =
      String(form.get("styles"))
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);


    const profile = {

      name: form.get("name"),

      city: form.get("city"),

      styles,

      level: form.get("level"),

      budget:
        Number(form.get("budget")) || 0,

      goal:
        form.get("goal"),

      radiusKm: 10,

      days: [
        "Saturday",
        "Sunday"
      ],

      timeStart: "16:00",

      timeEnd: "20:00"

    };


    try {

      const nextState =
        await api(
          "/api/profile",
          profile
        );

      render(nextState);

      $("#agent").scrollIntoView({
        behavior: "smooth"
      });

    } catch (error) {

      console.error(error);

      alert(
        "Could not save the intention. Make sure Crum is running."
      );

    }

  }
);


/* =========================================================
   BACKGROUND RUN
   ========================================================= */

$("#runBtn").addEventListener(
  "click",
  async () => {

    const button = $("#runBtn");

    button.disabled = true;

    button.textContent =
      "Agent working...";


    try {

      const nextState =
        await api("/api/run", {});

      render(nextState);


      setTimeout(() => {

        $("#decisionCard")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });

      }, 250);


    } catch (error) {

      console.error(error);

      alert(
        "The autonomous run failed."
      );

    } finally {

      button.disabled = false;

      button.textContent =
        "Simulate background run";

    }

  }
);


/* =========================================================
   RESET DEMO
   ========================================================= */

$("#resetBtn").addEventListener(
  "click",
  async () => {

    const button = $("#resetBtn");

    button.disabled = true;

    button.textContent =
      "Resetting...";


    try {

      const nextState =
        await api(
          "/api/reset",
          {}
        );

      /*
       * Always re-render the complete returned state.
       * This clears:
       * - agent status
       * - timeline
       * - decision card
       * - confirmation
       * - metrics
       */

      render(nextState);

      /*
       * Bring the user back to the agent section
       * so the reset is immediately visible.
       */

      $("#agent").scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

    } catch (error) {

      console.error(error);

      alert(
        "Could not reset the demo."
      );

    } finally {

      button.disabled = false;

      button.textContent =
        "Reset demo";

    }

  }
);


/* =========================================================
   IMAGE ERROR HANDLING
   ========================================================= */

[
  "heroMainImage",
  "heroSecondaryImage",
  "decisionImage"
]
  .forEach((id) => {

    const image = $(`#${id}`);

    if (!image) {
      return;
    }

    image.addEventListener("error", () => {

      console.error(
        "Image failed to load:",
        image.src
      );

      image.classList.add(
        "image-error"
      );

    });

  });


/* =========================================================
   INITIAL LOAD
   ========================================================= */

const savedTheme =
  localStorage.getItem("crumTheme") || "pink";


applyTheme(
  themes[savedTheme]
    ? savedTheme
    : "pink"
);


api("/api/state")
  .then((state) => {

    render(state);

  })
  .catch((error) => {

    console.error(error);

    $("#timeline").innerHTML = `
      <div class="timeline-empty">
        Start the server with
        <b>node server.mjs</b>.
      </div>
    `;

  });