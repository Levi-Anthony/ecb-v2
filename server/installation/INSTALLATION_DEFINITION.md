# Installation — Definition

Installation is the establishment of a canonical system component, capability, artifact, configuration, or dependency as a distinct, identifiable, operational instance within its designated substrate, such that the instance has a determinable relationship to the canonical source from which it is derived and can be verified for the role it is intended to perform.

Installation is an architectural state, not merely an action or hosting event.

## Structural function

Installation is the boundary between what the canonical system specifies or intends to exist and what the operational system actually contains and can rely upon. It establishes durable correspondence between canonical design and operational reality without making the runtime substrate the conceptual owner of the installed thing.

## Required dimensions

1. Identity — what was installed.
2. Source/provenance — which immutable or otherwise determinable canonical source state produced it.
3. Materialization — required substance actually exists in the target substrate.
4. Dependency closure — dependencies required for the intended role are present and identified.
5. Operational standing — the installed instance is reachable/usable in its intended role.
6. Verification surface — the installed instance can be inspected or exercised sufficiently to establish what is actually running.
7. Receipt — durable evidence connects the installed instance to source, identity, and installation state.

## Discriminator

A source is not an installation merely because it is canonical or deployable. A deployment is not necessarily a characterized installation merely because it completed successfully. A runtime is not the installed thing merely because it hosts the thing. An operational instance whose source identity, dependencies, or actual installed state cannot be determined may be deployed or running, but its installation is not adequately characterized.

## Must not collapse with

Specification; Source; Deployment; Runtime; Availability; Verification; Receipt.

## Canonical questions

What exactly is installed? What source state produced it? What material exists in the target substrate? What dependencies are present? What establishes that this is the operating instance? What evidence distinguishes intended source from installed reality? Where is the receipt? What remains unknown at the required Master-Key resolution?

## Standing / provenance

Standing: QUALIFIED-CANDIDATE.

Origin: ECOS/ECB v2 architecture synthesis, refined 2026-09-15.

## Supersession history

Supersedes the narrower working formulation: “An executable capability with known semantic/dependency identity exists in operational substrate, and durable receipt connects installed instance to canonical source.”
