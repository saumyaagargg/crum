const clone = (value) => JSON.parse(JSON.stringify(value));

export function initialState() {
  return {
    product: "Crum",
    profile: {
      name: "Saumyaa",
      city: "Gurugram",
      styles: ["Hip-Hop", "Contemporary"],
      level: "Intermediate",
      radiusKm: 10,
      days: ["Saturday", "Sunday"],
      timeStart: "16:00",
      timeEnd: "20:00",
      budget: 800,
      goal: "Workshop + practice partners"
    },
    agent: {
      status: "IDLE",
      lastRunAt: null,
      currentTask: null,
      timeline: [],
      decision: null,
      event: null,
      participants: [],
      confirmation: null,
      monitoring: false
    },
    stats: {
      sourcesMonitored: 12,
      opportunitiesEvaluated: 0,
      strongMatches: 0,
      coordinationRuns: 0,
      tasksCompleted: 0
    }
  };
}

function stamp() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function addTimeline(state, title, detail, kind = "done") {
  state.agent.timeline.unshift({
    time: stamp(),
    title,
    detail,
    kind
  });
}

export function saveProfile(input, profile) {
  const state = clone(input);
  state.profile = {
    ...state.profile,
    ...profile,
    styles: Array.isArray(profile.styles) ? profile.styles : state.profile.styles
  };
  addTimeline(state, "Intention saved", "Crum will keep working in the background.", "done");
  return state;
}

export function runAutonomousWorkflow(input) {
  const state = clone(input || initialState());
  state.agent.status = "AWAITING_APPROVAL";
  state.agent.lastRunAt = new Date().toISOString();
  state.agent.currentTask = "Coordinate a strong-fit dance opportunity";
  state.agent.confirmation = null;

  state.stats.opportunitiesEvaluated += 9;
  state.stats.strongMatches += 1;
  state.stats.coordinationRuns += 1;

  addTimeline(state, "New opportunity detected", "Hip-Hop Masterclass · Saturday · Gurugram");
  addTimeline(state, "Event understood", "Intermediate · ₹499 · 7 km · registration open");
  addTimeline(state, "Fit evaluated", "91/100 match with your saved intention");
  addTimeline(state, "Compatible dancers found", "Aisha and Rohan are both available");
  addTimeline(state, "Details coordinated", "3 seats remain and all constraints align");
  addTimeline(state, "Human decision required", "Reservation is ready for your approval.", "waiting");

  state.agent.event = {
    id: "crum-hiphop-01",
    name: "Hip-Hop Masterclass",
    style: "Hip-Hop",
    level: "Intermediate",
    date: "Saturday, 19 Sep",
    time: "5:00 PM",
    location: "Studio 8, Gurugram",
    distanceKm: 7,
    price: 499,
    seatsLeft: 3,
    matchScore: 91
  };

  state.agent.participants = [
    { name: "Aisha", style: "Hip-Hop", level: "Intermediate", availability: "Sat 5–8 PM" },
    { name: "Rohan", style: "Hip-Hop", level: "Intermediate", availability: "Sat 4–7 PM" }
  ];

  state.agent.decision = {
    title: "Reserve this dance plan?",
    message: "I found the opportunity, checked the fit, coordinated two compatible dancers, and verified availability. Only your approval remains.",
    amount: 499
  };

  return state;
}

export function approveReservation(input) {
  const state = clone(input || initialState());
  if (!state.agent.event) return state;

  state.agent.status = "MONITORING";
  state.agent.decision = null;
  state.agent.monitoring = true;
  state.stats.tasksCompleted += 1;

  const confirmationId = `CR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  state.agent.confirmation = {
    confirmed: true,
    id: confirmationId,
    message: "Reservation confirmed. Crum will continue monitoring for changes."
  };

  addTimeline(state, "Reservation approved", "Human approval received.");
  addTimeline(state, "Reservation completed", `Confirmation ${confirmationId} created.`);
  addTimeline(state, "Monitoring continues", "Crum will surface only if something changes.");

  return state;
}

export function simulateVenueChange(input) {
  const state = clone(input || initialState());
  if (!state.agent.event) return state;

  state.agent.event.location = "Studio 8 · Hall B, Gurugram";
  state.agent.monitoring = true;
  state.agent.status = "MONITORING";

  addTimeline(state, "Change detected", "The venue changed to Hall B.");
  addTimeline(state, "Agent handled the change", "Your plan was updated automatically.");

  return state;
}

export function resetDemo() {
  return initialState();
}
