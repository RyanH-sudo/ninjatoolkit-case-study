# Case Study · NinjaToolKit
## Building an MSP-Scale Configuration-Truth Audit Platform

**Author:** Ryan Haig
**Role:** Engineering · eMazzanti Technologies (managed-service provider · NJ/NY metro)
**Period:** Q4 2025 → Q2 2026 · approximately five months of focused development
**Status:** In production · multi-tenant client engagement use · 16 named release cycles

---

> **TL;DR** · One engineer, five months, ~60,000 lines of production Python + JavaScript + PowerShell, 8,872+ regression tests, 16 named release cycles, three project-permanent invariants enforced through the test suite. A configuration-truth audit platform for MSP-scale cybersecurity engagements covering four firewall vendors (WatchGuard · Palo Alto · Fortinet · Cisco ASA) and a 47-section Windows-server collector pipeline. Engagement-quality deliverables ratified live on customer data. Open to senior · principal · or staff IC roles · or first-engineering-hire / engineering-leadership at smaller teams. Hybrid or remote · NJ/NY metro or US-remote.

---

## Why this work happened

I joined an engagement team that was producing configuration-audit deliverables the hard way. We had a stack of vendor tools that each saw a sliver of the picture — Nipper for firewall posture, Tenable for vulnerability inventory, Lansweeper for asset state, ad-hoc PowerShell for the Windows-server side — and senior engineers were spending 60-80 hours per major audit stitching the outputs into something a client could read. None of it composed. None of it compounded. Every audit was a one-off.

The strategic case for fixing that gap got harder to ignore in late 2025, when the threat landscape shifted in a way that turned configuration audit from a periodic compliance exercise into a load-bearing defensive layer. The asymmetry between offensive and defensive automation has been collapsing fast: by Q2 2026, a single-engineer offensive operator running open-weight LLMs and agentic frameworks can produce more attack surface in a week than a six-person defensive team can audit in a month. If our managed-service practice couldn't measure configuration posture across the entire client estate at high cadence, we couldn't defend it either.

So the work was simple to state: build the audit platform that would let our engineering team operate at the cadence the threat picture demanded, with deliverables that held a quality bar that justified the engagement fee.

What it took to build it was a five-month run of compounding architectural decisions. This is what shipped.

---

## What's running in production today

**Firewall Audit pillar.** A 4,400-line Python audit engine running 30 checks against a normalised configuration model, fed by four vendor parsers (WatchGuard XML · Palo Alto PAN-OS XML · Fortinet FortiOS text · Cisco ASA running-config). Cross-mapped to 50 controls across four compliance frameworks (PCI DSS v4.0 · CIS v8 · NIST CSF 2.0 · CMMC 2.0). The engine emits findings into a 19-chapter engagement-quality report renderer with a static-SVG network-exposure topology (W3 radius cap · W5 multi-ring concentric layout for fleets ≥ 9 zone-nodes) and attack-chain correlation across findings. Adding a fifth vendor parser is a 200-300 line job because the engine reads the normalised model, not vendor-specific structures.

**Site Audit pillar.** A ~3,974-line PowerShell collector running 47 data-capture sections on every Windows server in scope (hardware · OS · patches · services · ports · accounts · groups · shares · NTFS deltas · certificate stores · firewall posture · backup state · audit-policy state · Kerberos delegation · LAPS · LSA Protection · SMB version posture · much more). A five-layer Python aggregator chain feeds both an 11-chapter site-audit report and a 1,500-card live engineer dashboard with 21 drill-downs across 9 server-detail tabs — about 190 named-entity drill-downs in a 29-server fleet. Every count on the dashboard is clickable into the named entities behind it. The report is the print-form of the dashboard.

**Test discipline.** 8,872+ regression tests across roughly 50 modules. Zero-regressions-per-ship-cycle as a non-negotiable build gate. Custom `tmp_db` fixture runs the full migration chain against a disposable SQLite database per test. A dedicated failure-mode taxonomy regression suite (Class A aggregator-collapse · Class B renderer-misread · Class C display-collapse) protects against the same failure mode reoccurring silently. A four-sub-gate release gate (`tools/release_gate.py`) exits non-zero on any failure and blocks the EXE build.

**Build and distribution.** Single ~95 MB PyInstaller EXE. 4-thread Waitress WSGI. SQLite with forward-only transactional migrations. Distribution via GitHub Releases with versioned `.zip` plus companion `.zip.sha256` checksum per ship cycle. 16 named release versions in five months, each regression-clean, each ratified live against customer data.

