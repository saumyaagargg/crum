# Crum

Crum is an autonomous dance-planning agent demo for the AWS Agents for Humans hackathon.

## Core concept

Set your dance intention once. Crum works in the background to:

**Discover → Evaluate → Coordinate → Monitor → Escalate → Execute → Verify**

The human is only interrupted for meaningful approval.

## Run locally

Requirements:
- Node.js 18+

From the project root:

```powershell
node server.mjs
```

Open:

```text
http://localhost:3000
```

## Demo flow

1. Set your dance preferences.
2. Click **Simulate background run**.
3. Watch the agent timeline.
4. Review the single human decision.
5. Approve the reservation.
6. Click **Simulate venue change** to show continued monitoring.

## Project structure

```text
crum/
├── backend/
│   └── domain.mjs
├── data/
│   └── demo-state.json
├── docs/
├── frontend/
│   ├── assets/
│   ├── app.js
│   ├── index.html
│   └── styles.css
└── server.mjs
```

## AWS integration roadmap

This MVP uses local deterministic mock tools so the demo is reliable.

For the hackathon deployment, replace the mock pieces with:
- Strands Agents SDK for agent orchestration
- Amazon Bedrock for multimodal event/flyer understanding
- DynamoDB for persistent state
- EventBridge for event-driven triggers
- Step Functions for long-running workflows
- optional calendar / booking / notification integrations

Do not claim that mock endpoints are live AWS services in the demo. Clearly label them as the local MVP while showing where each AWS service fits in the architecture.

## License

MIT
