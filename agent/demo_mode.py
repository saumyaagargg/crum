import sys
import json
import os

sys.stdout.reconfigure(encoding="utf-8")

from tools import (
    discover_events,
    find_compatible_dancers,
    verify_availability,
    build_plan,
    monitor_plan,
)


def get_intention():

    # First try environment variable from Node
    raw = os.environ.get("CRUM_INTENTION")

    if raw:
        try:
            return json.loads(raw)
        except Exception:
            pass

    # Also support command-line JSON
    if len(sys.argv) > 1:

        try:
            return json.loads(sys.argv[1])
        except Exception:
            pass

    # Safe default
    return {
        "style": "Hip-Hop",
        "level": "Intermediate",
        "day": "Saturday",
        "time": "Evening",
        "budget": 800,
        "radius_km": 10,
        "location": "Gurugram",
    }


def main():

    raw_intention = get_intention()

    intention = {
        "style": raw_intention.get(
            "style",
            "Hip-Hop"
        ),

        "level": raw_intention.get(
            "level",
            "Intermediate"
        ),

        "day": raw_intention.get(
            "day",
            "Saturday"
        ),

        "time": raw_intention.get(
            "time",
            "Evening"
        ),

        "budget": int(
            raw_intention.get(
                "budget",
                800
            )
        ),

        "radius_km": int(
            raw_intention.get(
                "radius_km",
                10
            )
        ),

        "location": raw_intention.get(
            "location",
            "Gurugram"
        ),
    }


    # --------------------------------------------------
    # 1. DISCOVER EVENTS
    # --------------------------------------------------

    events = discover_events(
        style=intention["style"],
        level=intention["level"],
        day=intention["day"],
        time=intention["time"],
        budget=intention["budget"],
        radius_km=intention["radius_km"],
        location=intention["location"],
    )


    # --------------------------------------------------
    # 2. FIND COMPATIBLE DANCERS
    # --------------------------------------------------

    dancers = find_compatible_dancers(
        style=intention["style"],
        level=intention["level"],
        day=intention["day"],
        time=intention["time"],
    )


    # --------------------------------------------------
    # 3. SELECT STRONGEST EVENT
    # --------------------------------------------------

    event_id = None

    for line in events.splitlines():

        if line.startswith("Event ID:"):

            event_id = (
                line
                .replace("Event ID:", "")
                .strip()
            )

            break


    if not event_id:
        event_id = "EVT001"


    # --------------------------------------------------
    # 4. VERIFY AVAILABILITY
    # --------------------------------------------------

    availability = verify_availability(
        event_id=event_id
    )


    # --------------------------------------------------
    # 5. SELECT DANCERS
    # --------------------------------------------------

    dancer_ids = []

    for line in dancers.splitlines():

        if line.startswith("D") and ":" in line:

            dancer_id = (
                line
                .split(":")[0]
                .strip()
            )

            if dancer_id:
                dancer_ids.append(
                    dancer_id
                )


    selected_dancers = ", ".join(
        dancer_ids[:2]
    )


    if not selected_dancers:
        selected_dancers = (
            "No participants selected"
        )


    # --------------------------------------------------
    # 6. BUILD PLAN
    # --------------------------------------------------

    plan = build_plan(
        event_id=event_id,
        dancer_ids=selected_dancers,
    )


    # --------------------------------------------------
    # 7. MONITOR
    # --------------------------------------------------

    monitoring = monitor_plan(
        plan_id="PLAN001"
    )


    # --------------------------------------------------
    # 8. RETURN RESULT
    # --------------------------------------------------

    result = {

        "intention": intention,

        "events": events,

        "dancers": dancers,

        "availability": availability,

        "plan": plan,

        "monitoring": monitoring,

        "approval_required": True,

        "status":
            "READY_FOR_APPROVAL",
    }


    print(
        json.dumps(
            result,
            ensure_ascii=False
        )
    )


if __name__ == "__main__":
    main()