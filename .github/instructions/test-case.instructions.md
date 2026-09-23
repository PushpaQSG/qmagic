## Test Data Integration

### Purpose

The Test Case Agent must identify and include the test data required for each test step.

Every generated test case must contain a `Test Data` column.

The `Test Data` column must contain test-data references or values that can be consumed by the automation layer.

The Test Case Agent must use the Test Data Agent as the source of truth for test-data classification, source, strategy, dependencies, and availability.

When the Test Data Contract includes `test_step_data`, copy its matching `test_data` expression into the corresponding numbered entry in the `Test Data` cell. Every test scenario row must contain one ordered `Test Data` entry for every numbered action: a semicolon-separated `name=reference` expression, `DATA_SOURCE_REQUIRED: <name>`, or `N/A`.

---

## Token and Memory Efficiency

Load only the requirement, the relevant Test Data Contract, and the rules needed for the current test scenario. Do not load unrelated contracts or repeat the full schema in the generated response.

The final response must contain only the requested four-column table. Keep data references compact; do not include contract descriptions, source locations, constraints, secrets, or runtime values in the test case unless they are needed to identify an unresolved dependency.

## Test Case Output Structure

The generated output must be a Markdown table with exactly these columns, in this order:

| TCID | Test Objective | Test Steps | Test Data |
| ---- | -------------- | ---------- | --------- |

Rules:

1. `TCID` is a unique test-case identifier, such as `TC-EMPLOYEE-001`.
2. `Test Objective` states the behavior being verified.
3. `Test Steps` contains the ordered actions. Use `<br>` between actions when more than one step is required; prefix each action with its step number.
4. `Test Data` contains the matching ordered data expressions. Use `<br>` between entries and keep each entry aligned with the corresponding `Test Steps` action.
5. Do not add `Preconditions`, `Step`, `Expected Result`, or other columns unless the user explicitly requests them.
6. Include one row per test scenario, not one row per action.

Example:

| TCID | Test Objective | Test Steps | Test Data |
| ---- | -------------- | ---------- | --------- |
| TC-EMPLOYEE-001 | Add a new employee successfully | 1. Log in as an authorized HR user.<br>2. Navigate to PIM → Add Employee.<br>3. Enter employee details.<br>4. Save the employee.<br>5. Verify the employee and confirmation. | 1. `DATA_SOURCE_REQUIRED: hr_username; DATA_SOURCE_REQUIRED: hr_password`<br>2. `N/A`<br>3. `employee_first_name=RUNTIME_GENERATOR: employee_first_name; employee_middle_name=RUNTIME_GENERATOR: employee_middle_name; employee_last_name=RUNTIME_GENERATOR: employee_last_name; employee_id=RUNTIME_GENERATOR: employee_id`<br>4. `N/A`<br>5. `employee_id=RUNTIME_GENERATOR: employee_id` |

---

## Test Data Column Rules

For every test step, determine whether test data is required.

### Rule 1 — Test data is required

If a step requires data to perform the action, populate the `Test Data` column.

Example:

| Step | Test Step      | Test Data       | Expected Result      |
| ---- | -------------- | --------------- | -------------------- |
| 1    | Enter username | `TEST_USERNAME` | Username is accepted |
| 2    | Enter password | `TEST_PASSWORD` | Password is accepted |

---

### Rule 2 — Test data is not required

If the step does not require data, use:

`N/A`

`N/A` is still a required value in the `Test Data` column; do not leave the cell blank.

Example:

| Step | Test Step   | Test Data | Expected Result   |
| ---- | ----------- | --------- | ----------------- |
| 3    | Click Login | N/A       | User is logged in |

---

### Rule 3 — Use Test Data Agent output

The Test Case Agent must not independently invent test-data sources.

The Test Data Agent determines:

* What data is required
* Whether the data is application-required
* Whether test data is required for the scenario
* Classification
* Source
* Generation strategy
* Constraints
* Dependencies
* Sensitive-data handling

The Test Case Agent must use this information when populating the `Test Data` column.

---

### Rule 4 — Do not hardcode secrets

Credentials, tokens, API keys, or other sensitive information must never be placed directly in the test case.

Use a reference instead.

Example:

`TEST_USERNAME`

`TEST_PASSWORD`

Do not use:

`john@test.com`

`Password123`

unless the value is explicitly approved as non-sensitive test data.

---

### Rule 5 — Test Data must be automation-consumable

The Test Data column should contain a value, reference, fixture, file, or generation instruction that can later be consumed by the Automation Agent.

Examples:

| Data Type            | Test Data                  |
| -------------------- | -------------------------- |
| Environment variable | `TEST_USERNAME`            |
| Static value         | `EA`                       |
| Runtime generated    | `UNIQUE_RUNTIME`           |
| Existing fixture     | `VALID_NDC_FIXTURE`        |
| Test file            | `valid_844_claim.csv`      |
| Database lookup      | `EXISTING_CE:CE-DSH220031` |
| API-created data     | `CREATE_TEST_CUSTOMER`     |

Avoid vague descriptions such as:

`Valid username`

`Valid customer`

`Some NDC`

`Valid claim`

The test-data reference must provide enough information for the automation layer to resolve the actual data.

---

## Test Data Decision Rules

For every step:

1. Identify the action being performed.
2. Determine whether the action requires test data.
3. If test data is required, identify the required data element.
4. Use the Test Data Agent to determine the classification and source.
5. Populate the `Test Data` column with the resolved data reference.
6. If the data cannot be resolved, use `DATA_SOURCE_REQUIRED`.
7. Never invent an actual value when the required source is unknown.

---

## Handling DATA_SOURCE_REQUIRED

If the Test Data Agent returns:

`DATA_SOURCE_REQUIRED`

