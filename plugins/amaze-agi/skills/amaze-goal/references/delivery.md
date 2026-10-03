# Delivery

Upload and attachment are separate effects with separate receipts.

| Step | Verified when | Otherwise |
| --- | --- | --- |
| Upload | the destination reports a SHA-256 equal to the local bytes | unverified (no hash), failed, or unknown |
| Attach | a fresh listing of the container shows the item | unknown until listed or confirmed absent |

- Keep the exact delivered bytes and their SHA-256 with the job.
- Unknown upload or attach: look for the item first (reconcile), then decide whether to retry.
- Report links only after the readback, never from the send call alone.

## After delivery

Write the lessons worth keeping to memory (see [memory](memory.md)), read them back, and stop at the finish line. Do not continue with unrequested follow-ups.
