# NinjaToolKit: An Agentic Audit and Remediation Platform for Managed Infrastructure

**A technical case study**

**Author:** Ryan Haig, Forward Deployed Engineer, eMazzanti Technologies
**Subject:** NinjaToolKit v8.1.0, released September 28, 2026
**Status:** In production use by the engineering team of a managed service provider
**Measurement:** Every figure in this document was measured against the v8.1.0 release on September 28, 2026, unless it
is labelled as historical. The platform is private company software; this document describes its design and
behavior without reproducing its source or any client data.

---

## Contents

1. [Summary](#1-summary)
2. [The problem and its constraints](#2-the-problem-and-its-constraints)
3. [System architecture](#3-system-architecture)
4. [Data engineering: from a PowerShell capture to one list of problems](#4-data-engineering-from-a-powershell-capture-to-one-list-of-problems)
5. [Network engineering: the firewall audit engine](#5-network-engineering-the-firewall-audit-engine)
6. [Server architecture: what the judges read](#6-server-architecture-what-the-judges-read)
7. [Agentic orchestration: the adversarial diagnosis](#7-agentic-orchestration-the-adversarial-diagnosis)
8. [From diagnosis to verified fix: the issue lifecycle](#8-from-diagnosis-to-verified-fix-the-issue-lifecycle)
9. [Cybersecurity: the safety model](#9-cybersecurity-the-safety-model)
10. [Model governance: routing, refusals and cost](#10-model-governance-routing-refusals-and-cost)
11. [The engineer's surface](#11-the-engineers-surface)
12. [DevOps and release engineering](#12-devops-and-release-engineering)
13. [Verification: measurement over assertion](#13-verification-measurement-over-assertion)
14. [Results](#14-results)
15. [How I build](#15-how-i-build)
16. [Lessons](#16-lessons)
17. [What comes next](#17-what-comes-next)
18. [Appendix: glossary](#18-appendix-glossary)

---

## 1. Summary

NinjaToolKit turns the raw configuration of a managed estate into engineering work that closes. It ingests the
output of a 47-section PowerShell collector and WatchGuard firewall exports, judges them with deterministic code,
organizes every finding into one list of problems, and then runs a gated, adversarial multi-agent diagnosis on any
server, area or client fleet. The diagnosis does not end in a report. It ends in issues, and each issue walks to a
verified close: a read-only test the engineer runs and pastes back, a fix that a second agent reviews and the engineer
approves, and a close that the next capture either confirms or reopens.

Three design decisions define the system:

- **The model proposes; code decides; the engineer approves.** Every agent output is parsed into a fixed shape and
  held to evidence by code before it reaches a page. No module in the platform can execute anything on a client
  machine. The engineer runs every script and approves every change.
- **Disagreement is structural.** A single model asked to check its own diagnosis agrees with itself. The platform
  gives a second agent a different task with a different success condition (break the diagnosis) and a third agent
  the job of ruling between them.
- **Everything ships as one file.** The platform is a single self-contained Windows executable with no runtime
  dependency beyond the model API, so an engineer can run it on an office server from an empty folder.

| At v8.1.0 | |
|---|---|
| Product code | 204,142 lines of Python, plus a 4,021-line PowerShell collector |
| Tests | 13,875 collected, 13,822 passed, 0 failed, in 156,974 lines of test code |
| Standing verification | 19 harnesses and a 6-part release gate, run before every release |
| Server judgment | 55 deterministic judges across nine areas of a server |
| Firewall audit | 52 checks, mapped to 50 controls across four compliance frameworks |
| Agents | Proposer, challenger, arbiter and writer, plus a checker, a reviewer and a describer |
| History | 4,585 commits and 56 tagged releases between March and September 2026 |
| Paid verification of the release | One full diagnosis in the built executable: 4 model calls, $2.21, 21 issues |

---

## 2. The problem and its constraints

### 2.1 The operating reality

A managed service provider audits estates it does not own, for clients who expect evidence, at a cadence set by
the threat picture rather than by the calendar. Before this platform, a major audit meant senior engineers
stitching together the partial views of several vendor tools, each of which saw one slice of the estate. By the
team's own estimate that took 60 to 80 hours per engagement, and nothing carried forward: every audit was a one-off.

The deeper problem was not the audit. It was what came after it. A report lists what is wrong; it does not
diagnose why, it does not produce the test that would settle a doubt, and it does not track whether a fix held.
That work happened in engineers' heads and in ticket threads, which is to say it was not recorded, not
reproducible, and not reviewable.

### 2.2 What the platform had to be

The constraints were set by the environment, and each one shaped the architecture:

| Constraint | Why it exists | What it forced |
|---|---|---|
| One self-contained executable | It runs on an office server used by the whole team, often with no development tooling installed | No runtime dependencies beyond the model API; every asset bundled; a build check that nothing outside the bundle is opened |
| The engineer is the gate | The platform acts on client infrastructure under contract | No transport to client machines at all; every script run by a person; every change approved by a person |
| Evidence first | Client deliverables must survive scrutiny | Reports render the named entities behind every count; findings carry the lines that prove them |
| Nothing seeded | A demo estate in production code is a liability | The application starts empty and shows only what was ingested |
| Bounded, visible cost | Model calls are paid per token, and a runaway argument is real money | Every call priced before it is sent, a ceiling per argument, every call recorded |
| Frontier models only | A hallucinated finding in a client deliverable costs more than an expensive call | No small-model tier; a cheaper model may describe but never diagnose |

---

## 3. System architecture

### 3.1 Context

```mermaid
flowchart LR
    subgraph Estate["Client estate"]
        SRV["Windows servers"]
        FWD["WatchGuard firewalls"]
    end
    subgraph NTK["NinjaToolKit: one executable on an office server"]
        ING["Ingest and parse"] --> WH[("Warehouse")]
        WH --> JDG["Judges and firewall engine"]
        JDG --> PRB["One list of problems"]
        PRB --> AGT["Agents"]
        AGT --> CUR["Courier"]
        WH --> REP["Client reports"]
    end
    ENG(("Engineer"))
    API["Claude API"]
    SRV -->|"collector output"| ENG
    FWD -->|"configuration export"| ENG
    ENG -->|"uploads"| ING
    AGT <-->|"HTTPS, priced and recorded"| API
    CUR -->|"read-only test or reviewed fix"| ENG
    ENG -->|"runs it"| SRV
    ENG -->|"pastes the output"| CUR
```

The platform sits between the engineer and the estate, never between the estate and anything else. Data reaches
it only through the engineer (a collector run, a configuration export), and work leaves it only through the
engineer (a script to run). The one external network dependency is the model API, and it is used only when the
engineer has switched the AI on.

### 3.2 Layers

```mermaid
flowchart TB
    L1["Collection: PowerShell collector v5.3, 47 sections"]
    L2["Parsing: capture parser, WatchGuard parser, roster matching"]
    L3[("Warehouse: SQLite, 17 forward-only migrations")]
    L4["Judgment: 55 server judges, 52-check firewall engine, one finding shape"]
    L5["Record: append-only session events, Jobs, issues, reconciliation"]
    L6["Agents: argument, writer, checker, reviewer, describer, console turn"]
    L7["Evidence and custody: evidence cards, test packs, remediation packs, courier, return leg"]
    L8["Surface: Flask and Waitress, pages generated from the warehouse, live event channel"]
    L9["Reports: firewall and site audit client deliverables"]
    L1 --> L2 --> L3 --> L4 --> L5
    L5 --> L6 --> L7 --> L5
    L3 --> L8
    L5 --> L8
    L3 --> L9
```

| Layer | Representative modules | Size at v8.1.0 |
|---|---|---|
| Collection | the PowerShell collector | 4,021 lines |
| Parsing | capture parser, firewall engine and parser, client registry | 6,723, 12,940 and 4,078 lines |
| Judgment | server judges, one finding shape | 55 judges |
| Record | console session, event log, Jobs, run record, reconciliation | 13 event kinds |
| Agents | argument, issue write-up, reading check, fix review, describe, console runner | 7 agent roles |
| Evidence and custody | evidence cards, target packs, script analysis, remediation packs, courier, return leg | |
| Surface | the Flask application, the page server, 98 console modules | 68,088 lines in `ui/` |
| Reports | the firewall and site audit renderers | 49,526 lines |
| Model access | one API client, model registry, call ledger, master switch | 24 modules in the AI package |

### 3.3 Runtime model

The executable starts a Flask application under the Waitress WSGI server, creates a `data` folder beside itself
for the SQLite warehouse and logs, and serves the console on a local port. Pages are generated on the server from
the warehouse and carry their own scripts and styles; there is no front-end build step and no framework. A page
build is reused only while it is less than 20 seconds old and the warehouse tables it reads have not changed, so no
page opens out of date after a diagnosis writes to the record.

Long-running work (an argument between agents takes minutes) runs on a background thread per session. The page
follows it through a server-sent event stream keyed by the session's event sequence number, so a dropped
connection resumes exactly where it stopped, and one shared poller tells every open page which runs are live.

### 3.4 The record is the source of truth

Everything the console does is an event in an append-only log, one session per object (a server, a client, a
problem). A Job is not a table. It is a reading of that log: the operator event that dispatched the agents, the
agents' turns and claims, the case they built, the scripts they issued, the issues they wrote, and the events that
closed them. Because the log is append-only and every projection is rebuilt from it, a restart cannot corrupt a
Job, and a run that a dead process left open is found at boot, marked stopped, and offered for resumption.

The log has one rule that runs through the whole platform: **absence is not zero.** A script with no returned
output is "not returned", never "returned empty". A capture that could not read a section says so, and that is
kept apart from "measured and found nothing". A missing setting for the AI switch reads as off.

---

## 4. Data engineering: from a PowerShell capture to one list of problems

### 4.1 The collector

The collector is a 4,021-line PowerShell script (version 5.3) that runs on each Windows server through the
remote-management tool the team already uses, or directly on the console. It captures 47 sections of configuration
and state: hardware and firmware, the operating system and its servicing stack, patches, services and their
accounts, listening ports, scheduled tasks, local and domain accounts, group membership, shares and NTFS
permissions, all four certificate stores, the host firewall, DNS, time, event logs, backup and volume shadow copy
state, disk health, BitLocker and TPM, Kerberos delegation, LAPS, LSA protection, SMB, TLS and RDP posture, WinRM,
installed software, and more.

It is designed around one rule: **it captures what an engineer needs to reason about credential exposure, and never
the credentials themselves.** It reads password-set timestamps, service principal names, encryption types and
NTLM compatibility levels. It does not read passwords, hashes, LSA secrets or DPAPI keys.

### 4.2 Ingestion

Three inputs go in, in a fixed order, through one drop on the Add data page:

1. **The device roster** (an export from the remote-management portal). It defines which clients and servers
   exist, and nothing else can be saved until it is in.
2. **The collector's capture.** One text file may hold hundreds of servers. The parser splits it by host, strips
   the remote-management tool's wrapper text, matches each host to the roster, and stores the parsed sections.
3. **The firewall exports.** Each WatchGuard XML export is parsed, audited by the full engine, and stored with its
   canonical audit in one transaction, keyed to its client.

The parser tolerates missing sections, partial sections and version drift between collector versions without
dropping data, and it records what it could not read rather than defaulting it. Host names arrive uppercase in one
source and lowercase in another; every join between them is case-insensitive, in the browser as well as on the
server.

### 4.3 One finding shape

The two pillars produce findings in different ways. The server judges are functions over a parsed capture; the
firewall engine is a set of checks over a normalized configuration model. An adapter maps both into one finding
shape (what was found, why it is true on this machine, the evidence lines, what would make it wrong, the fix), and
every consumer reads that shape. The judges and the engine were never rewritten to fit each other; the shape sits
between them.

On top of that shape sits **one list of problems**. The judges find what they were written to find. The agents,
reading a server's whole capture, find the rest. Both land in the same list, one page per problem, worst first. An
issue has exactly one home (a server and an area), an issue an older open Job already holds is shown as "already
open" there rather than filed twice, and a problem found at two or more clients becomes a Global: a single brief
for the team's project list rather than a separate ticket per client.

### 4.4 Stable identity

A finding that is renumbered between two audits cannot be tracked, compared or reopened. Findings therefore carry a
content-derived identity: a registry of 91 signature recipes, one per finding type, each declaring which target
fields and anchor fields identify it. The identity is the SHA-256 of the recipe and those normalized values. The same
finding on the same target produces the same identity on every run; a different certificate, policy, listener or
server produces a different one. Recipe identifiers are permanent: renaming one would orphan every record that
refers to it.

### 4.5 Four invariants

Four rules hold across every layer, and each exists because breaking it once produced a wrong client deliverable:

1. **Evidence first.** A report renders the named entities behind every count. "Eight expired certificates" without
   the certificate subjects is incomplete, however well it is laid out.
2. **Comprehensiveness.** A firewall audit is the whole firewall. There is no "top ten"; navigation layers over the
   complete content and never replaces it.
3. **Granularity preserved.** Every field the collector captures survives capture, parsing, the page and the report
   without collapsing into a count.
4. **Commercial boundary.** Client-facing reports carry no pricing, cost or margin content. The engineer's view
   carries all of it. A test walks the rendered report and fails on any currency amount outside an engineer-only
   container.

---

## 5. Network engineering: the firewall audit engine

### 5.1 Model and parser

The firewall pillar reads WatchGuard Fireware configuration exports. The parser builds a normalized model of the
device: policies in their true processing order, aliases resolved to their members, service objects, NAT
translations, interfaces and zones, IKE and IPsec policies, VPN tunnels, accounts and authentication servers,
subscription services, and management settings. XML is parsed with a hardened parser, and the engine for each
upload is its own instance, so two engineers auditing at once can never overwrite each other's device.

### 5.2 The 52 checks

| Area | Checks |
|---|---|
| Rule base | overly permissive rules, shadowed rules, duplicate rules, unused and disabled rules, unattached and sparsely used objects, policy logging, configuration hygiene |
| Exposure | internet-facing services, dangerous ports, NAT exposure, deep NAT follow-through, remote access portal, geo-blocking posture |
| Cryptography and VPN | VPN security, VPN algorithms, tunnel scope, L2TP, SSL VPN, mobile VPN identity, TLS profiles |
| Management plane | management access, SNMP, logon banner, authentication posture, directory transport, credential exposure, plaintext integration credentials |
| Inspection and threat services | HTTPS inspection, proxy coverage, IPS, antivirus, advanced threat services, WebBlocker, application control, HTTP/3 and QUIC posture, DNS egress posture, DoS prevention, anti-spoofing |
| Resilience and routing | HA failover state, dynamic routing posture, IPv6 posture, wireless posture, missing security features |
| Vulnerability intelligence | firmware correlation against the known-exploited vulnerabilities catalog |
| Traffic-log analysis | traffic anomalies, denied patterns, policy hit correlation, geo-IP risks, command-and-control beaconing, lateral movement, blind spots |

Eight checks read traffic or device logs (the traffic-log group, plus unused and disabled rules, which needs hit
counts). When the logs are not supplied, the audit states which checks did not run and why, rather than presenting a
narrower audit as a complete one.

### 5.3 The analysis that matters

Three pieces of network analysis do most of the work that a rule-by-rule reading cannot:

- **Precedence simulation.** Policies are evaluated in the order the device evaluates them, with aliases resolved,
  so a rule that can never match because an earlier rule already takes its traffic is found as a shadowed rule.
  The detector compares the address space the aliases resolve to. An earlier version compared alias names, which
  are unique per policy, so it could never match and never fired.
- **NAT follow-through.** An exposure is not the policy port. A static NAT can publish an internal RDP host on a
  non-standard external port, and a policy-level check that looks for port 3389 will see nothing. The engine follows
  the translation to the real internal host and service, and names both.
- **Attack-chain correlation.** Findings that are individually moderate can compose into a path: an exposed
  service, a weak authentication posture behind it, and no inspection in between. The engine correlates findings
  into chains and tags them with MITRE ATT&CK techniques.

### 5.4 Compliance mapping

Every finding maps to the controls it affects across four frameworks, and every control's status (pass, fail, or not
applicable because the data is not present) is derived from the findings rather than asserted:

| Framework | Controls |
|---|---|
| PCI DSS v4.0 | 11 |
| CIS Controls v8 | 12 |
| NIST CSF 2.0 | 14 |
| CMMC 2.0 | 13 |

A positive finding (a service confirmed enabled and active) affirms its control rather than failing it. That
distinction was a defect once, and it is now a rule of the mapping.

### 5.5 At scale

Run over the 36 WatchGuard exports available for this measurement, the engine produced 1,415 findings: 184 critical,
260 high, 352 medium, 307 low and 312 informational. Every one carries the configuration evidence that raised it and
the policy it concerns, cited by the number the device's own management interface shows.

The engine's output feeds a 19-chapter client report and the firewall's page in the console, which can reopen the
stored report at any time.

---

## 6. Server architecture: what the judges read

The server pillar's 55 judges are deterministic functions over a parsed capture. Each one raises a finding only when
the capture establishes it, names what would make it wrong, and files it into one of nine areas of a server:
endpoint agents, network path, session host, identity and name, OS and resource, hardware, third-party software,
policy, and outside the host.

| Area of concern | Representative judges |
|---|---|
| Identity and Active Directory | Domain Admins sprawl, unconstrained delegation, Kerberoastable service accounts, LDAP signing not required, legacy domain functional level, stale user and computer accounts, WDigest credential caching, services running as domain users or local administrators |
| Exposure and protocols | legacy SMB, legacy TLS, RDP without Network Level Authentication, WinRM Basic authentication, WinRM trusted-hosts wildcard, exposed database or cleartext services, host firewall off or open, custom rules opening risky ports, legacy name resolution, public DNS resolvers on domain members, unsafe dynamic DNS updates |
| Endpoint protection | no real-time protection, two endpoint products active at once, stale signatures, third-party remote access installed, Print Spooler on a domain controller |
| Resilience and recovery | no backup agent, unhealthy VSS writers, disk errors in the system log, volumes critically low, memory pressure, virtual machines in a critical state |
| Lifecycle and servicing | end-of-life operating systems and SQL Server instances, end-of-life software, stuck servicing stack, automatic updates disabled, unsupported firmware age, certificates expiring without replacement |
| Configuration hygiene | volume encryption absent, Secure Boot disabled, unrestricted PowerShell execution policy, legacy PowerShell engine, Telnet client present, broad share permissions, shares owned by deleted accounts, roles installed and never used |

Eighteen judges also declare a named doubt: a condition the capture cannot settle on its own, such as whether a
legacy protocol is still in use by something on the network. Those doubts are what the agents' tests are built to
settle (Section 8). Thirty-nine judges carry a remediation, so a finding the engineer wants fixed without a
diagnosis can go straight to a Change Job whose issues come from code rather than a model.

---

## 7. Agentic orchestration: the adversarial diagnosis

### 7.1 Why one agent is not enough

A model asked "what is wrong with this server" commits to an answer and then defends it. Asked to check its own
proposal, it agrees with itself. In a real investigation the most expensive fault is the one everybody agreed on,
because an over-determined problem (several independent faults that can each produce the symptom) hides behind the
first plausible cause.

The platform's answer is to separate the roles and give each a different success condition. Retractions that took
an engineer a day by hand now happen inside the same run.

### 7.2 The protocol

```mermaid
sequenceDiagram
    autonumber
    participant E as Engineer
    participant A as Application
    participant P as Proposer
    participant C as Challenger
    participant R as Arbiter
    participant W as Writer
    E->>A: Start a Job on a server, an area or a fleet
    A->>A: Build evidence cards and price every seat against the ceiling
    A->>P: The capture and the evidence cards
    P-->>A: Candidate causes, streamed line by line
    A->>C: The capture, the evidence and the proposer's candidates
    C-->>A: Downgrades, exonerations and missed causes
    A->>R: The capture and both positions
    R-->>A: A ruling on every candidate, disputed ones first
    A->>W: The rulings, the findings and the case
    W-->>A: Issues grouped by what settles or fixes them
    A->>A: Strike anything the rulings do not support
    A-->>E: Issues on the Job page, filed under problems
```

- **The proposer** enumerates candidate causes exhaustively, across all nine areas. A cause it thinks unlikely still
  goes on the tree at a low status, because the value of the tree is that the whole solution space is visible.
- **The challenger** is told that its task is not to agree. It receives the proposer's candidates and attacks each one
  it can, with evidence: usually a downgrade, and "exonerated" when the capture actually rules the cause out. It is
  told not to downgrade what it cannot attack, and to add the causes the proposer missed.
- **The arbiter** receives the capture and both positions and rules on every candidate either seat raised, naming the
  evidence that decided each dispute. It may rule that two candidates are the same fault on different machines, or
  that one is a consequence of another. It is told not to split the difference.
- **The writer** turns the rulings into issues: what was found, what it does, and what to do, grouped by what settles
  or fixes them (the same test settles them, or the same change closes them), in the order an engineer works them:
  tests first, then fixes, then questions for the client, then projects.

### 7.3 The claim as a contract

Every agent writes candidates in one fixed line format:

```
CANDIDATE: <id> | <area A-I> | <symptom> | <status> | <hypothesis> | <evidence> | <hosts>
```

and every status has one meaning:

| Status | Meaning |
|---|---|
| confirmed | The capture establishes that the fault is present. |
| strong | It leads, and something still has to prove it. |
| plausible | It fits, and nobody has tested it. The honest state of most of a real investigation. |
| weak | Noted, minor, and would not change what anyone does. |
| exonerated | Tested and ruled out by evidence in this capture, which must be named. |

A candidate is always written as the fault, never as its negation, so "confirmed" always means the fault is present.
That rule came from measurement: when agents were allowed to write "memory is not a contributor", a later seat
promoted it to "confirmed", and the page listed a healthy subsystem among the confirmed faults.

The format is deliberately six fields and no more. Every extra field is one more thing a line can get wrong, and a
malformed line is a lost hypothesis. Code parses the lines; the model never decides what the page shows.

### 7.4 Designed for truncation

The arbiter's work grows with the number of candidates, and a real server can produce dozens. Its output can be cut
off at a length limit. The protocol makes that failure graceful rather than silent:

- The tree is folded by **last assertion wins**, so a candidate the arbiter never reaches keeps the status the
  earlier seats gave it. That is a true statement about the investigation, not a gap.
- The arbiter is told to rule on **disputed candidates first**, so a cut loses only the candidates nobody was
  arguing about.
- Every seat is told to **lead with its lines** and put commentary after them, so a truncation never destroys a
  seat's entire contribution.

### 7.5 Context engineering

Each seat reasons over **evidence cards** built by code, and every claim must cite a card:

| Card | Contents |
|---|---|
| F | The server's judged findings: what, why, the evidence, and what would make it wrong |
| P | How the server differs from its peers (same client, same role): services, software, endpoint products, DNS servers, pending reboot, uptime |
| E | The last critical and error events the capture kept, and event sources compared with the peer median |
| M | What the capture could not say, kept apart from what it measured and found clean |
| N | The client's standing notes: what must not be touched, and why |

A seat that needs more context can ask for it in the same fixed format (`NEED: <host> | <reason>`), and the platform
supplies a neighbor's capture within the cost ceiling. The capture itself is never summarized or truncated to fit a
budget: a digest hands the model the statistic and throws away the evidence, so a seat that cannot be afforded in
full is refused instead.

### 7.6 Holding the output to the evidence

Three agents exist only to hold other agents to evidence, and code makes the final decision in each case:

- **The writer is held to the rulings.** An issue that names a machine, a number, a path or a quoted name that is not
  in the rulings, the findings or the case is dropped and reported, never kept. Ruling identifiers and finding keys it
  does not recognize are struck.
- **The checker holds a reading to its output.** When the engineer pastes a test's output, a principal agent rules
  causes confirmed or ruled out. The checker sees only the raw output and those rulings, and must quote, for each
  ruling, the line of the output that shows it. Code then keeps a ruling only if its quoted line is really in the
  output. What the output shows that no ruling addresses comes back as new, untested candidates.
- **The reviewer checks a fix before it is offered.** It reads the server's capture, the case and the change in its
  four parts, and objects only on the machine's own evidence: a backup that saves nothing the revert can use, a revert
  that does not restore, a verification that cannot see the fault, dependencies of what the change touches, and
  whether it runs under Windows PowerShell 5.1 as SYSTEM. A blocking objection to the backup or the revert holds the
  fix; a change that cannot be undone is not offered on a promise.

A fourth, the **describer**, runs on a cheaper model and does only one thing: it names the problem a ruling states,
so the same problem on another server files with it. It rules on nothing and adds nothing to an issue's evidence.

### 7.7 Live orchestration

Claims are drawn as the agents write them. The model's streamed text is read line by line as it arrives; each
completed candidate line is parsed and handed to the page, where it appears as a provisional mark on its seat's
lane and in the Job's board ("3 claims so far" and the newest title). The writer's issues appear as rows while it
writes them. When a seat finishes, its claims are saved to the record with the moment each was written, and the
provisional marks become permanent.

In-flight claims live only in the run's memory. A claim counts only when its seat finishes, so a stopped or failed
seat saves nothing half-written, and every reader of the record sees exactly what it saw before live drawing
existed.

---

## 8. From diagnosis to verified fix: the issue lifecycle

### 8.1 The lifecycle

```mermaid
stateDiagram-v2
    [*] --> NeedsTest: an issue to settle
    [*] --> NeedsFix: an issue to fix
    NeedsTest --> TestIssued: agents write a read-only test
    TestIssued --> TestReturned: engineer runs it and pastes the output
    TestReturned --> Settled: courier verifies, checker holds the reading
    Settled --> NeedsFix: fault confirmed
    Settled --> Closed: checked, not a problem
    NeedsFix --> Proposed: agents write the fix
    Proposed --> Held: reviewer blocks the backup or revert
    Held --> Proposed: fix rewritten
    Proposed --> Approved: engineer approves
    Proposed --> NeedsFix: engineer refuses
    Approved --> Verified: engineer runs it and pastes the output
    Verified --> Closed: closed as fixed
    Closed --> Reopened: next capture still raises it
    Reopened --> NeedsFix
```

The engineer can do everything from the issue's own page: ask the agents for a test or a fix, copy the script, paste
the output back, approve or refuse, and close with a reason. The agents' answer lands on the same page.

### 8.2 Tests that settle one doubt

A test is not an improvised script. It is built from a **target pack**: a named, reviewable collection that exists to
settle one disclosed doubt, and whose rule is that a pack with no doubt to settle is a fishing trip. That rule came
from measurement. Measured across the live estate in September 2026, doubts the judges could already settle from the
capture accounted for 83 findings; doubts only the machine could answer accounted for 770. Only the second kind
earns a pack.

Every pack is read-only and declares it in its first line, carries a manifest of the sections it attempted and
returned, and is addressed by host name and doubt identifier, never by a database row number that could name a
different record in another database. The shape is borrowed from digital forensics collection tooling: curated,
named, composable targets that a person can review in one line ("settle this doubt on this server: six checks,
read-only") instead of forty lines of PowerShell.

### 8.3 Chain of custody

```mermaid
flowchart LR
    ISS["Issue a script under a run token<br/>token scope: host, pack declaration, body hash"] --> RUN["Engineer runs it on the server"]
    RUN --> PST["Engineer pastes the output"]
    PST --> TOK{"Token known and outstanding?"}
    TOK -- no --> REJ["Refused on the spot, no model call"]
    TOK -- yes --> SHA{"Output carries the same script hash?"}
    SHA -- no --> REJ
    SHA -- yes --> MAN{"Manifest complete?"}
    MAN -- "cut off" --> PART["Read as incomplete, never as complete"]
    MAN -- yes --> REB["Rebuild the pack from the token's declaration"]
    REB --> CHK["Checker holds the reading to the output"]
    CHK --> EVD["Evidence on the issue"]
```

The courier makes issuing and returning one transaction. The pack is always rebuilt from the token's own scope and
never taken from the caller, because a caller that supplies a pack on return could supply a different pack from the
one issued, and every check would then be read against the wrong questions without any error, since the shapes
match. The script hash is the chain of custody: it proves that the script that ran is the script that was
approved. A paste that is not the issued script's output is answered immediately, without a model call.

A returned test is evidence, never a remediation. The distinction is encoded, not named: a read-only pack cannot mark
anything as fixed, because if a diagnostic return could, every collection would flip its findings to "resolved" the
moment the loop began to run.

### 8.4 Fixes with four parts

A fix is a **remediation pack**, and a pack without all four parts is refused:

| Part | Behavior |
|---|---|
| Backup | Runs always, even in preview. A backup that only runs when the change applies has no backup at the moment one is needed. |
| Apply | Runs only when the engineer sets one variable. The script ships inert. |
| Revert | The literal command that undoes the change, printed into the transcript so it survives whether or not anyone kept the console. A pack may declare the change not reversible, and the proposal then says so where the engineer cannot miss it; it may not leave the field empty. |
| Verify | Runs before and after the change, so the transcript carries both states. |

A script analyser classifies every script, test or fix, into one of three states: reads only; changes, with each change
listed as a plain sentence ("stops the Print Spooler service, sets one registry value"); or unreadable, when any
token cannot be classified. Unreadable is shown most prominently, because it is the one answer nobody can check.
The analyser uses an allow list rather than a deny list: a deny list is never complete, and an allow list fails in
the safe direction by refusing to describe some legitimate scripts rather than calling an unsafe one safe.

### 8.5 Closing and reconciling

An issue closes with one of a fixed set of reasons: fixed, the client accepts the risk, on the client's plan, not
ours to fix, the client answered, checked and not a problem, or a duplicate. A decision (accepted, planned, not ours,
answered, checked) holds for 90 days by default, or until the finding becomes worse than it was when decided, and the
page keeps listing it as still present.

When a new capture arrives, the platform reconciles every Job on that machine against what its judges now raise.
An open issue whose findings a complete new capture no longer raises closes as fixed. An issue closed as fixed whose
finding is still raised reopens: the fix did not hold. A capture that is incomplete closes nothing, because a judge
that cannot see its input raises nothing, exactly as it does on a clean machine. This is how a risk register treats a
decided risk: on record, on a clock, and back on the list the moment it grows.

---

## 9. Cybersecurity: the safety model

The platform acts on client infrastructure, and its safety model is built so that the strongest guarantees are
structural rather than procedural.

| Threat | Control |
|---|---|
| An agent changes a client system | There is no transport. No module can open a session to a host; a test asserts that the console runner imports nothing capable of execution, and the courier is held to the same rule. The engineer runs every script. |
| A diagnostic script mutates a server | Test packs are read-only by construction and refused at build time otherwise. The script analyser lists every change a script makes, or marks it unreadable. |
| A fix cannot be undone | A remediation pack requires a backup that always runs and a literal revert command. The reviewer's blocking objection to either holds the fix. |
| A fix runs without approval | Fixes ship inert, and a proposal is offered to the engineer, who approves or refuses it on the issue page. Every decision is an event in the log. |
| Pasted output is forged, altered, or from another script | Run tokens, script hashes and manifests; the pack rebuilt from the token, never from the caller. |
| An agent invents facts | Fixed claim format parsed by code; the writer held to the rulings; the checker held to quoted lines; unknown identifiers struck. |
| Secrets leak | The collector captures no credentials. The API key is encrypted at rest. A scrubber redacts key, header, JSON and bearer-token patterns from any string headed to a page, a log or a response. A plaintext integration credential in a firewall export is fingerprinted at extraction, so the raw value never reaches the parser's objects or a report. |
| Malicious configuration files | XML is parsed with a hardened parser that refuses entity expansion. |
| The AI runs when it should not | One master switch, off by default. A missing, corrupt or non-literal setting reads as off, never as a default that something later overrides. |
| Client pricing leaks into a deliverable | The commercial boundary: client-facing HTML carries no currency amounts outside engineer-only containers, enforced by a test that walks the rendered document. |
| The model is asked to produce offensive content | Every agent's instructions state who the work is for and that it is defensive: describe a weakness in the terms needed to fix it, never the steps to exploit it. |

Two principles run through all of it. The first is that **the human gate must be informed to be real**: a
"mutating: true" flag tells an engineer to be careful, while a list of what the script changes tells them what to
check. The second is that **a guard must fail toward the safe state**: an unknown model is priced at the most
expensive rate, an unreadable setting is off, an unclassifiable script is unreadable, and an incomplete capture closes
nothing.

---

## 10. Model governance: routing, refusals and cost

### 10.1 Which model does what

| Model | Role |
|---|---|
| Claude Opus 5.5 | Every diagnostic seat, the writer, the checker, the reviewer and the console |
| Claude Opus 5 | The fallback when Opus 5.5 declines a request |
| Claude Sonnet 5 | Description only: a problem's name, a brief field. It never diagnoses. |

There is no small-model tier. Cost is governed by the ceiling and by deciding whether a call runs at all, never by
lowering the quality of the model that does the reasoning.

### 10.2 Refusal routing

Frontier models decline some security synthesis, and a diagnostic platform for security configuration will meet
that regularly. The platform handles it as a routing problem, openly:

```mermaid
flowchart TD
    Q["A call for a seat, the writer, the checker or the reviewer"] --> G{"AI switch on?"}
    G -- "no, or unreadable" --> X["Refused and recorded, no call"]
    G -- yes --> B{"Priced within the ceiling?"}
    B -- no --> Y["Seat refused; the capture is never truncated"]
    B -- yes --> H{"Opus 5.5 declined this content before,<br/>or 2 of its last 3 calls of this kind?"}
    H -- no --> O["Send on Opus 5.5"]
    H -- yes --> F["Send on Opus 5 first<br/>(every 10th call retries Opus 5.5)"]
    O --> R{"Declined?"}
    R -- yes --> F2["Resend once on Opus 5"]
    R -- no --> L["Record the call and its price"]
    F --> L
    F2 --> L
```

A refused request is resent once on the fallback model. After that, calls for the same content (one server's session)
or the same kind of work (a seat, the reviewer) go to the fallback first, and every tenth such call tries the primary
model again, so a model that starts answering is noticed. A refused call is priced at the dearer of the model asked
and the model that answered. The platform never rewords a request to get past a model's safety classifier; the
legitimate route for security work of this kind is the model provider's verification program.

### 10.3 Cost control

- **Priced before sent.** Every seat is priced before it is sent against a ceiling of $8.00 for the whole argument,
  sized to hold the capture, two neighbor captures and one resend.
- **One ledger.** Every model call writes one row to a call ledger beside its log line, with the session, the
  purpose, the model, the tokens, the cache reads and writes, the stop reason and the price, so the database and the
  log always hold the same calls at the same prices.
- **One source of truth for models and prices.** Before it existed, the codebase held 49 hard-coded model identifiers
  across 13 files and two pricing tables that disagreed by a factor of 3.2 for the same model. Now one module owns
  identity and pricing, and an unknown model is priced at the most expensive rate, because over-charging produces a
  visible early stop and under-charging produces a silent overrun.
- **Measured, never recalled.** Spend is read from the ledger and the logs. The paid model calls made to build and
  prove the v8 release line, as recorded, cost $122.37 in total.

### 10.4 Testing without spending

Every agent flow was built and proven first against a local stand-in for the model API that streams scripted
responses line by line at a chosen pace. On request it returns rate-limit, overload and authentication errors, a
credit-exhausted error, a stream cut mid-answer, a reply stopped at the length limit, a refusal, an empty reply or a
malformed write-up, and it can answer slowly enough that a test watches claims arrive mid-seat. Its costs are
marked as pretend. Paid calls were reserved for proofs that only a real model can give, each with a budget set in
advance.

---

## 11. The engineer's surface

### 11.1 Pages

| Page | What it does |
|---|---|
| Home | The inbox: what is waiting on the engineer, agents at work, servers ready to start |
| Findings | One list of problems, worst first, one page per problem |
| Clients, and a client's page | A fleet's problems sorted by shape: one change fixes it everywhere, spread across the fleet, or on a few machines |
| A server's page | Everything wrong on that machine, its capture section by section, and the Diagnose control |
| Firewalls, and a firewall's page | The device, its findings, its policies, and its stored report |
| Jobs, a Job's page, an issue's page | The work: the board of seats, the argument drawn live, the issues, and each issue's steps to a close |
| Add data | The three inputs in order, with what each file contributed and what it could not read |
| Settings | The AI switch and key, and only controls that work |

### 11.2 The console and the drawing

Every page carries a console bound to that page's object: a server, a client, a problem or a Job. The engineer can
ask a question, steer the next agent ("member servers only"), or stop a run in flight. The console's left pane lists
every session with a live run, including runs started from another page or another browser tab, within seconds.

The argument is drawn as it happens: one lane per seat, each claim a mark placed at the moment it was written, its
shape and color carrying its status, and a thread connecting a claim's status across the seats that ruled on it. A
Replay control plays a finished argument back in time.

### 11.3 The guide

Every page names the one thing to do next and draws a line to it: "Copy the script and run it on this server",
"Read the reviewer, then approve the fix", "Open the report". The guide exists because the target user is a colleague
who opens the application for the first time and has to know how to start working on servers.

### 11.4 The design system

The console follows a written design system and a ratified set of templates, checked by a lint that runs with the
release gates: a near-black ground with bone-colored ink, a serif face for narrative text, a sans-serif face for
labels, a monospaced face for figures, and one perceptually uniform color ramp (defined in OKLCH) reserved for
severity, so color always means an exception and never decoration. Every count on a page opens to the named entities
behind it.

---

## 12. DevOps and release engineering

### 12.1 One file

The platform is built with PyInstaller into one executable of 68,995,857 bytes. The console's modules are bundled as
data rather than analyzed as code, which means the packager cannot see what they import; a guard derives the list of
hidden imports from the source so the build cannot silently omit one. A second check scans the runtime tree and fails
if anything opens or defaults to a path outside the bundle and the data folder. Paths that are harmless from source
can be wrong when frozen, so every release is proven on the built executable, not only on the source.

### 12.2 The release pipeline

```mermaid
flowchart LR
    B["Work on the branch<br/>each piece proven on the stand-in"] --> S["Full suite in three processes"]
    S --> G["Release gate<br/>6 sub-gates"]
    G --> H["19 standing harnesses"]
    H --> P["Both client report proofs"]
    P --> X["Build the executable"]
    X --> W["Walk it from an empty folder<br/>every page, every act"]
    W --> K["Package with its SHA-256"]
    K --> M["Merge, tag, push, release<br/>each on the owner's approval"]
```

- **The suite** (13,875 tests) runs in three sequential processes so that peak memory stays at a third of a single
  run on the development workstation.
- **The release gate** has six sub-gates: an exemplar voice score for generated prose, a rendered report review,
  prompt-library coverage, a compliance-gap inventory, a dependency vulnerability audit, and template syntax
  validation. It exits non-zero on any failure.
- **The walk** starts the built executable from an empty folder and drives it the way its buttons drive it: the
  splash, the three inputs, a firewall audit and its reopened report, a Diagnose started from Home, the agents'
  claims captured mid-seat, a test asked for and pasted back on the issue page, a fix reviewed, approved and run, and
  the issue closed. Every page must show its next step and throw no error.
- **Every release is tagged**, its notes are written before the tag, and earlier releases remain available so that
  any version can be fallen back to. A pre-push hook in the repository refuses every push to the release branch;
  its override is used only at an approved release, by the owner.

### 12.3 Schema evolution

The warehouse is SQLite with 17 migrations, each forward-only, transactional and idempotent, keyed on a schema
version row. A failed migration rolls back to its pre-migration state. A test fixture runs the whole migration chain
against a disposable database for every test that needs one.

---

## 13. Verification: measurement over assertion

### 13.1 Why the harnesses exist

At one point in the platform's history, 85 rendered-output invariants, all six release gates and roughly 12,300 tests
passed at the same time as a domain controller exposed to a well-known print-spooler vulnerability scored 100 and
"Healthy" on the engineer's dashboard. Every verification surface said the product was correct, and the product was
not correct.

The response changed what gets verified. The 19 standing harnesses do not re-run the test suite. They prove that
specific defects stay closed and that rendered output matches its evidence, and they print the evidence beside every
verdict.

### 13.2 The forensic campaign (historical, August 2026)

I then stopped building and audited the platform against itself: a complete read of both pillars, 1,313 findings
triaged, and about 86 fixes. Every fix's expected measurements were written down before the edit, so a prediction
could not be adjusted to fit its result. **66 predictions held and 32 were refuted**, and several refutations stopped
fixes that would have made the product worse: one recorded prescription would have shipped 69 false high-severity
findings, another would have hidden a real exposure on 176 hosts.

Representative findings, each measured rather than inferred:

- A delivered firewall report stated that no internet-facing RDP exposure existed, while nine enabled policies
  published RDP to named internal hosts through static NAT on non-standard external ports. The port check was
  correct and saw nothing; the only check that followed the NAT translation was unreachable. Corrected, that one
  sentence became ten critical findings naming the terminal servers.
- Every server in every delivered site report was banded critical, because a certificate condition read all four
  certificate stores where its own comment said it read the Personal store. Windows accumulates expired root
  certificates, so the condition was true on every host, and every other threshold in the function was unreachable.
- A regular expression that crossed a line break bound 829 parsed fields to the next field's label.
- Finding identifiers were list positions, and 25 of 26 changed meaning between two runs. Making them content-derived
  (Section 4.4) made the entire back catalogue comparable.
- Two concurrent uploads under a multi-threaded server could save one client's configuration under another client's
  name. Four obvious fixes were each ruled out by measurement before the one that worked: a per-request context
  registry behind a forwarding proxy that left all 97 call sites unchanged.

The bias the refutations revealed is the finding I value most: almost every wrong prediction assumed the platform
was worse than it measured. Knowing that changes how I read my next hypothesis.

### 13.3 Rules that came out of it

1. **Measure before filing.** Reading both ends of a data path proves a defect can happen; only measurement proves it
   does.
2. **Suspect the instrument first.** About thirty measurement errors were caught during the campaign, including a
   pattern that matched "NOT INSTALLED" while looking for "INSTALLED". Each was caught because the evidence was
   printed beside the verdict.
3. **A zero is meaningful only once the instrument has been shown able to return non-zero.**
4. **Green tests prove structure, not truth.** The rendered artifact is opened and read.

### 13.4 What only the built executable shows

Walking the built executable from an empty folder has found defects that no test could, in every release since it
became a gate. For v8.0.0 it found a double-clicked executable that opened no browser window, a first diagnosis drawn
as not running for the three minutes its first seat reads, a tab strip that jumped 274 pixels when a pane shortened,
volumes under 20 GB flagged as full, and a module that wrote to a console the windowed executable does not have.
For v8.1.0, a walk of the release candidate by the product owner found that the console missed a run started on
another page, that claims arrived in one batch per seat rather than as written, and that asking for a test only typed
into the console. All three were rebuilt, proven on the stand-in, and walked again in the rebuilt executable before
the release.

---

## 14. Results

| Measure | Result |
|---|---|
| Estate in production use | 224 servers across 48 client organizations ingested and judged; the firewall pillar exercised across 36 device exports |
| Firewall findings on the export set | 1,415, each with configuration evidence and its policy number |
| A full paid diagnosis in the built executable (v8.1.0) | 4 calls on Opus 5.5, $2.21, 21 issues, each filed under a problem with a severity |
| A domain controller argued in full (v8.0.0) | $2.97; 16 of 17 confirmed claims stand on the capture's own lines, checked by hand against the raw capture |
| A 13-server client fleet argued in full (v8.0.0) | $3.68; its one error was a cautious one |
| A Global's brief for the project list | $0.0055 on Sonnet 5 |
| Paid model spend across the whole v8 verification program | $122.37 |
| Release quality | 13,822 of 13,875 tests passed, 0 failed; 6 of 6 gates; 19 of 19 harnesses; the executable walked with 0 dead ends |
| Delivery | 56 tagged releases in six months; every release reversible to its predecessor |

The team's baseline for a major audit was 60 to 80 hours of stitching vendor output. An audit run now takes minutes
from upload, and the engineer's time goes to the part that needs an engineer: deciding what to test, what to fix and
what to tell the client.

---

## 15. How I build

I built NinjaToolKit with Claude as an engineering partner, and the way that partnership is run is as much a part of
the work as the code.

**What I own.** The architecture, the domain judgment (what a server's configuration means, what an MSP engineer
needs at two in the morning), the safety model, the invariants, and every decision that cannot be undone: a merge, a
tag, a release, a change to a prompt, a paid call. The model writes and revises code at a volume no single engineer
could, and I hold it to a process I designed.

**The process.**

- **A plan before building.** Every phase starts as a written plan that I approve. Continuing work covers only the
  plan that was approved; anything new comes back as a proposal.
- **A durable project record.** The position (a tracker of every phase and item), my standing rulings, and the design
  system live in files in the repository, not in a conversation. A new working session starts by reading them, so
  decisions survive context limits and model changes.
- **Predictions before edits.** For defect work, the expected measurements are written down before the change and
  never adjusted afterwards.
- **Proof at three altitudes.** Targeted tests for each piece; a live run against the stand-in model API for every
  agent flow; and a walk of the built executable from an empty folder before anything is called done.
- **Human gates on irreversible actions.** Destructive git operations, pushes to the release branch, tags and releases
  wait for my explicit approval at that moment; approval never carries forward. The repository enforces the release
  branch with its own hook.
- **Measured, never recalled.** Every number in a status report, a release note or this document is the output of a
  command run at the time.

**Why it matters for the work I do.** A forward deployed engineer's job is to take frontier models into a real
operating environment and make them produce reliable work there. This platform is that problem at small scale: an
environment with real constraints, real clients and real cost, where the model's output has to be held to evidence by
code and the human has to stay in control of everything that touches production. The same discipline that makes the
product's agents trustworthy is the discipline I used to build the product.

---

## 16. Lessons

1. **Separate the roles, and give each a success condition the others cannot satisfy.** The challenger's value is
   that its task is to break the proposal. Asking one model to be both author and critic produces agreement.
2. **Parse, do not trust.** The fixed claim format, parsed by code, is what makes every downstream guarantee possible:
   holding the writer to the rulings, holding the checker to quoted lines, folding the tree deterministically.
3. **Design for truncation.** Output limits are a certainty at scale. Ordering the work (disputed claims first, lines
   before commentary) and folding by last assertion turns a cut-off reply into a true, smaller result instead of a
   corrupted one.
4. **Keep the human gate informed.** A gate is only real if the person at it knows what they are approving: the list of
   changes a script makes, the reviewer's objections first, the revert command in plain view.
5. **Fail toward the safe state.** Every guard in the platform has a default, and the default is the one that stops or
   refuses: unknown models priced high, unreadable settings off, incomplete captures closing nothing.
6. **Absence is not zero.** Not returned is not empty; not measured is not clean; not raised by an incomplete capture is
   not fixed. Most of the platform's historical defects were one of these confusions.
7. **Refusals are a routing problem.** Frontier models will decline some security work. Detect it, route around it
   openly with a recorded reason, re-test the primary model periodically, and never disguise a request.
8. **The artifact is the test.** Green suites have coexisted with wrong output in this codebase more than once. The
   built executable, walked from nothing, and the rendered report, opened and read, are the final checks.

---

## 17. What comes next

The next release line is planned and not yet built:

- **Sign-in.** Every engineer's name on every action, and a password before the application is opened beyond a single
  office network.
- **Tests written during the diagnosis.** Today the agents write a test when asked; the writer will produce the first
  test for each issue as part of the diagnosis, which changes a reviewed prompt and needs its own paid proof.
- **Cheaper tests.** A test currently reads the whole server capture; a test that reads only the sections its issue
  needs will cost a fraction, to be proven with a measured before and after on real runs.
- **The report AI.** The layered narrative pipeline for the client reports is built and parked, pending its own review.
- **A reopened firewall report that carries the engineer's run.** Today a firewall's reopened report is the audit
  stored when the export was dropped; it will carry the engineer, the industry's compliance lead and the traffic-log
  checks of the run.
- **A third pillar for Microsoft 365 and Entra ID tenants**, built to the same shape: an ingest module, judges and
  report chapters against the same finding shape, inheriting stable identity, the agents and the issue lifecycle.
- **A transport, eventually, and only behind the same gates.** When a signed agent on the server replaces the
  engineer's copy and paste, the courier's shape does not change: a collection is identical whether a person pastes it
  or a daemon posts it.

---

## 18. Appendix: glossary

| Term | Meaning |
|---|---|
| Capture | The output of the PowerShell collector for one or more servers |
| Judge | A deterministic function that raises a finding from a capture |
| Finding | One thing wrong on one server or firewall, with its evidence, in the shared finding shape |
| Problem | A finding type as it appears across servers and clients; one page per problem |
| Global | A problem found at two or more clients, handled as one project |
| Job | One piece of work on one object, read from that object's event log |
| Seat | One agent role in the argument: proposer, challenger or arbiter |
| Candidate | One claimed cause, in the fixed line format, with a status |
| Ruling | The arbiter's final status for a candidate, with the evidence that decided it |
| Issue | A unit of work the writer made from rulings: a test, a fix, a question for the client, or a project |
| Doubt | A condition a judge names but cannot settle from the capture alone |
| Target pack | A read-only collection that settles one doubt |
| Remediation pack | A fix with backup, apply, revert and verify |
| Run token | The identifier a script is issued under and returned under |
| Courier | The part of the platform that issues and accepts scripts under run tokens |
| Stand-in | A local imitation of the model API used to test every agent flow at no cost |
| Walk | Driving the built executable end to end from an empty folder |
