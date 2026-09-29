# Specification Quality Checklist: Gemini Coach and Read-Only Tool

**Purpose**: Validate specification completeness and isolate the missing tool
contract before planning.
**Created**: 2026-09-29
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] The player value and bounded scope are described.
- [x] All mandatory specification sections are complete.
- [x] Gemini is limited to a server-side hint role after trusted facts exist.

## Requirement Completeness

- [ ] The tutor-provided tool contract, scope, fixture, and failure cases are named.
- [x] Input-before-call, authorization, output validation, safe errors, telemetry,
  retry, and cancellation expectations are testable.
- [x] Required negative paths and their zero-call or zero-retry expectations are
  explicit.
- [x] The single-tool and read-only scope boundaries are explicit.

## Feature Readiness

- [ ] The specification is ready for planning only after FR-001 is resolved.
- [x] The deterministic Core path is separated from the supplementary Gemini path.

## Notes

- Blocked by the absent tutor contract; do not invent `lookupReplay`, identifiers,
  scope, or fixtures from course examples.
