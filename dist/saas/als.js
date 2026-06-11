// als.ts — alleen de AsyncLocalStorage, in een eigen module zonder runtime-
// imports zodat helpscout-client.ts en context.ts er allebei op kunnen leunen
// zonder circulaire import (de HelpScoutClient-import hieronder is type-only).
import { AsyncLocalStorage } from 'node:async_hooks';
export const requestContext = new AsyncLocalStorage();
//# sourceMappingURL=als.js.map