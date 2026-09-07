import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'
import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
import { storeJson } from '../fileModels/store.json'
/**
 * Reset all mempool settings to undefined so the new flavor's upstream
 * defaults take effect. This is the primary reason users switch between
 * Core and Knots.
 */
const mempoolReset = {
  // Shared mempool settings
  persistmempool: undefined,
  maxmempool: undefined,
  mempoolexpiry: undefined,
  mempoolfullrbf: undefined,
  permitbaremultisig: undefined,
  datacarrier: undefined,
  datacarriersize: undefined,
  // Knots-specific mempool settings
  permitbaredatacarrier: undefined,
  rejectparasites: undefined,
  rejecttokens: undefined,
  mempoolreplacement: undefined,
  mempooltruc: undefined,
  permitbareanchor: undefined,
  permitephemeral: undefined,
  minrelaytxfee: undefined,
  bytespersigop: undefined,
  bytespersigopstrict: undefined,
  maxtxlegacysigops: undefined,
  limitancestorcount: undefined,
  limitancestorsize: undefined,
  limitdescendantcount: undefined,
  limitdescendantsize: undefined,
  permitbarepubkey: undefined,
  maxscriptsize: undefined,
  datacarriercost: undefined,
  acceptnonstddatacarrier: undefined,
  dustrelayfee: undefined,
  acceptunknownwitness: undefined,
  minrelaycoinblocks: undefined,
  minrelaymaturity: undefined,
}

/**
 * Chain-split recovery flag (see startos/forkRecovery.ts), set on every
 * sidegrade out of this enforcing flavor and consumed by the destination
 * flavor's chain-recovery oneshot at next start (a clean no-op when there is
 * nothing to fix). The shared datadir carries this flavor's persisted
 * per-block verdicts across the switch, so RDTS-driven invalid verdicts must
 * be reconsidered or they pin Core / pre-RDTS Knots to a stale chain across a
 * split. The destination's own rdtsEnforcedLastRun marker detects the same
 * transition independently; setting the flag here makes the switch case
 * deterministic even if a prior run never recorded a marker.
 *
 * The inverse direction needs nothing: the Knots release this flavor pins
 * re-validates the RDTS-applicable range itself when it starts on a datadir
 * that advanced without enforcement.
 */
const leavingRdtsFlavor = { reconsiderInvalidTips: true }

/**
 * `consensusrules=rdts` acknowledges the upgrade to the binary and nothing
 * else: the RUNTIME_WARN build enforces RDTS with or without it, and only
 * warns when it is missing. The package sets it on arrival and clears it on
 * departure — no other flavor understands the key — but never enforces it, so
 * a user who would rather see the warning can delete it and it stays deleted.
 */
const setConsensusRules = { raw: { consensusrules: 'rdts' as const } }

/**
 * `maxtipage` has no arrival half — the file model pins it — but the flavors
 * we hand off to parse unknown keys through rather than dropping them, so it
 * must be removed here: left behind, a node on their chain would call itself
 * synced up to two weeks late.
 */
const clearFlavorKeys = {
  raw: { consensusrules: undefined, maxtipage: undefined },
}

