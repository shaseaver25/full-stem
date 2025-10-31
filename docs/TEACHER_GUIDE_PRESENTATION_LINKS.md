# Teacher Guide: Adding Presentations to Lessons

This guide explains how to add presentations (PowerPoint, Google Slides, etc.) to your lessons using shareable embed links.

## Why Embed Links?

Using embed links from presentation platforms offers several advantages:

- ✅ **Reliable playback** - Works every time, no compatibility issues
- ✅ **Native features** - Animations, transitions, and interactive elements work perfectly
- ✅ **Always up-to-date** - Edit your presentation and changes appear instantly
- ✅ **Faster loading** - No file uploads or conversions needed
- ✅ **Keep control** - Presentations stay in your account where you manage them

## Supported Platforms

Our lesson builder works with embed links from:

- **Google Slides** (recommended)
- **OneDrive PowerPoint Online**
- **Canva Presentations**
- **Prezi**
- **SlideShare**
- Any platform that provides an embed link

---

## Google Slides (Recommended)

### Step-by-Step Instructions:

1. **Open your presentation** in Google Slides
   
2. **Publish to web:**
   - Click **File** in the top menu
   - Select **Share** → **Publish to web**
   
3. **Get the embed link:**
   - Click the **Embed** tab (not "Link")
   - Choose your preferred settings:
     - Auto-advance slides (optional)
     - Start presentation from beginning
     - Restart slide show after last slide (optional)
   - Click **Publish**
   
4. **Copy the link:**
   - You'll see an iframe code like: `<iframe src="https://docs.google.com/presentation/d/e/..."></iframe>`
   - Copy the entire URL from inside the `src="..."` quotes
   - Example: `https://docs.google.com/presentation/d/e/2PACX-1vT.../embed?start=false&loop=false`
   
5. **Paste in lesson builder:**
   - Return to the lesson builder
   - Find the "Presentation Embed Link" field
   - Paste the URL you copied
   - Save the component

### Privacy Settings:

Make sure your presentation is accessible to students:

1. Click the **Share** button (top right of Google Slides)
2. Under "General access," select:
   - **Anyone with the link** (Viewer)
3. Click **Done**

---

## OneDrive PowerPoint Online

### Step-by-Step Instructions:

1. **Upload to OneDrive:**
   - Upload your PowerPoint file to OneDrive
   - Open the file in **PowerPoint Online** (web version)
   
2. **Get embed code:**
   - Click **File** → **Share** → **Embed**
   - A panel will appear on the right side
   
3. **Generate embed code:**
   - Click the **Generate** button
   - You'll see HTML code like: `<iframe src='https://onedrive.live.com/embed?...'></iframe>`
   
4. **Extract the URL:**
   - Copy only the URL from inside the `src='...'` quotes
   - Example: `https://onedrive.live.com/embed?resid=ABC123...`
   
5. **Paste in lesson builder:**
   - Return to the lesson builder
   - Find the "Presentation Embed Link" field
   - Paste the URL you copied
   - Save the component

### Privacy Settings:

1. Right-click on your PowerPoint file in OneDrive
2. Select **Share**
3. Set permissions to:
   - **Anyone with the link can view**
4. Click **Apply**

---

## Canva Presentations

### Step-by-Step Instructions:

1. **Open your presentation** in Canva
   
2. **Get embed code:**
   - Click **Share** (top right)
   - Select **More** → **Embed**
   
3. **Copy the embed link:**
   - You'll see an iframe code
   - Copy the URL from inside the `src="..."` quotes
   
4. **Paste in lesson builder:**
   - Return to the lesson builder
   - Paste the URL into the "Presentation Embed Link" field
   - Save the component

---

## Prezi

### Step-by-Step Instructions:

1. **Open your Prezi presentation**
   
2. **Share your Prezi:**
   - Click **Share** (top right)
   - Select **Embed**
   
3. **Copy embed link:**
   - Copy the URL from the embed code
   - Example: `https://prezi.com/embed/...`
   
4. **Paste in lesson builder:**
   - Return to the lesson builder
   - Paste the URL into the "Presentation Embed Link" field
   - Save the component

