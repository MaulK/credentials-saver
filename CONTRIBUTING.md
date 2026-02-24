# Contributing to CredentialSaver

Thank you for your interest in contributing to CredentialSaver! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other contributors

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates.

When creating a bug report, include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: 
   ```
   1. Go to '...'
   2. Click on '....'
   3. Scroll down to '....'
   4. See error
   ```
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Screenshots**: If applicable, add screenshots
6. **Environment**:
   - OS: [e.g. Windows 10, macOS 14]
   - Browser: [e.g. Chrome 120, Firefox 121]
   - Version: [e.g. 1.0.0]

### Suggesting Enhancements

Enhancement suggestions are welcome! Please:

1. Check if the feature already exists
2. Check if it's already requested
3. Provide a clear use case
4. Explain why it would be beneficial
5. Consider implementation complexity

### Pull Requests

#### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/credentialsaver.git
   cd credentialsaver
   ```

3. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. Make your changes

5. Test your changes thoroughly

6. Commit your changes:
   ```bash
   git add .
   git commit -m "Add your feature"
   ```

7. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

8. Create a Pull Request

#### Coding Standards

- Follow existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and small
- Avoid unnecessary complexity

#### Security Considerations

Any code changes must:

- Not compromise encryption strength
- Maintain data privacy
- Follow secure coding practices
- Not introduce XSS vulnerabilities
- Not expose sensitive data in logs

#### Testing

Before submitting a PR:

1. Test on multiple browsers (Chrome, Firefox, Safari, Edge)
2. Test on different screen sizes
3. Test with various data sets
4. Verify no console errors
5. Check accessibility

#### Commit Messages

Use clear, descriptive commit messages:

```
feat: add password strength indicator
fix: resolve issue with modal z-index
docs: update installation instructions
style: improve button hover effects
refactor: simplify encryption module
test: add tests for import/export
chore: update dependencies
```

#### PR Description

Include in your PR:

- **Description**: What changes were made
- **Type**: bug fix, feature, enhancement, etc.
- **Related Issues**: Link to related issues
- **Screenshots**: For UI changes
- **Testing**: How you tested the changes

## Project Structure

```
credentialsaver/
├── public/              # Static assets and HTML
│   ├── index.html
│   └── favicon.ico
├── src/                 # Source code
│   ├── css/            # Stylesheets
│   │   └── styles.css
│   └── js/             # JavaScript modules
│       └── app.js
├── docs/                # Documentation
│   ├── README.md
│   ├── SECURITY.md
│   └── TESTING.md
├── tests/               # Test files
├── config/              # Configuration files
├── .gitignore
├── LICENSE
├── package.json
└── CONTRIBUTING.md
```

## Areas for Contribution

We welcome contributions in these areas:

### Security Enhancements
- Additional encryption options
- Security audit findings
- Vulnerability fixes

### Feature Additions
- Browser extension for auto-fill
- Two-factor authentication
- Password sharing (encrypted)
- Cloud backup options
- Password expiration tracking

### UI/UX Improvements
- Better accessibility
- Mobile optimizations
- New themes
- Improved animations

### Documentation
- Translation to other languages
- Video tutorials
- Additional guides
- API documentation

### Testing
- Automated test suite
- Cross-browser testing
- Performance testing
- Security testing

## Getting Help

If you need help:

1. Check existing documentation
2. Search existing issues
3. Ask in discussions (if available)
4. Contact maintainers

## Recognition

Contributors will be:
- Listed in the contributors section
- Mentioned in release notes
- Invited to become maintainers (for significant contributions)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
