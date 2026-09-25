# Exploratory handoff analysis

## Evidence floor

The verified fact is continuity of packet identity and germination record across two local stores: the same lot ID remains paired with the same germination record after a move. That supports inventory provenance for this transfer. It does not establish who may receive a packet, whether a recipient agreed to receive it, or whether those decisions survive a disaster-response handoff.

## Plausible design neighborhoods

- **Chain-of-custody and inventory transfer:** A signed transfer manifest could bind lot ID, germination record, quantity, sender, receiver, and handoff time. This extends the observed store-to-store continuity into an auditable distribution path. The existing observation does not prove signatures, quantities, or later custody events are reliable.
- **Entitlement or voucher redemption:** A disaster-response program could issue a scoped, one-use claim token after an eligibility decision. Redemption would bind the token to a packet lot and record fulfillment, while keeping the rule for eligibility separate from the packet's identity. Analogues include aid vouchers and controlled inventory issuance; their suitability here remains a design hypothesis.
- **Consent as a distinct event:** An opt-in record could capture the recipient's informed agreement, the intended use of their data, and the channel and time of consent. It should be linked to fulfillment without assuming that possession of a token implies consent. Whether individual consent is required, and its valid form, depends on the actual distribution context.
- **Offline reconciliation:** If connectivity fails, local distributors might issue numbered receipts against preallocated stock and reconcile them later. Duplicate redemption, lost receipts, and revocation become risks requiring a defined conflict policy. This is a plausible disaster-response pattern, not a demonstrated requirement.

A minimal handoff model therefore has separate assertions: **packet provenance**, **recipient eligibility decision**, **recipient consent**, and **fulfillment**. Each needs an actor, timestamp, scope, and evidence source. Linking them by a transaction ID can help auditing without treating one assertion as proof of another. No particular technology, such as a blockchain, follows from the evidence floor.

## Next discriminator

Determine **who authoritatively decides eligibility and what evidence distributors can verify at the point of handoff, especially offline**. A concrete policy and one representative issuance/redemption walkthrough would reveal whether a roster, signed voucher, local attestation, or another mechanism fits. In that walkthrough, separately specify how consent is requested and recorded before fulfillment. Until those rules are known, the mechanisms above are candidates rather than validated solutions.
