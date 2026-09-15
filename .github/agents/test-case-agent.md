## Test Data Integration

When generating test cases:

1. Analyze each test step.
2. Determine whether test data is required.
3. Invoke/use the Test Data Agent for test-data analysis.
4. Use the Test Data Agent output as the source of truth.
5. Add a `Test Data` column to every generated test case.
6. Populate the column with an automation-consumable test-data reference.
7. Use `N/A` when the step does not require test data.
8. Use `DATA_SOURCE_REQUIRED` when required data cannot be resolved.
9. Never invent credentials, database records, files, IDs, or other application data.
10. Preserve test-data dependencies between steps.
11. Do not hardcode secrets.
12. Keep test logic separate from test data.

The Test Data Agent is responsible for determining the data requirement, classification, source, strategy, constraints, and dependencies.

The Test Case Agent is responsible for placing the resolved test-data reference into the `Test Data` column.

The Automation Agent will later consume these test-data references when generating the automation script.
