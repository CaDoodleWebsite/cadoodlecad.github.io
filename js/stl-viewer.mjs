/**
 * STL viewer for MkDocs pages, built on the Babylon.js UMD build.
 *
 * Usage in Markdown (raw HTML passes through Python-Markdown untouched):
 *
 *   <div class="stl-viewer" data-stl="../models/bracket_binary.stl"></div>
 *
 * Supported data-* attributes:
 *   data-stl                    (required) URL of the .stl file, relative to the page
 *   data-height                 CSS height of the viewer box            (default 420px)
 *   data-color                  raw, unlit hex mesh colour (this gets lit
 *                                by the viewer's own PointLight -- don't
 *                                sample it from an already-lit screenshot)
 *                                                                         (default #b8c4d0)
 *   data-background             hex clear colour                        (default #1c2128)
 *   data-autorotate             "true" to spin until the user interacts (default false)
 *   data-wireframe              "true" to render edges only             (default false)
 *   data-preserve-coordinates   "true" to skip the loader's Y/Z swap    (default false)
 *   data-grid                   "true" to show a CaDoodle-workplane-style
 *                                grid plane under the model              (default false)
 *
 * Loaded as an ES module via mkdocs.yml `extra_javascript`. Because classic
 * scripts execute before deferred modules, the Babylon UMD globals are
 * guaranteed to exist by the time this runs -- no load-order guard needed.
 */

const DEFAULTS = {
  height: "420px",
  color: "#b8c4d0",
  background: "#1c2128",
  autorotate: false,
  wireframe: false,
  preserveCoordinates: false,
  grid: false,
};

/**
 * Browsers cap simultaneous WebGL contexts (commonly 8-16) and silently drop
 * the oldest once past the limit, which looks like a random blank canvas
 * rather than an error. We keep our own budget well under any cap and evict
 * least-recently-seen viewers ourselves, so eviction is predictable.
 */
const MAX_LIVE_ENGINES = 4;
const live = [];

/**
 * DO_NOT_ALTER_FILE_COORDINATES is a static on the loader class, so it is
 * process-wide rather than per-load. Serialising imports through one queue
 * means a viewer that opts out of the swap cannot race one that does not.
 */
let loadQueue = Promise.resolve();

function enqueueLoad(task) {
  const result = loadQueue.then(task, task);
  // Keep the chain alive even if one load rejects.
  loadQueue = result.catch(() => {});
  return result;
}

function readConfig(el) {
  const truthy = (v) => v === "true" || v === "1" || v === "";
  return {
    url: el.dataset.stl,
    height: el.dataset.height || DEFAULTS.height,
    color: el.dataset.color || DEFAULTS.color,
    background: el.dataset.background || DEFAULTS.background,
    autorotate: el.dataset.autorotate !== undefined && truthy(el.dataset.autorotate),
    wireframe: el.dataset.wireframe !== undefined && truthy(el.dataset.wireframe),
    preserveCoordinates:
      el.dataset.preserveCoordinates !== undefined && truthy(el.dataset.preserveCoordinates),
    grid: el.dataset.grid !== undefined && truthy(el.dataset.grid),
  };
}

function showError(el, message) {
  el.innerHTML = "";
  const box = document.createElement("div");
  box.className = "stl-viewer__error";
  box.textContent = message;
  el.appendChild(box);
}

/**
 * Frame the camera from the model's bounding box.
 *
 * STL carries no unit information -- the same part may arrive as 200 (mm) or
 * 0.2 (m). A fixed camera radius and fixed clip planes would put one of those
 * off-screen and clip the other, so every distance here is derived from the
 * model's own diagonal.
 */
