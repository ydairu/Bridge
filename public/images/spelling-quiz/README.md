# Spelling Quiz Images

This directory is for storing images used in the spelling quiz game.

## How to add images:

1. **Upload your images** to this directory (`/public/images/spelling-quiz/`)
2. **Update the word data** in `src/views/SpellingQuiz.vue` to include the image path
3. **Image format**: Use `.jpg`, `.png`, or `.webp` formats
4. **Recommended size**: 200x200 pixels or similar square aspect ratio

## Example usage:

```javascript
{
  word: 'HAMMER',
  hint: 'Tool for hitting nails',
  letters: ['H', 'A', 'M', 'M', 'E', 'R'],
  image: '/images/spelling-quiz/hammer.jpg' // Add this path
}
```

## Image naming convention:

- Use lowercase letters
- Use hyphens for spaces (e.g., `safety-equipment.jpg`)
- Be descriptive (e.g., `construction-helmet.jpg`)

## Supported image formats:

- `.jpg` / `.jpeg`
- `.png`
- `.webp`
- `.svg`
