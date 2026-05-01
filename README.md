# Case Study · NinjaToolKit
## A production agentic-audit platform shipped at MSP scale

**Author:** Ryan Haig
**Role:** Engineering · eMazzanti Technologies (managed-service provider · NJ/NY metro)
**Period:** Q4 2025 → present · ~6 months of focused development, in active development
**Status:** In production · multi-tenant client engagement use · 17 named release versions across 510 commits · zero force-pushes

---

> **TL;DR** · I'm a **production agentic-systems engineer** building the AI-integrated workflow patterns that frontier AI labs are racing to ship as product — except I ship them at MSP scale, against daily customer-engagement pressure, before off-the-shelf product exists. **NinjaToolKit** is one shipped instance of that operating model: a ~60,000-LOC production agentic-audit platform with 8,911 active regression tests, 17 named release versions, and a live server-side agent embedded in target Windows estates with built-in defense against morphic / agentic AI attacks (WormGPT · FraudGPT · BlackMamba polymorphic-by-LLM-call · Morris II prompt-injection · agentic offensive frameworks). The platform bridges previously-siloed enterprise systems (Microsoft 365 · Active Directory · multi-vendor firewalls · Hyper-V · Azure) into a canonical audit substrate, surfaces compliance and configuration gaps invisible to native vendor dashboards, and runs gated agentic workflows with human-in-the-loop approval over a 16-module Claude API pipeline. Open to senior · principal · staff IC · Forward Deployed Engineer · Applied AI Engineer roles. US Citizen · remote (Chiang Mai, Thailand) · available US business hours · open to relocation.

---

## The operating model · six pillars

NinjaToolKit is the shipped instance. The operating model behind it is the actual pitch — six pillars I bring to any team I join.

**1 · Silo-bridging via agentic architecture.** Take previously-disconnected enterprise systems — Microsoft 365, Active Directory, multi-vendor firewalls (WatchGuard, Palo Alto, Fortinet, Cisco ASA), Hyper-V, Azure — and integrate them into a single canonical audit substrate. Configuration and compliance gaps invisible in any native vendor dashboard become visible in the integrated view. This is silo-busting at the architectural layer, not dashboard-aggregation.

**2 · Gated agentic workflows · human-in-the-loop approval.** Frontier-AI multi-pass generation behind explicit approval gates. Engineer reviews proposed remediation, ratifies, the agent executes via vendor-native APIs, re-audits, proves the gap closed. The canonical "agents with bounded autonomy / engineer-in-the-loop discipline" pattern that AI safety teams describe as a research roadmap — I'm shipping it in production today.

**3 · GUI-bypass via CLI scripting · diagnosis where dashboards can't reach.** PowerShell, bash, and API scripts that go where vendor GUIs refuse to go. The 47-section Windows-server collector captures data depth most MSP audits never reach (Kerberoastable accounts · unconstrained-delegation principals · LSA Protection state · LAPS posture · BitLocker-vs-TPM coupling · spooler-disabled audit-policy triangulation · much more). The CLI is the source of truth; the GUI is marketing.

**4 · Live server-side agent · RMM-class capability + 2026 frontier-defense.** Embedded agent in target Windows estates that streams diagnostic data to engineer dashboards in real-time, accepts remote-scripting commands like an RMM agent, and carries built-in detection layers for the 2026 morphic / agentic AI threat class — WormGPT, FraudGPT, BlackMamba (polymorphic-by-LLM-call), Morris II (prompt-injection worm), and agentic offensive frameworks. The defensive layer that has to exist for production AI to be safe; building it because customer environments need it.

**5 · Multi-substrate integration · whatever medium fits.** Scripting, vendor APIs, MCP servers, webhook integrations, ConnectWise PSA + RMM hooks, Azure Resource Manager, WatchGuard Cloud API — whichever data-collection medium fits each system. Every integration wires into the agentic substrate. Not vendor-locked, not protocol-locked, medium-agnostic by design.

**6 · Productionizing AI-integrated workflows that don't yet exist as products.** Speed-running the future. Anthropic, OpenAI, and the rest of the frontier labs are racing to ship the patterns I've been shipping at MSP scale for ~6 months. Not waiting for product — building the integrations because customer-engagement work demands them today.

---

## Why this work happened

