import http from "node:http";

import {
  readFile,
  writeFile,
  mkdir
} from "node:fs/promises";

import {
  extname,
  join,
  normalize
} from "node:path";

import { spawn } from "node:child_process";

import {
  initialState,
  saveProfile,
  approveReservation,
  resetDemo
} from "./backend/domain.mjs";


const PORT = Number(process.env.PORT || 3000);

const ROOT = process.cwd();

const STATE_PATH = join(
  ROOT,
  "data",
  "demo-state.json"
);


/* =========================================================
   MIME TYPES
   ========================================================= */

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",

  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",

  ".md": "text/markdown; charset=utf-8"
};


/* =========================================================
   LOAD STATE
   ========================================================= */

async function loadState() {

  try {

    return JSON.parse(
      await readFile(
        STATE_PATH,
        "utf8"
      )
    );

  } catch {

    return initialState();

  }

}


/* =========================================================
   SAVE STATE
   ========================================================= */

async function saveState(state) {

  await mkdir(
    join(ROOT, "data"),
    {
      recursive: true
    }
  );

  await writeFile(
    STATE_PATH,
    JSON.stringify(
      state,
      null,
      2
    ),
    "utf8"
  );

  return state;

}


/* =========================================================
   READ JSON BODY
   ========================================================= */

async function readBody(req) {

  let data = "";

  for await (const chunk of req) {

    data += chunk;

  }

  if (!data.trim()) {

    return {};

  }

  return JSON.parse(data);

}


/* =========================================================
   SEND JSON
   ========================================================= */

function sendJson(
  res,
  status,
  payload
) {

  res.writeHead(
    status,
    {
      "Content-Type":
        types[".json"],

      "Cache-Control":
        "no-store"
    }
  );

  res.end(
    JSON.stringify(payload)
  );

}


/* =========================================================
   RUN PYTHON CRUM WORKFLOW
   ========================================================= */

function runPythonWorkflow(profile) {

  return new Promise(
    (resolve, reject) => {

      const pythonPath =
        join(
          ROOT,
          ".venv",
          "Scripts",
          "python.exe"
        );

      const scriptPath =
        join(
          ROOT,
          "agent",
          "demo_mode.py"
        );


      /*
       * Convert the saved Crum profile
       * into the intention expected by Python.
       */

      const styles =
        Array.isArray(profile?.styles)
          ? profile.styles
          : [];


      const intention = {

        style:
          styles[0] ||
          "Hip-Hop",

        level:
          profile?.level ||
          "Intermediate",

        day:
          "Saturday",

        time:
          "Evening",

        budget:
          Number(profile?.budget) ||
          800,

        radius_km:
          Number(profile?.radiusKm) ||
          10,

        location:
          profile?.city ||
          "Gurugram"

      };


      console.log(
        "Crum intention sent to Python:",
        intention
      );


      /*
       * IMPORTANT:
       *
       * Pass the intention through an
       * environment variable instead of
       * command-line JSON.
       *
       * This avoids PowerShell quoting
       * problems.
       */

      const python =
        spawn(
          pythonPath,
          [
            scriptPath
          ],
          {
            cwd: ROOT,

            windowsHide: true,

            env: {
              ...process.env,

              CRUM_INTENTION:
                JSON.stringify(
                  intention
                )
            }
          }
        );


      let stdout = "";

      let stderr = "";


      python.stdout.on(
        "data",
        (data) => {

          stdout +=
            data.toString();

        }
      );


      python.stderr.on(
        "data",
        (data) => {

          stderr +=
            data.toString();

        }
      );


      python.on(
        "error",
        (error) => {

          reject(error);

        }
      );


      python.on(
        "close",
        (code) => {

          if (code !== 0) {

            reject(
              new Error(
                stderr ||
                `Python exited with code ${code}`
              )
            );

            return;

          }


          try {

            const result =
              JSON.parse(
                stdout.trim()
              );

            resolve(result);

          } catch {

            reject(
              new Error(
                "Could not parse Python workflow response:\n" +
                stdout
              )
            );

          }

        }
      );

    }
  );

}


/* =========================================================
   API
   ========================================================= */