function frameCamera(camera, meshes) {
  let min = null;
  let max = null;

  for (const mesh of meshes) {
    if (!mesh.getTotalVertices || mesh.getTotalVertices() === 0) continue;
    mesh.computeWorldMatrix(true);
    const info = mesh.getBoundingInfo();
    const bmin = info.boundingBox.minimumWorld;
    const bmax = info.boundingBox.maximumWorld;
    min = min ? BABYLON.Vector3.Minimize(min, bmin) : bmin.clone();
    max = max ? BABYLON.Vector3.Maximize(max, bmax) : bmax.clone();
  }

  if (!min || !max) return;

  const center = BABYLON.Vector3.Center(min, max);
  const diagonal = max.subtract(min).length() || 1;

  camera.setTarget(center);
  camera.radius = diagonal * 1.6;
  camera.lowerRadiusLimit = diagonal * 0.15;
  camera.upperRadiusLimit = diagonal * 12;
  camera.minZ = diagonal / 1000;
  camera.maxZ = diagonal * 100;

  /*
   * Zoom proportionally, not additively.
   *
   * `wheelPrecision` moves the camera a fixed distance per tick, so once you
   * are zoomed out each tick covers a trivial fraction of the gap and getting
   * back in takes dozens of scrolls -- while the same step is jumpy up close.
   * `wheelDeltaPercentage` instead moves a percentage of the current radius,
   * so a tick feels identical at every distance. Setting it takes precedence
   * over `wheelPrecision`, so that is deliberately no longer set.
   *
   * Trackpads emit many small deltas per gesture, hence the low percentage.
   */
  camera.wheelDeltaPercentage = 0.02;
  camera.pinchDeltaPercentage = 0.02;
  camera.useNaturalPinchZoom = true;

  camera.panningSensibility = 2000 / diagonal;

  return {
    alpha: camera.alpha,
    beta: camera.beta,
    radius: camera.radius,
    target: center.clone(),
    diagonal,
  };
}

/**
 * Draws a CaDoodle-workplane-style grid tile on a canvas: a base fill, minor
 * gridlines at each small-tile boundary, and a major gridline at the tile's
 * own edge. Colors and the 10-small-tiles-per-big-tile ratio are the real
 * ones traced from WorkplaneManager.createTexturedWorkplane's bytecode (see
 * knowledge_base/notes/cadoodle-grid-workplane-mechanism.md): wpColor
 * #3838A8, grid1Color #202060 (minor), grid10Color #0000FF (major). Tiled
 * across a ground plane via UV scale, this reproduces the same recurring
 * major-gridline spacing the real app draws -- per-pixel noise is skipped
 * for a lightweight texture, everything else is faithful to the algorithm.
 */
function buildGridTexture(scene) {
  const SIZE = 200;
  const SMALL = 20; // CaDoodle's TILE_SMALL_GRID_PX
  // Mipmapping matters here, not just as an optimisation: this texture gets
  // tiled ~60-70x across the enlarged ground plane (see buildGridPlane), and
  // without mips the GPU point-samples a high-frequency grid pattern at
  // extreme minification, which aliases into a flat averaged blur rather
  // than visible lines -- this was the actual cause of "no grid visible",
  // not a missing texture or wrong colors.
  const texture = new BABYLON.DynamicTexture("cadoodle-grid", SIZE, scene, true);
  // The ground plane is viewed at an oblique angle, where even mipmapped
  // textures blur without this -- keeps grid lines crisp near the camera
  // instead of just "less washed out."
  texture.anisotropicFilteringLevel = 16;
  const ctx = texture.getContext();

  ctx.fillStyle = "#3838A8";
  ctx.fillRect(0, 0, SIZE, SIZE);

  ctx.strokeStyle = "#202060";
  ctx.lineWidth = 1;
  for (let i = SMALL; i < SIZE; i += SMALL) {
    ctx.beginPath();
    ctx.moveTo(i + 0.5, 0);
    ctx.lineTo(i + 0.5, SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i + 0.5);
    ctx.lineTo(SIZE, i + 0.5);
    ctx.stroke();
  }

  ctx.strokeStyle = "#0000FF";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, SIZE, SIZE);

  texture.update();
  return texture;
}

