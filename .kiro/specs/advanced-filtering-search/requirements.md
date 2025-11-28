# Requirements Document - Advanced Filtering and Search

## Introduction

This feature adds advanced filtering and search capabilities to the ITR Complete CAS Data Extractor, allowing users to filter and search through extracted transaction data, portfolio holdings, and fund information directly in the web interface before downloading reports.

## Glossary

- **System**: The ITR Complete CAS Data Extractor application
- **User**: Individual investor, financial advisor, or data analyst using the application
- **Transaction**: A single mutual fund transaction record (purchase, redemption, SIP, etc.)
- **Filter**: A criterion applied to narrow down displayed data
- **Search**: Text-based query to find specific records
- **Portfolio**: Collection of mutual fund holdings
- **Folio**: A unique account number for mutual fund investments

## Requirements

### Requirement 1

**User Story:** As a user, I want to filter transactions by date range, so that I can analyze investments within a specific time period.

#### Acceptance Criteria

1. WHEN a user selects a start date and end date THEN the System SHALL display only transactions within that date range
2. WHEN a user clears the date filter THEN the System SHALL display all transactions
3. WHEN a user enters an invalid date range (end before start) THEN the System SHALL display an error message and prevent filtering
4. WHEN no transactions exist in the selected date range THEN the System SHALL display a "No results found" message

### Requirement 2

**User Story:** As a user, I want to filter transactions by transaction type, so that I can focus on specific types of transactions like purchases or redemptions.

#### Acceptance Criteria

1. WHEN a user selects one or more transaction types THEN the System SHALL display only transactions matching those types
2. WHEN a user deselects all transaction types THEN the System SHALL display all transactions
3. WHEN the System displays transaction type options THEN the System SHALL show all available types from the extracted data
4. WHEN a user applies multiple transaction type filters THEN the System SHALL display transactions matching any of the selected types

### Requirement 3

**User Story:** As a user, I want to search for specific fund schemes by name, so that I can quickly find transactions for a particular fund.

#### Acceptance Criteria

1. WHEN a user enters a search query THEN the System SHALL display transactions where the scheme name contains the query text
2. WHEN a user clears the search query THEN the System SHALL display all transactions
3. WHEN the System performs search THEN the System SHALL be case-insensitive
4. WHEN no transactions match the search query THEN the System SHALL display a "No results found" message

### Requirement 4

**User Story:** As a user, I want to filter transactions by folio number, so that I can view transactions for a specific investment account.

#### Acceptance Criteria

1. WHEN a user selects a folio number THEN the System SHALL display only transactions for that folio
2. WHEN the System displays folio options THEN the System SHALL show all unique folio numbers from the extracted data
3. WHEN a user clears the folio filter THEN the System SHALL display all transactions
4. WHEN a user applies folio filter THEN the System SHALL update the transaction count display

### Requirement 5

**User Story:** As a user, I want to filter transactions by amount range, so that I can identify large or small transactions.

#### Acceptance Criteria

1. WHEN a user enters minimum and maximum amount values THEN the System SHALL display only transactions within that amount range
2. WHEN a user enters only a minimum amount THEN the System SHALL display transactions greater than or equal to that amount
3. WHEN a user enters only a maximum amount THEN the System SHALL display transactions less than or equal to that amount
4. WHEN a user clears amount filters THEN the System SHALL display all transactions
5. WHEN a user enters invalid amount values (non-numeric) THEN the System SHALL display an error message

### Requirement 6

**User Story:** As a user, I want to combine multiple filters simultaneously, so that I can perform complex data analysis.

#### Acceptance Criteria

1. WHEN a user applies multiple filters THEN the System SHALL display transactions matching all filter criteria
2. WHEN a user adds a new filter to existing filters THEN the System SHALL update results to match all active filters
3. WHEN a user removes one filter from multiple active filters THEN the System SHALL update results to match remaining filters
4. WHEN the System applies filters THEN the System SHALL display the count of matching transactions

### Requirement 7

**User Story:** As a user, I want to see filter results in real-time, so that I can immediately see the impact of my filter selections.

#### Acceptance Criteria

1. WHEN a user changes any filter value THEN the System SHALL update displayed results within 500 milliseconds
2. WHEN the System updates filter results THEN the System SHALL maintain the current scroll position
3. WHEN the System applies filters THEN the System SHALL display a loading indicator if processing takes longer than 200 milliseconds
4. WHEN the System completes filtering THEN the System SHALL remove the loading indicator

### Requirement 8

**User Story:** As a user, I want to export filtered results, so that I can download only the data I'm interested in.

#### Acceptance Criteria

1. WHEN a user clicks export with active filters THEN the System SHALL generate a report containing only filtered transactions
2. WHEN a user exports filtered data THEN the System SHALL maintain the selected output format (Excel, JSON, or Text)
3. WHEN a user exports filtered Excel data THEN the System SHALL include only the selected sheets with filtered data
4. WHEN the System generates filtered export THEN the System SHALL include filter criteria in the metadata

### Requirement 9

**User Story:** As a user, I want to clear all filters at once, so that I can quickly reset to viewing all data.

#### Acceptance Criteria

1. WHEN a user clicks "Clear All Filters" THEN the System SHALL remove all active filters
2. WHEN the System clears all filters THEN the System SHALL display all transactions
3. WHEN the System clears all filters THEN the System SHALL reset all filter input fields to their default states
4. WHEN no filters are active THEN the System SHALL disable or hide the "Clear All Filters" button

### Requirement 10

**User Story:** As a user, I want to see which filters are currently active, so that I understand what data is being displayed.

#### Acceptance Criteria

1. WHEN a user applies a filter THEN the System SHALL display an active filter indicator
2. WHEN the System displays active filters THEN the System SHALL show the filter name and value
3. WHEN a user clicks on an active filter indicator THEN the System SHALL remove that specific filter
4. WHEN the System displays active filters THEN the System SHALL show the total count of active filters
