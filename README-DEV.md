# Developer Guide

## Quick Start

1. **Install dependencies**: `npm install`
2. **Run dev setup**: `chmod +x scripts/dev-setup.sh && ./scripts/dev-setup.sh`
3. **Start development**: `npm run dev`

## Developer Tools

### Scripts
- `npm run lint` - Run ESLint
- `npx prettier --write .` - Format code
- `npx vitest run` - Run tests once
- `npx vitest` - Run tests in watch mode

### Debug Tools

#### TTS Debug HUD
Add `?debug=1` to any URL to see the TTS debug overlay:
- Shows current playback state, timing, and word highlighting
- Only appears in development mode
- Example: `http://localhost:5173/?debug=1`

#### Error Boundaries
All read-aloud components are wrapped in error boundaries that:
- Show friendly error messages to users
- Display detailed error info in development
- Allow easy recovery with "Try Again" button

### Testing

#### Unit Tests
Tests are located in `src/utils/__tests__/`:
- `segment.test.ts` - Word segmentation and language utilities
- `timing.test.ts` - Timing synthesis and validation

Run tests:
```bash
npx vitest run          # Run once
npx vitest             # Watch mode
npx vitest --ui        # Visual test runner
```

#### Manual Testing Checklist
- [ ] Test with Arabic/Hebrew text (RTL)
- [ ] Test with Chinese/Japanese text (no spaces)
- [ ] Test keyboard shortcuts (Space, Arrow keys)
- [ ] Test screen reader announcements
- [ ] Test error recovery

### Code Quality

#### Pre-commit Checks
Run before committing:
```bash
./scripts/pre-commit-manual.sh
```

This checks:
- ESLint compliance
- Prettier formatting
- All tests passing

#### Architecture

##### Centralized Types (`src/types/tts.ts`)
- `WordTiming` - Shared timing type across all components
- `SpeechState` - Common TTS state interface
- `TTSOptions` - Configuration options

##### Utilities (`src/utils/`)
- `segment.ts` - International word tokenization
- `timing.ts` - Word timing synthesis and validation

##### Components Structure
```
InlineReadAloud (main component)
├── ErrorBoundary (error handling)
├── TTSDebugHUD (dev debugging)
├── SpeechControls (play/pause controls)
└── Content div (with highlighting)
```

### Internationalization

#### Language Support
- Automatic language detection from `lang` prop
- Proper RTL/LTR direction handling
- International word segmentation via `Intl.Segmenter`
- Fallback for unsupported environments

#### Testing Languages
- English: Basic functionality
- Arabic: RTL text direction
- Chinese: Character-based segmentation
- Spanish: Accented characters
- Mixed: Multiple languages in one text

### Performance

#### Word Highlighting
- Uses in-place DOM manipulation (no HTML rebuilds)
- Efficient segmentation with `Intl.Segmenter`
- Cached timing calculations

#### TTS Integration
- ElevenLabs API with timing synthesis
- Audio caching and cleanup
- Sync point detection for long content

## Contributing

1. Create feature branch
2. Add/update tests
3. Run pre-commit checks
4. Submit PR with clear description

## Troubleshooting

### Common Issues

**TypeScript errors about WordTiming**
- Ensure imports use `@/types/tts` not local types

**Tests failing**
- Check if `vitest.config.ts` is properly configured
- Ensure test files end with `.test.ts`

**Highlighting not working**
- Check browser console for errors
- Verify `Intl.Segmenter` support or fallback
- Test with `?debug=1` to see timing data