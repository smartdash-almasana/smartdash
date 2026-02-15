# Antigravity Skill Integration Patterns for SmartSeller

## Best-practice patterns
- Keep `SKILL.md` concise and trigger-oriented (name + precise description + compact workflow).
- Use progressive disclosure: core workflow in `SKILL.md`, deeper references only when needed.
- Prefer one skill per domain responsibility to reduce accidental cross-triggering.
- Encode safety constraints directly inside each skill and repeat globally in catalog docs.
- Include few-shot examples that mirror real SmartSeller requests.

## Trigger/keyword strategy
- Put high-intent verbs and domain nouns in the `description` field.
- Reuse stable prefixes in prompts, e.g., `SmartSeller:`.
- Distinguish overlapping skills with explicit keywords:
  - Schema: `migration`, `view`, `DDL`, `column`, `constraint`
  - Webhook: `idempotency`, `retry`, `dedupe`, `worker`
  - Clinical scoring: `taxonomy`, `severity`, `threshold`, `impact`
  - Health analysis: `drivers`, `anomalies`, `score drop`, `diagnostics`
  - SQL tests: `verification`, `consistency checks`, `audit-safe SELECT`

## Production safety constraints
- Disallow destructive SQL by default (`DROP`, `DELETE`, `TRUNCATE`).
- Allow write SQL only in explicit migration tasks.
- Require verification SQL for every schema or scoring change.
- Preserve backward compatibility for scenario keys and core contracts.
- Avoid touching UI files for backend/data skill invocations unless explicitly requested.

## Agent invocation guidance
- Use direct intent prompts with one dominant task.
- If request spans multiple domains, execute in sequence:
  1. `smartseller-schema-migrations`
  2. `smartseller-sql-test-generation`
  3. `smartseller-health-score-analysis` (if analytical validation needed)
- Keep final outputs auditable with file paths and SQL evidence references.
