# Header Modder

Header Modder is a powerful Chrome extension designed to modify HTTP request headers on the fly. Built with Angular, it provides a user-friendly interface to manage and apply header modifications based on specific URL patterns and customizable groups.

## Features

- **Dynamic Header Modification**: Add, modify, or remove request headers.
- **URL Pattern Matching**: Apply rules only to specific websites or URL patterns.
- **Rule Grouping**: Organize your header rules into groups for better management.
- **Chrome Side Panel Support**: Access and manage your rules easily through the Chrome side panel.
- **Manifest V3**: Built using the latest Chrome Extension standards for better security and performance.
- **Import/Export**: Easily share or backup your header configurations.

## Technology Stack

- **Framework**: [Angular](https://angular.io/) (v21+)
- **Styling**: SCSS / Angular Material
- **Extension API**: Manifest V3, `declarativeNetRequest`, `sidePanel`, `storage`

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (latest LTS recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/pedange/header-modder.git
   cd modder-header/modder-header
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

To run the project in development mode with live reloading:
```bash
npm run watch
```

### Building the Extension

To build the extension for production:
```bash
npm run build:ext
```
The build artifacts will be stored in the `dist/` directory.

### Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** in the top right corner.
3. Click on **Load unpacked**.
4. Select the `dist/modder-header/browser` folder (or the appropriate build output folder).

## License

This project is licensed under the MIT License.
