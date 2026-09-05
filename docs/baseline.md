# Todo List baseline

This baseline records source-inspected behavior before migration. Browser behavior
and the hosted API have not been verified. No automated regression suite exists;
the checklist below is a plan for future checks, not executable coverage.

## Repository structure and entry points

- `index.html`: browser entry point, initial sample task, CDN styles and scripts.
- `index.js`: global functions for rendering, API requests, and SweetAlert dialogs.
- `style.css`: layout, scrolling task list, and responsive styling.
- `.vscode/settings.json`: Live Server port `5501`.
- `.gitattributes`: text-file LF policy (`* text=auto eol=lf`).

The app has no local backend, package manifest, build/lint/test commands, or CI.
Dependencies load from CDNs: Axios, SweetAlert2, Bootstrap, jQuery Slim, Popper,
Font Awesome, and Google Fonts. Axios is unpinned; SweetAlert2 is pinned only to
major version 11. `node --check index.js` checks syntax only.

## Current Todo data shape

Inferred from client code, not a verified remote schema:

```ts
type Todo = {
  id: string | number; // Remote type unknown; inline handlers assume numeric-compatible IDs.
  content: string;
  createdAt: string; // Client creates an ISO timestamp.
  isCompleted: boolean;
};
```

Creation omits `id`, expecting the service to assign it. Rendering reads `id`,
`content`, and `createdAt`; it ignores `isCompleted`.

## Existing API behavior to preserve

Base URL: `https://6825ded0397e48c91313f355.mockapi.io/tasks`.

| Action | Request | Client behavior |
| --- | --- | --- |
| Load | `GET /tasks` | On DOM ready, fetch tasks, clear initial markup, sort by `createdAt` descending, and render browser-localized time and date. |
| Add | `POST /tasks` | Add button trims input and ignores blank input. Sends `{ content, createdAt, isCompleted: false }`. On success, clears input, starts a refresh, and shows a notification. |
| Edit | `PUT /tasks/:id` | Opens a prefilled dialog. Save sends only `{ content }`, without trimming or blank validation, then starts a refresh and shows a notification. Cancel sends no request. |
| Delete | `DELETE /tasks/:id` | Requires confirmation. Success starts a refresh and shows a notification. Cancel sends no request and shows a cancellation dialog. |

Refreshes after mutations are not awaited. Enter-key submission has no handler.
Preserve the CRUD flow, ordering, date presentation, dialogs, and existing visual
layout during migration; track defects below separately from parity requirements.

## Current checkbox behavior

Each rendered checkbox starts unchecked, even if a task has `isCompleted: true`.
Clicking changes only its local visual state: there is no API request or state
handler. Re-rendering or reloading resets it. Persisted completion is not currently
implemented; its migration scope remains unresolved.

## Planned baseline regression checklist

Future automated checks must mock or intercept API requests so they do not modify
hosted MockAPI data. These checks have not been implemented or executed.

- Load multiple tasks newest first; an empty response clears the list.
- Display timestamps using the browser locale.
- Blank add sends no request; valid add trims content and sends all creation fields.
- Successful add clears input, refreshes the list, and shows a notification.
- Edit prefills content; save sends content only; cancel sends no request.
- Confirmed delete sends one DELETE and refreshes; cancellation sends no request.
- Checkbox clicks send no request, ignore stored completion, and reset on render.
- Reload displays persisted tasks using an isolated test store or stateful mock.
- Record request-failure behavior and the known add scope error separately from
  passing parity expectations.
- Cover apostrophes, HTML-like text, nonnumeric IDs, and long content to expose
  rendering/handler defects; unsafe execution is not behavior to preserve.
- Check desktop/mobile layout, list scrolling, keyboard controls, and dialog focus.

## Known defects and risks, not parity requirements

- `addTodo()` logs `response` outside its `try` block scope, causing a runtime error
  after any nonblank add attempt, including a failed POST.
- Task content is interpolated into `innerHTML` and inline JavaScript handlers.
  Quotes can break editing; crafted content can execute script. IDs also enter
  inline handlers without safe encoding.
- The initial static "Hello" task remains if loading fails; its edit button targets
  hardcoded ID `2` rather than a fetched task.
- Load/add failures only log errors. Edit/delete lack explicit error recovery;
  success notifications do not guarantee that the subsequent refresh succeeded.
- Repeated clicks can issue duplicate requests, and overlapping refreshes can
  display stale results.
- Icon buttons lack accessible names. Long text and narrow layouts need browser
  verification.
- CDN availability and floating versions affect reproducibility. No authentication
  is configured in the client; remote access controls are unknown.

## Unverified remote API assumptions

- GET returns an array with the expected fields and parseable timestamps; field
  requirements, nullability, and actual ID types are unverified.
- The service assigns IDs on POST and persists tasks across reloads.
- PUT with only `content` preserves omitted fields rather than replacing the task.
- Response bodies, status codes, validation, missing-ID behavior, CORS, access
  controls, limits, and current endpoint availability are unverified.

## Migration decisions

- Backend: NestJS with TypeScript.
- Frontend: React with Vite and TypeScript.
- Preserve behavior before replacing implementation: establish the baseline and
  future isolated checks, then replace components in small, verifiable steps.
- Keep the project intentionally small; separate defect fixes from implementation
  migration so behavior changes can be reviewed explicitly.

## Unresolved decisions

- Which local persistence technology to use.
- Whether existing MockAPI data needs migration.
- Whether checkbox persistence belongs to parity work or a later feature.
