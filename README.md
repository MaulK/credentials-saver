# CredentialSaver

<div align="center">

![CredentialSaver](public/favicon.ico)

**A secure, local password manager that stores your credentials entirely in your browser using AES-256-GCM encryption.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version: 1.0.0](https://img.shields.io/badge/Version-1.0.0-green.svg)](CHANGELOG.md)

</div>

## 🌟 Features

- 🔒 **AES-256-GCM Encryption** - Military-grade encryption for your credentials
- 💾 **Local-Only Storage** - Data never leaves your browser
- 🔑 **Master Password** - Single password to access all credentials
- 🎲 **Password Generator** - Create strong, random passwords
- 📁 **Categories** - Organize credentials into folders
- 🔍 **Search** - Find credentials instantly
- 📤 **Import/Export** - Backup and restore your data
- 🌙 **Dark Mode** - Easy on the eyes
- 📱 **Responsive** - Works on all devices
- 📊 **Audit Log** - Track all changes

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Installation

### Option 1: Direct File Access

1. Clone or download this repository
2. Open `public/index.html` in your web browser

### Option 2: Local Server (Recommended)

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000`

### Option 3: Browser Extension

Create a `manifest.json` in the root directory:

```json
{
  "manifest_version": 3,
  "name": "CredentialSaver",
  "version": "1.0.0",
  "description": "Secure local password manager",
  "action": {
    "default_popup": "public/index.html"
  },
  "permissions": ["storage"]
}
```

Load as an unpacked extension in Chrome/Edge.

## 🎯 Quick Start

1. **Open** the application in your browser
2. **Create** a strong master password (minimum 12 characters recommended)
3. **Add** your first credential
4. **Use** the password generator for secure passwords
5. **Export** regular backups

## 📁 Project Structure

```
credentialsaver/
├── public/                 # Public files
│   ├── index.html          # Main HTML file
│   └── favicon.ico         # Application icon
├── src/                    # Source code
│   ├── css/               # Stylesheets
│   │   └── styles.css     # Main styles with dark/light mode
│   ├── js/                # JavaScript
│   │   └── app.js        # Application logic
│   └── assets/            # Static assets
├── docs/                   # Documentation
│   ├── README.md          # User guide
│   ├── SECURITY.md        # Security details
│   └── TESTING.md         # Test cases
├── tests/                  # Test files
├── config/                 # Configuration files
├── .gitignore             # Git ignore rules
├── LICENSE                # MIT License
├── package.json           # Project metadata
├── CONTRIBUTING.md        # Contribution guidelines
└── CHANGELOG.md          # Version history
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [User Guide](docs/README.md) | Complete installation and usage instructions |
| [Security](docs/SECURITY.md) | Security architecture and best practices |
| [Testing](docs/TESTING.md) | Comprehensive test cases |
| [Contributing](CONTRIBUTING.md) | How to contribute |
| [Changelog](CHANGELOG.md) | Version history and changes |

## 🔒 Security

CredentialSaver uses industry-standard security:

- **Encryption**: AES-256-GCM
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Storage**: IndexedDB (encrypted)
- **No Server**: All data stays local

⚠️ **Important**: 
- Clearing browser data deletes all credentials
- Forgotten master password cannot be recovered
- Regular backups are essential

See [Security Documentation](docs/SECURITY.md) for complete details.

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌐 Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |
| Opera | 76+ |

## 🎨 Screenshots

### Light Mode
```
┌─────────────────────────────────────────┐
│  🔐 CredentialSaver              │
│  ┌────────────────────────────┐     │
│  │ + Add Credential          │     │
│  └────────────────────────────┘     │
│  ┌────────────────────────────┐     │
│  │ 📁 All Credentials (5)   │     │
│  │ 👤 Social (2)            │     │
│  │ 📧 Email (1)             │     │
│  │ 🏦 Banking (1)            │     │
│  │ 🛒 Shopping (1)           │     │
│  └────────────────────────────┘     │
│  ┌────────────────────────────┐     │
│  │ 🔍 Search credentials...  │     │
│  └────────────────────────────┘     │
└─────────────────────────────────────────┘
```

### Dark Mode
```
┌─────────────────────────────────────────┐
│  🔐 CredentialSaver              │
│  ┌────────────────────────────┐     │
│  │ + Add Credential          │     │
│  └────────────────────────────┘     │
│  ┌────────────────────────────┐     │
│  │ 📁 All Credentials (5)   │     │
│  │ 👤 Social (2)            │     │
│  │ 📧 Email (1)             │     │
│  │ 🏦 Banking (1)            │     │
│  │ 🛒 Shopping (1)           │     │
│  └────────────────────────────┘     │
│  ┌────────────────────────────┐     │
│  │ 🔍 Search credentials...  │     │
│  └────────────────────────────┘     │
└─────────────────────────────────────────┘
```

## 📞 Support

- 📖 [Documentation](docs/README.md)
- 🔒 [Security Guide](docs/SECURITY.md)
- 🧪 [Testing Guide](docs/TESTING.md)
- 📝 [Report Issues](https://github.com/yourusername/credentialsaver/issues)

## 🙏 Acknowledgments

- Built with modern web technologies
- Icons from [Feather Icons](https://feathericons.com/)
- Inspired by industry password managers

---

<div align="center">

**Made with ❤️ for security-conscious users**

[⬆ Back to Top](#credentialsaver)

</div>
