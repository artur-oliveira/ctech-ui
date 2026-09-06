# CLAUDE.md — ctech-ui (npm `@aoctech/ui`)

This is a shared frontend package consumed (or meant to be consumed) by every CTech product UI —
breaking changes here should be versioned and communicated, not made casually.

Confirmed consumers today (grepped sibling `ui/package.json` files, read-only): **ctech-billing**
only (`^0.1.1`, 37 files under `ui/src` import from `@aoctech/ui`). `ctech-account`, `ctech-wallet`,
`ctech-dfe` and `ctech-poker` do not depend on this package — each vendors its own local component
set instead (e.g. `ctech-account/ui/src/components/ui/` has 15 hand-rolled ShadCN-style primitives).
This isn't a docs/quality problem: those four products' `ui/` predates this repo's initial commit
(2026-08-16) by two to five weeks, so they were never in a position to adopt it. `ctech-billing`'s
`ui/` was built alongside/after this package and picked it up from day one. Any migration of the
other four is a deliberate, separately-scoped effort, not a side effect of a docs fix.

## CTech Family — Cross-Repo Awareness (IMPORTANT)

This repo is one service in the CTech product family, not an isolated project. All CTech repos live under the same GitHub account and are meant to be treated as one codebase split across repos:

- ctech-cdk (github.com/artur-oliveira/ctech-cdk) — shared CDK constructs (EC2/ASG, DynamoDB, etc.)
- ctech-go-common (github.com/artur-oliveira/ctech-go-common) — shared Go libraries (HTTP client, auth, retries, websocket drain, caching)
- ctech-account, ctech-wallet, ctech-billing, ctech-dfe, ctech-poker — backend services
- ctech-ui (github.com/artur-oliveira/ctech-ui) — shared frontend design system / components (adoption in progress)
- ctech-ws-client (github.com/artur-oliveira/ctech-ws-client) — shared websocket client library
- ctech-oauth-client, ctech-vanity, ctech-lbalancer — supporting infra/clients

Before making a decision here, ask: "does this apply to the whole family, not just this repo?" Treat as cross-repo by default:
- Infra/runtime bugs (clock drift, spot interruption handling, websocket draining, health checks, load balancer behavior) — check ctech-cdk / ctech-lbalancer and sibling services for the same exposure before treating it as local.
- API leaks/perf/cost bugs (DynamoDB read/write amplification, KMS decrypt calls, SQS growth, N+1 requests) — check whether the root cause is shared code (ctech-go-common) or a repeatable pattern other services also have.
- Frontend state/websocket/resilience/UX patterns (reconnect, circuit breaker, error/loading/empty states, 404/500/503 pages, OAuth flow, modals, buttons) — check ctech-ui and ctech-ws-client for the shared version before implementing locally.
- New reusable code (not service-specific business logic) — default to proposing it for a shared package (ctech-cdk, ctech-go-common, ctech-ui, ctech-ws-client) instead of duplicating it here.

A fix scoped to only this repo, for a problem that is actually systemic across the family, is an incomplete fix. This applies to AI agents working in single-repo sessions too.