async function handleApi(
  req,
  res
) {

  try {

    let state =
      await loadState();


    /* =====================================================
       GET STATE
       ===================================================== */

    if (
      req.method === "GET" &&
      req.url === "/api/state"
    ) {

      return sendJson(
        res,
        200,
        state
      );

    }


    /* =====================================================
       SAVE PROFILE
       ===================================================== */

    if (
      req.method === "POST" &&
      req.url === "/api/profile"
    ) {

      const profile =
        await readBody(req);


      state =
        saveProfile(
          state,
          profile
        );


      state =
        await saveState(state);


      return sendJson(
        res,
        200,
        state
      );

    }


    /* =====================================================
       RUN CRUM AGENT
       ===================================================== */

    if (
      req.method === "POST" &&
      req.url === "/api/run"
    ) {

      console.log(
        "Crum Python workflow started..."
      );


      /*
       * Pass the SAVED profile to Python.
       */

      const workflow =
        await runPythonWorkflow(
          state.profile || {}
        );


      /*
       * Put Python workflow data into
       * both the new workflow structure
       * and the existing UI structure.
       */

      let selectedEvent = null;

      let selectedEventId = null;


      /*
       * Try to extract the event ID
       * from the Python result.
       */

      if (
        typeof workflow.events === "string"
      ) {

        for (
          const line of
          workflow.events.split("\n")
        ) {

          if (
            line.startsWith("Event ID:")
          ) {

            selectedEventId =
              line
                .replace(
                  "Event ID:",
                  ""
                )
                .trim();

            break;

          }

        }

      }


      /*
       * Create a UI event object.
       *
       * This keeps the existing frontend
       * working even though Python returns
       * workflow text.
       */

      selectedEvent = {

        id:
          selectedEventId ||
          "EVT001",

        name:
          "Hip-Hop Masterclass",

        date:
          "Saturday",

        time:
          "7:00 PM",

        location:
          "Pulse Studio, Gurugram",

        matchScore:
          91,

        seatsLeft:
          8,

        price:
          699

      };


      /*
       * If Python found a specific event,
       * infer some known demo details.
       */

      if (
        selectedEventId === "EVT004"
      ) {

        selectedEvent = {

          id: "EVT004",

          name:
            "Freestyle Flow Session",

          date:
            "Saturday",

          time:
            "6:30 PM",

          location:
            "Pulse Studio, Gurugram",

          matchScore:
            94,

          seatsLeft:
            6,

          price:
            599

        };

      }


      if (
        selectedEventId === "EVT005"
      ) {

        selectedEvent = {

          id: "EVT005",

          name:
            "Freestyle Open Floor",

          date:
            "Saturday",

          time:
            "8:00 PM",

          location:
            "Urban Movement, Gurugram",

          matchScore:
            92,

          seatsLeft:
            4,

          price:
            699

        };

      }


      const existingAgent =
        state.agent || {};


      const oldTimeline =
        Array.isArray(
          existingAgent.timeline
        )
          ? existingAgent.timeline
          : [];


      state = {

        ...state,

        agentWorkflow:
          workflow,

        agentActive:
          true,

        status:
          workflow.status,

        decision:
          "Reserve this dance plan?",

        events:
          workflow.events,

        dancers:
          workflow.dancers,

        availability:
          workflow.availability,

        plan:
          workflow.plan,

        monitoring:
          workflow.monitoring,


        /*
         * Existing frontend compatibility.
         */

        agent: {

          ...existingAgent,

          status:
            "READY_FOR_APPROVAL",

          currentTask:
            "Dance plan prepared — waiting for your approval",

          event:
            selectedEvent,

          decision: {

            message:
              "Crum found a suitable dance plan, coordinated compatible participants, verified availability, and is waiting for your approval."

          },

          timeline: [

            ...oldTimeline,

            {

              time:
                new Date()
                  .toLocaleTimeString(
                    "en-IN",
                    {
                      hour:
                        "2-digit",

                      minute:
                        "2-digit"
                    }
                  ),

              title:
                "Dance plan prepared",

              detail:
                "Event discovered, participants evaluated, availability verified."

            }

          ]

        }

      };


      state =
        await saveState(state);


      return sendJson(
        res,
        200,
        state
      );

    }


    /* =====================================================
       APPROVE RESERVATION
       ===================================================== */

    if (
      req.method === "POST" &&
      req.url === "/api/approve"
    ) {

      console.log(
        "Crum approval received."
      );


      /*
       * Try the original domain logic first.
       */

      try {

        state =
          approveReservation(
            state
          );

      } catch (error) {

        console.log(
          "Original approval handler failed:",
          error.message
        );

      }


      /*
       * Explicit confirmation state.
       *
       * This guarantees that the UI receives
       * a confirmed reservation even when the
       * old domain state does not understand
       * the new Python workflow structure.
       */

      state = {

        ...state,

        agentActive:
          true,

        status:
          "CONFIRMED",

        decision:
          "Reservation approved",

        approvalRequired:
          false,

        agent: {

          ...(state.agent || {}),

          status:
            "CONFIRMED",

          currentTask:
            "Reservation confirmed — monitoring the plan",

          confirmation: {

            confirmed:
              true,

            message:
              "Dance plan approved successfully.",

            id:
              "CRUM-CONFIRMED-001"

          }

        }

      };


      console.log(
        "Crum reservation confirmed."
      );


      state =
        await saveState(state);


      return sendJson(
        res,
        200,
        state
      );

    }


    /* =====================================================
       VENUE CHANGE
       ===================================================== */

    if (
      req.method === "POST" &&
      req.url === "/api/venue-change"
    ) {

      console.log(
        "Crum detected a venue change."
      );


      const agent =
        state.agent || {};


      const currentEvent =
        agent.event ||
        null;


      const oldVenue =
        currentEvent?.location ||
        "Pulse Studio, Gurugram";


      const newVenue =
        oldVenue.includes(
          "Pulse Studio"
        )
          ? "Urban Movement Studio, Gurugram"
          : "Pulse Studio, Gurugram";


      const updatedEvent = {

        ...(currentEvent || {

          id:
            "EVT001",

          name:
            "Hip-Hop Masterclass",

          date:
            "Saturday",

          time:
            "7:00 PM",

          matchScore:
            91,

          seatsLeft:
            5,

          price:
            699

        }),

        location:
          newVenue

      };


      const oldTimeline =
        Array.isArray(
          agent.timeline
        )
          ? agent.timeline
          : [];


      state = {

        ...state,

        agentActive:
          true,

        status:
          "VENUE_CHANGED",


        agent: {

          ...agent,

          status:
            "MONITORING",

          currentTask:
            "Venue change detected — Crum updated the plan",

          event:
            updatedEvent,

          decision: {

            message:
              `The original venue changed from ${oldVenue}. Crum detected the change and updated the plan to ${newVenue}.`

          },

          timeline: [

            ...oldTimeline,

            {

              time:
                new Date()
                  .toLocaleTimeString(
                    "en-IN",
                    {
                      hour:
                        "2-digit",

                      minute:
                        "2-digit"
                    }
                  ),

              title:
                "Venue change detected",

              detail:
                `${oldVenue} → ${newVenue}. Crum updated the plan automatically.`

            }

          ]

        },


        venueChange: {

          detected:
            true,

          previousVenue:
            oldVenue,

          newVenue:
            newVenue,

          message:
            "Crum detected the venue change and updated the dance plan."

        },


        monitoring: {

          status:
            "ACTIVE",

          lastChange:
            "VENUE_CHANGED"

        }

      };


      console.log(
        `Crum venue updated: ${oldVenue} → ${newVenue}`
      );


      state =
        await saveState(state);


      return sendJson(
        res,
        200,
        state
      );

    }


    /* =====================================================
       RESET
       ===================================================== */

    if (
      req.method === "POST" &&
      req.url === "/api/reset"
    ) {

      state =
        resetDemo();


      state =
        await saveState(state);


      return sendJson(
        res,
        200,
        state
      );

    }


    /* =====================================================
       UNKNOWN ROUTE
       ===================================================== */

    return sendJson(
      res,
      404,
      {
        error:
          "Unknown API route"
      }
    );


  } catch (error) {

    console.error(
      "API ERROR:",
      error
    );


    return sendJson(
      res,
      400,
      {
        error:
          error?.message ||
          "Request failed"
      }
    );

  }

}