The engagement team I joined was producing configuration-audit deliverables the hard way. We had a stack of vendor tools that each saw a sliver of the picture — Nipper for firewall posture, Tenable for vulnerability inventory, Lansweeper for asset state, ad-hoc PowerShell for the Windows-server side — and senior engineers were spending 60-80 hours per major audit stitching the outputs into something a client could read. None of it composed. None of it compounded. Every audit was a one-off.

The strategic case for fixing that gap got harder to ignore in late 2025, when the threat landscape shifted in a way that turned configuration audit from a periodic compliance exercise into a load-bearing defensive layer. The asymmetry between offensive and defensive automation has been collapsing fast: by Q2 2026, a single-engineer offensive operator running open-weight LLMs and agentic frameworks (WormGPT, FraudGPT, BlackMamba, Morris II, plus the wider agentic-offensive ecosystem) can produce more attack surface in a week than a six-person defensive team can audit in a month. If our managed-service practice couldn't measure configuration posture across the entire client estate at high cadence — and respond to it inside that estate when needed — we couldn't defend it either.

The work was simple to state: build the audit platform that would let our engineering team operate at the cadence the threat picture demanded, with deliverables that justified the engagement fee, and embed a live agent in the estates we audit so the diagnostic-and-remediation loop closes inside the customer environment instead of bouncing back through tickets.

What it took to build it was a ~6-month run of compounding architectural decisions. This is what shipped.

---

## What's running in production today

**Firewall Audit pillar.** A 4,400-line Python audit engine running 30 checks against a normalised configuration model, fed by four vendor parsers (WatchGuard XML · Palo Alto PAN-OS XML · Fortinet FortiOS text · Cisco ASA running-config). Cross-mapped to 50 compliance controls across four frameworks (PCI DSS v4.0 · CIS v8 · NIST CSF 2.0 · CMMC 2.0). The engine emits findings into a 19-chapter engagement-quality report renderer with a static-SVG network-exposure topology (W3 radius cap · W5 multi-ring concentric layout for fleets ≥ 9 zone-nodes) and attack-chain correlation across findings. Adding a fifth vendor parser is a 200-300 line job because the engine reads the normalised model, not vendor-specific structures.

**Site Audit pillar.** A ~3,974-line PowerShell collector running 47 data-capture sections on every Windows server in scope (hardware · OS · patches · services · ports · accounts · groups · shares · NTFS deltas · certificate stores · firewall posture · backup state · audit-policy state · Kerberos delegation · LAPS · LSA Protection · SMB version posture · much more). A five-layer Python aggregator chain feeds both an 11-chapter site-audit report and a 1,500-card live engineer dashboard with 21 drill-downs across 9 server-detail tabs — about 190 named-entity drill-downs in a 29-server fleet. Every count on the dashboard is clickable into the named entities behind it. The report is the print-form of the dashboard.

**AI pipeline.** A 16-module `ai_pipeline/` package implementing a 5-layer chained Claude pipeline for narrative generation across audit findings. Each layer carries explicit inputs, outputs, and evaluation gates — claim extraction, evidence verification against lineage records, narrative composition with citation, comprehensiveness check against original findings, and a final regression-gate review. The 8,911-test suite functions as the eval framework: zero-regressions-per-ship is the deployment gate. Anthropic's "evaluation frameworks · context engineering · agent architectures" land here as production code, not as research roadmap.

**Live server-side agent.** Embedded Windows-side agent that streams diagnostic data to engineer dashboards in real-time and accepts remote-scripting commands for diagnosis and remediation — RMM-class capability with built-in detection layers for the 2026 morphic-AI-attack and agentic-AI-attack threat class (WormGPT-derived phishing/malware generation, FraudGPT-derived fraud automation, BlackMamba polymorphic-by-LLM-call payloads, Morris II prompt-injection worms, autonomous agentic offensive frameworks).

**Test discipline.** 8,911 active regression tests across roughly 50 modules. Zero-regressions-per-ship-cycle as a non-negotiable build gate. Custom `tmp_db` fixture runs the full migration chain against a disposable SQLite database per test. A dedicated failure-mode taxonomy regression suite (Class A aggregator-collapse · Class B renderer-misread · Class C display-collapse) protects against the same failure mode reoccurring silently. A 5-sub-gate release gate (`tools/release_gate.py`) — exemplar voice · rendered-report review · prompt-library coverage · compliance-gap inventory · pip-audit CVE — exits non-zero on any failure and blocks the EXE build.

