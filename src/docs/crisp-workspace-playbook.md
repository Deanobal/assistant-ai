# AssistantAI Crisp Workspace Playbook

## 1) Primary widget setup
- Use Crisp as the only public website chat widget.
- Keep the widget styling minimal and professional.
- Use the default Crisp launcher and inbox as the live human response layer.
- Use the Crisp mobile app as the primary mobile response workflow.

## 2) Bot flow structure

### FLOW 1 — Greeting / Entry
Trigger:
- New visitor
- Short delay after page load

Message:
- Hey — quick question. Are you looking for pricing, how it works, or help with your business?

Buttons:
- Pricing
- How it works
- Improve my business
- Talk to someone

### FLOW 2 — Pricing Flow
When user selects Pricing:

Message 1:
- Starter: $497/month + $1,500 setup
- Growth: $1,500/month + $3,000 setup
- Enterprise: from $3,000/month + $7,500 setup

Message 2:
- What type of business are you running?

Buttons:
- Cleaning
- Trades
- Other

If Cleaning:

Message:
- Cleaning is a strong fit when you want fewer missed calls, more captured leads, and less admin.

Question:
- Are you mainly trying to stop missed calls, capture more leads, or automate bookings?

Buttons:
- Missed calls
- More leads
- Booking automation

If Trades:

Message:
- Trades are a strong fit when speed-to-lead and call handling matter most.

Question:
- Are you mainly trying to stop missed calls, capture more leads, or automate bookings?

Buttons:
- Missed calls
- More leads
- Booking automation

If Other:

Message:
- Got it — what are you mainly trying to improve right now?

Buttons:
- Missed calls
- More leads
- Booking automation

### FLOW 3 — Qualification + Close
For medium/high-intent leads:

Message 1:
- Got it — we can help with that. What’s the best number to reach you on?

Message 2:
- Perfect — do you want a call today or tomorrow?

Buttons:
- Today
- Tomorrow

Message 3:
- Done — I’ll prioritise this and get it moving.

Tag rules:
- Add tag: high_intent
- Add tag: callback_requested
- Add tag for business type if known
- Add tag for main need if known

### FLOW 4 — Human Request / Immediate Handoff
Trigger from:
- Talk to someone button
- call me
- book
- I want it
- ready to start
- get me a call
- strategy call

Message sequence:
1. Let’s get this moving. What’s the best number to reach you on?
2. Do you want a call today or tomorrow?
3. Done — I’ve marked this as priority so our team can pick it up fast.

Tag rules:
- Add tag: human_handoff
- Add tag: priority
- Add tag: callback_requested

## 3) High-intent trigger routing
These phrases should always leave general information mode and move into Qualification + Close or Human Handoff:
- price
- pricing
- cost
- call me
- book
- ready
- i want it
- get me a call
- strategy call

Routing rules:
- pricing / price / cost → Pricing Flow first, then business type, then qualification if intent stays strong
- call me / book / ready / i want it / get me a call / strategy call → Immediate Handoff flow
- If phone number is missing, ask for it first
- If phone number exists, ask today or tomorrow next
- After timing is captured, confirm priority handoff

## 4) Knowledge base / answer bank

### Pricing
- Approved answer: Starter is $497/month + $1,500 setup. Growth is $1,500/month + $3,000 setup. Enterprise starts from $3,000/month + $7,500 setup.
- Supported use case: Visitors asking what the packages cost.
- Limitations: Do not repeat pricing again unless they ask again.
- Best next step: Ask business type, then qualify fit.

### What AssistantAI does
- Approved answer: AssistantAI helps service businesses answer enquiries faster, capture more leads, reduce missed calls, and automate follow-up.
- Supported use case: Top-level commercial positioning.
- Limitations: Do not overclaim custom workflow depth unless scoped.
- Best next step: Ask what they want to improve.

### Who it is for
- Approved answer: AssistantAI is best for service businesses that want faster response times, less admin, and more captured opportunities.
- Supported use case: Fit questions.
- Limitations: Do not imply every business is an automatic fit.
- Best next step: Ask business type.