/**
 * A ground plane textured with the grid above, alpha-blended at 45% -- the
 * same diffuseColor alpha bytecode-confirmed on the real grid's PhongMaterial
 * (knowledge_base/notes/cadoodle-grid-lighting-math.md). Blending that same
 * alpha against this viewer's own clear color reproduces the real app's
 * actual on-screen mechanism, not just a visually similar approximation.
 */
function buildGridPlane(scene, diagonal) {
  // Large enough that the plane's far edge sits outside the visible frame at
  // any zoom level frameCamera() allows (up to upperRadiusLimit = diagonal *
  // 12) -- a smaller plane leaves its literal edge inside the frame, where
  // raw clearColor shows above it and the alpha-blended grid shows below it,
  // a visible seam that reads as a lighting/texture bug but isn't one.
  const size = diagonal * 40;
  const tile = diagonal * 0.6; // one texture repeat ~= one CaDoodle "big tile"

  const ground = BABYLON.MeshBuilder.CreateGround(
    "cadoodle-grid-plane",
    { width: size, height: size },
    scene
  );
  ground.position.y -= diagonal * 0.55;

  const texture = buildGridTexture(scene);
  texture.uScale = size / tile;
  texture.vScale = size / tile;

  const material = new BABYLON.StandardMaterial("cadoodle-grid-material", scene);
  material.diffuseTexture = texture;
  material.specularColor = new BABYLON.Color3(0, 0, 0);
  material.alpha = 0.45;
  material.backFaceCulling = false;

  ground.material = material;
  return ground;
}

/** Restore the framing computed when the model first loaded. */
function resetView(viewer) {
  const home = viewer.home;
  if (!home) return;
  viewer.camera.alpha = home.alpha;
  viewer.camera.beta = home.beta;
  viewer.camera.radius = home.radius;
  viewer.camera.setTarget(home.target.clone());
}

function zoomBy(viewer, factor) {
  const camera = viewer.camera;
  const next = camera.radius * factor;
  const lo = camera.lowerRadiusLimit || 0;
  const hi = camera.upperRadiusLimit || Infinity;
  camera.radius = Math.min(hi, Math.max(lo, next));
}

const CONTROLS = [
  { act: "zoom-in", label: "+", title: "Zoom in" },
  { act: "zoom-out", label: "−", title: "Zoom out" },
  { act: "reset", label: "↺", title: "Reset view (R)" },
  { act: "wireframe", label: "▦", title: "Toggle wireframe (W)" },
];

/**
 * On-screen controls. Trackpad zoom alone is not discoverable, and a user who
 * has zoomed or orbited into a bad spot otherwise has no way back short of
 * reloading the page -- "Reset view" is the real fix for that, the zoom
 * buttons just make the interaction visible.
 */
function buildControls(viewer) {
  // Orbit/zoom is pointer-only otherwise, which leaves the viewer unusable
  // without a mouse or trackpad.
  viewer.canvas.tabIndex = 0;
  viewer.canvas.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    const map = { r: "reset", w: "wireframe", "+": "zoom-in", "=": "zoom-in", "-": "zoom-out" };
    if (!map[key]) return;
    event.preventDefault();
    act(viewer, map[key]);
  });

  const bar = document.createElement("div");
  bar.className = "stl-viewer__controls";

  for (const spec of CONTROLS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "stl-viewer__btn";
    button.dataset.act = spec.act;
    button.textContent = spec.label;
    button.title = spec.title;
    button.setAttribute("aria-label", spec.title);
    bar.appendChild(button);
  }

  bar.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    act(viewer, button.dataset.act);
  });

  viewer.el.appendChild(bar);

  const hint = document.createElement("div");
  hint.className = "stl-viewer__hint";
  hint.textContent = "Drag to orbit · scroll to zoom · right-drag to pan";
  viewer.el.appendChild(hint);
  viewer.hint = hint;

  // The hint has done its job the moment the user touches the model.
  const dismiss = () => {
    hint.classList.add("is-hidden");
    viewer.canvas.removeEventListener("pointerdown", dismiss);
    viewer.canvas.removeEventListener("wheel", dismiss);
  };
  viewer.canvas.addEventListener("pointerdown", dismiss, { passive: true });
  viewer.canvas.addEventListener("wheel", dismiss, { passive: true });
}

