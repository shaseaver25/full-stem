# TailorEDU Lesson Template Import Guide

## Overview

The Lesson Template Import system allows teachers to create complete lessons offline using a simple text format, then upload them to automatically generate all lesson components in TailorEDU.

## How It Works

### 1. Download the Template

1. Navigate to the Lesson Builder
2. Click the "Import Template" tab
3. Click "Download Template" to get the blank template file
4. The template will be saved as `TailorEDU_Lesson_Template.txt`

### 2. Fill Out the Template

#### Metadata Section

At the top of the template, fill out the lesson metadata:

```
# Lesson Metadata
Title: Photosynthesis: How Plants Make Energy
Subject: Biology
Grade Level: 9th Grade
Duration (minutes): 45
Reading Level: 8
Language: en-US
Description: Students will learn the process of photosynthesis and its importance.
```

**Important:** Do not remove the `# Lesson Metadata` heading or the `---` divider below it.

#### Component Sections

Each `## Component:` heading defines a new lesson component. The text between headings becomes that component's content.

**Supported Component Types:**
- **Instructions** - Introduction and lesson overview
- **Page** - Main instructional content and reading material
- **Multimedia** - YouTube/Vimeo links (one per line)
- **Coding IDE** - Code samples and programming activities
- **Activity** - Hands-on activities and guided tasks
- **Quiz** - Questions and answers (use Q: and A: format)
- **Discussion** - Discussion prompts for peer interaction
- **Reflection** - Journaling prompts and reflections
- **Assignment** - Graded work (automatically marked as assignable)
- **Resources** - Reference links and materials

### 3. Upload the Template

1. Save your completed template file
2. Return to TailorEDU and click "Upload Template"
3. Select your file (.txt or .docx format supported)
4. Wait for the import to complete

### 4. Review and Edit

After upload:
- All components are automatically created
- Metadata populates the lesson details
- Assignment components are marked as assignable
- Switch to "Manual Build" tab to review and edit

## Example Template

```
# Lesson Metadata
Title: Introduction to Variables in Python
Subject: Computer Science
Grade Level: 10th Grade
Duration (minutes): 50
Reading Level: 7
Language: en-US
Description: Learn how to create and use variables in Python programming.

---

## Component: Instructions
Welcome to your first lesson on Python variables! In this lesson, you'll learn:
- What variables are and why they're important
- How to create variables in Python
- Different types of variables (strings, numbers, booleans)
- Best practices for naming variables

By the end, you'll be able to write simple Python programs using variables.

---

## Component: Page
## What is a Variable?

A variable is like a labeled box that stores information. Just like you might write 
your name on a box to remember what's inside, variables have names that help us 
remember what information they contain.

In Python, creating a variable is simple:

name = "Alice"
age = 15
is_student = True

---

## Component: Coding IDE
Language: python

# Practice: Create Your Own Variables
# TODO: Create a variable called 'favorite_color' with your favorite color
# TODO: Create a variable called 'lucky_number' with your lucky number
# TODO: Print both variables

# Example:
city = "Minneapolis"
print(city)

---

## Component: Quiz
Q: What symbol is used to assign a value to a variable in Python?
A: The equals sign (=)

Q: Can a variable name start with a number?
A: No, variable names must start with a letter or underscore

Q: What are the three main types of variables we learned about?
A: Strings, numbers, and booleans

---

## Component: Assignment
Create a Python program that:
1. Asks the user for their name, age, and favorite subject
2. Stores each response in a variable
3. Prints a personalized message using all three variables

Example output:
"Hello, Alice! You are 15 years old and your favorite subject is Math."

Submit your code file when complete.
```

## Tips for Success

### ✅ Do's
- Keep component headings exactly as shown (e.g., `## Component: Instructions`)
- Use clear, descriptive content
- Leave blank sections for components you don't need
- Include all required metadata fields
- Save your file with a .txt extension for easiest compatibility

### ❌ Don'ts
- Don't rename the component headings
- Don't remove the metadata section
- Don't remove the `---` dividers
- Don't use special formatting that won't translate to plain text

## Validation Rules

The system will check for:
1. **Valid File Format** - Must be .txt or .docx
2. **Required Sections** - Must include Metadata and at least one component
3. **Proper Structure** - Component headings must start with `## Component:`
4. **Complete Metadata** - At minimum, Title must be provided

## Troubleshooting

### "Invalid template format" Error
- Check that you have `## Component:` headings
- Verify the metadata section exists with `# Lesson Metadata`
- Make sure there are `---` dividers between sections

### "Missing required sections" Error
- At minimum, include Instructions and one other component
- Check that component headings aren't misspelled

### Components Not Appearing
- Verify each component section has content
- Check that you didn't accidentally delete a `## Component:` heading
- Make sure there's a blank line between sections

### Metadata Not Applied
- Check for typos in field names (Title, Subject, etc.)
- Ensure each metadata line has a colon (`:`)
- Verify values aren't still using placeholder brackets `[...]`

## Future Enhancements

Coming soon:
- **Microsoft Word (.docx) Support** - Full rich text formatting
- **Google Docs Import** - Direct import from Google Drive
- **Markdown Support** - Use Markdown syntax for formatting
- **Bulk Import** - Upload multiple lessons at once
- **Template Library** - Pre-made templates for common lesson types

## Support

Need help? Contact your TailorEDU administrator or submit feedback through the platform.

---

**Version:** 1.0  
**Last Updated:** October 2025
