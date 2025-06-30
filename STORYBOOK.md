
# Storybook Setup for TailorEDU

This project uses Storybook for component development and documentation.

## Getting Started

### Run Storybook
```bash
npm run storybook
```

### Build Storybook
```bash
npm run build-storybook
```

## Available Stories

### Content Components

#### ContentForm
- **Empty Form**: Fresh form for creating new content
- **Pre-filled Form**: Form with existing content data for editing

#### ContentCard  
- **Draft Content**: Unpublished content card
- **Published Content**: Published content card
- **Video Content**: Card displaying video content type
- **Audio Content**: Card displaying audio content type

#### VersionHistoryModal
- **Open with Versions**: Modal showing version history
- **Open with No Versions**: Modal with empty version history
- **Closed**: Modal in closed state
- **Single Version**: Content with only one version
- **Many Versions**: Content with extensive version history

## Features

- **Dynamic Controls**: All stories support interactive controls in the Controls panel
- **Auto Documentation**: Props are automatically documented using TypeScript
- **Organized Structure**: Stories are organized under `Content/` category
- **Mock Data**: Realistic mock data for all component states
- **Responsive Design**: Stories work across different viewport sizes

## Story Structure

Each story includes:
- Comprehensive prop documentation
- Interactive controls for all props
- Action logging for event handlers
- Multiple story variants showing different states
- Detailed descriptions for each story variant

## TypeScript Integration

- Full TypeScript support with type checking
- Automatic prop type extraction from components
- IntelliSense support in story files
- Type-safe story definitions

## Styling

- Tailwind CSS support enabled
- Component styles preserved in Storybook
- Consistent styling with the main application

## Development Tips

1. **Adding New Stories**: Create `.stories.tsx` files alongside components
2. **Mock Data**: Use realistic data that represents actual use cases
3. **Controls**: Utilize argTypes for better control definitions
4. **Documentation**: Add descriptions for both components and individual stories
5. **Actions**: Use action addon to test event handlers

## Best Practices

- Keep stories focused on single component variants
- Use descriptive story names that explain the component state
- Include edge cases and error states
- Document complex props with detailed descriptions
- Group related stories under meaningful categories
