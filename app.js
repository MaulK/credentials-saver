/**
 * CredentialSaver - Secure Local Password Manager
 * 
 * A comprehensive password manager that stores credentials locally
 * using IndexedDB with AES-256-GCM encryption via Web Crypto API.
 */

// ============================================
// Configuration & Constants
// ============================================

const CONFIG = {
    DB_NAME: 'CredentialSaverDB',
    DB_VERSION: 1,
    STORES: {
        CREDENTIALS: 'credentials',
        SETTINGS: 'settings',
        AUDIT_LOG: 'audit_log'
    },
    ENCRYPTION: {
        ALGORITHM: 'AES-GCM',
        KEY_LENGTH: 256,
        SALT_LENGTH: 16,
        IV_LENGTH: 12,
        ITERATIONS: 100000
    },
    AUTO_LOCK_MINUTES: 5,
    MAX_AUDIT_ENTRIES: 500
};

const CATEGORIES = {
    social: 'Social Media',
    email: 'Email',
    banking: 'Banking',
    shopping: 'Shopping',
    work: 'Work',
    other: 'Other'
};

// ============================================
// Global State
// ============================================

const AppState = {
    isUnlocked: false,
    masterKey: null,
    credentials: [],
    currentCategory: 'all',
    searchQuery: '',
    viewMode: 'grid',
    inactivityTimer: null,
    currentCredentialId: null,
    theme: 'light'
};

// ============================================
// Encryption Utilities (Web Crypto API)
// ============================================

const CryptoUtils = {
    /**
     * Generate a random salt for key derivation
     */
    async generateSalt() {
        return crypto.getRandomValues(new Uint8Array(CONFIG.ENCRYPTION.SALT_LENGTH));
    },

    /**
     * Generate a random IV for encryption
     */
    async generateIV() {
        return crypto.getRandomValues(new Uint8Array(CONFIG.ENCRYPTION.IV_LENGTH));
    },

    /**
     * Derive encryption key from master password using PBKDF2
     */
    async deriveKey(password, salt) {
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveKey']
        );

        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: CONFIG.ENCRYPTION.ITERATIONS,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: CONFIG.ENCRYPTION.ALGORITHM, length: CONFIG.ENCRYPTION.KEY_LENGTH },
            false,
            ['encrypt', 'decrypt']
        );
    },

    /**
     * Encrypt data using AES-GCM
     */
    async encrypt(data, key) {
        const iv = await this.generateIV();
        const encoder = new TextEncoder();
        const encrypted = await crypto.subtle.encrypt(
            {
                name: CONFIG.ENCRYPTION.ALGORITHM,
                iv: iv
            },
            key,
            encoder.encode(JSON.stringify(data))
        );

        // Combine IV and encrypted data
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);

        return this.arrayBufferToBase64(combined);
    },

    /**
     * Decrypt data using AES-GCM
     */
    async decrypt(encryptedData, key) {
        const combined = this.base64ToArrayBuffer(encryptedData);
        const iv = combined.slice(0, CONFIG.ENCRYPTION.IV_LENGTH);
        const data = combined.slice(CONFIG.ENCRYPTION.IV_LENGTH);

        const decrypted = await crypto.subtle.decrypt(
            {
                name: CONFIG.ENCRYPTION.ALGORITHM,
                iv: iv
            },
            key,
            data
        );

        const decoder = new TextDecoder();
        return JSON.parse(decoder.decode(decrypted));
    },

    /**
     * Hash a value using SHA-256
     */
    async hash(value) {
        const encoder = new TextEncoder();
        const data = encoder.encode(value);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    /**
     * Convert ArrayBuffer to Base64
     */
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    },

    /**
     * Convert Base64 to ArrayBuffer
     */
    base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }
};

// ============================================
// IndexedDB Storage
// ============================================

