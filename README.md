# VT Keyboard Extension

A browser extension that modifies the behavior of the Enter key on virtual keyboards to create new lines instead of submitting forms, with support for both Chromium-based browsers (Chrome, Edge) and Firefox.

## Features

- **Smart Enter Key Handling**: Converts Enter key presses to new line insertions in text areas and input fields
- **Advanced Virtual Keyboard Support**: Comprehensive handling for mobile virtual keyboards (GBoard, SwiftKey, etc.) with multiple fallback strategies
- **Whitelist Management**: Only activates on user-specified websites for better control
- **Search Field Exclusion**: Automatically skips search inputs to maintain expected behavior
- **Cross-Browser Support**: Works on both Chromium and Firefox browsers
- **Persistent Settings**: Whitelist stored using browser sync storage
- **User-Friendly Options**: Simple interface to manage whitelisted domains

## Installation

### From Source (Development)

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/vt-keyboard-extension.git
   cd vt-keyboard-extension
   ```

2. **For Firefox:**
   - Open Firefox and go to `about:debugging`
   - Click "This Firefox" → "Load Temporary Add-on"
   - Select the `manifest.json` file from the project root

3. **For Chromium (Chrome/Edge):**
   - Open Chrome/Edge and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the project root directory

### From Built Artifacts

Download the latest release artifacts:

**Firefox:**
- `vt-keyboard-extension-firefox.xpi` (Manifest V2)

**Chromium (Chrome/Edge):**
- `vt-keyboard-extension-chromium-v3.zip` (Manifest V3, recommended)
- `vt-keyboard-extension-chromium-v2.zip` (Manifest V2, legacy support)

*Load ZIP files as unpacked extensions in Chrome/Edge developer mode*

## Usage

1. After installation, the extension icon will appear in your browser toolbar
2. Click the extension icon to access settings
3. Add domains to the whitelist (e.g., `docs.google.com`, `notion.so`)
4. On whitelisted sites, pressing Enter in text areas will create new lines instead of submitting forms
5. The extension automatically excludes search fields

## Building

### Prerequisites

- Node.js 18+
- npm

### Build Process

```bash
# Install dependencies
npm install -g web-ext

# Lint (Firefox only)
web-ext lint

# Build extension
web-ext build --overwrite-dest

# For Firefox: rename zip to xpi
mv web-ext-artifacts/*.zip web-ext-artifacts/vt-keyboard-extension.xpi
```

### CI/CD

The project includes GitHub Actions workflow that automatically builds artifacts for both browsers on every commit to the main branch.

## Configuration

### Default Whitelist

The extension comes pre-configured with these domains:
- `docs.google.com`
- `notion.so`
- `etherpad.net`

### Adding Custom Domains

1. Click the extension icon
2. Enter a domain (e.g., `example.com`)
3. Click "Add Domain"
4. The whitelist is automatically synced across your browser instances

## Technical Details

- **Manifest Versions**: 2 and 3 (MV2/MV3)
- **Permissions**: `storage`, `activeTab`, `scripting` (V3), `tabs` (V2)
- **Content Scripts**:
  - **V3**: Dynamically injected on whitelisted domains only
  - **V2**: Statically declared, with whitelist checking inside script
- **Storage**: Uses `chrome.storage.sync` for cross-device synchronization
- **Background**: Service worker (V3) or persistent background page (V2)

## Browser Compatibility

**Optimized Build Strategy:**
- **Firefox**: Uses Manifest V2 for maximum compatibility (48.0+)
- **Chromium Browsers** (Chrome, Edge): Uses Manifest V3 for modern features (88+)
- **Other Chromium browsers**: Supported via V3 build

**Full Compatibility Matrix:**
- **Firefox**: 48.0+ (V2 build)
- **Chrome**: 88+ (V3 build)
- **Edge**: 88+ (V3 build)
- **Legacy browsers**: Use V2 build with appropriate modifications

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have suggestions:
1. Check the [Issues](https://github.com/yourusername/vt-keyboard-extension/issues) page
2. Create a new issue with detailed information about your browser version and the problem
