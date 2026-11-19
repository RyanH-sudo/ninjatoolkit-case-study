# NinjaToolKit v9: technical case study

**A model reads the whole server. Code holds it to the evidence. An engineer decides every change.**

**Ryan Haig**, Forward Deployed Engineer and AI Automation Engineer

[The case study](https://ryanh-sudo.github.io/ninjatoolkit-case-study/case-study/) ·
[The film](https://ryanh-sudo.github.io/ninjatoolkit-case-study/film/) ·
[Source text](CASE_STUDY.md)

NinjaToolKit is an audit and remediation platform for managed Windows Server estates and WatchGuard firewalls. It ships
as one self-contained Windows program that runs on a server for a whole engineering team, with its own agents on the
servers it looks after. I designed it, built it and released it. The current release is **v9.0.1, November 2026**.

It is private company software, so this repository describes its architecture, method and measured behavior without
its source. It contains no client names, machine names, addresses or client data: every example and every frame of the
film runs on an estate invented for the purpose and checked by script against the real one.

## What is here

| | |
|---|---|
| **[The case study](https://ryanh-sudo.github.io/ninjatoolkit-case-study/case-study/)** | About 22,000 words in 19 sections, with 13 hand-drawn figures: the problem and its constraints, the data engineering, the 177 deterministic checks, the firewall pillar, agents and the standing watch, the AI harness in full technical depth, a worked run end to end, the operator's surface, the audits, operations, how it was proved, how it was built, and what is not proved yet. ([source text](CASE_STUDY.md)) |
| **[The film](https://ryanh-sudo.github.io/ninjatoolkit-case-study/film/)** | The released program working the invented estate, recorded as it happened: eleven acts, about sixteen minutes, silent with captions. Every screen is the real v9.0.1 program; every word the model says is what it wrote. |
| **[Earlier versions](https://ryanh-sudo.github.io/ninjatoolkit-case-study/earlier/)** | The v8.3.1 study and its demos, and the v9 design study written while v9 was in build. Kept for the record. |

## The system in figures

| | |
|---|---|
| Code | 138,202 lines of Python in eleven layers whose imports go one way; 32,284 lines of JavaScript; a 4,165-line PowerShell collector |
| Tests | 6,096 passing in 671 files, 17 standing verification harnesses, a five-part release gate |
| Deterministic checks | 177: 117 for servers in 18 families, 52 in the firewall engine, 8 on a Firebox's own settings; mapped to the 287 controls of NIST SP 800-53 Rev 5 Moderate and to CSF 2.0 |
| Models | Claude Opus 5.5, with Opus 5 as fallback; GLiNER 2.5 running locally; a hosted calibrated decision model |
| Operations | 80,161 requests through a 2 hour 40 minute soak with no error; fifty agents for an hour with no batch lost; killed mid-write twice and recovered both times |
| AI output held to facts | 318 of 318 audit fields kept by code's check of what the model wrote |
| History | 6,526 commits since March 2026; 62 version tags; 111 numbered design decisions |

## How the figures are labelled

Every figure is measured: the output of a command or a run, taken at the v9.0.1 tag unless the sentence says
otherwise. Where a figure comes from the real estate the product was built against, it is a count only. What is built
and not yet proved in production is listed in section 16 of the study.

## Contact

[github.com/RyanH-sudo](https://github.com/RyanH-sudo) · rytuality@gmail.com ·
[linkedin.com/in/rytuality](https://linkedin.com/in/rytuality) · A live walkthrough is available on request.
