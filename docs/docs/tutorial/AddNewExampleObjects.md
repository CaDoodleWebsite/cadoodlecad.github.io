# Adding New Example Objects

## Overview

This page covers two things: visualizing a real example object right here on
this page, and adding your own to CaDoodle for everyone to use. Jump to
whichever you're after, or read straight through.

## What is a CaDoodle object?

A CaDoodle object is a script that generates a real 3D shape when you pick
it from the [shapes palette](getting-started.md#creating-your-first-shape).
Most are `build123d` Python scripts or Groovy scripts. CaDoodle also
supports OpenSCAD, Blender, FreeCAD, and a few other formats. Plugins are
how CaDoodle accesses and creates example shapes in those formats.

Each object lives in a git repo (usually
[CaDoodle-Example-Objects](https://github.com/CommonWealthRobotics/CaDoodle-Example-Objects))
and gets a button in the shapes palette grid. Pick the button, and CaDoodle
runs the script and drops the result into your scene.

## See an example object, right here in the page

This spur gear is a real example object, rendered below on a grid styled to
match CaDoodle's design plane, running in your browser rather than inside the
real app. Use the on-screen controls to orbit, zoom, and reset the view.

<div class="stl-viewer"
     data-stl="../models/spur-gear.stl"
     data-color="#37A2DB"
     data-background="#F4EDE0"
     data-grid="true"
     data-height="350px"></div>
<p class="stl-viewer__caption">spur-gear.stl: 485 KB, 9,940 facets, binary</p>

Take it with you: open the STL in another viewer, or the
[Groovy script](../downloads/SpurGear.groovy) below to see how the gear is
built.

<div class="stl-viewer__downloads">
  <a class="stl-viewer__download-btn" href="../models/spur-gear.stl" download>Download STL</a>
  <a class="stl-viewer__download-btn" href="../downloads/SpurGear.groovy" download>Download source script</a>
</div>

## Add a new example object, in the real CaDoodle app

I absolutely want to have folks add more example shapes! Two repos work
together to put an object in the shapes palette:

- [CaDoodle-Example-Objects](https://github.com/CommonWealthRobotics/CaDoodle-Example-Objects)
  holds the scripts that generate geometry.
- [CaDoodle-ShapesPalet-Content](https://github.com/CommonWealthRobotics/CaDoodle-ShapesPalet-Content)
  holds the JSON files that register a script as a button in the shapes
  palette, cloned into
  `~/Documents/CaDoodle-workspace/gitcache/github.com/CommonWealthRobotics/CaDoodle-ShapesPalet-Content/`.

### How the JSON and the script produce what you see

The JSON entry has no geometry in it. It just points CaDoodle at a script
and says where to put the button:

```json
"SpurGear": {
  "git": "https://github.com/CommonWealthRobotics/CaDoodle-Example-Objects.git",
  "file": "build123d/SpurGear.groovy",
  "order": "8",
  "plugin": "build123d"
},
```

- `git`: the repo CaDoodle clones or fetches the script from.
- `file`: the script's path inside that repo. CaDoodle runs this file
  when someone picks the button.
- `order`: where the button lands in the grid. Lower numbers come first.
- `plugin`: optional. Only needed when the script hands off to an external
  plugin instead of building geometry in plain Groovy, see below.
- `copyFile: true`: optional. Copies the source file into the user's own
  directory and adds an editor button for it, so they can edit the
  script itself instead of just running it. Use this for something like
  a Blender file you want the user to sculpt on.

Most objects skip `plugin` and build geometry directly, in plain Groovy,
using BowlerStudio's own CSG classes. `cube.groovy` is a real example: it
builds a `CSG` object straight from `eu.mihosoft.vrl.v3d.Cube`, wires up
parameter sliders for width, height, depth, and corner rounding, and
returns the shape.

The spur gear above works differently. Its `.groovy` file is a thin
bridge, not the geometry itself:

```groovy
import com.neuronrobotics.bowlerstudio.scripting.Build123dLoader

return Build123dLoader.getGear(csgdb, "SpurGear", args)
```

`"plugin": "build123d"` tells CaDoodle this script hands off to the
`build123d` plugin, which runs Python's `build123d` CAD library to build
the actual gear and hands a CSG shape back. Same JSON shape, same
scripting hook, a different plugin doing the real modeling.

### From your clone to a merged PR

1. Decide whether you're adding a brand new script or reusing one that
   already exists. A new script goes in
   [CaDoodle-Example-Objects](https://github.com/CommonWealthRobotics/CaDoodle-Example-Objects).
   Registering it as a palette button goes in
   [CaDoodle-ShapesPalet-Content](https://github.com/CommonWealthRobotics/CaDoodle-ShapesPalet-Content).
   Most new objects touch both.
2. Fork whichever repo (or both) you need, and clone your fork.
3. Add your script to `CaDoodle-Example-Objects`, and add a JSON entry
   for it to the right file in `CaDoodle-ShapesPalet-Content`
   (`Plugins.json`, `BasicShapes.json`, or whichever category fits).
4. Fully quit and relaunch CaDoodle to see your button and test it.
   Repeat steps 3-4 until it works the way you want.
5. Commit and push to your fork(s).
6. Open a pull request back to whichever of
   `CommonWealthRobotics/CaDoodle-Example-Objects` or
   `CommonWealthRobotics/CaDoodle-ShapesPalet-Content` you changed.
7. A maintainer reviews and merges. Once merged, your object is available
   to the whole community as an example object.

## Supported file types

- Doodle files (CaDoodle native file format)
- BowlerStudio scripted CAD (Groovy)
- FreeCAD files
- Blender files
- Inkscape SVGs (where all objects are paths) for extrusion
- Inkscape SVGs as sweep inputs (rings, threads, spirals)
- OpenSCAD files (you need to wrap it in a groovy file to expose the parametrics)
- STL files
- OBJ files
