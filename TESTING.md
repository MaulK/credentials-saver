# Testing Instructions for CredentialSaver

This document provides comprehensive testing instructions for CredentialSaver to ensure all features work correctly.

## Prerequisites

- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript enabled
- Local server or direct file access

## Test Environment Setup

### Option 1: Direct File Access

1. Navigate to the project folder
2. Double-click `index.html` to open in browser
3. Note: Some browsers may restrict IndexedDB on `file://` protocol

### Option 2: Local Server (Recommended)

```bash
# Python 3
python -m http.server 8000

# Navigate to http://localhost:8000
```

## Test Cases

### 1. Initial Setup

| Test ID | Description | Expected Result | Status |
|---------|-------------|------------------|--------|
| TS-01 | Open application for first time | Loading screen appears, then master password setup modal | ⬜ |
| TS-02 | Enter weak master password (< 8 chars) | Error message: "Please use a stronger password" | ⬜ |
| TS-03 | Enter mismatched passwords | Error message: "Passwords do not match" | ⬜ |
| TS-04 | Create strong master password | Success toast, main app appears, credentials list empty | ⬜ |
| TS-05 | Reload page after setup | Master password unlock modal appears | ⬜ |
| TS-06 | Enter incorrect master password | Error message: "Incorrect master password" | ⬜ |
| TS-07 | Enter correct master password | Success toast, main app unlocks | ⬜ |

### 2. Credential Management

#### Adding Credentials

| Test ID | Description | Expected Result | Status |
|---------|-------------|------------------|--------|
| TC-01 | Click "Add Credential" button | Modal opens with empty form | ⬜ |
| TC-02 | Fill required fields only | Credential saved, appears in list | ⬜ |
| TC-03 | Add credential with all fields | All data saved correctly | ⬜ |
| TC-04 | Add credential with favorite flag | Credential has yellow top border | ⬜ |
| TC-05 | Add credential without required fields | Form validation prevents save | ⬜ |
| TC-06 | Add multiple credentials | All appear in list, counts update | ⬜ |
| TC-07 | Add credential in specific category | Appears in that category filter | ⬜ |

#### Viewing Credentials

| Test ID | Description | Expected Result | Status |
|---------|-------------|------------------|--------|
| TV-01 | Click on credential card | View modal opens with all details | ⬜ |
| TV-02 | Password is masked by default | Shows as dots (••••••••••••) | ⬜ |
| TV-03 | Click eye icon to show password | Password becomes visible | ⬜ |
| TV-04 | Click eye icon again to hide | Password masked again | ⬜ |
| TV-05 | Credential without website | Website row hidden in view modal | ⬜ |
| TV-06 | Credential without notes | Notes row hidden in view modal | ⬜ |
| TV-07 | Check timestamps | Created and modified dates displayed | ⬜ |

#### Editing Credentials

| Test ID | Description | Expected Result | Status |
|---------|-------------|------------------|--------|
| TE-01 | Click edit icon on card | Edit modal opens with pre-filled data | ⬜ |
| TE-02 | Modify credential fields | Changes saved successfully | ⬜ |
| TE-03 | Change category | Credential moves to new category | ⬜ |
| TE-04 | Toggle favorite status | Favorite indicator updates | ⬜ |
| TE-05 | Edit from view modal | Edit modal opens with correct data | ⬜ |
| TE-06 | Cancel edit | Modal closes, no changes saved | ⬜ |

#### Deleting Credentials

| Test ID | Description | Expected Result | Status |
|---------|-------------|------------------|--------|
| TD-01 | Click delete icon on card | Delete confirmation modal appears | ⬜ |
| TD-02 | Confirm deletion | Credential removed from list | ⬜ |
| TD-03 | Cancel deletion | Modal closes, credential remains | ⬜ |
| TD-04 | Delete last credential | Empty state message appears | ⬜ |
| TD-05 | Delete multiple credentials | All removed, counts update | ⬜ |

### 3. Password Generator

