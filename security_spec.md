# Security Specification — KreceAgro

## 1. Data Invariants
1. **Owner-Isolated Accounts**: A merchant can only read, create, or update their own `/users/{userId}` document, `/users/{userId}/private/info` PII document, `/users/{userId}/credits/{creditId}` credits, and `/users/{userId}/coupons/{couponId}` coupons.
2. **Verified Identity Gate**: Every read and write operation requires `request.auth != null && request.auth.token.email_verified == true`.
3. **Immutable Ownership & Timestamps**: `uid` / `ownerId` and `createdAt` cannot be modified after creation. `createdAt == request.time` on creation and `updatedAt == request.time` on updates.
4. **Terminal Credit Lock**: Once a credit document reaches `status == 'completed'`, no subsequent client updates are permitted.
5. **Strict Key & Size Enforcement**: No ghost fields are allowed (`hasOnly(...)`), all strings have explicit `.size()` bounds, and arrays (`installments`) are strictly bounded (`<= 12`).

## 2. Adversarial Payloads ("Dirty Dozen")
1. Unauthenticated read on `/users/u1/private/info` -> `PERMISSION_DENIED`.
2. Unverified email user (`email_verified: false`) writing `/users/u1` -> `PERMISSION_DENIED`.
3. User `u2` reading `/users/u1/private/info` -> `PERMISSION_DENIED`.
4. User `u1` creating credit with `ownerId: 'u2'` (Identity Spoofing) -> `PERMISSION_DENIED`.
5. User `u1` creating `/users/u1` with shadow field `isAdmin: true` -> `PERMISSION_DENIED`.
6. User `u1` updating `/users/u1` modifying `creditLimit` arbitrarily -> `PERMISSION_DENIED` (only permitted profile/points fields allowed).
7. User `u1` creating credit with client-forged `createdAt` timestamp -> `PERMISSION_DENIED`.
8. User `u1` updating a `completed` credit back to `active` -> `PERMISSION_DENIED`.
9. User `u1` creating credit with 100-item `installments` array -> `PERMISSION_DENIED`.
10. User `u1` creating credit with invalid document ID containing `/` or >128 chars -> `PERMISSION_DENIED`.
11. User `u1` listing `/users/u2/credits` -> `PERMISSION_DENIED`.
12. User `u1` updating coupon modifying `discountAmount` -> `PERMISSION_DENIED` (only `status` and `updatedAt` may change).
