// -- react ssr --
export * as ReactDOMServer from "https://esm.sh/react-dom@17.0.1/server";

// -- std --
export { extname } from "https://deno.land/std@0.95.0/path/mod.ts";
export { generate as generateUuid } from "https://deno.land/std@0.95.0/uuid/v4.ts";

// -- router --
export * as router from "https://crux.land/router@0.0.4";

// -- media types --
export { lookup as mediaTypeLookup } from "https://deno.land/x/media_types@v2.8.4/mod.ts";

// -- esbuild --
const start = new Date().getTime();

// @ts-ignore not working
globalThis.performance = {
  now() {
    return new Date().getTime() - start;
  },
};
// @deno-types="https://unpkg.com/esbuild-wasm@0.11.19/esm/browser.d.ts"
import * as esbuild from "https://gist.githubusercontent.com/lucacasonato/358c6b7e8198bfb2cf3d220e49fdcf5f/raw/3714cb0f59606eefc29ed0fea36d4cd93549938b/esbuild-wasm.js";
export { esbuild };
export { denoPlugin } from "https://raw.githubusercontent.com/nksaraf/esbuild_deno_loader/main/mod.ts";
