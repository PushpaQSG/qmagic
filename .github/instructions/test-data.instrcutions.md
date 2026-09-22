---
applyTo: "test-cases/**/*.md,test-data/**/*.contract.json"
description: Require validated, resolvable, and safe test-data contracts before generating test cases or automation.
---

# Test Data Instructions

## Purpose

Identify and define test-data requirements before generating automation scripts.

## Core Rule

The LLM must identify:

- What data is required
- Why the data is required
- Data type
- Constraints
- Dependencies
- Data classification
- Data retrieval/generation strategy

The LLM must NOT invent application-specific test data.

Read `.github/test-data-contract.schema.json` before producing or changing a test-data contract. Use `.github/agents/test-data-agent.md` as the authoritative analysis workflow.

## Data Classification

Use one of:

- STATIC
- DYNAMIC
- UNIQUE
- BOUNDARY
- EXISTING_FIXTURE
- API_CREATE
- DB_LOOKUP
- SYNTHETIC
- SECRET_REFERENCE

## Rules

1. Never hardcode passwords, tokens, API keys or other secrets.
2. Never use production data.
3. Never invent production data
4. Use existing fixtures when stable test data is required.
5. Identify the data required to validate the expected result.
6. Determine the appropriate test data strategy.
7. Use synthetic data when new data is required.
8. Use dynamic generation for dates, timestamps and other runtime values.
9. Use unique generation when uniqueness is required.
10. Identify boundary values from application constraints.
11. Identify dependencies between test-data entities.
12. If the source of required data is unknown, return `DATA_SOURCE_REQUIRED`.
13. Do not generate automation code until the Test Data Contract has been created.
14. Keep test logic separate from test data.
15. Use lower snake_case for each data `name`; use the same identifier in `depends_on`, test cases, and automation mappings.
16. Include an automation-consumable `reference` and `source` whenever an approved source is known. A reference is an environment-variable key, secret-store key, fixture key, lookup key, or generator key, not a vague label.
17. Use `status = READY` only when every required value can be resolved from an approved non-production source. Otherwise use `status = DATA_SOURCE_REQUIRED` and list blocking identifiers in `unresolved_data`.
18. For persisted synthetic, unique, or API-created records, state `scope` and `cleanup_strategy`. Tests must remove or neutralize data they create and must not collide during parallel runs.
19. Use a secret-store or environment-variable reference for `SECRET_REFERENCE`; set `sensitive = true` and never put the actual value in `example`, test cases, code, logs, or reports.
20. Before test-case generation, validate the JSON contract against `.github/test-data-contract.schema.json`. Do not use an invalid contract as a source for automation.
21. When test steps are known, add `test_step_data` to the contract. It must contain one entry per test-case step with `test_case_id`, `step`, `action`, and `test_data`.
22. Format each step value as semicolon-separated `name=reference` pairs. Use `N/A` only when the action truly needs no data; use `DATA_SOURCE_REQUIRED: <name>` when it cannot run until a source is provided.
23. Once `source` is identified, resolve and record the concrete `location` where that data actually lives (see Source Location Map). Do not leave a known source without its location.

## Source Location Map

Once a data item's `source` is identified, fetch/pick the value from its concrete `location`. Do not stop at the abstract source category.

| source | location | Example |
| --- | --- | --- |
| `ENVIRONMENT` | `.env` file, keyed by the exact variable name, loaded via `src/config/env.ts` | `location: ".env -> BASE_URL"`, `reference: "BASE_URL"` |
| `SECRET_STORE` | Approved external secret manager / CI secret, keyed by its exact secret name (never the value) | `location: "CI secret store -> ORANGEHRM_HR_PASSWORD"` |
| `FIXTURE` | Versioned fixture file under `test-data/`, keyed by its JSON path | `location: "test-data/orangehrm-add-employee.contract.json -> test_data[employee_id]"` |
| `RUNTIME_GENERATOR` | Automation helper/library invoked at run time (faker, uuid, counter) | `location: "automation runtime generator: uuid()"` |
| `API` | Exact endpoint, method, and field used to extract the value | `location: "GET /api/v2/courses -> data[0].id"` |
| `DATABASE` | Exact schema/table/column and lookup key | `location: "hr_db.employee -> employee_id"` |
| `APPLICATION_UI` | Exact screen/control where the value must be read at run time | `location: "Admin > Add User form -> Role dropdown options"` |
| `REQUIREMENT` | The requirement or acceptance-criteria line that states the literal value | `location: "Acceptance criteria line: 'Dashboard'"` |
| `UNRESOLVED` | No location known; must be listed in `unresolved_data` | omit `location` |

Rules:

1. Never guess a `location`. If the exact file, endpoint, table, or screen is not confirmed, use `source: "UNRESOLVED"` and add the item to `unresolved_data`.
2. Prefer the repository's existing convention: environment values belong in `.env` (see `.env.example`) and are read through `src/config/env.ts`; do not invent a new config mechanism.
3. A `SECRET_REFERENCE` item must never place the secret value in `location`; only the variable/secret name.
4. When a value depends on a prior step or another data item (e.g. an ID returned by a previous API call), record that in `depends_on`, and set `location` to describe how it is captured (e.g. "response of step 2 API_CREATE").

