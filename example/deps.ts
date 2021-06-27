export * from "../runtime.ts";
import { ResizeObserver } from 'https://cdn.skypack.dev/@juggle/resize-observer?dts';

// @ts-ignore
window.ResizeObserver = ResizeObserver;

import { IS_BROWSER } from "../runtime.ts";
import { setup } from "https://cdn.skypack.dev/twind/shim";

export { default as createStore } from "https://cdn.skypack.dev/zustand?dts";
export * from "https://cdn.skypack.dev/zustand/middleware?dts";


export * as THREE from "https://cdn.skypack.dev/three?dts";

if (IS_BROWSER) {
  setup({});
}