---

## Troubleshooting

### "No preview available" or blank screen

**Problem:** The embed link isn't working in the lesson viewer.

**Solutions:**

1. **Check sharing settings:**
   - Make sure the presentation is set to "Anyone with the link can view"
   - Private presentations won't embed properly
   
2. **Use the embed URL, not the edit URL:**
   - ❌ Wrong: `https://docs.google.com/presentation/d/ABC123/edit`
   - ✅ Correct: `https://docs.google.com/presentation/d/e/ABC123/embed`
   
3. **Copy from the embed code:**
   - Always get the URL from the **Embed** option, not from the browser address bar
   
4. **Test the link:**
   - Open a new browser tab
   - Paste the link directly into the address bar
   - If it doesn't show your presentation, the link needs to be regenerated

### Presentation shows but won't advance slides

**Problem:** Students see the first slide but can't navigate.

**Solutions:**

1. **For Google Slides:**
   - When publishing to web, ensure navigation controls are enabled
   - Check the embed settings in the publish dialog
   
2. **For PowerPoint Online:**
   - Make sure you're using the embed link, not a direct file link
   - The embed viewer includes navigation controls

### Students see "Permission denied"

**Problem:** Students get an error when trying to view the presentation.

**Solutions:**

1. **Update sharing permissions:**
   - Google Slides: Share with "Anyone with the link"
   - OneDrive: Set file permissions to "Anyone with the link can view"
   
2. **Don't restrict to your organization:**
   - Make sure access isn't limited to your school domain
   - Test with an incognito/private browser window

### Link doesn't paste into the field

**Problem:** The embed URL is too long or contains special characters.

**Solutions:**

1. **Copy the full URL:**
   - Make sure you're copying the complete link
   - Include everything from `https://` to the end
   
2. **No extra characters:**
   - Don't include the `<iframe>` tags, quotes, or other HTML
   - Just the URL itself

---

## Best Practices

### 1. Test Before Assigning

Always preview your presentation as a student would see it:
- Click the preview button in the lesson builder
- Check that all slides display correctly
- Test navigation controls

### 2. Keep Presentations Updated

Since the lesson uses a link to your original presentation:
- Edit the original file in Google Slides/OneDrive
- Changes appear automatically in your lesson
- No need to re-upload or update the link

### 3. Accessible Design

Make presentations accessible for all students:
- Use high-contrast colors
- Include alt text for images
- Use readable fonts (minimum 18pt)
- Avoid relying solely on color to convey information

### 4. File Organization

Keep your presentations organized:
- Use clear, descriptive file names
- Organize by unit/topic in your cloud storage
- Keep a folder specifically for course presentations

### 5. Backup Your Work

- Google Slides and OneDrive automatically save changes
- Consider downloading backup copies periodically
- Keep master versions separate from student-facing versions

---

## Quick Reference

| Platform | Share Method | Where to Find Embed Link |
|----------|--------------|--------------------------|
| **Google Slides** | File → Share → Publish to web → Embed tab | Copy from `src="..."` in iframe code |
| **OneDrive PowerPoint** | File → Share → Embed → Generate | Copy from `src='...'` in iframe code |
| **Canva** | Share → More → Embed | Copy from `src="..."` in iframe code |
| **Prezi** | Share → Embed | Copy embed URL directly |
| **SlideShare** | Share button → Embed | Copy from `src="..."` in iframe code |

---

## Still Need Help?

If you're having trouble:

1. **Check the sharing settings** - This is the most common issue
2. **Try a different browser** - Sometimes browser extensions block embeds
3. **Test in incognito mode** - Helps identify permission problems
4. **Contact support** - Include the presentation link and error message you're seeing

---

## Video Tutorials

For visual learners, check out these helpful videos:

- [How to Embed Google Slides](https://www.youtube.com/results?search_query=how+to+embed+google+slides)
- [Sharing PowerPoint from OneDrive](https://www.youtube.com/results?search_query=onedrive+powerpoint+embed)
- [Creating Embeddable Presentations](https://www.youtube.com/results?search_query=embed+presentation+link)

---

*Last updated: 2025*
