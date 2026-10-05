<!--
Sync Impact Report
Version change: 0.0.0 -> 1.0.0
Modified principles:
- Legacy principle 1 -> I. Browser-First, Static-Deployable Architecture
- Legacy principle 2 -> II. Vanilla JavaScript / ES6 Standards
- Legacy principle 3 -> III. Three.js as the Canonical 3D Runtime
- Legacy principle 4 -> IV. Security and Secret-Handling
- Legacy principle 5 -> V. Minimal Dependency and Simplicity
Added sections:
- Additional Constraints
- Development Workflow
Removed sections:
- None
Deferred items:
- TODO(RATIFICATION_DATE): confirm original adoption date.
-->

# DMG-S Constitution

## Core Principles

### I. Browser-First, Static-Deployable Architecture
All project functionality MUST run in a browser without requiring a server-side runtime for core application behavior or deployment. The project MUST be designed for static hosting and must prefer architectures that can be published as a static website without backend dependencies. Rationale: this keeps deployment simple, transparent, and compatible with public static hosting.

### II. Vanilla JavaScript / ES6 Standards
All application code MUST be written in modern ECMAScript syntax using ES6+ features and native browser APIs. Frameworks are disallowed unless a project-approved exception is explicitly documented and still aligns with the project’s static-hosting constraints. Rationale: a vanilla, standards-based approach reduces dependency risk and keeps behavior predictable.

### III. Three.js as the Canonical 3D Runtime
Three.js MUST be the primary 3D library for rendering, scene construction, and interactive behavior. Additional 3D tooling MAY be used only as a direct supplement to Three.js and not as a replacement for the principal runtime. Rationale: a single canonical 3D library simplifies development, debugging, and long-term maintenance.

### IV. Security and Secret-Handling
No secrets, keys, tokens, private configuration values, or other sensitive credentials MAY be stored in source files, build artifacts, deployment configuration, browser code, or logs. The project MUST fail review if any secret or key is exposed in the repository or public deployment bundle. Rationale: public static deployment requires zero hidden trust assumptions.

### V. Minimal Dependency and Simplicity
The project MUST avoid external dependencies that cannot be deployed into a static website and MUST prefer the smallest viable dependency surface. Any dependency addition requires explicit justification for why it is necessary, static-hosting-compatible, and maintainable. Rationale: simplicity reduces breakage risk and improves portability.

## Additional Constraints
The project MUST use Three.js as the main 3D library and MUST remain browser-native and static-site friendly. The project MUST be implemented in a vanilla approach using ES6+ JavaScript, without a framework stack or heavy build abstraction that prevents static deployment. The project MUST not expose any secrets or keys in any form, including source, configuration, or runtime client code. The project MUST avoid external dependencies that cannot be deployed to a static website.

## Development Workflow
All design changes, dependency additions, and deployment decisions MUST be checked against the project’s static-hosting, ES6, and security constraints before they are approved. Reviewers MUST verify that any added library, utility, or rendering dependency remains compatible with static deployment and does not introduce secret-handling problems. Any exception MUST be documented with rationale, owner, and a clear rollback path. Rationale: these constraints are non-negotiable product requirements, not optional preferences.

## Governance
This Constitution supersedes general project conventions when they conflict with the project’s required architecture and security standards. Amendments require documented rationale, an updated version number, and review against the project’s static deployment, framework, and secret-handling constraints. Project compliance MUST be checked in pull requests and design reviews before release. This document is the governing record for the project’s architecture and operational standards.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): confirm original adoption date. | **Last Amended**: 2026-10-01
