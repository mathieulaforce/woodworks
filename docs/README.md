# Woodworks docs

Everything about the product and how it is built lives here, next to the code,
so docs change in the same pull request as the feature they describe.

| Folder | What goes in it |
|---|---|
| [product/](product/) | What we are building and why: vision, feature specs, user decisions |
| [architecture/](architecture/) | How the system fits together: apps, packages, data model |
| [decisions/](decisions/) | Architecture decision records (ADRs), one file per decision, numbered |

Adding a doc: drop a Markdown file in the right folder and link it from this table
or from the folder's existing pages. New decision? Copy
[decisions/template.md](decisions/template.md) to the next number.
