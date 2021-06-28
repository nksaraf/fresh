import { denoPlugin, esbuild } from "./deps.ts";
import { Page } from "./types.ts";

let esbuildInitalized: boolean | Promise<void> = false;
async function ensureEsbuildInialized() {
  if (esbuildInitalized === false) {
    esbuildInitalized = esbuild.initialize({
      wasmURL: "https://unpkg.com/esbuild-wasm@0.11.19/esbuild.wasm",
      worker: false,
    });
    await esbuildInitalized;
    esbuildInitalized = true;
  } else if (esbuildInitalized instanceof Promise) {
    await esbuildInitalized;
  }
}

export class Bundler {
  #pages: Page[];
  #cache: Map<string, Uint8Array> | Promise<void> | undefined = undefined;
  #preloads = new Map<string, string[]>();

  constructor(pages: Page[]) {
    this.#pages = pages;
  }

  async bundle() {
    const entryPoints: Record<string, string> = {};

    for (const page of this.#pages) {
      entryPoints[page.name] = `fresh:///${page.name}`;
    }

    await ensureEsbuildInialized();

    console.log(import.meta.url)
    try {
      const bundle = await esbuild.build({
        bundle: true,
        entryPoints,
        format: "esm",
        jsxFactory: "h",
        jsxFragment: "Fragment",
        metafile: true,
        // minify: true,
        outdir: `/`,
        outfile: "",
        platform: "neutral",
        plugins: [freshPlugin(this.#pages), denoPlugin({ loader: "portable", importMapFile: "import_map.json" })],
        splitting: true,
        target: ["chrome89", "firefox88", "safari13"],
        treeShaking: true,
        write: false,
        logLevel: 'debug'
      });

      const metafileOutputs = bundle.metafile!.outputs;

      for (const path in metafileOutputs) {
        const meta = metafileOutputs[path];
        const imports = meta.imports
          .filter(({ kind }) => kind === "import-statement")
          .map(({ path }) => `/${path}`);
        this.#preloads.set(`/${path}`, imports);
      }

      const cache = new Map<string, Uint8Array>();
      for (const file of bundle.outputFiles) {
        cache.set(file.path, file.contents);
      }
      this.#cache = cache;
    } catch (e) {
      console.log(e);
      throw e
    }

    return;
  }

  async cache(): Promise<Map<string, Uint8Array>> {
    if (this.#cache === undefined) {
      this.#cache = this.bundle();
    }
    if (this.#cache instanceof Promise) {
      await this.#cache;
    }
    return this.#cache as Map<string, Uint8Array>;
  }

  async get(path: string): Promise<Uint8Array | null> {
    const cache = await this.cache();
    return cache.get(path) ?? null;
  }

  getPreloads(path: string): string[] {
    return this.#preloads.get(path) ?? [];
  }
}

function freshPlugin(pageList: Page[]): esbuild.Plugin {
  const runtime = new URL("../../runtime.ts", import.meta.url);

  const pageMap = new Map<string, Page>();

  for (const page of pageList) {
    pageMap.set(`/${page.name}`, page);
  }

  return {
    name: "fresh",
    setup(build) {
      build.onResolve({ filter: /fresh:\/\/.*/ }, function onResolve(
        args: esbuild.OnResolveArgs,
      ): esbuild.OnResolveResult | null | undefined {
        return ({
          path: args.path,
          namespace: "fresh",
        });
      });

      build.onLoad(
        { filter: /.*/, namespace: "fresh" },
        function onLoad(
          args: esbuild.OnLoadArgs,
        ): esbuild.OnLoadResult | null | undefined {
          const url = new URL(args.path);
          const path = url.pathname;
          const page = pageMap.get(path);
          if (!page) return null;
          const contents = `
import Page from "${page.url}";
import { h, ReactDOM, DATA_CONTEXT } from "${runtime.href}";

addEventListener("DOMContentLoaded", () => {
  const { params, data } = JSON.parse(document.getElementById("__FRSH_PROPS")?.textContent ?? "{}");
  try {
    ReactDOM.render(h(DATA_CONTEXT.Provider, { value: new Map(data ?? []) }, h(Page, { params: params ?? {} })), document.getElementById("__FRSH"));  
  } catch(err) {
    if (err instanceof Promise) {
      console.error("Render tried to suspend without a suspense boundary.");
    } else {
      console.error("Render threw an error:", err);
    }
  }
});
`;
          return { contents, loader: "js" };
        },
      );
    },
  };
}
