# OneDrive Integration for TailorEDU

## Overview
Teachers can connect Microsoft accounts (personal or school), attach OneDrive files to lesson components, and students can view attachments inline.

## Setup Instructions

### 1. Microsoft Entra ID (Azure) Configuration

**Register Application:**
1. Go to [Azure Portal](https://portal.azure.com) > Microsoft Entra ID > App registrations
2. Click "New registration"
3. Name: "TailorEDU OneDrive Integration"
4. Redirect URI: `${window.location.origin}/auth/callback/microsoft`

**Configure API Permissions:**
- Microsoft Graph > Delegated permissions:
  - `Files.ReadWrite`
  - `offline_access`
  - `User.Read`

**Get Credentials:**
- Copy the Application (client) ID
- Create a client secret and copy it

### 2. Supabase Configuration

**Add Microsoft OAuth Provider:**
1. Go to Supabase Dashboard > Authentication > Providers
2. Enable "Azure" provider
3. Add your Azure Application (client) ID
4. Add your client secret
5. Set redirect URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

**Configure URL Settings:**
- Site URL: Your production URL
- Redirect URLs: Include your preview and production URLs

### 3. Environment Setup

The OneDrive Picker requires the Azure client ID. Update `OneDriveFilePicker.tsx`:
```typescript
clientId: 'YOUR_AZURE_CLIENT_ID'
```

## Usage

### For Teachers
1. Click "Attach from OneDrive" in lesson builder
2. Sign in with Microsoft account (first time only)
3. Select files from OneDrive
4. Files are attached and visible to students

### For Students
- View embedded OneDrive files inline within lessons
- Click "Open in OneDrive" to view in full screen

## Database Schema

Table: `onedrive_attachments`
- `id`: UUID primary key
- `lesson_component_id`: Foreign key to lesson_components
- `file_id`: OneDrive item ID
- `file_name`: File name
- `web_url`: OneDrive preview/download link
- `mime_type`: File type
- `owner_id`: User who attached
- `metadata`: Additional metadata (JSONB)
- `created_at`, `updated_at`: Timestamps

## Security

- OAuth tokens encrypted in `user_tokens` table with provider = 'onedrive'
- RLS policies enforce:
  - Teachers manage their own attachments
  - Students view attachments in enrolled classes
  - Admins view all attachments

## File Support

**Embeddable:**
- Microsoft Word (.docx)
- Microsoft Excel (.xlsx)
- Microsoft PowerPoint (.pptx)
- PDF documents
- Images (JPG, PNG)
- Videos (MP4)

**Non-embeddable:** Display as file cards with "Open in OneDrive" link