const Storage = {
    db: null,

    /**
     * Initialize IndexedDB
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(CONFIG.DB_NAME, CONFIG.DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Credentials store
                if (!db.objectStoreNames.contains(CONFIG.STORES.CREDENTIALS)) {
                    const credentialStore = db.createObjectStore(CONFIG.STORES.CREDENTIALS, { keyPath: 'id' });
                    credentialStore.createIndex('category', 'category', { unique: false });
                    credentialStore.createIndex('favorite', 'favorite', { unique: false });
                    credentialStore.createIndex('created', 'created', { unique: false });
                }

                // Settings store
                if (!db.objectStoreNames.contains(CONFIG.STORES.SETTINGS)) {
                    db.createObjectStore(CONFIG.STORES.SETTINGS, { keyPath: 'key' });
                }

                // Audit log store
                if (!db.objectStoreNames.contains(CONFIG.STORES.AUDIT_LOG)) {
                    const auditStore = db.createObjectStore(CONFIG.STORES.AUDIT_LOG, { keyPath: 'id' });
                    auditStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    },

    /**
     * Get all items from a store
     */
    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Get a single item from a store
     */
    async get(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Put an item in a store
     */
    async put(storeName, item) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(item);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Delete an item from a store
     */
    async delete(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Clear all items from a store
     */
    async clear(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
};

// ============================================
// Password Strength Checker
// ============================================

const PasswordStrength = {
    /**
     * Calculate password strength
     */
    calculate(password) {
        let score = 0;
        let feedback = [];

        if (!password) {
            return { score: 0, label: 'Enter password', color: 'weak' };
        }

        // Length
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        if (password.length >= 16) score += 1;

        // Character types
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^a-zA-Z0-9]/.test(password)) score += 2;

        // Bonus for variety
        const uniqueChars = new Set(password).size;
        if (uniqueChars / password.length > 0.7) score += 1;

        // Determine label
        let label, color;
        if (score < 3) {
            label = 'Weak';
            color = 'weak';
            feedback.push('Use a longer password');
        } else if (score < 5) {
            label = 'Fair';
            color = 'fair';
            feedback.push('Add more character types');
        } else if (score < 7) {
            label = 'Good';
            color = 'good';
        } else {
            label = 'Strong';
            color = 'strong';
        }

        return { score, label, color, feedback };
    },

    /**
     * Update strength indicator
     */
    updateIndicator(password, fillElement, textElement) {
        const result = this.calculate(password);

        fillElement.className = 'strength-fill ' + result.color;
        textElement.textContent = result.label;

        return result;
    }
};

// ============================================
// Password Generator
// ============================================

const PasswordGenerator = {
    /**
     * Generate a random password
     */
    generate(options = {}) {
        const {
            length = 16,
            uppercase = true,
            lowercase = true,
            numbers = true,
            symbols = true
        } = options;

        let chars = '';
        if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
        if (numbers) chars += '0123456789';
        if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        if (!chars) {
            chars = 'abcdefghijklmnopqrstuvwxyz';
        }

        let password = '';
        const array = new Uint32Array(length);
        crypto.getRandomValues(array);

        for (let i = 0; i < length; i++) {
            password += chars[array[i] % chars.length];
        }

        return password;
    }
};

// ============================================
// Audit Log
// ============================================

const AuditLog = {
    /**
     * Add an entry to the audit log
     */
    async add(action, details = '') {
        const entry = {
            id: crypto.randomUUID(),
            action,
            details,
            timestamp: Date.now()
        };

        await Storage.put(CONFIG.STORES.AUDIT_LOG, entry);
        await this.prune();
    },

    /**
     * Get all audit log entries
     */
    async getAll() {
        const entries = await Storage.getAll(CONFIG.STORES.AUDIT_LOG);
        return entries.sort((a, b) => b.timestamp - a.timestamp);
    },

    /**
     * Prune old entries
     */
    async prune() {
        const entries = await Storage.getAll(CONFIG.STORES.AUDIT_LOG);
        if (entries.length > CONFIG.MAX_AUDIT_ENTRIES) {
            const toDelete = entries
                .sort((a, b) => a.timestamp - b.timestamp)
                .slice(0, entries.length - CONFIG.MAX_AUDIT_ENTRIES);

            for (const entry of toDelete) {
                await Storage.delete(CONFIG.STORES.AUDIT_LOG, entry.id);
            }
        }
    },

    /**
     * Clear all audit log entries
     */
    async clear() {
        await Storage.clear(CONFIG.STORES.AUDIT_LOG);
    }
};

// ============================================
// Toast Notifications
// ============================================

const Toast = {
    container: null,

    init() {
        this.container = document.getElementById('toast-container');
    },

    show(message, type = 'info', duration = 3000) {
        if (!this.container) this.init();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
            error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-message">${this.escapeHtml(message)}</div>
            <button class="toast-close" aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        // Close button
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.dismiss(toast));

        this.container.appendChild(toast);

        // Auto dismiss
        setTimeout(() => this.dismiss(toast), duration);
    },

    dismiss(toast) {
        toast.classList.add('removing');
        toast.addEventListener('animationend', () => toast.remove());
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ============================================
// Modal Management
// ============================================

const Modal = {
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            // Trigger reflow for animation
            void modal.offsetWidth;
            modal.classList.add('show');

            // Focus first input
            const firstInput = modal.querySelector('input:not([type="hidden"])');
            if (firstInput) firstInput.focus();
        }
    },

    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 250);
        }
    },

    closeAll() {
        document.querySelectorAll('.modal.show').forEach(modal => {
            this.close(modal.id);
        });
    }
};

// ============================================
// Credential Management
// ============================================