| Test ID | Description | Expected Result | Status |
|---------|-------------|------------------|--------|
| PG-01 | Open password generator | Modal opens with random password | ⬜ |
| PG-02 | Adjust length slider | Password length changes, value updates | ⬜ |
| PG-03 | Toggle uppercase checkbox | Password includes/excludes uppercase | ⬜ |
| PG-04 | Toggle lowercase checkbox | Password includes/excludes lowercase | ⬜ |
| PG-05 | Toggle numbers checkbox | Password includes/excludes numbers | ⬜ |
| PG-06 | Toggle symbols checkbox | Password includes/excludes symbols | ⬜ |
| PG-07 | Uncheck all checkboxes | Password uses lowercase only | ⬜ |
| PG-08 | Click regenerate button | New password generated | ⬜ |
| PG-09 | Check strength indicator | Strength updates based on password | ⬜ |
| PG-10 | Click copy button | Password copied to clipboard | ⬜ |
| PG-11 | Click "Use This Password" | Password inserted into credential form | ⬜ |
| PG-12 | Generate from credential form | Generator modal opens | ⬜ |

### 4. Search Functionality

| Test ID | Description | Expected Result | Status |
|---------|-------------|------------------|--------|
| SR-01 | Type in search bar | Results filter in real-time | ⬜ |
| SR-02 | Search by account name | Matching credentials appear | ⬜ |
| SR-03 | Search by username | Matching credentials appear | ⬜ |
| SR-04 | Search by website | Matching credentials appear | ⬜ |
| SR-05 | Search by notes | Matching credentials appear | ⬜ |
| SR-06 | Case-insensitive search | Results match regardless of case | ⬜ |
| SR-07 | No matches found | Empty state or no results message | ⬜ |
| SR-08 | Clear search button | Button appears when typing | ⬜ |
| SR-09 | Click clear search | Results reset, search cleared | ⬜ |
| SR-10 | Keyboard shortcut (Ctrl/Cmd+K) | Search bar focused | ⬜ |

### 5. Category Filtering

| Test ID | Description | Expected Result | Status |
|---------|-------------|------------------|--------|
| CF-01 | Click "All Credentials" | All credentials shown | ⬜ |
| CF-02 | Click specific category | Only that category shown | ⬜ |
| CF-03 | Category counts update | Counts reflect actual numbers | ⬜ |
| CF-04 | Active category highlighted | Selected category has different style | ⬜ |
| CF-05 | Add credential in category | Count increases for that category | ⬜ |
| CF-06 | Delete from category | Count decreases for that category | ⬜ |
| CF-07 | Search within category | Searches filtered results | ⬜ |

### 6. Import/Export

#### Export

| Test ID | Description | Expected Result | Status |
|---------|-------------|------------------|--------|
| EX-01 | Export as JSON (unencrypted) | File downloads with all credentials | ⬜ |
| EX-02 | Export as JSON (encrypted) | File downloads with encrypted data | ⬜ |
| EX-03 | Export as CSV | File downloads with CSV format | ⬜ |
| EX-04 | Verify JSON file content | Contains all credential data | ⬜ |
| EX-05 | Verify encrypted export | Cannot read without master password | ⬜ |
| EX-06 | Export with no credentials | Empty file or appropriate message | ⬜ |

#### Import

| Test ID | Description | Expected Result | Status |
|---------|-------------|------------------|--------|
| IM-01 | Import valid JSON file | Credentials imported successfully | ⬜ |
| IM-02 | Import encrypted file | Prompts for password, imports correctly | ⬜ |
| IM-03 | Import duplicate credentials | Duplicates skipped, new ones added | ⬜ |
| IM-04 | Import invalid JSON | Error message displayed | ⬜ |
| IM-05 | Drag and drop file | File imports correctly | ⬜ |
| IM-06 | Click browse button | File picker opens, can select file | ⬜ |
| IM-07 | Import results shown | Summary of imported/skipped displayed | ⬜ |
| IM-08 | Import after clearing data | All credentials restored | ⬜ |

