# NinjaToolKit: technical case studies

**Ryan Haig** · Forward Deployed Engineer and AI Automation Engineer

**Read online: [ryanh-sudo.github.io/ninjatoolkit-case-study](https://ryanh-sudo.github.io/ninjatoolkit-case-study/)**

NinjaToolKit is an agentic audit and remediation platform for managed Windows Server estates and WatchGuard
firewalls, which I designed and built end to end. It judges a whole estate in about a minute, diagnoses a server with
AI agents that argue over its raw evidence, and carries each problem to a verified fix with an engineer approving every
change. It is private company software, so these studies describe its design and behavior without its source, and they
contain no company names, client names, machine names or client data. Every demo runs on an invented company.

| | | |
|---|---|---|
| **[NinjaToolKit 8.3.1](https://ryanh-sudo.github.io/ninjatoolkit-case-study/v8/)** | Shipped October 17, 2026 | One self-contained executable; 56 deterministic server judges; a 52-check firewall engine mapped to 50 compliance controls; a three-seat AI diagnosis (proposer, challenger, lead engineer) held to evidence in code; a Job chain that carries every problem to a verified close. Measured on unseen servers against keys written in advance: 40 of 47 problems found, no ruled-out claim made. Certified by eight layered walks of the built product. ([source text](CASE_STUDY.md)) |
| **[NinjaToolKit v9](https://ryanh-sudo.github.io/ninjatoolkit-case-study/v9/)** | In build: the ground and the data foundation built and measured | The burn-down: every question settled by the cheapest layer that can prove its answer within a stated error bound, from deterministic code through **GLiNER 2.5** and a **calibrated decision model (TypeSafe's Jev) with conformal acceptance** to **Claude Opus 5.5** on the residue, and the engineer as the gate. On a typed collector proven across ten estate runs, an observation store with provenance, a dependency map with evidence on every link, one firewall model that two independent readers agree on across 53 real exports, and live telemetry; the designed firewall chain carries a complaint from the exposure path to a diagnosis across both ends of a tunnel and a fix by hand. Scored against an answer key of 7,247 items built before the AI layer. ([source text](CASE_STUDY_V9.md)) |

## Demos

| Demo | What it is |
|---|---|
| [v9: the operating picture](https://ryanh-sudo.github.io/ninjatoolkit-case-study/demos/ntk-v9-operating-picture.html) | v9 at work on an invented company, about 16 minutes in four acts, self-playing with chapters. The decision layer as a spinning wheel of servers and Fireboxes; the shipped v8.3.1 application and its firewall audit, real screens; the firewall pillar from one model to an exposure path, a diagnosis across both ends of a tunnel and a fix by hand; then GLiNER 2.5, the calibrated decision model, Opus 5.5, the name map, fixes in waves, many engineers at once and compliance per control |
| [v8.3.1: the guided tour](https://ryanh-sudo.github.io/ninjatoolkit-case-study/demos/ntk-8.3.1-tour.html) | The real v8.3.1 application run from an empty folder on an invented company's servers and firewalls, 15 chapters, one offline file |
| [Where it started: the IMPACT demo](https://ryanh-sudo.github.io/ninjatoolkit-case-study/demos/ntk-impact-demo.html) | The first demo, built for a live audience: one cross-site incident diagnosed across a domain controller, a Hyper-V host and a firewall |

## How the figures are labelled

Every figure is **measured** (the output of a command or a run, with its date), **published** (from the research
literature or vendor documentation, named), or a **target** the design commits to measuring. Nothing in the v9 design
phases is presented as a result.

## Contact

[github.com/RyanH-sudo](https://github.com/RyanH-sudo) · rytuality@gmail.com ·
[linkedin.com/in/rytuality](https://linkedin.com/in/rytuality) · A live walkthrough is available on request.
