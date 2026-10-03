# Delivery

Delivery has separate facts. Report each at the level actually reached:

| Fact | Established by |
| --- | --- |
| Source identity | SHA-256 of the exact bytes you produced; keep those bytes unchanged |
| Destination hash verified | the destination reports a SHA-256 equal to the source hash |
| Upload accepted | the connector confirms the upload (ID, link or receipt) without a destination hash |
| Attachment accepted | the connector confirms the item was attached or posted |
| Attachment listed | a fresh listing of the container shows the item |
| Recipient delivery or view | the recipient or platform confirms it; otherwise not known |

- A confirmed connector receipt is enough to move to the next stage; report it as *attested*. Do not invent a hash or listing the route cannot provide, and do not loop downloading files back just to re-hash them.
- When the destination offers a hash or listing cheaply, use it and report *verified*.
- The source SHA-256 plus unchanged bytes remain the authority for which report was delivered.
- A different destination hash means failed. An unknown upload or attach is looked up first (reconcile), then retried only if absent.
- Report links with their level: "uploaded, connector receipt" is not "viewed by recipient".

## After delivery

Write the lessons worth keeping to memory (see [memory](memory.md)), read them back, and stop at the finish line. Do not continue with unrequested follow-ups.
