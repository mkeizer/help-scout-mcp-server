# /docs Command

Manage Help Scout Docs knowledge base articles.

## Usage

```
/docs <action> [arguments]
```

## Actions

### Search articles
```
/docs search <query>
```
Search the knowledge base for articles matching a keyword.

### Create article
```
/docs create <title>
```
Create a new published article in the knowledge base.

### Update article
```
/docs update <article URL or ID>
```
Update an existing article.

### Delete article
```
/docs delete <article URL or ID>
```
Delete an article (irreversible).

### List categories
```
/docs categories
```
List all knowledge base categories with article counts.

### List articles
```
/docs list [categoryId]
```
List articles, optionally filtered by category.

## Input

The user provides one of the above actions with arguments. For article URLs, extract the article ID from the URL path.

## Workflow

### Search

1. Use `searchDocsArticles` with the query
2. Present results as a table with name, URL, and status

### Create

1. Ask the user for:
   - Article title (if not provided)
   - Which category to assign (show categories with `listDocsCategories`)
   - Article content (HTML)
2. Use `createDocsArticle` to publish the article
3. Also create a local copy in `knowledge/` matching the category folder structure
4. Return the public URL

### Update

1. Extract article ID from URL if needed (the hex string after `/article/` or after the number-slug, e.g. `69ab375df79ac76b8a9f07c2`)
2. Use `getDocsArticle` to fetch current content
3. Show the user what currently exists
4. Ask what they want to change
5. Use `updateDocsArticle` with only the changed fields
6. Update the local `knowledge/` copy if it exists

### Delete

1. Use `getDocsArticle` to show what will be deleted
2. **Ask for confirmation** — this is irreversible
3. Use `deleteDocsArticle` to remove it
4. Remove the local `knowledge/` copy if it exists

### List categories

1. Use `listDocsCategories`
2. Present as table: category name, ID, article count

### List articles

1. Use `listDocsArticles` (with categoryId if provided)
2. Present as table: article name, status, URL, last updated

## Article HTML Guidelines

When creating or updating articles, use proper HTML:

```html
<p>Paragraph text goes here.</p>

<h3>Section heading</h3>

<ul>
<li>Bullet point</li>
</ul>

<ol>
<li>Numbered step</li>
</ol>

<code>inline code</code>
<strong>bold text</strong>
<a href="https://example.com">link text</a>
```

## Category → Folder Mapping

| Category ID | Local folder |
|-------------|-------------|
| `664c7045463661770bfaf0aa` | `knowledge/administratief/` |
| `664c704f463661770bfaf0ab` | `knowledge/directadmin/` |
| `5acccf172c7d3a0e93672f4f` | `knowledge/domeinnamen/` |
| `5acb57952c7d3a0e93671f40` | `knowledge/e-mail/` |
| `664c706e804514782072afcf` | `knowledge/mijn-keurigonline/` |
| `5acb57a42c7d3a0e93671f42` | `knowledge/technisch/` |
| `5acb573a2c7d3a0e93671f36` | `knowledge/uncategorized/` |

## Local Knowledge Sync

When creating or updating an article, also maintain the local markdown copy:

**Filename:** Use the article slug (e.g., `sftp-foutmelding-unexpected-end-of-file.md`)

**Format:**
```markdown
# Article Title

> Bron: https://help.keurigonline.nl/article/NNN-slug

[Content converted from HTML to markdown]
```

## Notes

- All tools require `HELPSCOUT_DOCS_API_KEY` to be configured
- Default collection ID comes from `HELPSCOUT_DOCS_COLLECTION_ID` env var
- Articles are published by default — use `status: "notpublished"` for drafts
- The `deleteDocsArticle` action is **irreversible** — always confirm before deleting
- Article names must be unique within a collection

ARGUMENTS: $ARGUMENTS