### 7. Audit Log

| Test ID | Description | Expected Result | Status |
|---------|-------------|------------------|--------|
| AL-01 | Open audit log | Modal shows all entries | ⬜ |
| AL-02 | Entries sorted by time | Most recent first | ⬜ |
| AL-03 | Entry shows action | Action type displayed | ⬜ |
| AL-04 | Entry shows details | Details displayed if available | ⬜ |
| AL-05 | Entry shows timestamp | Date and time displayed | ⬜ |
| AL-06 | Add credential logged | New entry appears in log | ⬜ |
| AL-07 | Edit credential logged | New entry appears in log | ⬜ |
| AL-08 | Delete credential logged | New entry appears in log | ⬜ |
| AL-09 | Import/Export logged | Actions appear in log | ⬜ |
| AL-10 | Clear audit log | All entries removed | ⬜ |
| AL-11 | Export audit log | Log file downloads | ⬜ |
| AL-12 | Empty log state | Message shows no entries | ⬜ |

### 8. Theme Management

| Test ID | Description | Expected Result | Status |
|---------|-------------|------------------|--------|
| TH-01 | Click theme toggle | Theme switches between light/dark | ⬜ |
| TH-02 | Sun icon in dark mode | Moon icon shown, sun hidden | ⬜ |
| TH-03 | Moon icon in light mode | Sun icon shown, moon hidden | ⬜ |
| TH-04 | Theme persists on reload | Previous theme maintained | ⬜ |
| TH-05 | System preference detected | Matches OS theme on first load | ⬜ |
| TH-06 | Dark mode colors readable | All text visible in dark mode | ⬜ |
| TH-07 | Light mode colors readable | All text visible in light mode | ⬜ |

### 9. View Modes

| Test ID | Description | Expected Result | Status |
|---------|-------------|------------------|--------|
| VM-01 | Click grid view button | Cards display in grid layout | ⬜ |
| VM-02 | Click list view button | Cards display in list layout | ⬜ |
| VM-03 | Grid view responsive | Adjusts to screen size | ⬜ |
| VM-04 | List view responsive | Adjusts to screen size | ⬜ |
| VM-05 | View mode persists | Remains selected after actions | ⬜ |

### 10. Copy to Clipboard

| Test ID | Description | Expected Result | Status |
|---------|-------------|------------------|--------|
| CP-01 | Copy username from card | Username copied, toast appears | ⬜ |
| CP-02 | Copy password from card | Password copied, toast appears | ⬜ |
| CP-03 | Copy from view modal | Field value copied, toast appears | ⬜ |
| CP-04 | Copy website | URL copied, toast appears | ⬜ |
| CP-05 | Verify clipboard content | Copied value matches expected | ⬜ |

### 11. Auto-Lock

| Test ID | Description | Expected Result | Status |
|---------|-------------|------------------|--------|
| ALK-01 | Wait 5 minutes inactive | Application locks automatically | ⬜ |
| ALK-02 | Activity before timeout | Timer resets, no lock | ⬜ |
| ALK-03 | Move mouse | Timer resets | ⬜ |
| ALK-04 | Type on keyboard | Timer resets | ⬜ |
| ALK-05 | Click anywhere | Timer resets | ⬜ |
| ALK-06 | Manual lock via menu | Application locks immediately | ⬜ |
| ALK-07 | Lock via logout button | Confirmation dialog, then lock | ⬜ |

### 12. Modal Management

| Test ID | Description | Expected Result | Status |
|---------|-------------|------------------|--------|
| MM-01 | Open multiple modals | Only one modal visible at a time | ⬜ |
| MM-02 | Close with X button | Modal closes | ⬜ |
| MM-03 | Close with Escape key | All modals close | ⬜ |
| MM-04 | Click outside modal | Modal closes (backdrop click) | ⬜ |
| MM-05 | Modal animation | Smooth open/close animation | ⬜ |
| MM-06 | Focus management | First input focused on open | ⬜ |

