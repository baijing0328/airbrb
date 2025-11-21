# Testing Rationale

## Component Testing
We have implemented unit tests for several core components to ensure they function correctly in isolation:
- `CreateHostForm`: Verifies that the listing creation modal opens correctly and handles the submission flow.
- `DeleteHostItem`: Ensures the deletion process requires confirmation and handles API success/failure states.
- `LogoutBtn`: Checks the logout functionality, including Redux state updates and navigation.

These components were chosen as they represent critical user interactions (creation, deletion, authentication) and have distinct behaviors.

## UI Testing (Happy Path)
We have implemented a comprehensive UI test (`adminHappyPath.test.jsx`) that simulates a complete user journey for an administrator/host. This test covers:
1.  User Registration
2.  Creating a new listing
3.  Editing the listing
4.  Publishing and Unpublishing the listing
5.  Making a booking (as a guest)
6.  Logging out and back in

This "happy path" test ensures that the core business logic and critical user flows work together as expected.

