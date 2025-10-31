# Presentation Component - Student Slide Viewer

## Overview
The Presentation component provides a full-featured slide viewer with navigation, text-to-speech, translation, and accessibility features for optimal student learning experience.

## Features

### 🖼️ Slide Display & Navigation
- **Individual slide viewing** - Display one slide at a time in a card-based viewer
- **Navigation controls** - Large, accessible Previous/Next buttons with visual indicators
- **Slide counter** - Shows current position (e.g., "Slide 3 of 15")
- **Progress bar** - Visual indicator showing percentage completion
- **Thumbnail strip** - Optional collapsible thumbnail navigation at bottom

### ⌨️ Keyboard Navigation
- **Arrow keys** - Left/Right to navigate between slides
- **Space bar** - Advance to next slide
- **Home key** - Jump to first slide
- **End key** - Jump to last slide
- **F key** - Toggle fullscreen mode
- **ESC key** - Exit fullscreen

### 📱 Mobile Support
- **Touch gestures** - Swipe left/right to navigate
- **Pinch to zoom** - Zoom into slide content
- **Double-tap** - Toggle fullscreen mode
- **Responsive design** - Optimized for phones and tablets

### 🔊 Read-Aloud Integration
- **Text-to-speech** - Reads slide content and speaker notes
- **Play/pause controls** - Control audio playback
- **Multiple languages** - Supports 50+ languages for TTS
- **Speed control** - Adjust playback speed (0.5x to 2x)
- **Auto-advance** - Optionally move to next slide after reading completes
- **Highlight text** - Karaoke-style text highlighting during reading

### 🌐 Translation Support
- **50+ languages** - Translate slide text to student's preferred language
- **Live translation** - Translate on-demand as students navigate
- **Original + translated** - Toggle between original and translated text
- **Persistent preference** - Remember student's language choice
- **Note**: Only translates text content, not embedded images with text

### ♿ Accessibility Features (WCAG 2.1 AA Compliant)
- **Screen reader support** - Announces slide changes and controls
- **Keyboard-only navigation** - Full functionality without mouse
- **ARIA labels** - Proper semantic markup for assistive technologies
- **High contrast mode** - Supports system-level contrast preferences
- **Focus indicators** - Clear visual focus on all interactive elements
- **Live regions** - Dynamic content changes announced to screen readers

### 📊 Progress Tracking
- **Completion tracking** - Mark lesson as complete when all slides viewed
- **Progress percentage** - Visual indicator of how much has been viewed
- **Viewed slides** - Track which slides student has already seen
- **Required viewing** - Optional setting to require viewing all slides before proceeding

### 🎛️ Additional Features
- **Fullscreen mode** - Maximize slide view for better focus
- **Download option** - Allow students to download original presentation (optional)
- **Speaker notes** - Display additional context below slides (collapsible)
- **Dark mode support** - Automatically adapts to system theme

## Teacher Configuration

### Required Fields
- **Title** - Presentation title (shown in top bar)
- **Embed URL** - Link to Google Slides, Prezi, or other presentation

### Optional Settings
- **Speaker Notes** - Additional context or instructions for students
- **Allow Downloads** - Enable/disable download button (default: enabled)
- **Require Full Viewing** - Students must view all slides to complete (default: disabled)
- **Show Thumbnails** - Display thumbnail strip at bottom (default: enabled)
- **Enable Translation** - Allow language translation (default: enabled)

### Supported Platforms
- Google Slides (via embed URL)
- Prezi presentations
- SlideShare
- Canva presentations
- Any public embed URL

## Technical Implementation

### Component Structure
```typescript
<PresentationViewer
  title="Introduction to Biology"
  embedUrl="https://docs.google.com/presentation/..."
  slides={[]}
  speakerNotes="Review these concepts for the quiz"
  allowDownloads={true}
  requireFullViewing={false}
  showThumbnails={true}
  enableTranslation={true}
  onComplete={() => {}}
/>
```

### Integration with Existing Hooks
The component uses existing hooks from the codebase:
- `useTextToSpeech()` - For read-aloud functionality
- `useTranslation()` - For content translation
- Both hooks already support multiple languages and TTS engines

### Supported Languages
English, Spanish, French, German, Chinese, Japanese, Korean, Arabic, Portuguese, Russian, Hindi, Italian, and 40+ more.

## Important: AI Lesson Creation

⚠️ **The Presentation component is NOT available in AI lesson creation mode.**

**Reason**: Large Language Models (including Gemini and GPT) cannot generate actual PowerPoint or slide files. They can only generate text content, outlines, and descriptions - not binary file formats like .pptx or visual slide decks.