function act(viewer, action) {
  if (action === "zoom-in") zoomBy(viewer, 0.75);
  else if (action === "zoom-out") zoomBy(viewer, 1 / 0.75);
  else if (action === "reset") resetView(viewer);
  else if (action === "wireframe" && viewer.material) {
    viewer.material.wireframe = !viewer.material.wireframe;
  }
  // A stopped viewer must repaint to show the change.
  viewer.start();
}

function createViewer(el, config) {
  const canvas = document.createElement("canvas");
  canvas.className = "stl-viewer__canvas";
  el.innerHTML = "";
  el.appendChild(canvas);

  const engine = new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
  });
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = BABYLON.Color4.FromHexString(
    config.background.length === 7 ? config.background + "ff" : config.background
  );

  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    -Math.PI / 3,
    Math.PI / 3.2,
    10,
    BABYLON.Vector3.Zero(),
    scene
  );
  camera.attachControl(canvas, true);
  camera.useFramingBehavior = false;

  // A point light parented to the camera, matching real CaDoodle's own
  // camera-locked "headlamp" PointLight (0.8, 0.8, 0.8) plus a dim ambient
  // term (0.1, 0.1, 0.1), per knowledge_base/notes/cadoodle-grid-lighting-math.md
  // -- a positional light with real specular response, not the flat
  // HemisphericLight gradient this used before. Being camera-locked also
  // solves the "far side of a rotating part goes dark" problem inherently:
  // whatever currently faces the camera is what the light faces too, same
  // as orbiting around the real app's headlamp.
  const key = new BABYLON.PointLight("key", BABYLON.Vector3.Zero(), scene);
  key.parent = camera;
  key.intensity = 0.8;
  key.diffuse = new BABYLON.Color3(0.8, 0.8, 0.8);
  key.specular = new BABYLON.Color3(0.8, 0.8, 0.8);
  scene.ambientColor = new BABYLON.Color3(0.1, 0.1, 0.1);

  const material = new BABYLON.StandardMaterial("stl", scene);
  // config.color is meant as a raw, unlit material color -- see the
  // data-color doc comment above. Do not sample this from a lit CaDoodle
  // screenshot; that bakes CaDoodle's own lighting in twice.
  material.diffuseColor = BABYLON.Color3.FromHexString(config.color);
  material.specularColor = new BABYLON.Color3(0.18, 0.18, 0.18);
  material.wireframe = config.wireframe;
  // STL facets are unwelded, so exported normals are per-face. Rendering both
  // sides keeps inverted or non-manifold facets from punching holes in the model.
  material.backFaceCulling = false;

  const viewer = {
    el,
    engine,
    scene,
    camera,
    canvas,
    material,
    config,
    seen: 0,
    running: false,
  };

  viewer.start = () => {
    if (viewer.running || viewer.disposed) return;
    viewer.running = true;
    engine.runRenderLoop(() => scene.render());
  };
  viewer.stop = () => {
    if (!viewer.running) return;
    viewer.running = false;
    engine.stopRenderLoop();
  };
  viewer.dispose = () => {
    if (viewer.disposed) return;
    viewer.disposed = true;
    viewer.stop();
    if (viewer.resizeObserver) viewer.resizeObserver.disconnect();
    scene.dispose();
    engine.dispose();
    const i = live.indexOf(viewer);
    if (i !== -1) live.splice(i, 1);
    el.dataset.stlState = "idle";
  };

  const resizeObserver = new ResizeObserver(() => engine.resize());
  resizeObserver.observe(el);
  viewer.resizeObserver = resizeObserver;

  const loadTask = () => {
    BABYLON.STLFileLoader.DO_NOT_ALTER_FILE_COORDINATES = config.preserveCoordinates;
    // ImportMeshAsync is the module-level replacement for the legacy
    // SceneLoader class; fall back if the vendored build predates it.
    if (typeof BABYLON.ImportMeshAsync === "function") {
      return BABYLON.ImportMeshAsync(config.url, scene);
    }
    return BABYLON.SceneLoader.ImportMeshAsync("", "", config.url, scene);
  };

  enqueueLoad(loadTask)
    .then((result) => {
      if (viewer.disposed) return;
      const meshes = (result && result.meshes) || scene.meshes;
      for (const mesh of meshes) {
        if (mesh.getTotalVertices && mesh.getTotalVertices() > 0) mesh.material = material;
      }
      viewer.home = frameCamera(camera, meshes);
      if (config.grid) buildGridPlane(scene, viewer.home.diagonal);
      buildControls(viewer);

      if (config.autorotate) {
        camera.useAutoRotationBehavior = true;
        camera.autoRotationBehavior.idleRotationSpeed = 0.25;
        camera.autoRotationBehavior.idleRotationWaitTime = 1200;
      }
      el.dataset.stlState = "ready";
      viewer.start();
    })
    .catch((err) => {
      if (viewer.disposed) return;
      viewer.dispose();
      showError(el, `Could not load ${config.url}: ${err && err.message ? err.message : err}`);
      el.dataset.stlState = "error";
      console.error("[stl-viewer]", config.url, err);
    });

  return viewer;
}

