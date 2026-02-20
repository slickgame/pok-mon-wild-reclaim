# Poacher Reward Contract (Battle → Zones)

## Authority split

- **Battle** computes and emits only **base trainer gold** (`battleGoldBase`) + poacher metadata needed for resolution.
- **Zones** is the **single authority** for nodelet poacher settlement:
  - applies poacher reward tier gold multiplier,
  - grants guaranteed + rolled poacher items,
  - settles harvest transaction state (resolved/forfeited),
  - applies defeat consequence profile.

This avoids double-source reward logic drift and accidental duplicate grants.

## Handoff parameters

`Battle` returns to `Zones` with query params:

- `nodeletBattle`
- `nodeletId`
- `battleOutcome`
- `nodeletBattleType`
- `poacherTrainerId`
- `poacherTrainerTier`
- `poacherRewardTier`
- `poacherLossProfile`
- `triggeredByAction`
- `harvestTxnId`
- `battleGoldBase`

All handoff build/parse/cleanup logic is centralized in `src/components/zones/poacherOutcomeHandoff.js`.

## Live data migration/backfill

`Zones` runs a lightweight migration pass on load (`migrateZoneNodeletsForPoacherData`) to normalize legacy poacher nodelet data:

- clears legacy `pendingHarvestForfeit` flag,
- normalizes malformed `harvestTxns` entries,
- preserves data with migration notes.

This is intentionally idempotent and safe to re-run.