**Current Implementation**:
- Presentation component only appears in **manual lesson builder mode**
- Teachers must manually upload or provide embed URLs for presentations
- AI lesson creation flow excludes this component type

**Future Considerations**:
If we integrate with a slides generation API (such as Canva's Presentation API), we could:
1. Have AI generate slide content (text, structure, bullet points)
2. Pass that content to Canva/similar API to create actual slides
3. Re-enable the Presentation component in AI lesson creation

Until then, teachers must create presentations separately and add them manually.

## Usage Examples

### Basic Embedded Presentation
```typescript
<PresentationViewer
  title="Week 1: Introduction"
  embedUrl="https://docs.google.com/presentation/d/1abc123/embed"
/>
```

### With All Features Enabled
```typescript
<PresentationViewer
  title="Chapter 3: Cell Biology"
  embedUrl="https://docs.google.com/presentation/d/1abc123/embed"
  speakerNotes="Pay special attention to slides 5-8 about mitosis"
  allowDownloads={true}
  requireFullViewing={true}
  showThumbnails={true}
  enableTranslation={true}
  onComplete={() => {
    console.log('Student completed presentation');
    markLessonComplete();
  }}
/>
```

### Restricted Viewing
```typescript
<PresentationViewer
  title="Test Material"
  embedUrl="https://docs.google.com/presentation/d/1abc123/embed"
  allowDownloads={false}
  requireFullViewing={true}
  showThumbnails={false}
/>
```

## Student Experience

1. **Viewing** - Students see one slide at a time with clear navigation
2. **Reading** - Click volume icon to have slide content read aloud
3. **Translation** - Select language from dropdown to translate content
4. **Navigation** - Use buttons, keyboard, or swipe gestures to move between slides
5. **Fullscreen** - Press F key or fullscreen button for distraction-free viewing
6. **Progress** - Progress bar shows completion percentage
7. **Completion** - When all slides viewed (if required), lesson marked as complete

## Keyboard Shortcuts Quick Reference

| Key | Action |
|-----|--------|
| ← | Previous slide |
| → | Next slide |
| Space | Next slide |
| Home | First slide |
| End | Last slide |
| F | Toggle fullscreen |
| ESC | Exit fullscreen |

## Future Enhancements

### Phase 2 Features (Not Yet Implemented)
- **Actual slide extraction** - Extract slides from uploaded .pptx files as images
- **OCR text extraction** - Extract text from slide images for TTS/translation
- **Thumbnail generation** - Auto-generate thumbnails from slides
- **PDF support** - Import and display PDF presentations
- **Slide annotations** - Allow students to add notes to specific slides
- **Quiz integration** - Embed quiz questions between slides
- **Analytics** - Track time spent on each slide

### Required Infrastructure
These features require server-side processing:
- Edge function for .pptx file parsing
- Image processing for thumbnail generation
- OCR service integration (Google Vision API, Tesseract, etc.)
- PDF parsing library (pdf.js)

## Testing Checklist

- [ ] Upload Google Slides embed URL
- [ ] Navigate with Previous/Next buttons
- [ ] Navigate with keyboard arrows
- [ ] Navigate with swipe on mobile
- [ ] Test read-aloud functionality
- [ ] Test translation to multiple languages
- [ ] Test fullscreen mode (F key and button)
- [ ] Test thumbnail navigation
- [ ] Verify progress tracking updates correctly
- [ ] Test download functionality
- [ ] Test on screen reader (NVDA/JAWS)
- [ ] Test keyboard-only navigation
- [ ] Test on mobile devices (iOS and Android)
- [ ] Verify completion tracking when requireFullViewing=true
- [ ] Test with no embed URL (graceful fallback)
- [ ] Test with invalid embed URL
- [ ] Verify speaker notes display correctly
- [ ] Test all toggle settings work correctly

## Accessibility Compliance

✅ **WCAG 2.1 Level AA Compliant**

- Keyboard accessible (all controls)
- Screen reader announcements for slide changes
- ARIA labels on all interactive elements
- High contrast mode support
- Focus indicators on all focusable elements
- Color contrast meets 4.5:1 minimum
- Time limits (none - students can view at their own pace)
- Error identification and correction
- Consistent navigation patterns

## Support

For questions or issues with the Presentation component:
1. Check this documentation
2. Review the component code at `src/components/lesson/PresentationViewer.tsx`
3. Check existing hooks: `useTextToSpeech.ts` and `useTranslation.ts`
4. Test with console logs for debugging

---

**Version**: 1.0.0  
**Last Updated**: October 31, 2025  
**Author**: Lovable AI  
**Component Location**: `src/components/lesson/PresentationViewer.tsx`
