# Shared CTech error experience

`ErrorState` provides accessible, responsive Portuguese defaults for 400, 404, 500 and 503. Override title/description for localization and domain wording; provide actions through `action`. It uses semantic tokens from the active ThemeProvider and does not depend on Next.js or a network service. Existing components and themes are unchanged.

Products own their route/error boundaries. Use 404 for missing routes/entities, 400 for malformed links, 500 for unexpected rendering failures and 503 for unavailable services. Retry must call the failed operation again, not merely hide the message. Keep exception details in application observability; never expose stack traces, credentials or private data through UI copy.

A static exported `/503/` page can be served by a functioning edge during backend downtime. It cannot load if the edge itself is unreachable. Displaying an error state in the browser does not change the original static HTTP response status; configure hosting to serve 404.html with HTTP 404 and maintenance pages with HTTP 503. Framework error boundaries do not catch arbitrary event-handler or asynchronous errors; applications must handle those explicitly.

Adoption by other products is incremental and requires importing the released component; publishing does not automatically alter deployed products.
