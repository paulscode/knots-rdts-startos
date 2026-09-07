import { setupManifest } from '@start9labs/start-sdk'
import { long, short, torDescription } from './i18n'

export const manifest = setupManifest({
  id: 'knots-rdts',
  title: 'Bitcoin Knots (RDTS) Companion',
  license: 'MIT',
  donationUrl: null,
  packageRepo: 'https://github.com/paulscode/knots-rdts-startos',
  upstreamRepo: 'https://github.com/bitcoinknots/bitcoin',
  marketingUrl: 'https://bitcoinknots.org/',
  description: { short, long },
  volumes: ['main', 'i2pd'],
  images: {
    bitcoind: {
      source: {
        dockerBuild: {
          buildArgs: {
            VERSION: '29.4.knots20260508',
            PATH_VERSION: '29.x',
          },
        },
      },
      arch: ['x86_64', 'aarch64', 'riscv64'],
    },
    // The Start9 image again, and the first version of it worth running on a
    // pruned node. v0.8.1 is tagged at the merge of PR #34, which fixed two
    // defects that each stopped a pruned node's dependents dead and neither of
    // which cleared on its own:
    //
    //   - The witness check rejected any block whose coinbase commits to
    //     witnesses the block does not carry. Blocks mined during SegWit
    //     signalling have exactly that shape and are valid; mainnet 434499 is
    //     the first. Every peer returns the same bytes, so every peer "failed",
    //     the block was never fetched, and an indexer could never pass that
    //     height.
    //   - The passthrough cookie was read once at startup. bitcoind writes a
    //     new one every time it starts, so from this node's next restart the
    //     proxy answered its dependents 401 forever, and only restarting the
    //     proxy cleared it.
    //
    // The previous release carried our own build of those fixes, because they
    // had not been released upstream yet. They have been, so this is back on
    // the official image: same fixes, same three architectures, and none of the
    // BLAKE2b header work this chain has no use for.
    //
    // Anything below v0.8.1 is not safe to pin here. v0.8.0 has both defects.
    proxy: {
      source: {
        dockerTag: 'ghcr.io/start9labs/btc-rpc-proxy:v0.8.1',
      },
      arch: ['x86_64', 'aarch64', 'riscv64'],
    },
    python: {
      source: {
        dockerTag: 'python:3.14.2-alpine',
      },
      arch: ['x86_64', 'aarch64', 'riscv64'],
    },
    i2pd: {
      source: {
        dockerTag: 'purplei2p/i2pd:release-2.58.0',
      },
      arch: ['x86_64', 'aarch64'],
      emulateMissingAs: 'x86_64',
    },
  },
  dependencies: {
    tor: {
      description: torDescription,
      optional: true,
      metadata: {
        title: 'Tor',
        icon: 'https://raw.githubusercontent.com/Start9Labs/tor-startos/65faea17febc739d910e8c26ff4e61f6333487a8/icon.svg',
      },
    },
  },
})