the Test Case Agent must not invent a value.

The Test Data column should contain:

`DATA_SOURCE_REQUIRED: <data name>`

Example:

`DATA_SOURCE_REQUIRED: authorized QA username`

The test case may still be generated, but the missing data dependency must be clearly identified.

---

## Test Data Dependencies

If one test-data element depends on another, preserve the dependency.

Example:

Parent CE → Child Site → Sub-ceiling Contract → Claim

The Test Data column may contain:

| Step | Test Step                   | Test Data                             |
| ---- | --------------------------- | ------------------------------------- |
| 1    | Select Parent CE            | `PARENT_CE_FIXTURE`                   |
| 2    | Select Child Site           | `CHILD_SITE_FOR_PARENT_CE`            |
| 3    | Select Sub-ceiling Contract | `SUB_CEILING_CONTRACT_FOR_CHILD_SITE` |
| 4    | Upload claim                | `CLAIM_FILE_FOR_CHILD_SITE`           |

Do not select unrelated independent data.

---

## Positive Test Data

For positive scenarios, use valid data that satisfies the applicable application and business rules.

Example:

| Test Step      | Test Data           |
| -------------- | ------------------- |
| Enter quantity | `1`                 |
| Select UOM     | `EA`                |
| Enter NDC      | `VALID_NDC_FIXTURE` |

---

## Negative Test Data

For negative scenarios, the Test Data column must identify the intended invalid condition.

Examples:

| Test Scenario         | Test Data                                  |
| --------------------- | ------------------------------------------ |
| Invalid UOM           | `INVALID_UOM`                              |
| Missing NDC           | `NDC = EMPTY`                              |
| Invalid quantity      | `QUANTITY = -1`                            |
| Duplicate transaction | `TRANSACTION_ID = EXISTING_TRANSACTION_ID` |

The negative condition must be intentional and traceable to the requirement or validation rule.

---

## Boundary Test Data

For boundary scenarios, explicitly identify the boundary value.

Example:

| Test Scenario    | Test Data                          |
| ---------------- | ---------------------------------- |
| Minimum quantity | `QUANTITY = MIN_ALLOWED_VALUE`     |
| Maximum quantity | `QUANTITY = MAX_ALLOWED_VALUE`     |
| Below minimum    | `QUANTITY = MIN_ALLOWED_VALUE - 1` |
| Above maximum    | `QUANTITY = MAX_ALLOWED_VALUE + 1` |

Do not invent boundary limits when the requirement or application rules do not provide them.

---

## Optional Fields

An optional application field does not automatically mean that test data is unnecessary.

Determine whether the specific test scenario needs the field.

Example:

* Application field is optional.
* Scenario specifically tests the field.

Then:

`application_required = false`

but:

`test_data_required = true`

The Test Data column must contain the required test data.

---

## Required Fields

A required application field does not always mean that a test must provide a value.

For example, a negative test may intentionally omit a required field.

Example:

| Test Scenario                     | Test Data     |
| --------------------------------- | ------------- |
| Submit claim without required NDC | `NDC = EMPTY` |

The test data requirement is driven by the scenario.

---

## Do Not Guess

The Test Case Agent must not:

* Invent application data
* Invent database records
* Invent credentials
* Assume a customer/entity exists
* Assume a file exists
* Assume an API can create data
* Assume a field is mandatory without evidence
* Use production data

If required information is unavailable, identify the missing data dependency.

---

## Example Output

Example login test case:

| Test Case ID | Test Scenario    | Step | Test Step              | Test Data            | Expected Result                |
| ------------ | ---------------- | ---: | ---------------------- | -------------------- | ------------------------------ |
| TC-001       | Successful login |    1 | Navigate to Login page | `QA_APPLICATION_URL` | Login page is displayed        |
| TC-001       | Successful login |    2 | Enter username         | `TEST_USERNAME`      | Username is accepted           |
| TC-001       | Successful login |    3 | Enter password         | `TEST_PASSWORD`      | Password is accepted           |
| TC-001       | Successful login |    4 | Click Login            | `N/A`                | User is successfully logged in |

---

## Example 340B Test Case

| Test Case ID | Test Scenario                           | Step | Test Step                   | Test Data                                         | Expected Result               |
| ------------ | --------------------------------------- | ---: | --------------------------- | ------------------------------------------------- | ----------------------------- |
| TC-340B-001  | Child Site claim uses Parent CE pricing |    1 | Select Parent CE            | `PARENT_CE_FIXTURE`                               | Parent CE is selected         |
| TC-340B-001  | Child Site claim uses Parent CE pricing |    2 | Select Child Site           | `CHILD_SITE_FOR_PARENT_CE`                        | Child Site is selected        |
| TC-340B-001  | Child Site claim uses Parent CE pricing |    3 | Verify Sub-ceiling contract | `SUB_CEILING_CONTRACT_FOR_CHILD_SITE`             | Correct contract is displayed |
| TC-340B-001  | Child Site claim uses Parent CE pricing |    4 | Upload claim file           | `VALID_844_CLAIM_FILE`                            | Claim file is uploaded        |
| TC-340B-001  | Child Site claim uses Parent CE pricing |    5 | Submit claim                | `SUBMITTER_ID = CHILD_SITE_340B_ID`               | Claim is accepted             |
| TC-340B-001  | Child Site claim uses Parent CE pricing |    6 | Process claim               | `TRANSACTION_ID = UNIQUE_RUNTIME`                 | Claim is processed            |
| TC-340B-001  | Child Site claim uses Parent CE pricing |    7 | Verify pricing              | `NDC = VALID_NDC_FIXTURE; UOM = EA; QUANTITY = 1` | Parent CE pricing is applied  |