**Build and distribution.** Single ~95 MB PyInstaller EXE. 4-thread Waitress WSGI. SQLite with forward-only transactional migrations. Distribution via GitHub Releases with versioned `.zip` plus companion `.zip.sha256` checksum per ship cycle. **17 named release versions across 510 commits in 5 months** — zero force-pushes, zero mega-commits — each release regression-clean, each ratified live against customer data.

**Total scope.** Roughly 60,000 lines of production code across the audit engines, the canonical Flask app, ~7,000 lines of IIFE controller modules, a 6,500-line design-system CSS with a token + primitive layer, the PowerShell collector, the AI pipeline package, and four AI-prompt envelope files. Plus a 12-document, 6,116-line domain-specification corpus authored before the v6.3+ implementations were written. Zero offshore contractors. No traditional engineering team behind it.

---

## The engineering philosophy that produced it

Three project-permanent invariants encoded in the architecture and enforced through the test suite. These are the load-bearing engineering ideas that hold the deliverable bar across every renderer, every aggregator, every parser, and every future architectural change. I'd bring this philosophy to any engineering team I joined.

**Invariant 1 · Evidence-First Emission.** Every report renders the named entities behind every count. A report that says "8 expired certificates" without listing the certificate subjects is structurally incomplete, regardless of how nicely the chapter envelope is laid out. Counts are derived statistics on top of the named-entity layer, never substitutes for it. The PowerShell collector is the foundation; the aggregators preserve named entities; the renderers emit them. Locked at v7.0.1 after the polish ship that took the LARGE-fleet exemplar render from 173 KB and zero finding cards to 516 KB and 38 five-part finding cards with 660+ §-cited evidence rows.

**Invariant 2 · Audit Comprehensiveness Lock.** A firewall audit is THE FIREWALL. There is no "Top 10" anything. It is only EVERYTHING that will ensure the protection of what is behind it. Same applies to the site audit. Navigation primitives — chip rows, severity tallies, table-of-contents rails, risk badges — layer over the comprehensive content as engineer-aid wayfinding. They never substitute. Locked at v7.0.2.

**Invariant 3 · Granular-Data-Preservation.** Every piece of granular data the PowerShell collector captures must traverse all four layers (PS1 capture → parser/aggregator → dashboard card → site report chapter) without being collapsed to a count, until the rendering layer chooses how to display it. Even at render time, the named-entity list is one click or expand away — never lost. Locked at v7.2.0.

These invariants compose with what I call the **Constitutional Rule** — every count on the dashboard is clickable into the named entities behind it, and the report is the print form of the dashboard. The audit machine and the audit deliverable read from the same canonical schema. That isomorphism is what makes the deliverables hold up under principal-grade scrutiny. Clients can read the report; engineers can drill the dashboard; both surfaces show the same evidence.

---

## Engineering practice · transferable claims

Three engineering disciplines locked across the ship cycles that I bring to any team. These are *transferable* — they hold regardless of stack or domain.

**Specification-as-Substrate.** Specs as durable architectural infrastructure, not wiki pages that decay. Twelve domain documents authored as a 6,116-line research corpus before the v6.3+ implementations were written. Implementations cite the F-implication numbers they satisfy. Corrections feed back into the corpus rather than into chat context. The spec is the durable artifact; future engineers, future model versions, and future architectural decisions rest on it.

**Audit-as-Durable-Artifact.** At every major release boundary, structured engineering artefacts ship — forensic audits, retrospectives, threat models, roadmap recommendations, consolidated phase plans. Operational substrate for the next ship cycle, not after-the-fact documentation. Honest about what they don't cover. Findings ranked by severity. Future sessions, future engineers, and future architectural decisions read these artefacts before touching code.

**Honest-Scope-Naming.** Every engineering artefact carries an explicit "what this didn't cover" section. What's covered. What's not. What was intentionally deferred. What requires more data. This epistemic honesty in engineering documents is rare and substantially more useful than overclaimed alternatives. Senior hiring managers in cybersec-adjacent and Applied-AI roles read this register as a strong signal.

