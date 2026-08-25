# Case Study · NinjaToolKit
## A production agentic-audit platform shipped at MSP scale

**Author:** Ryan Haig
**Role:** Engineering · eMazzanti Technologies (managed-service provider · NJ/NY metro)
**Period:** October 2025 → present · ~10 months of focused development, in active development
**Status:** In production · multi-tenant client engagement use · **v7.6.13** · **55 tags · 53 GitHub Releases** · zero force-pushes

---

> **TL;DR** · I build production agentic-AI systems at MSP scale — against live customer-engagement pressure, before off-the-shelf product exists. **NinjaToolKit** is the shipped instance: **~157,000 lines of production application code** (plus 19,000 lines of standing verification harnesses and 112,000 lines of tests across 448 modules), a **12,139-line firewall audit engine running 52 checks** across three vendors, a **47-section Windows Server collector**, an **18-module `ai_pipeline/` package** implementing a 5-layer chained-Claude generation stack, symmetric two-pillar engagement dashboards where every count is clickable into the named entities behind it, and **four project-permanent invariants** enforced structurally rather than by convention. **53 releases in ten months, zero force-pushes.**
>
> The part worth reading is not the scale. It is **§7 — the August 2026 forensic campaign**, where I audited my own platform, wrote down every fix's expected numbers before making the edit, and recorded that **66 predictions held and 32 were refuted.** Several refutations caught a defect *in the repair*. That is the engineering judgment this document is actually about.

**Open to** Solutions Engineer · Applied AI Engineer · Forward Deployed Engineer · Solutions Architect. US Citizen · remote (Chiang Mai, Thailand) · available US business hours.

---

## The operating model · six pillars

NinjaToolKit is the shipped instance. The operating model is the transferable part.

**1 · Silo-bridging via canonical substrate.** Previously-disconnected enterprise systems — Microsoft 365, Active Directory, multi-vendor firewalls, Hyper-V, Azure — normalised into one canonical audit model. Configuration gaps invisible in any native vendor dashboard become visible in the integrated view. This is architectural silo-busting, not dashboard aggregation.

**2 · Gated agentic workflows · human-in-the-loop by design.** Multi-pass AI generation behind explicit approval gates, with the model proposing and a human executing. Every AI-authored claim in a rendered report is required to carry a provenance pointer to the field it came from — *a sentence that cannot cite is not emitted.*

**3 · GUI-bypass via CLI · diagnosis where dashboards cannot reach.** The 47-section collector captures depth most MSP audits never touch — Kerberoastable accounts, unconstrained-delegation principals, LSA Protection state, LAPS posture, BitLocker/TPM coupling, per-store certificate enumeration. The CLI is the source of truth; the GUI is marketing.

**4 · Instrument before you trust.** The platform's standing verification harnesses do not re-run the test suite. They prove that specific historical defects are still closed — *because in this codebase green tests have repeatedly coexisted with wrong output.* That distinction is the whole discipline.

**5 · Multi-substrate integration.** Scripting, vendor APIs, PSA/RMM hooks, Azure Resource Manager — whichever medium fits each system. Not vendor-locked, not protocol-locked.

**6 · Productionising AI-integrated workflows before they exist as products.** Building the integrations because customer-engagement work demands them today, not waiting for a vendor to ship them.

---

## Why this work happened

The engagement team I joined was producing configuration-audit deliverables the hard way. Vendor tools each saw a sliver — Nipper for firewall posture, Tenable for vulnerability inventory, Lansweeper for asset state, ad-hoc PowerShell for the Windows side — and senior engineers were spending 60-80 hours per major audit stitching outputs into something a client could read. None of it composed. None of it compounded. Every audit was a one-off.

The strategic case got harder to ignore in late 2025, when configuration audit stopped being a periodic compliance exercise and became a load-bearing defensive layer. The asymmetry between offensive and defensive automation has been collapsing: a single operator running open-weight models and agentic frameworks can now generate more attack surface in a week than a small defensive team can audit in a month. **If a managed-service practice cannot measure configuration posture across the whole estate at high cadence, it cannot defend it either.**

So: build the audit platform that lets the team operate at the cadence the threat picture demands, with deliverables that justify the engagement fee.

---

## What is running in production today

*Every figure below was measured against the source tree on 2026-08-25.*

