# NOT SO BAD fork

Based on upstream `v5.0.1` (`d1cc7d9aea612034dee9c7134977252a0961454c`).

`fix/consumed-contexts` contains the source fix and regression tests only. A closed
pair context is attached to its sentence once, instead of being copied to every
subsequent sentence. Sentence boundaries, ranges, and text are unchanged. This
branch can be used for an upstream pull request.

`aozora` adds package metadata and built `module/` (ESM) and `lib/` (CommonJS)
files. Consumers pin a full commit hash rather than a moving branch. Node.js
consumers install the GitHub archive at that commit; no install-time build is
required. Deno consumers import `module/sentence-splitter.js` from the same
commit and map its external dependencies:

```json
{
  "imports": {
    "sentence-splitter": "https://raw.githubusercontent.com/notsobad-jp/sentence-splitter/COMMIT/module/sentence-splitter.js"
  },
  "scopes": {
    "https://raw.githubusercontent.com/notsobad-jp/sentence-splitter/COMMIT/": {
      "@textlint/ast-node-types": "npm:@textlint/ast-node-types@13.4.1",
      "structured-source": "npm:structured-source@4.0.0"
    }
  }
}
```

To update, merge upstream into `fix/consumed-contexts`, run `pnpm install
--frozen-lockfile`, `pnpm test`, and `pnpm run build`. Merge the tested source
branch into `aozora`, rebuild, and commit the generated files with
`git add -f module lib`. Update consumer commit hashes and lockfiles together.

Once an upstream release contains the fix, consumers can return to the npm
package after comparing sentence/chunk output and rerunning performance checks.