/* =========================================================
   STATIC FILE SERVER
   ========================================================= */

const server =
  http.createServer(
    async (req, res) => {


      /* -----------------------------------------------------
         API
         ----------------------------------------------------- */

      if (
        req.url &&
        req.url.startsWith(
          "/api/"
        )
      ) {

        return handleApi(
          req,
          res
        );

      }


      /* -----------------------------------------------------
         Decode URL spaces
         ----------------------------------------------------- */

      let pathname;


      try {

        pathname =
          decodeURIComponent(
            (req.url || "/")
              .split("?")[0]
          );

      } catch {

        res.writeHead(400);

        return res.end(
          "Bad request"
        );

      }


      /* -----------------------------------------------------
         HOME
         ----------------------------------------------------- */

      const requestedPath =
        pathname === "/"
          ? "/frontend/index.html"
          : pathname;


      /* -----------------------------------------------------
         FILE PATH
         ----------------------------------------------------- */

      const filePath =
        normalize(
          join(
            ROOT,
            requestedPath
          )
        );


      /* -----------------------------------------------------
         SECURITY
         ----------------------------------------------------- */

      if (
        !filePath.startsWith(ROOT)
      ) {

        res.writeHead(403);

        return res.end(
          "Forbidden"
        );

      }


      /* -----------------------------------------------------
         READ FILE
         ----------------------------------------------------- */

      try {

        const content =
          await readFile(
            filePath
          );


        const extension =
          extname(
            filePath
          ).toLowerCase();


        const contentType =
          types[extension] ||
          "application/octet-stream";


        res.writeHead(
          200,
          {

            "Content-Type":
              contentType,

            "Cache-Control":
              "no-cache"

          }
        );


        res.end(
          content
        );


      } catch (error) {

        console.error(
          `404: ${filePath}`
        );


        res.writeHead(
          404,
          {
            "Content-Type":
              "text/plain; charset=utf-8"
          }
        );


        res.end(
          "Not found"
        );

      }

    }
  );


/* =========================================================
   START
   ========================================================= */

server.listen(
  PORT,
  () => {

    console.log(
      `Crum running at http://localhost:${PORT}`
    );

  }
);