**Firewall Audit pillar.** A **12,139-line** Python audit engine (`firewall_audit.py`) running **52 checks** against a normalised configuration model, fed by three vendor parsers (WatchGuard XML · Palo Alto PAN-OS XML · Fortinet FortiOS text). Cross-mapped to **50 compliance controls** across PCI DSS v4.0 · CIS v8 · NIST CSF 2.0 · CMMC 2.0, inside a canonical envelope that carries **ten frameworks**. Emits into a **19-chapter** engagement-quality report with static-SVG network-exposure topology and attack-chain correlation. Adding a fifth vendor parser is a 200-300 line job because the engine reads the normalised model, not vendor structures.

**Site Audit pillar.** A **3,692-line** PowerShell collector running **47 data-capture sections** on every Windows server in scope. A 19-aggregator Python chain feeds both an **11-chapter** site report and a live engineer dashboard carrying **70 distinct AI-bound card scopes across 9 server-detail tabs**. Every count on the dashboard is clickable into the named entities behind it. **The report is the print-form of the dashboard.**

**AI pipeline.** An **18-module `ai_pipeline/` package** implementing a 5-layer chained-Claude stack: deterministic input prep → per-server forensic narrative → cross-server correlation → environmental synthesis → kill-chain narrative → executive summary. Each layer carries explicit inputs, outputs and evaluation gates. A never-raises contract, atomic budget reserve/settle against a per-engineer cost cap, content-hash response caching keyed on a pipeline version, and a single SDK chokepoint. **Frontier tiers only — Opus for reasoning, Sonnet as the sole acceptable degrade, enforced at the routing boundary.**

**Scope-aware AI conversation.** A console that binds to whatever scope the engineer is working in by walking the DOM at hover-time via `closest('[data-ntk-card-ai]')`, resolving the scope key plus the structured card data verbatim — the model sees the actual finding, evidence and severity, not a label. **102 binding stampings** across the two pillars. Specialised clipboard formatters emit paste-ready blocks per card type, dropped straight into tickets, SSH sessions or firewall web UIs.

**Test discipline.** **112,150 lines of tests · 7,296 test functions across 448 modules · 14,034 passing cases, zero failures.** A custom `tmp_db` fixture runs the full migration chain against a disposable SQLite database per test. A failure-mode taxonomy suite (Class A aggregator-collapse · Class B renderer-misread · Class C display-collapse) prevents silent recurrence. A **6-sub-gate release gate** blocks the EXE build on any failure.

**Build and distribution.** Single-file PyInstaller EXE. 4-thread Waitress WSGI. SQLite with forward-only transactional migrations, currently at **Migration 013**. Distribution via GitHub Releases with a `.zip` plus companion `.zip.sha256` per cycle. **53 releases across 55 tags — zero force-pushes, zero mega-commits**, each regression-clean, each ratified against customer data. A customer-fallback ladder keeps multiple prior releases simultaneously live so every ship preserves a rollback path.

**Total scope.** **~157,000 lines of production application code** — the firewall engine (12,139) · the Flask application (10,345) · two report renderers (25,966 and 13,073) · the collector parser (5,570) · 20 vanilla-JS IIFE controllers (26,320) · a 7,091-line design-system CSS with a token and primitive layer · the AI pipeline package · the PowerShell collector (3,692). Plus **19,000 lines of standing verification harnesses** and **112,000 lines of tests** — **289,000 lines total**. Plus a 12-document, 6,116-line domain-specification corpus authored *before* the implementations it governs. Solo engineer, in active collaboration with Claude.

---

## The four project-permanent invariants

Encoded in the architecture, enforced through the test suite. These are the load-bearing ideas that hold the deliverable bar across every renderer, aggregator, parser, and future change.

**1 · Evidence-First Emission.** Every report renders the named entities behind every count. *"8 expired certificates"* without the certificate subjects is structurally incomplete regardless of how well the chapter is laid out. Counts are derived statistics on top of the named-entity layer, never substitutes for it. Locked at v7.0.1 after a polish cycle took the large-fleet exemplar from 173 KB with zero finding cards to 516 KB with 38 finding cards and 660+ §-cited evidence rows.

**2 · Audit Comprehensiveness Lock.** A firewall audit is **the firewall**. There is no "Top 10" anything — only everything that protects what is behind it. Navigation primitives layer *over* comprehensive content as wayfinding; they never substitute for it. Locked at v7.0.2.

**3 · Granular-Data-Preservation.** Every piece of granular data the collector captures traverses all four layers — capture → aggregator → dashboard card → report chapter — without collapsing to a count. Even at render time the named-entity list is one expand away. Locked at v7.2.0.

