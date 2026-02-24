# CredentialSaver

A secure, local password manager that stores your credentials entirely in your browser using AES-256-GCM encryption. No server-side components, no cloud storage - your data stays on your device.

## Features

- **Secure Storage**: AES-256-GCM encryption using the Web Crypto API
- **Local Only**: All data stored in IndexedDB - nothing leaves your browser
- **Master Password**: Protect your vault with a strong master password
- **Password Generator**: Generate strong, random passwords
- **Categories**: Organize credentials into categories (Social, Email, Banking, Shopping, Work, Other)
- **Search**: Quickly find credentials by name, username, website, or notes
- **Import/Export**: Backup and restore your credentials in JSON or CSV format
- **Dark/Light Mode**: Toggle between themes
- **Audit Log**: Track all changes to your credentials
- **Auto-Lock**: Automatically locks after 5 minutes of inactivity
- **Responsive Design**: Works on desktop and mobile devices

## Installation

### Option 1: Direct File Access

1. Download the project files:
   - `index.html`
   - `styles.css`
   - `app.js`

2. Open `index.html` in your web browser

### Option 2: Local Server (Recommended)

Using Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Using Node.js:
```bash
npx http-server -p 8000
```

Using PHP:
```bash
php -S localhost:8000
```

Then navigate to `http://localhost:8000` in your browser.

### Option 3: Browser Extension

To use as a browser extension:

1. Create a `manifest.json` file:
```json
{
  "manifest_version": 3,
  "name": "CredentialSaver",
  "version": "1.0",
  "description": "Secure local password manager",
  "action": {
    "default_popup": "index.html"
  },
  "permissions": ["storage"]
}
```

2. Load the extension in Chrome/Edge:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the folder containing your files

## First Time Setup

1. Open CredentialSaver in your browser
2. You'll be prompted to create a master password
3. Choose a strong, unique password that you won't forget
4. Confirm your master password
5. Your vault is now ready!

## Usage Guide

### Adding a Credential

1. Click the "Add Credential" button in the sidebar
2. Fill in the required fields:
   - **Account Name**: e.g., "Google Account"
   - **Email/Username**: Your login email or username
   - **Password**: Your password (or use the generator)
3. Optionally add:
   - **Website URL**: Link to the service
   - **Category**: Choose a category for organization
   - **Notes**: Additional information
   - **Favorite**: Mark as important
4. Click "Save Credential"

### Viewing Credentials

1. Click on any credential card to view details
2. Click the eye icon to show/hide the password
3. Click the copy icon to copy username or password to clipboard
4. Click the website link to open it in a new tab

### Editing a Credential

1. Click the edit icon on a credential card
2. Modify the fields as needed
3. Click "Save Credential"

### Deleting a Credential

1. Click the delete icon on a credential card
2. Confirm the deletion in the dialog

### Using the Password Generator

1. Click "Generate Password" when adding/editing a credential
2. Adjust the length (8-64 characters)
3. Select character types to include:
   - Uppercase letters (A-Z)
   - Lowercase letters (a-z)
   - Numbers (0-9)
   - Symbols (!@#$%^&*)
4. Click "Regenerate" for a new password
5. Click "Copy" to copy to clipboard
6. Click "Use This Password" to insert it into the form

### Searching Credentials

1. Use the search bar in the header
2. Type to search by name, username, website, or notes
3. Results appear instantly as you type
4. Click the X to clear the search

### Filtering by Category

1. Click on a category in the sidebar
2. View only credentials in that category
3. The count shows how many credentials are in each category

### Importing Credentials

1. Click Tools → Import
2. Drag and drop a JSON file or click "Browse Files"
3. Duplicates will be skipped
4. Import results will be displayed

### Exporting Credentials

1. Click Tools → Export
2. Choose format:
   - **JSON**: Recommended, supports encrypted export
   - **CSV**: For spreadsheet compatibility
3. Choose whether to encrypt the export
4. Click "Download Export"

### Viewing Audit Log

1. Click Tools → Audit Log
2. View all actions taken in the app
3. Click "Export Log" to save the log
4. Click "Clear Log" to remove all entries

### Locking the Application

- Click the lock icon in the tools menu
- Or wait 5 minutes for auto-lock
- Re-enter your master password to unlock

### Switching Themes

- Click the sun/moon icon in the header
- Toggle between light and dark mode
- Your preference is saved

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Esc` | Close modal |
| `Ctrl/Cmd + K` | Focus search bar |

## Browser Compatibility

CredentialSaver works in all modern browsers that support:
- Web Crypto API
- IndexedDB
- ES6 JavaScript

Tested and working in:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Security

### Encryption

- **Algorithm**: AES-256-GCM
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Salt**: Unique salt per installation
- **IV**: Random IV for each encryption

### Data Storage

- **IndexedDB**: All encrypted data stored locally
- **No Server**: No data sent to any external server
- **Memory Only**: Decrypted data only in memory while unlocked

### Important Security Notes

⚠️ **Read Before Using:**

1. **Local Storage Only**: Clearing browser data will delete all credentials. Regular backups are essential.

2. **Master Password**: If you forget your master password, your data cannot be recovered. There is no password reset feature.

3. **Single Browser**: Data is only accessible in the specific browser where it was stored. It won't sync across devices.

4. **Export Security**: Exported files (especially unencrypted) contain your passwords. Keep them secure and delete after use.

5. **Browser Security**: Use a reputable browser with good security features and keep it updated.

### Best Practices

1. Use a strong, unique master password (at least 12 characters)
2. Enable two-factor authentication on all your accounts
3. Regularly export encrypted backups
4. Lock the application when not in use
5. Keep your browser and operating system updated
6. Use a reputable password manager alongside this for critical accounts

## Troubleshooting

### Application won't load

- Ensure JavaScript is enabled in your browser
- Check browser console for errors
- Try using a different browser

### Can't unlock with master password

- Double-check your password
- If you've forgotten it, your data cannot be recovered
- Consider this when choosing your master password

### Credentials not saving

- Check browser storage permissions
- Ensure IndexedDB is enabled
- Try clearing browser cache and reloading

### Import fails

- Ensure the file is valid JSON format
- Check that the file was exported from CredentialSaver
- Verify the file isn't corrupted

## Limitations

- No cloud sync or backup
- No browser extension integration (yet)
- No two-factor authentication for the app itself
- No password sharing features
- No team or family sharing

## Future Enhancements

Potential features for future versions:
- Browser extension for auto-fill
- Cloud backup options (encrypted)
- Two-factor authentication
- Password expiry reminders
- Cross-browser sync
- Mobile app version

## License

This project is provided as-is for personal use. Use at your own risk.

## Support

For issues, questions, or contributions, please refer to the project repository.

## Credits

Created as a secure, offline password manager solution.