## Mandatory / Non-Mandatory Field Rules

The LLM must distinguish between:

* `application_required` — whether the application/business process requires the field/data.
* `test_data_required` — whether the specific test scenario requires an actual value.

These two values must be evaluated independently.

### Rules for application_required

1. Set `application_required = true` when the field is explicitly identified as required by:

   * Jira story or acceptance criteria
   * Application validation rules
   * API/schema definition
   * EDI specification
   * Documented business rules
   * Workflow dependency

2. Set `application_required = false` when the application context explicitly identifies the field as optional.

3. Do NOT assume a field is mandatory simply because:

   * it appears on the UI
   * it exists in the database
   * it exists in an API response
   * it appears in an example payload
   * it appears important
   * similar applications require it

4. If the mandatory status cannot be determined from the available application context, do NOT guess. Identify the status as unknown and identify the missing source of information.

   Set `application_required = "UNKNOWN"`, set the contract status to `DATA_SOURCE_REQUIRED`, and add the required-field rule identifier to `unresolved_data`.

### Rules for test_data_required

1. Set `test_data_required = true` when the current test scenario requires an actual value for the field.

2. Set `test_data_required = false` when the test intentionally does not provide a value.

3. For a negative test that verifies a mandatory field is missing:

```text
application_required = true
test_data_required = false
test_condition = "missing"
```

4. For a negative test that verifies an invalid value:

```text
application_required = true
test_data_required = true
test_condition = "invalid"
```

5. An optional application field can still have:

```text
application_required = false
test_data_required = true
```

when the specific test scenario requires the optional field to be populated.

### Conditional Mandatory Fields

If a field is mandatory only under a condition, the LLM must capture the condition.

Example:

```text
Username is required when User Type = Manager.
```

Output:

```text
application_required = true
condition = "User Type = Manager"
```

The LLM must not treat a conditionally mandatory field as universally mandatory.

### Missing Source

If the information required to determine mandatory status is not available:

* Do NOT invent the answer.
* Do NOT infer the answer from general domain knowledge.
* Identify the missing source.
* Return `DATA_SOURCE_REQUIRED` when the missing information prevents reliable test-data generation.

### Mandatory Application Field vs Test Data

A mandatory application field does not necessarily mean that test data must be supplied.

Example:

```text
Requirement:
Verify that the system rejects a user email when invalid email format is provided.

Email:
application_required = true
test_data_required = false
test_condition = "missing"
```

For a successful claim:

```text
email:
application_required = true
test_data_required = true
```

### Decision Priority

When determining whether a field/data item is mandatory, evaluate information in this order:

1. Acceptance criteria
2. Explicit requirement
3. Application validation rules
4. API/schema/EDI specification
5. Business rules
6. Workflow dependencies
7. Conditional rules
8. Explicit optional definition
9. If insufficient information → DO NOT GUESS


## Output

Return a Test Data Contract conforming to:

`test-data-contract.schema.json`

Every data item in the contract must contain:

- status
- test_data
- name
- entity
- type
- application_required
- test_data_required
- classification
- strategy
- constraints
- `depends_on` (when applicable)
- sensitive

When applicable, identify:
- condition
- test_condition
- reference
- source
- location
- scope
- cleanup_strategy

## Contract Handoff

The Test Case Agent must copy the matching `test_step_data.test_data` expression into every `Test Data` column cell. It must preserve `depends_on` ordering and show `DATA_SOURCE_REQUIRED: <name>` for unresolved items. It must not replace an unresolved reference with a plausible value or expose a secret.

The Automation Agent must resolve secrets only at runtime, generate unique values per run, and implement the specified cleanup strategy. It must not log sensitive values.

## TP Creation Example

For a TP creation scenario, classify data by its origin rather than by the field's purpose. A random TP name is `UNIQUE` and runtime-generated; TP type and category are `STATIC`; course and user values are resolved from an earlier step, precondition, or approved API request.

| Step | Action | Test Data | Expected Result |
| ---: | --- | --- | --- |
| 1 | Enter TP name. | `tp_name=RUNTIME_GENERATOR: tp_name` | A unique TP name is accepted. |
| 2 | Select TP type. | `tp_type=STATIC: <approved_tp_type>` | The approved TP type is selected. |
| 3 | Select category. | `category=STATIC: <approved_category>` | The approved category is selected. |
| 4 | Select course. | `course=API_GET: course_for_tp` | A course returned by the approved API or prior setup step is selected. |
| 5 | Select user. | `user=API_GET: eligible_user_for_tp` | An eligible user returned by the approved API is selected. |
| 6 | Save the TP. | `N/A` | The TP is created successfully. |
| 7 | Assert that the TP was created. | `tp_name=RUNTIME_GENERATOR: tp_name` | The created TP is displayed or returned by the system. |

The corresponding contract entries preserve dependencies. For example, `course` has `source: "API"`, `reference: "course_for_tp"`, and a strategy that specifies the approved GET request; `user` is similar. If the endpoint, response selector, prior-step output, or approved static option is not known, use `DATA_SOURCE_REQUIRED: <name>` instead of inventing a value.