### Key business outcomes
- Approved answer: The main outcomes are fewer missed opportunities, better lead capture, faster follow-up, and less manual admin.
- Supported use case: Outcome-focused sales conversations.
- Limitations: Do not promise results without setup and fit.
- Best next step: Ask which outcome matters most.

### Starter / Growth / Enterprise differences
- Approved answer: Starter is best for AI receptionist, lead capture, and call handling. Growth is better for booking automation, CRM sync, and follow-up. Enterprise is for more complex or custom workflows.
- Supported use case: Package fit questions.
- Limitations: Do not over-scope Enterprise from chat alone.
- Best next step: Ask business type and main workflow.

### Commercial cleaning fit
- Approved answer: Cleaning is a strong fit when missed calls, lead capture, and booking flow consistency matter.
- Supported use case: Cleaning business leads.
- Limitations: Do not promise every booking workflow is fully live without confirming scope.
- Best next step: Ask whether they want help with missed calls, more leads, or booking automation.

### Trades fit
- Approved answer: Trades are a strong fit when speed-to-lead, call handling, and follow-up consistency are the priority.
- Supported use case: Trades leads.
- Limitations: Do not overclaim custom integrations or automation depth.
- Best next step: Ask whether they want help with missed calls, more leads, or booking automation.

### What is live now
- Approved answer: Live now includes the website, commercial positioning, strategy-call booking flow, and core sales routing.
- Supported use case: Capability questions.
- Limitations: Be conservative about anything account-specific or partially implemented.
- Best next step: If they need exact implementation scope, move them to a strategy call.

### What is not yet included / not safe to overclaim
- Approved answer: Some integration, billing, booking automation, portal, notification, and analytics workflows should be described conservatively unless confirmed live.
- Supported use case: Honesty and scope control.
- Limitations: Never imply a tool is connected or a workflow is fully live just because UI exists.
- Best next step: Escalate or route to strategy call when certainty is needed.

### Strategy call next step
- Approved answer: If you want the right package and workflow mapped properly, the best next step is a strategy call.
- Supported use case: Moving qualified leads forward.
- Limitations: Do not imply a booking is confirmed until it is actually confirmed.
- Best next step: Capture number and preferred timing or route to booking.

## 5) Honesty / overclaim rules
Be conservative on:
- integrations
- billing
- booking automation
- portal features
- notifications
- analytics
- any workflow not confirmed live

Approved rule:
- If something is partial, say it is partial.
- If something is not confirmed live, do not present it as live.
- If account-specific confirmation is needed, hand it to a human.

## 6) Conversation quality rules
Every bot reply should be:
- short
- human-like
- confident
- helpful
- one question at a time
- non-repetitive
- commercially useful

Do not:
- repeat pricing unless explicitly asked again
- ask for business type again if already captured
- leave dead-end states
- leave the user without a clear next step

## 7) Human handoff checklist
Before handoff, capture and preserve where possible:
- business type
- main need
- pricing intent
- phone number
- urgency
- whether they asked for a call today or tomorrow

Suggested Crisp tags:
- pricing_intent
- cleaning
- trades
- missed_calls
- more_leads
- booking_automation
- high_intent
- callback_requested
- human_handoff
- priority
- today_call
- tomorrow_call

## 8) Saved replies / macros

### Speed
- Got it — give me 2 mins
- I’m on this now

### Close
- Let’s get this moving — what’s the best number to reach you on?
- We can get this set up quickly

### Control / qualification
- What type of business are you in?
- What are you mainly trying to improve right now?

## 9) Test scenarios
1. Vague visitor question
2. Pricing question
3. Cleaning business lead
4. High-intent “I want it” lead
5. “Book my call” request
6. “Call me today” request
7. Human request
8. Frustrated user
9. Out-of-knowledge question
10. Support-style question

Pass criteria for every scenario:
- no repetition
- correct flow progression
- contact capture when relevant
- proper human handoff when needed
- no dead-end states
- no repeated pricing loop
- no repeated business type question after answer is known