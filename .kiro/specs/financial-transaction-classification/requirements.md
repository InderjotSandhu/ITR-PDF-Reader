# Requirements Document

## Introduction

The CAS transaction extractor currently fails to properly classify financial transactions. While administrative transactions (marked with `***`) are correctly handled, financial transactions are not being passed through the classification logic. Instead, the raw description text is being used as the transaction type, resulting in incorrect classifications. This feature will fix the transaction type classification for financial transactions.

## Glossary

- **Financial Transaction**: A transaction that affects fund units or amounts (Purchase, Redemption, Switch-In, Switch-Out, Systematic Investment, Dividend)
- **Administrative Transaction**: A transaction marked with `***` that does not affect fund units (Stamp Duty, STT Paid, Address Update, etc.)
- **Transaction Type**: The standardized category of a transaction (e.g., "Purchase", "Redemption", "Switch-Out")
- **Transaction Description**: The full text description from the CAS statement
- **CAS Statement**: Consolidated Account Statement containing mutual fund transaction records
- **Transaction Extractor**: The module responsible for parsing and extracting transaction data from CAS statements

## Requirements

### Requirement 1

**User Story:** As a user, I want financial transactions to be correctly classified by type, so that I can filter and analyze transactions by their actual type rather than seeing raw description text.

#### Acceptance Criteria

1. WHEN a financial transaction is parsed THEN the system SHALL call the classifyTransactionType function to determine the correct transaction type
2. WHEN a transaction description contains "systematic investment" or "sip" THEN the system SHALL classify it as "Systematic Investment"
3. WHEN a transaction description contains "switch-out" or "switchout" THEN the system SHALL classify it as "Switch-Out"
4. WHEN a transaction description contains "switch-in" or "switchin" THEN the system SHALL classify it as "Switch-In"
5. WHEN a transaction description contains "redemption" or "redeem" THEN the system SHALL classify it as "Redemption"
6. WHEN a transaction description contains "dividend" THEN the system SHALL classify it as "Dividend"
7. WHEN a transaction description contains "purchase" THEN the system SHALL classify it as "Purchase"
8. WHEN a transaction description does not match any known pattern THEN the system SHALL default to "Purchase" as the transaction type

### Requirement 2

**User Story:** As a developer, I want the transaction type to be separate from the description, so that the data structure maintains semantic clarity.

#### Acceptance Criteria

1. WHEN a transaction is created THEN the transactionType field SHALL contain the classified type (e.g., "Switch-Out")
2. WHEN a transaction is created THEN the description field SHALL contain the original full description text from the CAS statement
3. WHEN displaying transactions THEN the system SHALL preserve both the classified type and the original description

### Requirement 3

**User Story:** As a user, I want transaction classification to be case-insensitive, so that variations in CAS statement formatting do not affect classification accuracy.

#### Acceptance Criteria

1. WHEN classifying a transaction THEN the system SHALL perform case-insensitive pattern matching
2. WHEN a description contains "REDEMPTION", "Redemption", or "redemption" THEN the system SHALL classify all as "Redemption"
3. WHEN a description contains patterns with asterisk prefixes (e.g., "*Switch-Out") THEN the system SHALL correctly identify and classify the transaction type

### Requirement 4

**User Story:** As a user, I want administrative transactions to remain unaffected by this change, so that the existing administrative transaction handling continues to work correctly.

#### Acceptance Criteria

1. WHEN an administrative transaction (marked with `***`) is parsed THEN the system SHALL use the cleaned description as the transaction type
2. WHEN an administrative transaction is parsed THEN the system SHALL NOT apply financial transaction classification rules
3. WHEN an administrative transaction is validated THEN the system SHALL skip transaction type validation