### 13. Responsive Design

| Test ID | Description | Expected Result | Status |
|---------|-------------|------------------|--------|
| RD-01 | Desktop view (1920px) | Full layout with sidebar | ⬜ |
| RD-02 | Tablet view (768px) | Adjusted layout, sidebar moves | ⬜ |
| RD-03 | Mobile view (480px) | Stacked layout, full-width cards | ⬜ |
| RD-04 | Touch interactions | Buttons work on touch devices | ⬜ |
| RD-05 | Scroll behavior | Content scrolls properly | ⬜ |

### 14. Security Features

| Test ID | Description | Expected Result | Status |
|---------|-------------|------------------|--------|
| SF-01 | Check IndexedDB storage | Data is encrypted, not plain text | ⬜ |
| SF-02 | Master password not stored | Only hash stored in settings | ⬜ |
| SF-03 | Lock clears memory | Decrypted data not accessible after lock | ⬜ |
| SF-04 | Before unload warning | Warning when leaving with unlocked app | ⬜ |
| SF-05 | No external requests | Check network tab - no external calls | ⬜ |

### 15. Error Handling

| Test ID | Description | Expected Result | Status |
|---------|-------------|------------------|--------|
| EH-01 | Invalid file import | Error message displayed | ⬜ |
| EH-02 | Corrupted data | Graceful error handling | ⬜ |
| EH-03 | Storage quota exceeded | Appropriate error message | ⬜ |
| EH-04 | Browser not supported | Feature detection message | ⬜ |

### 16. Accessibility

| Test ID | Description | Expected Result | Status |
|---------|-------------|------------------|--------|
| A11Y-01 | Keyboard navigation | All features accessible via keyboard | ⬜ |
| A11Y-02 | Screen reader compatibility | Labels and announcements work | ⬜ |
| A11Y-03 | Focus indicators | Visible focus on all interactive elements | ⬜ |
| A11Y-04 | Color contrast | Meets WCAG AA standards | ⬜ |
| A11Y-05 | Reduced motion | Respects prefers-reduced-motion | ⬜ |

## Browser Compatibility Testing

Test in the following browsers:

| Browser | Version | Notes | Status |
|---------|----------|--------|--------|
| Chrome | 90+ | ⬜ | |
| Firefox | 88+ | ⬜ | |
| Safari | 14+ | ⬜ | |
| Edge | 90+ | ⬜ | |
| Opera | 76+ | ⬜ | |

## Performance Testing

| Test ID | Description | Expected Result | Status |
|---------|-------------|------------------|--------|
| PF-01 | Initial load time | < 2 seconds | ⬜ |
| PF-02 | Search with 100+ credentials | < 500ms response | ⬜ |
| PF-03 | Modal open animation | Smooth, no lag | ⬜ |
| PF-04 | Password generation | Instant | ⬜ |
| PF-05 | Export large dataset | < 3 seconds | ⬜ |

## Regression Testing

After any code changes, re-run:

1. All credential management tests (TC, TV, TE, TD)
2. Search functionality (SR)
3. Import/Export (EX, IM)
4. Security features (SF)

## Test Execution Checklist

- [ ] All test cases documented above executed
- [ ] Results recorded for each test
- [ ] Failed tests identified and logged
- [ ] Browser compatibility verified
- [ ] Performance benchmarks met
- [ ] Accessibility standards met
- [ ] Security features verified

## Bug Report Template

If a test fails:

```
Test ID: [ID]
Description: [What was being tested]
Expected: [What should happen]
Actual: [What actually happened]
Browser: [Name and version]
OS: [Operating system]
Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Screenshot/Video: [Attach if applicable]
Console Errors: [Paste any console errors]
```

## Sign-off

| Tester | Date | Browser | Results |
|---------|-------|---------|---------|
| | | | |
| | | | |
| | | | |

---

**Document Version**: 1.0
**Last Updated**: 2024
