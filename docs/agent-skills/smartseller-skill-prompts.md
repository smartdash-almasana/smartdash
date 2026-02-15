# SmartSeller Skill Invocation Prompts

## `smartseller-schema-migrations`
```text
SmartSeller: propose schema migration for new clinical scenario and include post-migration verification SQL.
# agent usage example: use smartseller-schema-migrations
```

## `smartseller-webhook-processor`
```text
SmartSeller: enhance webhook processor idempotency and retry handling without changing UI.
# agent usage example: use smartseller-webhook-processor
```

## `smartseller-clinical-taxonomy-scoring`
```text
SmartSeller: add a new clinical taxonomy event and rebalance scoring thresholds with regression checks.
# agent usage example: use smartseller-clinical-taxonomy-scoring
```

## `smartseller-health-score-analysis`
```text
Analyze health score drivers and summarize anomalies for last 7 days with read-only SQL evidence.
# agent usage example: use smartseller-health-score-analysis
```

## `smartseller-sql-test-generation`
```text
Generate safe SELECT queries for audit and validate snapshot consistency.
# agent usage example: use smartseller-sql-test-generation
```

## End-to-end test prompts
```text
SmartSeller: create database view for overdue questions trend and produce SQL verification tests.
SmartSeller: generate SQL to validate snapshot consistency and webhook dedupe integrity.
SmartSeller: analyze health score drivers and explain major score drop anomalies.
```
