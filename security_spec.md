# Security Specification for Lumina Select

## 1. Data Invariants
1. A session belongs to a photographer (`photographerUid`).
2. A client can view a session if they have access to the session (session ID & valid status).
3. A client can update the session's `selectedCount`, `status`, and `clientNotes` during selection.
4. A photo belongs to a parent session (`/sessions/{sessionId}/photos/{photoId}`).
5. Only the photographer or active client can toggle `isSelected` on photos within that session.
6. Comments belong to a specific photo within a session and cannot exceed size bounds.
7. Timestamps and string fields are strictly bound in size to avoid resource exhaustion attacks.

## 2. The Dirty Dozen Payloads (Negative Security Test Cases)
1. Injecting massive 10MB payload into session description.
2. Malicious user altering photographerUid to spoof ownership.
3. Client attempting to delete an entire photo collection or session.
4. Client attempting to modify photographerUid of a session.
5. Injected script tags or invalid types in `isSelected` (e.g. passing a string instead of boolean).
6. Non-permitted fields injected during selection update (Ghost Fields).
7. Non-authenticated write to sessions collection.
8. Modifying photo URL or filename by unauthorized user.
9. Attempting path traversal or ID poisoning using non-alphanumeric IDs.
10. Attempting to add comment without required authorName or message.
11. Exceeding comment message length (> 1000 characters).
12. Updating an immutable createdAt timestamp.