**4 · Commercial-Content Persona Boundary.** Client-facing report HTML carries zero commercial framing unless management has ratified that specific surface. Engineer view sees pricing, cost ranges and margin signals; the client-facing artifact does not. Enforced structurally by a dedicated test suite, not by convention. Locked at v7.5.1.

These compose into the **Constitutional Rule**: every count on the dashboard is clickable into the named entities behind it, and the report is the print-form of the dashboard. The audit machine and the audit deliverable read from the same canonical schema. **That isomorphism is what makes the deliverables survive scrutiny.**

---

## The August 2026 forensic campaign · the section that matters

Ten months in, I stopped building and audited what I had built. A complete code crawl of both pillars, ~1,300 findings triaged, ~86 fixes landed. **Every fix's expected numbers were written into a ledger before the edit was made.**

**66 predictions held. 32 were recorded as refuted.** Several refutations caught a defect *in the repair itself* before it shipped. In one cycle, **four recorded prescriptions would each have introduced a new defect** if applied literally — measuring first changed the fix, not the estimate.

That produced the rule the platform now runs on: **locations are reliable; prescriptions are hypotheses.**

**What it found, all measured rather than inferred:**

- **A delivered client report asserted "No internet-facing RDP exposures detected"** while nine enabled policies published RDP to named internal hosts via static NAT on obfuscated external ports. The port-exposure check read the *policy* port and correctly saw nothing; the only check that followed the NAT translation was structurally dead.
- **Findings were identified by list position** — 25 of 26 changed meaning between two runs. Made content-derived, which made the entire back-catalogue comparable and made audit-over-audit diffing possible for the first time.
- **A cross-client data-bleed defect.** One module-level engine object read by 97 call sites, served by a 4-thread WSGI server, with an audit lifecycle spanning multiple requests — two concurrent uploads could save one client's configuration under another client's name. **Four obvious fixes were each ruled out by measurement** (a lock cannot span separate requests; thread-local breaks because the server reuses threads; a session cookie cannot distinguish two browser tabs; HTTP Basic auth skips entirely when unconfigured) before the one that worked: a per-request context registry behind an attribute-forwarding proxy that left all 97 call sites untouched.
- **A shadow-rule detector that had never fired** — zero findings across every config in the corpus — because it compared unresolved aliases, making every policy a unique singleton.
- **A coverage instrument** built to answer a question nobody could: *what does the capture hold that the dashboards never show?* Measured: **site 78.0%, firewall 51.7%** — and a category the instrument's own design note calls out as the one that earns it, **REPORT-ONLY**: a field reaching a client report but no engineer dashboard *inverts* Invariant 1.

**The methodological finds are the ones I would defend in an interview:**

- **A dead field read is only a defect when nothing else supplies the value.** Filing all 24 dead reads would have claimed 32 correct findings were false.
- **Never grade an undocumented enum.** A finding written up as "DH group 2, 1024-bit, CRITICAL" was retracted when the value proved to be a UI dropdown index, not IETF numbering.
- **A pattern that cannot distinguish the two answers it is separating will confidently give you one.** Six instances in a single session, including a regex that matched `Azure Arc.*INSTALLED` inside the string *"NOT INSTALLED"*.
- **A zero is only meaningful once the instrument has been shown capable of returning non-zero.** Over thirty instrument errors were caught during the campaign — every one because the evidence was printed beside the conclusion.

**Two standing harnesses now prove the fixes are still closed rather than asserting it.** Re-run 2026-08-24: **96/96 and 68/68, exit 0.** Their design note states the reason plainly: *tests prove structure; this proves the specific defects are still closed, because in this codebase green tests have repeatedly coexisted with wrong output.*

---

## Honest about failures

**v7.1.0 single-subnet topology.** The topology adapter shipped, passed the regression gate against multi-subnet fixtures, and broke 11 of 23 multi-server customer sites on production deploy. Single-subnet sites emitted one zone-node and zero edges; the renderer's empty-edges branch returned an empty-state SVG and the body fell to prose-only. The multi-subnet fixtures had masked the edge case entirely. Hot-fixed within 24 hours with corrected graph semantics, corpus-wide re-verification across all 23 sites, and a permanent regression test that runs the *whole* corpus before any future topology change can ship. **The lesson became doctrine: real-corpus verification runs the production code path against the whole corpus, not a representative sample.**

**v7.0.6 endpoint payload divergence.** Two endpoints served the same conceptual data through independently-evolved code paths. A prior fix updated only one. The SPA hit the other and saw empty fields. Fixed by extracting a shared payload-builder both endpoints invoke, with a test asserting byte-identical shape. **The generalised rule — one of two consumers of the same quantity is always the wrong one — later became the strongest defect predictor in the codebase, confirmed five times in a single cycle.**

