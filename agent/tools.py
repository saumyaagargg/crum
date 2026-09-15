from strands import tool


@tool
def discover_events(
    style: str,
    level: str,
    day: str,
    time: str,
    budget: int,
    radius_km: int,
    location: str,
) -> str:
    """Find dance events matching the user's preferences."""

    events = [
        {
            "event_id": "EVT001",
            "name": "Hip-Hop Masterclass",
            "style": "Hip-Hop",
            "level": "Intermediate",
            "day": "Saturday",
            "time": "5:00 PM",
            "venue": "Studio 8",
            "location": "Gurugram",
            "distance_km": 7,
            "price": 499,
            "seats": 3,
        },
        {
            "event_id": "EVT002",
            "name": "Urban Choreo Session",
            "style": "Hip-Hop",
            "level": "Intermediate",
            "day": "Saturday",
            "time": "7:00 PM",
            "venue": "The Dance Room",
            "location": "Gurugram",
            "distance_km": 9,
            "price": 699,
            "seats": 5,
        },
        {
            "event_id": "EVT003",
            "name": "Hip-Hop Foundations",
            "style": "Hip-Hop",
            "level": "Beginner",
            "day": "Saturday",
            "time": "6:00 PM",
            "venue": "Move Studio",
            "location": "Gurugram",
            "distance_km": 6,
            "price": 399,
            "seats": 8,
        },
        {
            "event_id": "EVT004",
            "name": "Freestyle Flow Session",
            "style": "Freestyle",
            "level": "Intermediate",
            "day": "Saturday",
            "time": "6:30 PM",
            "venue": "Pulse Studio",
            "location": "Gurugram",
            "distance_km": 8,
            "price": 599,
            "seats": 6,
        },
        {
            "event_id": "EVT005",
            "name": "Freestyle Open Floor",
            "style": "Freestyle",
            "level": "Intermediate",
            "day": "Saturday",
            "time": "8:00 PM",
            "venue": "Urban Movement",
            "location": "Gurugram",
            "distance_km": 9,
            "price": 699,
            "seats": 4,
        },
        {
            "event_id": "EVT006",
            "name": "Freestyle Basics",
            "style": "Freestyle",
            "level": "Beginner",
            "day": "Saturday",
            "time": "5:30 PM",
            "venue": "Move Studio",
            "location": "Gurugram",
            "distance_km": 6,
            "price": 399,
            "seats": 8,
        },
    ]

    matches = []

    for event in events:

        if event["style"].lower() != style.lower():
            continue

        if event["day"].lower() != day.lower():
            continue

        if event["level"].lower() != level.lower():
            continue

        if event["price"] > budget:
            continue

        if event["distance_km"] > radius_km:
            continue

        matches.append(event)

    if not matches:
        return "No events matched all constraints."

    result = f"Found {len(matches)} matching event(s):\n"

    for event in matches:
        result += f"""
Event ID: {event["event_id"]}
Name: {event["name"]}
Style: {event["style"]}
Level: {event["level"]}
Day: {event["day"]}
Time: {event["time"]}
Venue: {event["venue"]}
Location: {event["location"]}
Distance: {event["distance_km"]} km
Price: ₹{event["price"]}
Available seats: {event["seats"]}
"""

    return result


@tool
def find_compatible_dancers(
    style: str,
    level: str,
    day: str,
    time: str,
) -> str:
    """Find dancers whose preferences and availability are compatible."""

    dancers = [
        {
            "dancer_id": "D001",
            "name": "Aisha",
            "style": "Hip-Hop",
            "level": "Intermediate",
            "available": True,
        },
        {
            "dancer_id": "D002",
            "name": "Rohan",
            "style": "Hip-Hop",
            "level": "Intermediate",
            "available": True,
        },
        {
            "dancer_id": "D003",
            "name": "Meera",
            "style": "Contemporary",
            "level": "Intermediate",
            "available": True,
        },
        {
            "dancer_id": "D004",
            "name": "Kavya",
            "style": "Freestyle",
            "level": "Intermediate",
            "available": True,
        },
        {
            "dancer_id": "D005",
            "name": "Arjun",
            "style": "Freestyle",
            "level": "Intermediate",
            "available": True,
        },
    ]

    matches = [
        dancer
        for dancer in dancers
        if dancer["style"].lower() == style.lower()
        and dancer["level"].lower() == level.lower()
        and dancer["available"]
    ]

    if not matches:
        return "No compatible dancers are currently available."

    result = "Compatible dancers found:\n"

    for dancer in matches:
        result += (
            f'{dancer["dancer_id"]}: {dancer["name"]} — '
            f'{dancer["style"]}, {dancer["level"]}\n'
        )

    return result


@tool
def verify_availability(event_id: str) -> str:
    """Verify current event seats and booking information."""

    availability = {
        "EVT001": {
            "name": "Hip-Hop Masterclass",
            "seats": 3,
            "price": 499,
            "status": "AVAILABLE",
        },
        "EVT002": {
            "name": "Urban Choreo Session",
            "seats": 5,
            "price": 699,
            "status": "AVAILABLE",
        },
        "EVT004": {
            "name": "Freestyle Flow Session",
            "seats": 6,
            "price": 599,
            "status": "AVAILABLE",
        },
        "EVT005": {
            "name": "Freestyle Open Floor",
            "seats": 4,
            "price": 699,
            "status": "AVAILABLE",
        },
    }

    event = availability.get(event_id)

    if not event:
        return f"Event {event_id} was not found."

    return f"""
Availability verified.

Event: {event["name"]}
Event ID: {event_id}
Status: {event["status"]}
Available seats: {event["seats"]}
Price: ₹{event["price"]}
"""


@tool
def build_plan(event_id: str, dancer_ids: str) -> str:
    """Create a coordinated dance plan from an event and selected dancers."""

    return f"""
Dance plan prepared.

Event: {event_id}
Participants: {dancer_ids}

Plan status: READY_FOR_HUMAN_APPROVAL

Crum should ask the user for approval before making a booking
or creating any financial commitment.
"""


@tool
def monitor_plan(plan_id: str) -> str:
    """Check a coordinated dance plan for changes."""

    return f"""
Monitoring plan: {plan_id}

Current status: ACTIVE
Venue status: UNCHANGED
Time status: UNCHANGED
Availability status: CONFIRMED

No changes detected.
"""