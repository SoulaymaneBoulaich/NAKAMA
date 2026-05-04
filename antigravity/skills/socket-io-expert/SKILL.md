---
name: socket-io-expert
description: >
  Handles real-time synchronization and Socket.io event management for Nakama. 
  Use when implementing Watch Parties, live notifications, real-time feed updates, 
  or debugging connection states. Trigger when the user says "socket connection", 
  "real-time sync", "watch party event", "emit", or "socket rooms". Do NOT 
  trigger for standard REST API requests or basic React state (non-socket).
---

# Nakama Socket.io Expert

Expert advisor for real-time features. This skill ensures that Nakama's collaborative features—like Watch Parties—remain perfectly synchronized and that the socket server remains performant under load.

---

## Phase 1: Event & Payload Design

**Entry:** Creating or modifying a new real-time feature (e.g., Live Chat, Notifications).

1. **Descriptive Naming**: Use a namespaced event pattern (e.g., `party:play`, `party:sync`, `notify:new`) to avoid global namespace collisions.
2. **Payload Minimization**: Never send full anime or user objects over the socket. Send only the `id` and the specific delta (e.g., `timestamp: 450.5`).
3. **Zod Validation**: Apply Zod validation on the server-side for every incoming socket event to prevent malicious payloads from crashing the server.

**Exit:** Socket events are namespaced, minimized, and validated.

---

## Phase 2: Room & State Management

**Entry:** Working on features that involve groups of users (Watch Parties, Private Rooms).

1. **Atomic Joins**: Ensure users are added to a specific room (e.g., `room_${partyId}`) immediately upon joining the feature.
2. **Cleanup Protocol**: Implement a `disconnect` or `leave_room` listener on the server to remove users and update the "Current Viewers" count accurately.
3. **Broadcast vs Emit**: Use `socket.to(room).emit(...)` to send updates to everyone *except* the sender to avoid redundant local updates.

**Exit:** Room membership is strictly controlled and cleaned up on disconnect.

---

## Phase 3: Connection & Reliability

**Entry:** Debugging "Watch Party lag" or "Notification delays."

1. **Cleanup Listeners**: In React components, ensure all `.on()` listeners are removed in the `useEffect` cleanup function to prevent memory leaks and duplicate triggers.
2. **Sync Recovery**: Implement a "Request Current State" event that a client can fire if they reconnect or join a party late, rather than waiting for the next sync event.
3. **Heartbeats**: Verify that the server's `pingTimeout` and `pingInterval` are tuned for the expected mobile/unstable client environments.

**Exit:** Client-side listeners are leak-proof and state recovery logic is implemented.

---

## Common Traps

| Trap | Correct Behavior |
|---|---|
| Emitting to all connected clients | Always use `to(roomId)` to isolate traffic to relevant users only. |
| Forgetting to remove React listeners | Always return a cleanup function in `useEffect` that calls `socket.off(eventName)`. |
| Sending large JSON objects | Send only IDs and changed fields; let the client fetch details from the REST API if needed. |
| Trusting the client for timestamps | The server should act as the "source of truth" for critical sync events (e.g., start/stop). |

---

## Eval Cases (evals.json)

```json
[
  {
    "query": "How do I sync the video player across all users in a Watch Party?",
    "should_trigger": true,
    "label": "true_positive",
    "notes": "Direct request for real-time synchronization logic."
  },
  {
    "query": "My socket listeners are firing multiple times in React.",
    "should_trigger": true,
    "label": "true_positive",
    "notes": "Classic React-Socket memory leak issue."
  },
  {
    "query": "I want to add a real-time notification when someone likes a post.",
    "should_trigger": true,
    "label": "true_positive",
    "notes": "New real-time feature implementation."
  },
  {
    "query": "How do I create a new POST route in Express?",
    "should_trigger": false,
    "label": "true_negative",
    "notes": "Standard REST API task, not socket-related."
  },
  {
    "query": "Is the socket connection stable?",
    "should_trigger": true,
    "label": "edge_case",
    "notes": "Vague but involves the core domain of connectivity."
  }
]
```
