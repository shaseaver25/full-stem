# Google Drive Integration for TailorEDU

## Overview
TailorEDU now supports seamless Google Drive integration across all lesson components. Teachers can attach and embed Drive files directly within lessons, providing students with instant access to documents, presentations, spreadsheets, and more.

## Features

### ✅ Supported Component Types
- **PowerPoint/Slides** - Embed presentation files
- **Page** - Attach supporting documents
- **Multimedia** - Link video files from Drive
- **Discussion** - Share reference materials
- **Coding IDE** - Attach starter code files
- **Desmos Activity** - Include supporting worksheets
- **Activity** - Provide activity resources
- **Assignment** - Attach rubrics and instructions
- **Assessment** - Include reference materials
- **Reflection** - Share reflection prompts

### 🔐 Security & Permissions
- **Role-Based Access**: Only authorized users can view Drive files
  - Teachers can attach and manage files in their lessons
  - Students can view files in classes they're enrolled in
  - Admins have full visibility
- **OAuth 2.0**: Secure authentication via Google OAuth
- **Encrypted Storage**: Drive tokens stored encrypted in database
- **Automatic Refresh**: Tokens automatically refresh when expired

### 📎 File Management
- **Multiple Attachments**: Attach multiple Drive files per component
- **Inline Previews**: Files display embedded preview when possible
- **Direct Links**: Quick access to open files in Google Drive
- **Easy Removal**: Teachers can remove attachments anytime

## Setup Instructions

### 1. Google Cloud Console Configuration

#### Enable Google Picker API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to **APIs & Services** > **Library**
4. Search for "Google Picker API"
5. Click **Enable**

#### Create API Key
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the API key
4. Update `src/components/drive/DriveFilePicker.tsx`:
   ```typescript
   const GOOGLE_API_KEY = 'YOUR_ACTUAL_API_KEY';
   ```

#### Configure OAuth Consent Screen
Already configured with these scopes:
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/userinfo.profile`
- `openid`
- `https://www.googleapis.com/auth/drive.file` ✅

### 2. Supabase Configuration

#### Database Tables
The following tables are automatically created:
- `user_tokens` - Stores encrypted OAuth tokens
- `drive_attachments` - Stores file metadata and associations

#### Row-Level Security
RLS policies ensure:
- Teachers manage their own attachments
- Students view files in enrolled classes only
- Admins have full access

### 3. Authentication Setup

#### OAuth Provider
Supabase Authentication > Providers > Google:
- ✅ Enabled
- ✅ Client ID configured
- ✅ Client Secret configured
- ✅ Drive scope: `https://www.googleapis.com/auth/drive.file`

## Usage Guide

### For Teachers

#### Attaching Files
1. **Create or Edit Lesson Component**
   - Navigate to Lesson Builder
   - Create or select a component to edit

2. **Attach from Drive**
   - Scroll to "Google Drive Attachments" section
   - Click "Attach from Drive" button
   - Google Picker will open showing your Drive files

3. **Select File**
   - Browse your Drive files
   - Select the file to attach
   - Click "Select" in the picker

4. **Verify Attachment**
   - File appears in attachments list
   - Preview shows for supported file types
   - Link to open in Drive available

#### Managing Attachments
- **View**: Click "Open in Drive" to view full file
- **Remove**: Click trash icon to remove attachment
- **Multiple Files**: Repeat process to attach multiple files

#### Reauthorization
If token expires:
1. System displays "Google Drive Access Required" alert
2. Click "Reauthorize Google Drive"
3. Complete OAuth flow again
4. Continue attaching files

### For Students

#### Viewing Attachments
1. **Open Lesson**
   - Navigate to assigned lesson
   - Components with Drive files show attachments section

2. **View Embedded Files**
   - Supported files (docs, PDFs, presentations) show inline preview
   - Other files show with download link

3. **Open in Drive**
   - Click "Open in Drive" for full Google Drive interface
   - Edit (if permissions allow) or download file

### For Administrators

#### Monitoring
- View all Drive attachments across platform
- Track usage and attachment patterns
- Manage teacher Drive access

#### Troubleshooting
Common issues and solutions:

**Issue**: "Authentication Required" message
- **Solution**: Teacher needs to sign in with Google and grant Drive permissions

