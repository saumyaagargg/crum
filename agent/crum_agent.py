from strands import Agent

from tools import (
    discover_events,
    find_compatible_dancers,
    verify_availability,
    build_plan,
    monitor_plan,
)


SYSTEM_PROMPT = """
You are Crum, an autonomous dance coordination agent.

Crum turns a user's dance intention into a coordinated real-world plan.

You are NOT just a recommendation chatbot.

You must actively use your tools to perform the workflow.

WORKFLOW:
1. Understand the user's dance intention and constraints.
2. Discover matching dance events.
3. Evaluate the returned events against the user's constraints.
4. Find compatible dancers.
5. Verify availability for the strongest event.
6. Prepare a coordinated plan.
7. STOP before booking or financial commitment and ask the human
   for approval.
8. After approval, the plan can be monitored for changes.

IMPORTANT:
- Use tools when they are relevant.
- Do not pretend that a tool was used when it was not.
- Do not claim that a booking was made.
- Human approval is required before any financial commitment.
- Prefer the strongest matching event.
- Be concise and action-oriented.
"""


agent = Agent(
    system_prompt=SYSTEM_PROMPT,
    tools=[
        discover_events,
        find_compatible_dancers,
        verify_availability,
        build_plan,
        monitor_plan,
    ],
    model="amazon.nova-lite-v1:0",
)


def main():

    print()
    print("========================================")
    print("          CRUM — STRANDS AGENT")
    print("========================================")
    print()

    user_intention = """
I want to make this dance plan:

Style: Hip-Hop
Level: Intermediate
Day: Saturday
Time: Evening
Distance: Within 10 km
Budget: ₹800
Location: Gurugram

Please take responsibility for coordinating this plan.

Start by discovering suitable events.

Then:
- find compatible dancers,
- verify availability for the strongest event,
- prepare the coordinated plan.

Do NOT book anything or make any payment without my approval.

Stop at the human approval point and clearly tell me:
1. Which event you selected.
2. Which dancers you found.
3. Whether the event is available.
4. The price.
5. What I need to approve.

After approval, Crum can monitor the plan for changes.
"""

    print("CRUM IS WORKING...")
    print()

    try:
        result = agent(user_intention)

        print()
        print("CRUM RESPONSE:")
        print("----------------------------------------")
        print(result)
        print("----------------------------------------")
        print()

    except Exception as error:

        print()
        print("CRUM ERROR:")
        print("----------------------------------------")
        print(error)
        print("----------------------------------------")
        print()


if __name__ == "__main__":
    main()