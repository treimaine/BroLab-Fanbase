# File Upload Security Implementation

## Overview

This document describes the security measures implemented to prevent malicious file uploads and ensure file integrity.

**OWASP Mitigation:** A06:2025 - Insecure Design

## Security Features

### 1. Client-Side Validation (`src/lib/file-validation.ts`)

Before uploading any file, the client performs:

- **MIME Type Validation**: Ensures file type matches expected category (audio/video/image)
- **File Size Validation**: Enforces size limits based on file type
- **Checksum Calculation**: Generates SHA-256 hash for integrity verification

### 2. Server-Side Validation (`convex/files.ts`)

After upload, the server validates:

- **MIME Type Verification**: Re-validates the content type
- **Size Limit Enforcement**: Confirms file size is within limits
- **Checksum Storage**: Stores checksum for future verification
- **Automatic Cleanup**: Deletes invalid files immediately

## Usage Example

### Step 1: Validate File Before Upload

```typescript
import { validateFileBeforeUpload } from "@/lib/file-validation";

async function handleFileSelection(file: File, type: "audio" | "video" | "image") {
  // Define max size based on type
  const maxSize = type === "audio" ? 50 * 1024 * 1024 : // 50MB
                  type === "video" ? 500 * 1024 * 1024 : // 500MB
                  5 * 1024 * 1024; // 5MB for images

  // Validate file
  const validation = await validateFileBeforeUpload(file, type, maxSize);
  
  if (!validation.valid) {
    console.error("File validation failed:", validation.error);
    return;
  }

  // File is valid, proceed with upload
  const checksum = validation.checksum!;
  await uploadFile(file, type, checksum);
}
```

### Step 2: Upload File with Validation

```typescript
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";

async function uploadFile(file: File, type: "audio" | "video" | "image", checksum: string) {
  // 1. Get upload URL
  const uploadUrl = await generateUploadUrl({
    fileType: type,
    fileSize: file.size,
  });

  // 2. Upload file to Convex Storage
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });

  const { storageId } = await response.json();

  // 3. Validate uploaded file
  const validationResult = await validateUploadedFile({
    storageId,
    expectedType: type,
    checksum,
    contentType: file.type,
    fileSize: file.size,
  });

  if (!validationResult.valid) {
    throw new Error("File validation failed on server");
  }

  return storageId;
}
```

### Step 3: Integration in Product Upload

```typescript
// In AddProductDialog or similar component
import { validateFileBeforeUpload } from "@/lib/file-validation";
import { api } from "@/../convex/_generated/api";

async function onSubmit(data: FormData) {
  const file = selectedFile; // From file input
  const type = data.type; // "music" or "video"

  // Validate before upload
  const validation = await validateFileBeforeUpload(
    file,
    type === "music" ? "audio" : "video",
    type === "music" ? 50 * 1024 * 1024 : 500 * 1024 * 1024
  );

  if (!validation.valid) {
    toast.error(validation.error);
    return;
  }

  // Get upload URL
  const uploadUrl = await generateUploadUrl({
    fileType: type === "music" ? "audio" : "video",
    fileSize: file.size,
  });

  // Upload file
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });

  const { storageId } = await response.json();

  // Validate on server
  await validateUploadedFile({
    storageId,
    expectedType: type === "music" ? "audio" : "video",
    checksum: validation.checksum!,
    contentType: file.type,
    fileSize: file.size,
  });

  // Create product with validated file
  await createProduct({
    ...data,
    fileStorageId: storageId,
  });
}
```

## Accepted File Types

### Audio Files
- `audio/mpeg` (MP3)
- `audio/wav`
- `audio/ogg`
- `audio/aac`
- `audio/flac`
- `application/ogg`

### Video Files
- `video/mp4`
- `video/webm`
- `video/ogg`
- `video/quicktime` (MOV)
- `application/x-mpegurl` (HLS)

### Image Files
- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/webp`
- `image/gif`

## Size Limits

| File Type | Max Size | Plan Requirement |
|-----------|----------|------------------|
| Audio | 50 MB | Free |
| Video | 500 MB | Premium |
| Image | 5 MB | Free |

## Security Considerations

### Current Implementation

✅ Client-side MIME type validation
✅ Client-side file size validation
✅ Client-side SHA-256 checksum calculation
✅ Server-side MIME type re-validation
✅ Server-side size limit enforcement
✅ Automatic deletion of invalid files
✅ Checksum storage for audit trail

### Future Enhancements

For production deployment, consider:

1. **Malware Scanning**
   - Integrate with ClamAV or VirusTotal API
   - Scan files before making them available for download

2. **Server-Side Checksum Verification**
   - Implement in a Convex action to download and verify checksum
   - Compare client-provided checksum with server-calculated checksum

3. **Content Analysis**
   - Verify audio/video files are actually playable
   - Check for embedded malicious code in metadata

4. **Rate Limiting**
   - Limit number of uploads per user per time period
   - Prevent abuse and DoS attacks

5. **Audit Logging**
   - Log all upload attempts with user, file info, and validation results
   - Monitor for suspicious patterns

## Testing

### Test Cases

1. **Valid File Upload**
   - Upload a valid audio/video/image file
   - Verify checksum is calculated correctly
   - Verify server validation passes

2. **Invalid MIME Type**
   - Attempt to upload a .exe file as audio
   - Verify client-side validation rejects it
   - Verify server-side validation rejects it if bypassed

3. **Oversized File**
   - Attempt to upload a 100MB audio file
   - Verify client-side validation rejects it
   - Verify server-side validation rejects it if bypassed

4. **Corrupted File**
   - Upload a file with incorrect extension
   - Verify MIME type validation catches it

## References

- [OWASP A06:2025 - Vulnerable and Outdated Components](https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/)
- [Web Crypto API - SubtleCrypto.digest()](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest)
- [Convex File Storage](https://docs.convex.dev/file-storage)
