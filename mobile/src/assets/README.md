# Assets Directory Structure

This directory contains all static assets used in the NibJobs mobile application.

## Directory Structure

```
src/assets/
├── index.ts                    # Asset exports for easy importing
├── images/
│   ├── logos/                  # Brand logos and wordmarks
│   ├── icons/                  # UI icons and symbols
│   ├── illustrations/          # Empty states, error states, etc.
│   └── backgrounds/            # Background images and patterns
├── fonts/                      # Custom fonts (if any)
└── animations/                 # Lottie or other animation files
```

## Usage

### Import assets using the index file:
```typescript
import { NibJobsLogo, TelegramIcon, EmptyStateIllustration } from '../assets';

// In your component
<Image source={NibJobsLogo} style={styles.logo} />
```

### Direct import (alternative):
```typescript
import NibJobsLogo from '../assets/images/logos/nibjobs-logo.png';
```

## Asset Guidelines

### Images
- **Format**: PNG for icons/logos, JPEG for photos, SVG for simple graphics
- **Size**: Use appropriate resolutions for target devices
- **Naming**: Use kebab-case (e.g., `nibjobs-logo.png`)

### Icons
- **Size**: Provide 1x, 2x, 3x versions for React Native
- **Format**: PNG with transparent background
- **Style**: Consistent style throughout the app

### Logos
- **Variants**: Light and dark versions
- **Formats**: Both horizontal and vertical layouts
- **Usage**: Brand consistency across all screens

## File Naming Convention

- Use descriptive, kebab-case names
- Include size/variant in filename when necessary
- Examples:
  - `nibjobs-logo.png`
  - `telegram-icon-24.png`
  - `empty-state-illustration.png`
  - `hero-background-mobile.jpg`