A fourth claim that comes alongside these three: **failure-mode taxonomy as engineering vocabulary.** Three named failure classes (Class A aggregator-collapse · Class B renderer-misread · Class C display-collapse) with documented signatures, regression-test patterns, and permanent test suites. Named failures turn one-off bugs into reusable engineering knowledge. Most codebases of comparable size ship ad-hoc post-mortems and ad-hoc regression tests; here the bug classes have a vocabulary, an enforcement layer, and protected regression suites.

---

## The discipline that compounded

The compounding shows up in the numbers. v6.x baseline test suite was 184 tests. v7.0.0 was 8,417. The current branch is at **8,911 active regression tests**. **17 named release versions** in 5 months. Three project-permanent invariants locked. **510 commits with zero force-pushes and zero mega-commits.** 6-phase ship cycles labelled α/β/γ/δ/ε/ζ where no phase advances on assumed correctness; every phase ends with an explicit ratification checkpoint where the work is walked end-to-end before the next phase opens. The last ship cycle started from a foundation materially stronger than the previous one. That is what compounding architectural discipline produces.

- **Atomic-commit cadence with regression-clean per commit.** No mega-commits, no force-pushes, no "fix everything" rebases. The git history reads as a narrative. Any commit can be reverted in isolation; any ship cycle can be reasoned about by reading the log.
- **Specification-first authoring.** See above — twelve domain documents, 6,116-line corpus, F-implication numbers cited in code.
- **Real-corpus verification.** No hypothetical claims. Every renderer change tested against actual production vendor configurations and actual Windows-server collector data, across the WHOLE corpus, before declaring ship-ready. The platform-defining bugs (an orphan-`</div>` regression that broke the DOM tree past the firewall section, the v7.0.6 audit-run-endpoint payload-shape divergence, the v7.1.0 single-subnet topology edge case) all surfaced from real-corpus verification rather than from synthetic fixtures. Each one became a permanent regression test the next morning.
- **Per-phase ratification with named ratification gates.** 6-phase ship cycles α/β/γ/δ/ε/ζ where no phase advances on assumed correctness.
- **5-sub-gate release gate.** Exemplar voice · rendered-report review · prompt-library coverage · compliance-gap inventory · pip-audit CVE. Any sub-gate failure blocks the EXE build.
- **Failure-mode taxonomy as protected regression suites.** See above — Class A / B / C.

---

## Honest about failures · what real-deploy taught me

Two specific lessons I want to surface, because how an engineer recovers from production failure tells you more than any list of successes.

**v7.1.0 single-subnet topology.** The site-audit visual-topology adapter shipped, was verified against multi-subnet test fixtures, passed the regression gate, and broke 11 of 23 multi-server customer sites the moment it hit production deploy. The bug: single-subnet sites emitted 1 zone-node and 0 edges, the renderer's empty-edges branch returned an empty-state SVG, and the body fell to a prose-only fallback. The multi-subnet fixtures had masked the single-subnet edge case entirely. v7.1.1 hot-fix shipped within 24 hours with a corrected graph-semantics model (subnet becomes the visual hub for single-subnet sites, each server becomes a labelled zone-node), corpus-wide re-verification across all 23 sites, and a permanent regression test that runs the WHOLE corpus end-to-end before any future topology change can ship. The lesson got encoded into the engineering discipline as a memory file: real-corpus verification must run the production code path against the WHOLE corpus, not a representative sample, before declaring ship-ready.

**v7.0.6 endpoint payload divergence.** Two endpoints (`POST /api/audit/run` and `GET /api/audit/results`) were serving the same conceptual data through independently-evolved code paths. The previous fix updated only the GET path. The SPA hit the POST path and saw empty topology + compliance fields. The fix extracted a shared payload-builder helper that both endpoints invoke, with a regression test that confirms the two endpoints emit byte-identical payload shape. The lesson: two endpoints serving the same conceptual data must share a single payload-builder, or shape mismatches between them will produce silent SPA bugs.

Both incidents made the platform stronger. The discipline that catches them now exists because of them. I am honest about engineering failure because the recovery from failure is where real engineering judgement gets demonstrated.

---

## What I'd bring to your team