**Total scope.** Roughly 60,000 lines of production code across the audit engines, the canonical Flask app, the IIFE controller modules, the design-system CSS, the PowerShell collector, and four AI-prompt envelope files. Plus a 12-document, 6,116-line domain-specification corpus authored before the v6.3+ implementations were written. Zero offshore contractors. No traditional engineering team behind it.

---

## The engineering philosophy that produced it

Three project-permanent invariants encoded in the architecture and enforced through the test suite. These are the load-bearing engineering ideas that hold the deliverable bar across every renderer, every aggregator, every parser, and every future architectural change. I'd bring this philosophy to any engineering team I joined.

**Invariant 1 · Evidence-First Emission.** Every report renders the named entities behind every count. A report that says "8 expired certificates" without listing the certificate subjects is structurally incomplete, regardless of how nicely the chapter envelope is laid out. Counts are derived statistics on top of the named-entity layer, never substitutes for it. The PowerShell collector is the foundation; the aggregators preserve named entities; the renderers emit them. Locked at v7.0.1 after the polish ship that took the LARGE-fleet exemplar render from 173 KB and zero finding cards to 516 KB and 38 five-part finding cards with 660+ §-cited evidence rows.

**Invariant 2 · Audit Comprehensiveness Lock.** A firewall audit is THE FIREWALL. There is no "Top 10" anything. It is only EVERYTHING that will ensure the protection of what is behind it. Same applies to the site audit. Navigation primitives — chip rows, severity tallies, table-of-contents rails, risk badges — layer over the comprehensive content as engineer-aid wayfinding. They never substitute. Locked at v7.0.2.

**Invariant 3 · Granular-Data-Preservation.** Every piece of granular data the PowerShell collector captures must traverse all four layers (PS1 capture → parser/aggregator → dashboard card → site report chapter) without being collapsed to a count, until the rendering layer chooses how to display it. Even at render time, the named-entity list is one click or expand away — never lost. Locked at v7.2.0.

These invariants compose with what I call the **Constitutional Rule** — every count on the dashboard is clickable into the named entities behind it, and the report is the print form of the dashboard. The audit machine and the audit deliverable read from the same canonical schema. That isomorphism is what makes the deliverables hold up under principal-grade scrutiny. Clients can read the report; engineers can drill the dashboard; both surfaces show the same evidence.

---

## The discipline that compounded

Five engineering disciplines locked in across the ship cycles. They compose into the architectural leverage that makes a five-month one-engineer build possible at this scope.

- **Atomic-commit cadence with regression-clean per commit.** No mega-commits, no force-pushes, no "fix everything" rebases. The git history reads as a narrative. Any commit can be reverted in isolation; any ship cycle can be reasoned about by reading the log.
- **Specification-first authoring.** Twelve domain documents authored as a 6,116-line research corpus before the v6.3+ implementations were written. Implementations cite the F-implication numbers they satisfy. Corrections feed back into the corpus rather than into chat context. The spec is the durable artifact.
- **Real-corpus verification.** No hypothetical claims. Every renderer change tested against actual production vendor configurations and actual Windows-server collector data, across the WHOLE corpus, before declaring ship-ready. The platform-defining bugs (an orphan-`</div>` regression that broke the DOM tree past the firewall section, the v7.0.6 audit-run-endpoint payload-shape divergence, the v7.1.0 single-subnet topology edge case) all surfaced from real-corpus verification rather than from synthetic fixtures. Each one became a permanent regression test the next morning.
- **Per-phase ratification with named ratification gates.** Multi-phase ship cycles labelled α/β/γ/δ/ε/ζ where no phase advances on assumed correctness. Every phase ends with an explicit ratification checkpoint where the work is walked end-to-end before the next phase opens.
- **Failure-mode taxonomy.** Three classes of failure (Class A aggregator-collapse · Class B renderer-misread · Class C display-collapse) documented and protected by dedicated regression suites. The taxonomy turns post-mortems into reusable engineering vocabulary.

The compounding shows up in the numbers. v6.x baseline test suite was 184 tests. v7.0.0 was 8,417. v7.3.0 is 8,872. Three project-permanent invariants locked. Sixteen named release versions in five months. The last ship cycle started from a foundation materially stronger than the previous one. That is what compounding architectural discipline produces.

---

## Honest about failures · what real-deploy taught me

Two specific lessons I want to surface, because how an engineer recovers from production failure tells you more than any list of successes.