**Issue**: Picker doesn't open
- **Solution**: Check API key is valid and Picker API is enabled

**Issue**: File not visible to students
- **Solution**: Verify file permissions in Google Drive and student enrollment status

## Technical Details

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                  TailorEDU Frontend                  │
│                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐│
│  │ Lesson       │  │ Drive File   │  │ Drive      ││
│  │ Builder      │→ │ Picker       │→ │ API        ││
│  │ Component    │  │ Component    │  │            ││
│  └──────────────┘  └──────────────┘  └────────────┘│
│         ↓                  ↓                 ↓       │
└─────────┼──────────────────┼─────────────────┼──────┘
          │                  │                 │
          ↓                  ↓                 ↓
┌─────────────────────────────────────────────────────┐
│                  Supabase Backend                    │
│                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐│
│  │ lesson_      │  │ drive_       │  │ user_      ││
│  │ components   │  │ attachments  │  │ tokens     ││
│  │ (table)      │  │ (table)      │  │ (encrypted)││
│  └──────────────┘  └──────────────┘  └────────────┘│
│                                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │ RLS Policies (Role-based access control)      │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### API Endpoints

#### Drive Utilities (`src/utils/googleDrive.ts`)
- `getDriveToken()` - Retrieve stored Drive token
- `getValidDriveToken()` - Get valid token (refresh if needed)
- `refreshDriveToken()` - Refresh expired token
- `uploadToDrive()` - Upload file to Drive
- `hasDriveAccess()` - Check if user has Drive access

#### Components
- `DriveFilePicker` - Opens Google Picker for file selection
- `DriveFileEmbed` - Displays embedded Drive file preview
- `DriveAttachmentsList` - Shows list of attached files
- `DriveReauthorization` - Handles token reauthorization

### Database Schema

#### drive_attachments
```sql
CREATE TABLE public.drive_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_component_id UUID REFERENCES lesson_components(id),
  file_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  web_view_link TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);
```

## Best Practices

### For Teachers
1. **Organize Drive Files**: Keep lesson files in dedicated folders
2. **Check Permissions**: Ensure Drive files have appropriate sharing settings
3. **File Names**: Use descriptive file names for better student experience
4. **File Types**: Use common formats (PDF, DOCX, PPTX) for best compatibility
5. **Embed vs Link**: Use embed for in-lesson viewing, links for downloads

### For Developers
1. **Token Management**: Always check token validity before Drive operations
2. **Error Handling**: Provide clear error messages for auth failures
3. **Performance**: Consider lazy-loading Drive attachments
4. **Security**: Never expose raw tokens in client code
5. **Testing**: Test with various file types and sizes

## Troubleshooting

### Common Errors

#### "Failed to load Google Drive picker"
- **Cause**: Network issue or API key problem
- **Fix**: Check internet connection and API key configuration

#### "No valid Drive access token"
- **Cause**: User not authenticated with Google
- **Fix**: Click "Sign in with Google" and grant Drive permissions

#### "Failed to attach file"
- **Cause**: Database permission issue or network error
- **Fix**: Check console logs, verify user authentication

#### "File not visible"
- **Cause**: RLS policy blocking access
- **Fix**: Verify student enrollment and teacher ownership

### Debug Mode
Enable detailed logging:
```typescript
// In browser console
localStorage.setItem('DEBUG_DRIVE', 'true');
```

Console will show:
- 🔍 Token retrieval
- 📎 File selection
- 💾 Database operations
- ✅ Success confirmations
- ❌ Error details

## Roadmap

### Upcoming Features
- [ ] Folder selection support
- [ ] Batch file attachment
- [ ] Drive file search within picker
- [ ] Automatic file type icons
- [ ] Last modified timestamps
- [ ] File size indicators
- [ ] Download progress tracking
- [ ] Offline access indicators

### Known Limitations
- API key required for Google Picker (developer setup needed)
- File preview limited by Google Drive API capabilities
- Large files may have loading delays
- Some file types don't support inline preview

## Support

For issues or questions:
1. Check this documentation first
2. Review console logs for error details
3. Verify Google Cloud and Supabase configuration
4. Contact TailorEDU technical support

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-14  
**Compatibility**: TailorEDU v2.0+