---

## Forward scope

**NTK-ONE** — a modular rebuild under one hard constraint: every module must be small enough to load, reason about and refactor in a single context window without mapping the whole codebase. The motivation is measured, not aesthetic: one renderer is **25,966 lines**, roughly a third of a 1M-token window just to read once. That cost is why a 108-document corpus was needed to change anything safely.

In design:

- **A vendor-neutral firewall configuration model** — read → normalise → edit in a uniform UI → diff *in vendor-native syntax* → push → re-read → verify. Research on all five vendor APIs is complete, including the finding that Cisco's ASA REST API terminates at 9.16 and is no longer enhanced, so SSH/CLI is the only forward transport there.
- **An engineer console** over in-box OpenSSH and PowerShell Remoting — zero new dependencies, and the same authorised-execution channel the agent will use.
- **Change-driven agentic monitoring** — a new ingest triggers a diff, a cheap deterministic policy gate decides whether it warrants reasoning, and only then does a model run. Bounded by the diff rather than the corpus, which is what makes always-on affordable.
- **A third pillar — Microsoft 365 / Entra ID tenant audit**, built to the same shape as the site audit: conditional-access posture, privileged-role standing access, legacy-auth surface, mailbox forwarding and delegation, external sharing and guest sprawl, licence-versus-entitlement drift, and non-human identity (app registrations, service principals, consented permissions, expiring credentials). **The architectural point outweighs the feature: a pillar is an ingest module plus aggregators plus chapters against the same canonical envelope, not a fork of the platform** — so a third pillar inherits stable finding identity, exposure-window tracking, the diff engine, the AI pipeline and the evidence-first rendering discipline on day one. That inheritance is the return on the modular rebuild, which is why it is sequenced before new capability rather than after it.
- **Cross-pillar correlation** — the question no single pillar can answer: a host exposed at the perimeter, running a service account that is also a privileged tenant principal. Both facts already exist in one product; nothing joins them yet.
- **Exposure-window tracking** — first-seen, days-open, audits-carried per finding. A point-in-time scanner structurally cannot produce this; it requires stable identity plus persisted history, both of which now exist.

---

## What I would bring to your team

- **Production agentic-systems engineering at customer-engagement cadence.** Shipping AI-integrated workflow patterns at MSP scale, against daily customer pressure, before off-the-shelf product exists.
- **Architectural leadership through a full cycle.** Underspecified problem domain → specification corpus → implementation → enforcement layer → forensic audit of my own work → structural fixes. Ten months of compounding decisions on a production platform.
- **Verification instinct.** The instruments in this platform exist because I did not trust my own green tests. That is the habit I would bring.
- **Domain depth.** WatchGuard · Palo Alto · Fortinet · Active Directory · certificate hygiene · listening-port mapping · identity posture · 50 controls across four frameworks. I read these configurations as native language.
- **Applied AI engineering.** Multi-pass generation, context engineering, evaluation gates, cost governance, and grounding discipline — as shipped code with a cost meter, not as a research roadmap.

---

## Appendix · available on request

Anonymised architecture diagrams · code samples from non-client-IP material · expanded write-ups on the four invariants, the failure-mode taxonomy and the prediction ledger · live walkthrough of any area you want depth on · reference conversations with engagement-team senior engineers and eMazzanti leadership.

**Repository access to NinjaToolKit itself is not available — the platform is private company IP.** Every architectural claim here is verifiable through live walkthrough, anonymised excerpt, or reference conversation.

---

## Contact

- **GitHub:** [@RyanH-sudo](https://github.com/RyanH-sudo)
- **Email:** [rytuality@gmail.com](mailto:rytuality@gmail.com) · **LinkedIn:** [linkedin.com/in/rytuality](https://linkedin.com/in/rytuality)
- **Location:** Chiang Mai, Thailand · US Citizen · remote-first · available US business hours

Targeting roles where platform-architecture work compounds across the company rather than being filed as one project — frontier AI labs, compliance-product companies, cybersecurity tooling, agentic-AI platforms, and first-engineering-hire positions at smaller teams.

— Ryan

---

*Anonymisation honoured throughout: no client company names, no proprietary business detail beyond what the engineering context requires.*

*Every concrete figure in this document was re-measured against the source tree on **2026-08-25** rather than carried forward from a previous revision. Where a claim could not be verified in code, it was corrected or removed.*