const CredentialManager = {
    /**
     * Create a new credential
     */
    async create(credential) {
        const encrypted = await CryptoUtils.encrypt(credential, AppState.masterKey);

        const record = {
            id: crypto.randomUUID(),
            encrypted,
            category: credential.category,
            favorite: credential.favorite || false,
            created: Date.now(),
            modified: Date.now()
        };

        await Storage.put(CONFIG.STORES.CREDENTIALS, record);
        await AuditLog.add('Credential Created', `Created: ${credential.name}`);

        return record;
    },

    /**
     * Update an existing credential
     */
    async update(id, credential) {
        const encrypted = await CryptoUtils.encrypt(credential, AppState.masterKey);

        const record = {
            id,
            encrypted,
            category: credential.category,
            favorite: credential.favorite || false,
            modified: Date.now()
        };

        await Storage.put(CONFIG.STORES.CREDENTIALS, record);
        await AuditLog.add('Credential Updated', `Updated: ${credential.name}`);

        return record;
    },

    /**
     * Delete a credential
     */
    async delete(id) {
        const credential = await this.getById(id);
        await Storage.delete(CONFIG.STORES.CREDENTIALS, id);
        await AuditLog.add('Credential Deleted', `Deleted: ${credential?.name || id}`);
    },

    /**
     * Get a credential by ID
     */
    async getById(id) {
        const record = await Storage.get(CONFIG.STORES.CREDENTIALS, id);
        if (record && AppState.masterKey) {
            return await CryptoUtils.decrypt(record.encrypted, AppState.masterKey);
        }
        return null;
    },

    /**
     * Get all credentials
     */
    async getAll() {
        const records = await Storage.getAll(CONFIG.STORES.CREDENTIALS);
        const credentials = [];

        for (const record of records) {
            if (AppState.masterKey) {
                try {
                    const credential = await CryptoUtils.decrypt(record.encrypted, AppState.masterKey);
                    credential._meta = {
                        id: record.id,
                        favorite: record.favorite,
                        created: record.created,
                        modified: record.modified
                    };
                    credentials.push(credential);
                } catch (e) {
                    console.error('Failed to decrypt credential:', record.id, e);
                }
            }
        }

        return credentials;
    },

    /**
     * Get credentials by category
     */
    async getByCategory(category) {
        const all = await this.getAll();
        if (category === 'all') return all;
        return all.filter(c => c.category === category);
    },

    /**
     * Search credentials
     */
    async search(query) {
        const all = await this.getAll();
        const lowerQuery = query.toLowerCase();

        return all.filter(c =>
            c.name.toLowerCase().includes(lowerQuery) ||
            c.username.toLowerCase().includes(lowerQuery) ||
            (c.website && c.website.toLowerCase().includes(lowerQuery)) ||
            (c.notes && c.notes.toLowerCase().includes(lowerQuery))
        );
    }
};

// ============================================
// Import/Export
// ============================================