function touch(viewer) {
  viewer.seen = performance.now();
  while (live.length > MAX_LIVE_ENGINES) {
    const oldest = live.reduce((a, b) => (a.seen <= b.seen ? a : b));
    if (oldest === viewer) break;
    oldest.dispose();
  }
}

function initAll(root = document) {
  const nodes = root.querySelectorAll("[data-stl]");
  if (nodes.length === 0) return;

  if (typeof BABYLON === "undefined") {
    for (const el of nodes) {
      showError(el, "Babylon.js failed to load -- check extra_javascript in mkdocs.yml.");
    }
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target;
        if (entry.isIntersecting) {
          if (!el.__stlViewer || el.__stlViewer.disposed) {
            const config = readConfig(el);
            el.__stlViewer = createViewer(el, config);
            live.push(el.__stlViewer);
          }
          touch(el.__stlViewer);
          el.__stlViewer.start();
        } else if (el.__stlViewer) {
          // Keep the context but stop burning frames off-screen.
          el.__stlViewer.stop();
        }
      }
    },
    { rootMargin: "200px" }
  );

  for (const el of nodes) {
    const config = readConfig(el);
    if (!config.url) {
      showError(el, "Missing data-stl attribute.");
      continue;
    }
    el.style.height = config.height;
    el.dataset.stlState = "idle";
    observer.observe(el);
  }

  return () => {
    observer.disconnect();
    for (const viewer of [...live]) viewer.dispose();
  };
}

/**
 * Material for MkDocs' instant loading swaps pages via XHR without a reload,
 * so DOMContentLoaded fires only once per session. `document$` is Material's
 * RxJS observable that fires on every swap; on the stock theme it is absent
 * and the plain listener is correct. Tearing down on each swap matters more
 * than re-initialising: leaked WebGL contexts accumulate across navigation.
 */
let teardown = null;

function boot() {
  if (teardown) teardown();
  teardown = initAll(document) || null;
}

if (typeof window !== "undefined" && typeof window.document$ !== "undefined") {
  window.document$.subscribe(boot);
} else if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}

/**
 * Exported for pages that need to drive a single viewer directly (e.g. a
 * shapes-palette-style selector that swaps one model in and out on click)
 * rather than the [data-stl]/IntersectionObserver auto-boot path above.
 * `createViewer` returns the same viewer object `initAll` manages internally
 * -- callers are responsible for calling `.dispose()` on the previous one
 * before creating a new one, same discipline `touch()` enforces here.
 */
export { createViewer, readConfig };