- **Production agentic-systems engineering at customer-engagement cadence.** I ship the AI-integrated workflow patterns frontier labs are racing to ship as product, except at MSP scale, against daily customer pressure, before off-the-shelf product exists. Six pillars detailed above. NinjaToolKit is the proof.
- **Principal-grade architectural leadership.** Underspecified problem domain → spec corpus → implementation → enforcement layer (tests, invariants, release gates). ~6 months of compounding architectural decisions on a production platform is the proof.
- **Production discipline at engagement-quality.** Atomic commits · per-phase ratification · real-corpus verification · 5-sub-gate release gates · zero-regressions-per-ship. When live-deploy edge cases surface (and they do), the recovery cycle is fast, honest, and ratchets the engineering discipline forward.
- **Transferable engineering practice.** Specification-as-Substrate · Audit-as-Durable-Artifact · Honest-Scope-Naming · failure-mode taxonomy as engineering vocabulary. These are method-claims, not project-claims; they compose into any team's engineering culture.
- **Domain depth in cybersecurity, MSP operations, multi-vendor configuration audit, and 2026 frontier AI defense.** WatchGuard · Palo Alto · Fortinet · Cisco ASA · Active Directory · certificate hygiene · listening-port mapping · identity posture · 50 compliance controls across four frameworks · morphic-AI-attack and agentic-AI-attack defensive layering. I read the configurations as native language.
- **Applied AI engineering at production cadence.** Production Claude API integration with multi-pass generation, context engineering, agent architectures, and evaluation frameworks. Anthropic's exact JD language ("MCP servers, sub-agents, agent skills · evaluation frameworks · deployment patterns") lands here as shipped code, not as research roadmap.

I'm open to senior, principal, or staff-level individual-contributor roles, Applied AI / Forward Deployed Engineer positions at frontier AI labs, Solutions Engineer / Solutions Architect roles in the same orbit, or first-engineering-hire / engineering-leadership positions at smaller teams where the platform-architecture work compounds across the company. Remote · based in Chiang Mai, Thailand · US Citizen · available US business hours · open to relocation.

---

## Appendix · what I can share on request

- Anonymised architecture diagrams (system-level, dataflow, failure-mode taxonomy enforcement chain, ship-cycle phase architecture, AI-pipeline layer architecture)
- Code samples extracted from non-client-IP material (engineering patterns, the design-system token + primitive layer, the IIFE-controller pattern, the migration framework, the AI-pipeline layer interfaces)
- Expanded technical write-ups on the three project-permanent invariants, the failure-mode taxonomy, the six-pillar operating model, and the engineering disciplines that produced the trajectory
- Live walkthrough of the engineering discipline, the architecture, and any specific area you want depth on
- Reference conversations with engagement-team senior engineers and the eMazzanti leadership team

---

## Contact + next steps

If any of the engineering claims above resonate with what your team needs, I'd welcome the conversation.

- **GitHub:** [@RyanH-sudo](https://github.com/RyanH-sudo)
- **Location:** Chiang Mai, Thailand · US Citizen · remote-first · available US business hours · open to relocation
- **Email:** available on request via LinkedIn or this repo's Issues tab
- **Repository access to NinjaToolKit itself:** not available — the platform is private company IP — but every architectural claim in this case study is verifiable through live walkthrough, anonymised code excerpt, or reference conversation with the eMazzanti engineering team

I'm specifically targeting roles where the operating-model work I've described compounds across the company rather than being filed as one project. Frontier AI labs (Anthropic Forward Deployed Engineer / Applied AI Engineer · OpenAI Applied AI · Glean Founding FDE · Decagon FDE Agent Builder · Sierra Founding FDE Infrastructure · Harvey Senior FDE) are the natural primary fits. Compliance-product DNA companies (Vanta · Drata · Sprinto) are direct fits given the 50-control multi-framework work. Cybersecurity-tooling firms · agentic-AI platforms · platform-engineering teams at well-funded startups · MSSPs with APAC operations · Mercor 1099 expert-network engagements are also natural fits. Compensation expectations align with senior / principal / staff IC bands at firms that take engineering-quality seriously.

Looking forward to it.

— Ryan

---

*Anonymisation rules honoured throughout: no client company names, no proprietary business detail beyond what the engineering discipline requires for context. Every concrete number in this case study is auditable in the source tree of the platform under discussion.*