**v7.1.0 single-subnet topology.** The site-audit visual-topology adapter shipped, was verified against multi-subnet test fixtures, passed the regression gate, and broke 11 of 23 multi-server customer sites the moment it hit production deploy. The bug: single-subnet sites emitted 1 zone-node and 0 edges, the renderer's empty-edges branch returned an empty-state SVG, and the body fell to a prose-only fallback. The multi-subnet fixtures had masked the single-subnet edge case entirely. v7.1.1 hot-fix shipped within 24 hours with a corrected graph-semantics model (subnet becomes the visual hub for single-subnet sites, each server becomes a labelled zone-node), corpus-wide re-verification across all 23 sites, and a permanent regression test that runs the WHOLE corpus end-to-end before any future topology change can ship. The lesson got encoded into the engineering discipline as a memory file: real-corpus verification must run the production code path against the WHOLE corpus, not a representative sample, before declaring ship-ready.

**v7.0.6 endpoint payload divergence.** Two endpoints (`POST /api/audit/run` and `GET /api/audit/results`) were serving the same conceptual data through independently-evolved code paths. The previous fix updated only the GET path. The SPA hit the POST path and saw empty topology + compliance fields. The fix extracted a shared payload-builder helper that both endpoints invoke, with a regression test that confirms the two endpoints emit byte-identical payload shape. The lesson: two endpoints serving the same conceptual data must share a single payload-builder, or shape mismatches between them will produce silent SPA bugs.

Both of these incidents made the platform stronger. The discipline that catches them now exists because of them. I am honest about engineering failure because the recovery from failure is where real engineering judgement gets demonstrated.

---

## What I'd bring to your team

- **Principal-grade architectural leadership.** I can take an underspecified problem domain, author the specification corpus, ship the implementation, and protect the architecture with an enforcement layer — tests, invariants, release gates. Five months of compounding architectural decisions on a production platform is the proof.
- **Production discipline at engagement-quality.** I ship through atomic commits, per-phase ratification, real-corpus verification, and zero-regressions-per-ship-cycle gates. When live-deploy edge cases surface (and they do), the recovery cycle is fast, honest, and ratchets the engineering discipline forward.
- **Domain depth in cybersecurity, MSP operations, and multi-vendor configuration audit.** WatchGuard, Palo Alto, Fortinet, Cisco ASA, Active Directory, certificate hygiene, listening-port mapping, identity posture, 50 compliance controls across four frameworks. I read the configurations as native language.
- **Specification-as-substrate practice at production cadence.** Twelve domain documents authored as a 6,116-line research corpus before code was written. Implementations cite the spec sections they satisfy. Corrections feed back into the corpus rather than into chat context. Most engineering teams treat specs as wiki pages that decay; the teams that produce engineering deliverables that hold up under scrutiny treat specs as durable infrastructure. I bring that discipline.

I am open to senior, principal, or staff-level individual-contributor roles, Applied AI / Forward Deployed Engineer positions at frontier AI labs, or first-engineering-hire / engineering-leadership positions at smaller teams where the platform-architecture work compounds across the company. Remote · based in Chiang Mai, Thailand (US Citizen · US Pacific evening hours align with Thailand morning).

---

## Appendix · what I can share on request

- Anonymised architecture diagrams (system-level, dataflow, failure-mode taxonomy enforcement chain, ship-cycle phase architecture)
- Code samples extracted from non-client-IP material (engineering patterns, the design-system token + primitive layer, the IIFE-controller pattern, the migration framework)
- Expanded technical write-ups on the three project-permanent invariants, the failure-mode taxonomy, and the engineering disciplines that produced the trajectory
- Live walkthrough of the engineering discipline, the architecture, and any specific area you want depth on
- Reference conversations with engagement-team senior engineers and the eMazzanti leadership team

---

## Contact + next steps

If any of the engineering claims above resonate with what your team needs · I'd welcome the conversation.

- **GitHub:** [@RyanH-sudo](https://github.com/RyanH-sudo)
- **Location:** Chiang Mai, Thailand · US Citizen · remote-first · US Pacific evening hours = Thailand morning
- **Email:** available on request via LinkedIn or this repo's Issues tab
- **Repository access to NinjaToolKit itself:** not available — the platform is private company IP — but every architectural claim in this case study is verifiable through live walkthrough, anonymised code excerpt, or reference conversation with the eMazzanti engineering team

I'm specifically targeting roles where the platform-architecture work I've done compounds across the company rather than being filed as one project. Cybersecurity-tooling firms · agentic-AI platforms · platform-engineering teams at mid-market tech companies · MSSPs with APAC operations · and well-funded early-stage startups looking for a first principal engineering hire are the natural fits. Forward Deployed Engineer / Applied AI roles at frontier AI labs are also natural targets. Compensation expectations align with senior / principal / staff IC bands at firms that take engineering-quality seriously.

Looking forward to it.

— Ryan

---

*Anonymisation rules honoured throughout: no client company names, no proprietary business detail beyond what the engineering discipline requires for context. Every concrete number in this case study is auditable in the source tree of the platform under discussion.*