const ImportExport = {
    /**
     * Export credentials to JSON
     */
    async exportToJson(encrypted = true) {
        const credentials = await CredentialManager.getAll();
        let data;

        if (encrypted && AppState.masterKey) {
            data = await CryptoUtils.encrypt(credentials, AppState.masterKey);
        } else {
            data = credentials;
        }

        const json = JSON.stringify({ version: '1.0', encrypted, data }, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `credentials-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        URL.revokeObjectURL(url);
        await AuditLog.add('Export', 'Exported credentials');
    },

    /**
     * Export credentials to CSV
     */
    async exportToCsv() {
        const credentials = await CredentialManager.getAll();

        const headers = ['Name', 'Username', 'Password', 'Website', 'Category', 'Notes', 'Created', 'Modified'];
        const rows = credentials.map(c => [
            `"${c.name.replace(/"/g, '""')}"`,
            `"${c.username.replace(/"/g, '""')}"`,
            `"${c.password.replace(/"/g, '""')}"`,
            `"${(c.website || '').replace(/"/g, '""')}"`,
            `"${c.category}"`,
            `"${(c.notes || '').replace(/"/g, '""')}"`,
            `"${new Date(c._meta.created).toISOString()}"`,
            `"${new Date(c._meta.modified).toISOString()}"`
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `credentials-backup-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();

        URL.revokeObjectURL(url);
        await AuditLog.add('Export', 'Exported credentials to CSV');
    },

    /**
     * Import credentials from JSON
     */
    async importFromJson(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const json = JSON.parse(e.target.result);
                    let credentials = [];

                    if (json.encrypted && AppState.masterKey) {
                        credentials = await CryptoUtils.decrypt(json.data, AppState.masterKey);
                    } else if (Array.isArray(json.data)) {
                        credentials = json.data;
                    } else if (Array.isArray(json)) {
                        credentials = json;
                    } else {
                        throw new Error('Invalid import format');
                    }

                    let imported = 0;
                    let skipped = 0;
                    const existing = await CredentialManager.getAll();
                    const existingNames = new Set(existing.map(c => `${c.name}|${c.username}`));

                    for (const credential of credentials) {
                        const key = `${credential.name}|${credential.username}`;
                        if (existingNames.has(key)) {
                            skipped++;
                        } else {
                            await CredentialManager.create(credential);
                            imported++;
                            existingNames.add(key);
                        }
                    }

                    await AuditLog.add('Import', `Imported ${imported} credentials, skipped ${skipped}`);
                    resolve({ imported, skipped });
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }
};

// ============================================
// Theme Management
// ============================================

const ThemeManager = {
    async init() {
        // Check saved theme or system preference
        const savedTheme = localStorage.getItem('credentialsaver-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        AppState.theme = savedTheme || (prefersDark ? 'dark' : 'light');
        this.apply();
    },

    apply() {
        document.documentElement.setAttribute('data-theme', AppState.theme);
        localStorage.setItem('credentialsaver-theme', AppState.theme);

        // Update icons
        const sunIcon = document.querySelector('.sun-icon');
        const moonIcon = document.querySelector('.moon-icon');

        if (sunIcon && moonIcon) {
            if (AppState.theme === 'dark') {
                sunIcon.classList.add('hidden');
                moonIcon.classList.remove('hidden');
            } else {
                sunIcon.classList.remove('hidden');
                moonIcon.classList.add('hidden');
            }
        }
    },

    toggle() {
        AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
        this.apply();
    }
};

// ============================================
// Inactivity Timer
// ============================================

const InactivityTimer = {
    reset() {
        if (AppState.inactivityTimer) {
            clearTimeout(AppState.inactivityTimer);
        }

        if (AppState.isUnlocked) {
            AppState.inactivityTimer = setTimeout(() => {
                App.lock();
                Toast.show('Application locked due to inactivity', 'warning');
            }, CONFIG.AUTO_LOCK_MINUTES * 60 * 1000);
        }
    },

    start() {
        this.reset();
        document.addEventListener('mousemove', this.reset.bind(this));
        document.addEventListener('keypress', this.reset.bind(this));
        document.addEventListener('click', this.reset.bind(this));
    },

    stop() {
        if (AppState.inactivityTimer) {
            clearTimeout(AppState.inactivityTimer);
        }
        document.removeEventListener('mousemove', this.reset.bind(this));
        document.removeEventListener('keypress', this.reset.bind(this));
        document.removeEventListener('click', this.reset.bind(this));
    }
};

// ============================================
// UI Rendering
// ============================================

const UI = {
    /**
     * Render credential cards
     */
    async renderCredentials() {
        const list = document.getElementById('credential-list');
        const emptyState = document.getElementById('empty-state');

        let credentials;

        if (AppState.searchQuery) {
            credentials = await CredentialManager.search(AppState.searchQuery);
        } else if (AppState.currentCategory === 'all') {
            credentials = await CredentialManager.getAll();
        } else {
            credentials = await CredentialManager.getByCategory(AppState.currentCategory);
        }

        // Sort: favorites first, then by name
        credentials.sort((a, b) => {
            if (a._meta.favorite && !b._meta.favorite) return -1;
            if (!a._meta.favorite && b._meta.favorite) return 1;
            return a.name.localeCompare(b.name);
        });

        AppState.credentials = credentials;

        if (credentials.length === 0) {
            list.innerHTML = '';
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            list.innerHTML = credentials.map(cred => this.renderCredentialCard(cred)).join('');
        }

        this.updateCategoryCounts();
    },

    /**
     * Render a single credential card
     */
    renderCredentialCard(credential) {
        const categoryLabel = CATEGORIES[credential.category] || credential.category;
        const favoriteClass = credential._meta.favorite ? 'favorite' : '';
        const icon = this.getCategoryIcon(credential.category);

        return `
            <div class="credential-card ${favoriteClass}" data-id="${credential._meta.id}">
                <div class="credential-header">
                    <div class="credential-icon">${icon}</div>
                    <div class="credential-title">
                        <div class="credential-name">${this.escapeHtml(credential.name)}</div>
                        <div class="credential-username">${this.escapeHtml(credential.username)}</div>
                    </div>
                </div>
                <div class="credential-password">
                    <span class="password-dots">••••••••••••</span>
                </div>
                <div class="credential-actions">
                    <button class="icon-btn show-password" title="Show password">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button class="icon-btn copy-password" title="Copy password">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                    <button class="icon-btn edit-credential" title="Edit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="icon-btn delete-credential" title="Delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Get icon for category
     */
    getCategoryIcon(category) {
        const icons = {
            social: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>',
            email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
            banking: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
            shopping: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>',
            work: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
            other: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'
        };
        return icons[category] || icons.other;
    },

    /**
     * Update category counts
     */
    async updateCategoryCounts() {
        const all = await CredentialManager.getAll();

        document.getElementById('all-count').textContent = all.length;

        for (const [key, label] of Object.entries(CATEGORIES)) {
            const count = all.filter(c => c.category === key).length;
            const countEl = document.getElementById(`${key}-count`);
            if (countEl) countEl.textContent = count;
        }
    },

    /**
     * Update section title
     */
    updateSectionTitle() {
        const titleEl = document.getElementById('section-title');

        if (AppState.searchQuery) {
            titleEl.textContent = `Search Results: "${AppState.searchQuery}"`;
        } else if (AppState.currentCategory === 'all') {
            titleEl.textContent = 'All Credentials';
        } else {
            titleEl.textContent = CATEGORIES[AppState.currentCategory] || 'Credentials';
        }
    },

    /**
     * Show view credential modal
     */
    async showViewCredential(id) {
        const credential = await CredentialManager.getById(id);
        if (!credential) return;

        document.getElementById('view-credential-title').textContent = credential.name;
        document.getElementById('view-name').textContent = credential.name;
        document.getElementById('view-username').textContent = credential.username;
        document.getElementById('view-password').textContent = '••••••••••••';
        document.getElementById('view-password').classList.add('password-masked');

        const websiteEl = document.getElementById('view-website');
        const websiteRow = document.getElementById('view-website-row');

        if (credential.website) {
            websiteEl.textContent = credential.website;
            websiteEl.href = credential.website;
            websiteRow.classList.remove('hidden');
        } else {
            websiteRow.classList.add('hidden');
        }

        document.getElementById('view-category').textContent = CATEGORIES[credential.category] || credential.category;

        const notesEl = document.getElementById('view-notes');
        const notesRow = document.getElementById('view-notes-row');

        if (credential.notes) {
            notesEl.textContent = credential.notes;
            notesRow.classList.remove('hidden');
        } else {
            notesRow.classList.add('hidden');
        }

        document.getElementById('view-created').textContent = new Date(credential._meta.created).toLocaleString();
        document.getElementById('view-modified').textContent = new Date(credential._meta.modified).toLocaleString();

        AppState.currentCredentialId = id;
        Modal.open('view-credential-modal');
    },

    /**
     * Show edit credential modal
     */
    async showEditCredential(id) {
        const credential = await CredentialManager.getById(id);
        if (!credential) return;

        Modal.close('view-credential-modal');

        document.getElementById('credential-modal-title').textContent = 'Edit Credential';
        document.getElementById('credential-id').value = id;
        document.getElementById('credential-name').value = credential.name;
        document.getElementById('credential-username').value = credential.username;
        document.getElementById('credential-password').value = credential.password;
        document.getElementById('credential-website').value = credential.website || '';
        document.getElementById('credential-category').value = credential.category;
        document.getElementById('credential-notes').value = credential.notes || '';
        document.getElementById('credential-favorite').checked = credential._meta.favorite;

        PasswordStrength.updateIndicator(credential.password,
            document.getElementById('password-strength-fill'),
            document.getElementById('password-strength-text'));

        AppState.currentCredentialId = id;
        Modal.open('credential-modal');
    },

    /**
     * Reset credential form
     */
    resetCredentialForm() {
        document.getElementById('credential-modal-title').textContent = 'Add New Credential';
        document.getElementById('credential-form').reset();
        document.getElementById('credential-id').value = '';
        document.getElementById('password-strength-fill').className = 'strength-fill';
        document.getElementById('password-strength-text').textContent = 'Enter password';
        AppState.currentCredentialId = null;
    },

    /**
     * Render audit log
     */
    async renderAuditLog() {
        const entries = await AuditLog.getAll();
        const list = document.getElementById('audit-log-list');
        const emptyState = document.getElementById('audit-log-empty');

        if (entries.length === 0) {
            list.innerHTML = '';
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            list.innerHTML = entries.map(entry => `
                <div class="audit-entry">
                    <div class="audit-entry-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    </div>
                    <div class="audit-entry-content">
                        <div class="audit-entry-action">${this.escapeHtml(entry.action)}</div>
                        ${entry.details ? `<div class="audit-entry-time">${this.escapeHtml(entry.details)}</div>` : ''}
                        <div class="audit-entry-time">${new Date(entry.timestamp).toLocaleString()}</div>
                    </div>
                </div>
            `).join('');
        }
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ============================================
// Main Application
// ============================================

const App = {
    async init() {
        try {
            // Initialize storage
            await Storage.init();

            // Initialize theme
            await ThemeManager.init();

            // Hide loading screen
            document.getElementById('loading-screen').classList.add('hidden');

            // Check if master password exists
            const settings = await Storage.get(CONFIG.STORES.SETTINGS, 'masterPasswordHash');

            if (settings) {
                // Master password exists - show unlock form
                document.getElementById('master-password-form').classList.remove('hidden');
                document.getElementById('master-password-setup').classList.add('hidden');
            } else {
                // No master password - show setup form
                document.getElementById('master-password-form').classList.add('hidden');
                document.getElementById('master-password-setup').classList.remove('hidden');
            }

            // Show master password modal
            Modal.open('master-password-modal');

            // Setup event listeners
            this.setupEventListeners();

        } catch (error) {
            console.error('Failed to initialize app:', error);
            Toast.show('Failed to initialize application', 'error');
        }
    },

    setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            ThemeManager.toggle();
        });

        // Tools menu toggle
        const toolsMenuBtn = document.getElementById('tools-menu-btn');
        const toolsMenu = document.getElementById('tools-menu');

        toolsMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toolsMenu.classList.toggle('hidden');
        });

        document.addEventListener('click', () => {
            toolsMenu.classList.add('hidden');
        });

        // Modal close buttons
        document.querySelectorAll('.close-modal, .close-modal-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                Modal.closeAll();
            });
        });

        // Close modal on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    Modal.close(modal.id);
                }
            });
        });

        // Master password form
        document.getElementById('master-password-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.unlock();
        });

        // Master password setup form
        document.getElementById('master-password-setup-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.setupMasterPassword();
        });

        // Master password strength
        document.getElementById('new-master-password').addEventListener('input', (e) => {
            PasswordStrength.updateIndicator(e.target.value,
                document.getElementById('master-strength-fill'),
                document.getElementById('master-strength-text'));
        });

        // Toggle password visibility
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', () => {
                const wrapper = btn.closest('.password-input-wrapper');
                const input = wrapper.querySelector('input');

                if (input.type === 'password') {
                    input.type = 'text';
                    btn.classList.add('hidden');
                } else {
                    input.type = 'password';
                    btn.classList.remove('hidden');
                }
            });
        });

        // Add credential button
        document.getElementById('add-credential-btn').addEventListener('click', () => {
            UI.resetCredentialForm();
            Modal.open('credential-modal');
        });

        document.getElementById('empty-add-btn').addEventListener('click', () => {
            UI.resetCredentialForm();
            Modal.open('credential-modal');
        });

        // Credential form
        document.getElementById('credential-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveCredential();
        });

        // Credential password strength
        document.getElementById('credential-password').addEventListener('input', (e) => {
            PasswordStrength.updateIndicator(e.target.value,
                document.getElementById('password-strength-fill'),
                document.getElementById('password-strength-text'));
        });

        // Generate password button
        document.getElementById('generate-password-btn').addEventListener('click', () => {
            this.openPasswordGenerator();
        });

        // Password generator modal
        document.getElementById('password-generator-btn').addEventListener('click', () => {
            this.openPasswordGenerator();
        });

        document.getElementById('regenerate-password').addEventListener('click', () => {
            this.generatePassword();
        });

        document.getElementById('password-length').addEventListener('input', (e) => {
            document.getElementById('length-value').textContent = e.target.value;
            this.generatePassword();
        });

        ['include-uppercase', 'include-lowercase', 'include-numbers', 'include-symbols'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.generatePassword();
            });
        });

        document.getElementById('copy-generated').addEventListener('click', () => {
            const password = document.getElementById('generated-password').value;
            this.copyToClipboard(password);
        });

        document.getElementById('use-password-btn').addEventListener('click', () => {
            const password = document.getElementById('generated-password').value;
            document.getElementById('credential-password').value = password;
            PasswordStrength.updateIndicator(password,
                document.getElementById('password-strength-fill'),
                document.getElementById('password-strength-text'));
            Modal.close('password-generator-modal');
        });

        // Import
        document.getElementById('import-btn').addEventListener('click', () => {
            Modal.open('import-modal');
            document.getElementById('import-results').classList.add('hidden');
        });

        document.getElementById('import-browse-btn').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });

        document.getElementById('import-file').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const results = await ImportExport.importFromJson(file);
                    document.getElementById('import-summary').textContent =
                        `Successfully imported ${results.imported} credential(s). Skipped ${results.skipped} duplicate(s).`;
                    document.getElementById('import-results').classList.remove('hidden');
                    await UI.renderCredentials();
                    Toast.show(`Imported ${results.imported} credentials`, 'success');
                } catch (error) {
                    Toast.show('Failed to import: ' + error.message, 'error');
                }
            }
        });

        // Drop zone
        const dropZone = document.getElementById('import-drop-zone');

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', async (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');

            const file = e.dataTransfer.files[0];
            if (file && file.type === 'application/json') {
                try {
                    const results = await ImportExport.importFromJson(file);
                    document.getElementById('import-summary').textContent =
                        `Successfully imported ${results.imported} credential(s). Skipped ${results.skipped} duplicate(s).`;
                    document.getElementById('import-results').classList.remove('hidden');
                    await UI.renderCredentials();
                    Toast.show(`Imported ${results.imported} credentials`, 'success');
                } catch (error) {
                    Toast.show('Failed to import: ' + error.message, 'error');
                }
            }
        });

        // Export
        document.getElementById('export-btn').addEventListener('click', () => {
            Modal.open('export-modal');
        });

        document.getElementById('export-download-btn').addEventListener('click', async () => {
            const format = document.querySelector('input[name="export-format"]:checked').value;
            const encrypted = document.getElementById('export-encrypted').checked;

            if (format === 'json') {
                await ImportExport.exportToJson(encrypted);
            } else {
                await ImportExport.exportToCsv();
            }

            Modal.close('export-modal');
            Toast.show('Credentials exported successfully', 'success');
        });

        // Audit log
        document.getElementById('audit-log-btn').addEventListener('click', async () => {
            await UI.renderAuditLog();
            Modal.open('audit-log-modal');
        });

        document.getElementById('clear-audit-log').addEventListener('click', async () => {
            if (confirm('Are you sure you want to clear the audit log?')) {
                await AuditLog.clear();
                await UI.renderAuditLog();
                Toast.show('Audit log cleared', 'success');
            }
        });

        document.getElementById('export-audit-log').addEventListener('click', async () => {
            const entries = await AuditLog.getAll();
            const json = JSON.stringify(entries, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `audit-log-${new Date().toISOString().split('T')[0]}.json`;
            a.click();

            URL.revokeObjectURL(url);
        });

        // Security info
        document.getElementById('security-info-btn').addEventListener('click', () => {
            Modal.open('security-info-modal');
        });

        // Lock
        document.getElementById('lock-app-btn').addEventListener('click', () => {
            this.lock();
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to logout? This will lock the application.')) {
                this.lock();
            }
        });

        // Category navigation
        document.getElementById('category-nav').addEventListener('click', (e) => {
            const btn = e.target.closest('.category-item');
            if (btn) {
                document.querySelectorAll('.category-item').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                AppState.currentCategory = btn.dataset.category;
                AppState.searchQuery = '';
                document.getElementById('search-input').value = '';
                document.getElementById('clear-search').classList.add('hidden');
                UI.updateSectionTitle();
                UI.renderCredentials();
            }
        });

        // Search
        let searchTimeout;
        document.getElementById('search-input').addEventListener('input', (e) => {
            const query = e.target.value.trim();

            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                AppState.searchQuery = query;
                document.getElementById('clear-search').classList.toggle('hidden', !query);
                UI.updateSectionTitle();
                await UI.renderCredentials();
            }, 300);
        });

        document.getElementById('clear-search').addEventListener('click', () => {
            document.getElementById('search-input').value = '';
            AppState.searchQuery = '';
            document.getElementById('clear-search').classList.add('hidden');
            UI.updateSectionTitle();
            UI.renderCredentials();
        });

        // View toggle
        document.getElementById('grid-view-btn').addEventListener('click', () => {
            AppState.viewMode = 'grid';
            document.getElementById('grid-view-btn').classList.add('active');
            document.getElementById('list-view-btn').classList.remove('active');
            document.getElementById('credential-list').classList.remove('list-view');
            document.getElementById('credential-list').classList.add('grid-view');
        });

        document.getElementById('list-view-btn').addEventListener('click', () => {
            AppState.viewMode = 'list';
            document.getElementById('list-view-btn').classList.add('active');
            document.getElementById('grid-view-btn').classList.remove('active');
            document.getElementById('credential-list').classList.remove('grid-view');
            document.getElementById('credential-list').classList.add('list-view');
        });

        // Credential list actions (delegated)
        document.getElementById('credential-list').addEventListener('click', async (e) => {
            const card = e.target.closest('.credential-card');
            if (!card) return;

            const id = card.dataset.id;
            const credential = AppState.credentials.find(c => c._meta.id === id);

            if (e.target.closest('.show-password')) {
                const passwordEl = card.querySelector('.credential-password span');
                if (passwordEl.classList.contains('password-dots')) {
                    passwordEl.textContent = credential.password;
                    passwordEl.classList.remove('password-dots');
                    passwordEl.classList.add('password-visible');
                } else {
                    passwordEl.textContent = '••••••••••••';
                    passwordEl.classList.remove('password-visible');
                    passwordEl.classList.add('password-dots');
                }
            } else if (e.target.closest('.copy-password')) {
                this.copyToClipboard(credential.password);
                Toast.show('Password copied to clipboard', 'success');
            } else if (e.target.closest('.edit-credential')) {
                await UI.showEditCredential(id);
            } else if (e.target.closest('.delete-credential')) {
                await this.showDeleteConfirmation(id);
            } else if (!e.target.closest('button')) {
                await UI.showViewCredential(id);
            }
        });

        // View credential modal actions
        document.getElementById('view-credential-modal').addEventListener('click', async (e) => {
            const toggleBtn = e.target.closest('.toggle-view-password');
            const copyBtn = e.target.closest('.copy-btn');

            if (toggleBtn) {
                const passwordEl = document.getElementById('view-password');
                const credential = await CredentialManager.getById(AppState.currentCredentialId);

                if (passwordEl.classList.contains('password-masked')) {
                    passwordEl.textContent = credential.password;
                    passwordEl.classList.remove('password-masked');
                    toggleBtn.querySelector('.eye-icon').classList.add('hidden');
                    toggleBtn.querySelector('.eye-off-icon').classList.remove('hidden');
                } else {
                    passwordEl.textContent = '••••••••••••';
                    passwordEl.classList.add('password-masked');
                    toggleBtn.querySelector('.eye-icon').classList.remove('hidden');
                    toggleBtn.querySelector('.eye-off-icon').classList.add('hidden');
                }
            } else if (copyBtn) {
                const field = copyBtn.dataset.field;
                const credential = await CredentialManager.getById(AppState.currentCredentialId);

                let value;
                if (field === 'username') value = credential.username;
                else if (field === 'password') value = credential.password;
                else if (field === 'website') value = credential.website;

                if (value) {
                    this.copyToClipboard(value);
                    Toast.show(`${field.charAt(0).toUpperCase() + field.slice(1)} copied to clipboard`, 'success');
                }
            }
        });

        document.getElementById('view-edit-btn').addEventListener('click', async () => {
            await UI.showEditCredential(AppState.currentCredentialId);
        });

        // Delete confirmation
        document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
            if (AppState.currentCredentialId) {
                await CredentialManager.delete(AppState.currentCredentialId);
                Modal.close('delete-modal');
                await UI.renderCredentials();
                Toast.show('Credential deleted', 'success');
                AppState.currentCredentialId = null;
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape to close modals
            if (e.key === 'Escape') {
                Modal.closeAll();
            }

            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('search-input').focus();
            }
        });

        // Before unload warning
        window.addEventListener('beforeunload', (e) => {
            if (AppState.isUnlocked) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    },

    async setupMasterPassword() {
        const password = document.getElementById('new-master-password').value;
        const confirm = document.getElementById('confirm-master-password').value;
        const errorEl = document.getElementById('master-setup-error');

        if (password !== confirm) {
            errorEl.textContent = 'Passwords do not match';
            errorEl.classList.remove('hidden');
            return;
        }

        const strength = PasswordStrength.calculate(password);
        if (strength.score < 4) {
            errorEl.textContent = 'Please use a stronger password';
            errorEl.classList.remove('hidden');
            return;
        }

        try {
            // Generate salt and hash
            const salt = await CryptoUtils.generateSalt();
            const hash = await CryptoUtils.hash(password + CryptoUtils.arrayBufferToBase64(salt));

            // Store master password hash and salt
            await Storage.put(CONFIG.STORES.SETTINGS, {
                key: 'masterPasswordHash',
                hash,
                salt: CryptoUtils.arrayBufferToBase64(salt),
                created: Date.now()
            });

            // Derive encryption key
            AppState.masterKey = await CryptoUtils.deriveKey(password, salt);
            AppState.isUnlocked = true;

            // Close modal and show main app
            Modal.close('master-password-modal');
            document.getElementById('main-app').classList.remove('hidden');

            // Start inactivity timer
            InactivityTimer.start();

            // Render credentials
            await UI.renderCredentials();

            // Add audit log
            await AuditLog.add('Master Password Created', 'Master password was set up');

            Toast.show('Master password created successfully!', 'success');
        } catch (error) {
            console.error('Failed to setup master password:', error);
            errorEl.textContent = 'Failed to create master password';
            errorEl.classList.remove('hidden');
        }
    },

    async unlock() {
        const password = document.getElementById('master-password-input').value;
        const errorEl = document.getElementById('master-password-error');

        try {
            // Get stored hash and salt
            const settings = await Storage.get(CONFIG.STORES.SETTINGS, 'masterPasswordHash');
            if (!settings) {
                throw new Error('No master password found');
            }

            // Verify password
            const salt = CryptoUtils.base64ToArrayBuffer(settings.salt);
            const hash = await CryptoUtils.hash(password + CryptoUtils.arrayBufferToBase64(salt));

            if (hash !== settings.hash) {
                errorEl.textContent = 'Incorrect master password';
                errorEl.classList.remove('hidden');
                return;
            }

            // Derive encryption key
            AppState.masterKey = await CryptoUtils.deriveKey(password, salt);
            AppState.isUnlocked = true;

            // Close modal and show main app
            Modal.close('master-password-modal');
            document.getElementById('main-app').classList.remove('hidden');
            document.getElementById('master-password-input').value = '';
            errorEl.classList.add('hidden');

            // Start inactivity timer
            InactivityTimer.start();

            // Render credentials
            await UI.renderCredentials();

            // Add audit log
            await AuditLog.add('Unlocked', 'Application was unlocked');

            Toast.show('Welcome back!', 'success');
        } catch (error) {
            console.error('Failed to unlock:', error);
            errorEl.textContent = 'Failed to unlock';
            errorEl.classList.remove('hidden');
        }
    },

    lock() {
        AppState.isUnlocked = false;
        AppState.masterKey = null;
        AppState.credentials = [];
        InactivityTimer.stop();

        document.getElementById('main-app').classList.add('hidden');
        Modal.open('master-password-modal');
    },

    async saveCredential() {
        const id = document.getElementById('credential-id').value;
        const name = document.getElementById('credential-name').value;
        const username = document.getElementById('credential-username').value;
        const password = document.getElementById('credential-password').value;
        const website = document.getElementById('credential-website').value;
        const category = document.getElementById('credential-category').value;
        const notes = document.getElementById('credential-notes').value;
        const favorite = document.getElementById('credential-favorite').checked;

        const credential = {
            name,
            username,
            password,
            website: website || null,
            category,
            notes: notes || null,
            favorite
        };

        try {
            if (id) {
                await CredentialManager.update(id, credential);
                Toast.show('Credential updated successfully', 'success');
            } else {
                await CredentialManager.create(credential);
                Toast.show('Credential added successfully', 'success');
            }

            Modal.close('credential-modal');
            await UI.renderCredentials();
            UI.resetCredentialForm();
        } catch (error) {
            console.error('Failed to save credential:', error);
            Toast.show('Failed to save credential', 'error');
        }
    },

    openPasswordGenerator() {
        Modal.open('password-generator-modal');
        this.generatePassword();
    },

    generatePassword() {
        const length = parseInt(document.getElementById('password-length').value);
        const uppercase = document.getElementById('include-uppercase').checked;
        const lowercase = document.getElementById('include-lowercase').checked;
        const numbers = document.getElementById('include-numbers').checked;
        const symbols = document.getElementById('include-symbols').checked;

        const password = PasswordGenerator.generate({
            length,
            uppercase,
            lowercase,
            numbers,
            symbols
        });

        document.getElementById('generated-password').value = password;

        PasswordStrength.updateIndicator(password,
            document.getElementById('gen-strength-fill'),
            document.getElementById('gen-strength-text'));
    },

    async showDeleteConfirmation(id) {
        const credential = await CredentialManager.getById(id);
        if (!credential) return;

        document.getElementById('delete-credential-name').textContent = credential.name;
        AppState.currentCredentialId = id;
        Modal.open('delete-modal');
    },

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
    }
};

// ============================================
// Initialize Application
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
