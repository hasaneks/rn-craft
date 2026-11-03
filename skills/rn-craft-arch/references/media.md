# Camera and media

## Vision Camera

- Permission through the soft flow (`permissions.md`); microphone only if video with sound is in scope.
- `isActive` = screen focused (`useIsFocused`) **and** `AppState` active. The camera stops when the screen blurs or
  the app goes to the background.
- Pick a `format` that matches the need (photo resolution, fps); do not default to the maximum.
- Handle: no device, permission lost while open, `onError` (show a retry state, log the code), interrupted sessions.
- Full-screen presentation; capture button in the thumb zone; safe areas respected.

## Size and compression

- Decide per use case: for example avatars 512 px JPEG q0.8, documents 2048 px, video 720p H.264 with a length cap.
- Resize and compress on the device before upload; strip EXIF location unless the product needs it.

## Upload

- Progress, cancel, and failure with a retry button. Retries are controlled (backoff, limit) and resume the same
  upload id where the backend supports it.
- Prefer direct-to-storage uploads with a short-lived URL from the backend (pre-signed S3 / Firebase Storage rules)
  over streaming through the API; never put storage credentials in the app.
- Uploads that must survive backgrounding use a background-capable uploader.

## Files and cache

- Write captures to the cache directory; delete temporary files after upload or when the flow is cancelled; clean up
  orphans at startup.
- Image cache with limits; sized thumbnails in lists, full images only on detail.
- Every remote image has a placeholder and an error state.
