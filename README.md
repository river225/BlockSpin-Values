# rivers-blockspin-values
Rivers Blockspin Value's - Updated value list for Blockspin items, including guns and skins.

## Releasing (pages, versions, sitemap)

After changing any HTML, JS or CSS, run:

    node tools/release.mjs

It regenerates the section, guide and item pages from `index.html`, stamps every `?v=` with a
hash of the file's contents (so visitors never get an old cached copy), and rebuilds `sitemap.xml`.
Never edit files under `values/`, `guides/`, `items/`, `richest-players/` or `crew-logos/` by hand.
The "Update pages" GitHub Action also runs this on every push and hourly (refreshing the item
list from the Sheet), so a forgotten run is fixed automatically.

The main spreadsheet id lives only in `bsv-config.js`.