export const current = VersionInfo.of({
  version: '#knots:29.4:10',
  releaseNotes: {
    en_US: `- Runs the official Start9 build of the RPC proxy again, now that the fixes this node needed have been released upstream.\n- **Nothing changes in how this node behaves.** The previous release already carried both fixes; it carried them as our own build of the proxy, because upstream had not cut a release with them yet. Upstream v0.8.1 is tagged at exactly that merge, so this swaps back to the official image for the same code.\n- For reference, the two faults those fixes address, both of which stop a pruned node serving history to anything that depends on it: block 434,499 was rejected as tampered with when it is simply an unusual, valid block mined while SegWit was being signalled, which left indexers retrying it forever; and the proxy kept a copy of this node's cookie from when it started, so after this node restarted it rejected every request its dependents made.\n- Fewer moving parts, no loss of platform support: the official image covers the same three architectures, and it does not carry the BLAKE2b header handling this chain has no use for.`,
    es_ES: `- Runs the official Start9 build of the RPC proxy again, now that the fixes this node needed have been released upstream.\n- **Nothing changes in how this node behaves.** The previous release already carried both fixes; it carried them as our own build of the proxy, because upstream had not cut a release with them yet. Upstream v0.8.1 is tagged at exactly that merge, so this swaps back to the official image for the same code.\n- For reference, the two faults those fixes address, both of which stop a pruned node serving history to anything that depends on it: block 434,499 was rejected as tampered with when it is simply an unusual, valid block mined while SegWit was being signalled, which left indexers retrying it forever; and the proxy kept a copy of this node's cookie from when it started, so after this node restarted it rejected every request its dependents made.\n- Fewer moving parts, no loss of platform support: the official image covers the same three architectures, and it does not carry the BLAKE2b header handling this chain has no use for.`,
    de_DE: `- Runs the official Start9 build of the RPC proxy again, now that the fixes this node needed have been released upstream.\n- **Nothing changes in how this node behaves.** The previous release already carried both fixes; it carried them as our own build of the proxy, because upstream had not cut a release with them yet. Upstream v0.8.1 is tagged at exactly that merge, so this swaps back to the official image for the same code.\n- For reference, the two faults those fixes address, both of which stop a pruned node serving history to anything that depends on it: block 434,499 was rejected as tampered with when it is simply an unusual, valid block mined while SegWit was being signalled, which left indexers retrying it forever; and the proxy kept a copy of this node's cookie from when it started, so after this node restarted it rejected every request its dependents made.\n- Fewer moving parts, no loss of platform support: the official image covers the same three architectures, and it does not carry the BLAKE2b header handling this chain has no use for.`,
    pl_PL: `- Runs the official Start9 build of the RPC proxy again, now that the fixes this node needed have been released upstream.\n- **Nothing changes in how this node behaves.** The previous release already carried both fixes; it carried them as our own build of the proxy, because upstream had not cut a release with them yet. Upstream v0.8.1 is tagged at exactly that merge, so this swaps back to the official image for the same code.\n- For reference, the two faults those fixes address, both of which stop a pruned node serving history to anything that depends on it: block 434,499 was rejected as tampered with when it is simply an unusual, valid block mined while SegWit was being signalled, which left indexers retrying it forever; and the proxy kept a copy of this node's cookie from when it started, so after this node restarted it rejected every request its dependents made.\n- Fewer moving parts, no loss of platform support: the official image covers the same three architectures, and it does not carry the BLAKE2b header handling this chain has no use for.`,
    fr_FR: `- Runs the official Start9 build of the RPC proxy again, now that the fixes this node needed have been released upstream.\n- **Nothing changes in how this node behaves.** The previous release already carried both fixes; it carried them as our own build of the proxy, because upstream had not cut a release with them yet. Upstream v0.8.1 is tagged at exactly that merge, so this swaps back to the official image for the same code.\n- For reference, the two faults those fixes address, both of which stop a pruned node serving history to anything that depends on it: block 434,499 was rejected as tampered with when it is simply an unusual, valid block mined while SegWit was being signalled, which left indexers retrying it forever; and the proxy kept a copy of this node's cookie from when it started, so after this node restarted it rejected every request its dependents made.\n- Fewer moving parts, no loss of platform support: the official image covers the same three architectures, and it does not carry the BLAKE2b header handling this chain has no use for.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
    // Keyed by Core major series as caret ranges — one entry per Core
    // major, not per Core `:N`. Range-keyed `migrations.other` requires
    // StartOS ≥ 0.4.0-beta.9 (Start9Labs/start-os#3214).
    //
    // Sidegrade edges belong on whichever version is current: without them
    // this version has no path off the flavor at all.
    //
    // Intentional asymmetry: there is no `^#knotsprerdts` key for the
    // pre-RDTS Knots sibling (B). The B↔C migration belt lives on B's own
    // `^#knots` entry (its `up` edge, C→B, sets reconsiderInvalidTips),
    // which fires because this flavor satisfies B's `canMigrateTo`; the
    // runtime rdtsEnforcedLastRun marker double-covers it. Not a gap — no
    // mirror key.
    other: {
      ['^28']: {
        // Core → Knots
        up: async ({ effects }) => {
          await bitcoinConfFile.merge(effects, {
            ...mempoolReset,
            ...setConsensusRules,
          })
        },
        // Knots → Core
        down: async ({ effects }) => {
          await bitcoinConfFile.merge(effects, {
            ...mempoolReset,
            ...clearFlavorKeys,
          })
          await storeJson.merge(effects, leavingRdtsFlavor)
        },
      },
      ['^29']: {
        // Core → Knots
        up: async ({ effects }) => {
          await bitcoinConfFile.merge(effects, {
            ...mempoolReset,
            ...setConsensusRules,
          })
        },
        // Knots → Core
        down: async ({ effects }) => {
          await bitcoinConfFile.merge(effects, {
            ...mempoolReset,
            ...clearFlavorKeys,
          })
          await storeJson.merge(effects, leavingRdtsFlavor)
        },
      },
      ['^30']: {
        // Core → Knots: drop coinstatsindex written by Core 30+ at the new
        // path; Knots 29 only reads the old indexes/coinstats/ path, which
        // Core 30 deliberately preserved for downgrade.
        up: async ({ effects }) => {
          await bitcoinConfFile.merge(effects, {
            ...mempoolReset,
            ...setConsensusRules,
          })
          await rm('/media/startos/volumes/main/indexes/coinstatsindex', {
            recursive: true,
            force: true,
          }).catch(console.error)
        },
        // Knots → Core
        down: async ({ effects }) => {
          await bitcoinConfFile.merge(effects, {
            ...mempoolReset,
            ...clearFlavorKeys,
          })
          await storeJson.merge(effects, leavingRdtsFlavor)
        },
      },
      ['^31']: {
        // Core → Knots: drop fee_estimates.dat (v31 bumped
        // CURRENT_FEES_FILE_VERSION 149900 → 309900; ≤30 hard-fails) and
        // coinstatsindex (same reason as 30.x).
        up: async ({ effects }) => {
          await bitcoinConfFile.merge(effects, {
            ...mempoolReset,
            ...setConsensusRules,
          })
          await rm('/media/startos/volumes/main/fee_estimates.dat', {
            force: true,
          }).catch(console.error)
          await rm('/media/startos/volumes/main/indexes/coinstatsindex', {
            recursive: true,
            force: true,
          }).catch(console.error)
        },
        // Knots → Core
        down: async ({ effects }) => {
          await bitcoinConfFile.merge(effects, {
            ...mempoolReset,
            ...clearFlavorKeys,
          })
          await storeJson.merge(effects, leavingRdtsFlavor)
        },
      },
      // `#knotsrdts` (the "Bitcoin Knots plus BIP-110" build) is being
      // retired. Users on it can move here; nothing carries over. The
      // acceptance that build recorded predates the split, so arrival
      // re-prompts under the current terms — as it does from every other
      // flavor. No `down` — `#knotsrdts` is being de-listed, so the inverse
      // path can't be selected by a user.
      ['^#knotsrdts:29.3']: {
        up: async ({ effects }) => {
          await bitcoinConfFile.merge(effects, setConsensusRules)
        },
      },
    },
  },
})
  .satisfies('29.4:13')
  .satisfies('28.4:26')
