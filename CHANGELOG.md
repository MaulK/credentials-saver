# Changelog

All notable changes to CredentialSaver will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Planned
- Browser extension for auto-fill functionality
- Two-factor authentication for app unlock
- Cloud backup options (encrypted)
- Password expiration reminders
- Cross-browser data synchronization
- Mobile app version
- Team/family sharing features

## [1.0.0] - 2026-02-24

### Added
- **Core Features**
  - Secure credential storage with AES-256-GCM encryption
  - Master password protection with PBKDF2 key derivation (100,000 iterations)
  - Local-only storage using IndexedDB
  - No server-side components or cloud storage

- **Credential Management**
  - Add new credentials with name, username, password, website, category, notes
  - Edit existing credentials
  - Delete credentials with confirmation
  - Mark credentials as favorites
  - View credential details in modal
  - Show/hide password toggle
  - Copy username/password to clipboard

- **Password Generator**
  - Generate strong random passwords
  - Adjustable length (8-64 characters)
  - Toggle uppercase, lowercase, numbers, symbols
  - Real-time strength indicator
  - Copy generated password
  - Use generated password in credential form

- **Organization**
  - Category system (Social, Email, Banking, Shopping, Work, Other)
  - Filter credentials by category
  - Category counts in sidebar
  - Search across all credentials
  - Real-time search results

- **Import/Export**
  - Export to JSON (encrypted or plain)
  - Export to CSV format
  - Import from JSON files
  - Drag and drop import
  - Duplicate detection during import

- **Security**
  - Auto-lock after 5 minutes of inactivity
  - Manual lock option
  - Audit log of all changes
  - Export audit log
  - Clear audit log option
  - Security information modal

- **UI/UX**
  - Dark/light theme toggle
  - Theme persistence
  - Grid and list view modes
  - Responsive design (mobile, tablet, desktop)
  - Smooth animations and transitions
  - Toast notifications
  - Loading states
  - Empty state messages
  - Confirmation dialogs

- **Accessibility**
  - Keyboard navigation support
  - Screen reader compatible
  - Focus indicators
  - ARIA labels
  - Reduced motion support
  - High contrast mode support

- **Keyboard Shortcuts**
  - Escape to close modals
  - Ctrl/Cmd + K to focus search

### Security
- AES-256-GCM encryption for all credential data
- PBKDF2 with SHA-256 for key derivation
- 100,000 iterations for key derivation
- Cryptographically random salt and IV
- Master password never stored (only hash)
- Decrypted data only in memory while unlocked
- No external network requests
- XSS prevention through input sanitization

### Documentation
- Comprehensive README with installation and usage
- Security considerations document
- Testing instructions with test cases
- Contributing guidelines
- This changelog

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Opera 76+

## Version Format

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Incompatible API changes
- **MINOR**: Backwards-compatible functionality additions
- **PATCH**: Backwards-compatible bug fixes

## Migration Guide

### From Previous Versions

Since this is version 1.0.0, there are no previous versions to migrate from.

### Future Migrations

When upgrading to future versions:

1. Export your current credentials as encrypted backup
2. Upgrade to new version
3. Import your backup
4. Verify all credentials are present
5. Delete old version data if needed

## Support

For issues, questions, or feature requests, please:
- Check the [documentation](docs/README.md)
- Review [security considerations](docs/SECURITY.md)
- Follow [testing guide](docs/TESTING.md)
- [Report an issue](https://github.com/yourusername/credentialsaver/issues)
