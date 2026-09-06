# Using the MCP Server

CaDoodle ships a built-in MCP (Model Context Protocol) server for scripting
the live scene. It's a scripting API for the model you're working on, not a
remote control for the application: it can read and write CSGs, drive the
operation timeline, move the camera, and capture a screenshot of the 3D
view. It has no access to themes, CSS, or anything outside the 3D scene.

If you're writing a tool, an agent, or a script that needs to inspect or
change a CaDoodle scene without a human clicking around the UI, this is how
you do it.

## Starting the server

Open Settings, go to the Server tab, and check "Start server" under "Model
Context Protocol Server on port." The default port is 30170. The server
binds to `127.0.0.1` only, not the network.

There's no authentication. Any process on this machine that can reach that
port gets full scene read/write, including writing files to disk via the
screenshot tool's output path. That's normal for a localhost dev tool, but
worth knowing before leaving it running.

## What it can do

The server exposes fifteen tools across six areas:

- Scene inspection: read the current scene, the selection, every CSG, and
  the camera state.
- Selection: select or deselect CSGs by name.
- The operation timeline: add, remove, and regenerate operations, the same
  ones the UI itself uses.
- Parameters: read or set a CSG's named parameters, or resize it to exact
  bounds.
- Shapes: browse the shape palette and add a shape by name.
- Camera and capture: move the camera and capture a screenshot of the 3D
  view.

## Using it for issue documentation

Screenshots for example-object pages are exactly viewport shots: a shape,
from a chosen angle, in the scene. Adding a shape, moving the camera, and
taking a screenshot can produce one of those in a single round trip, at an
exact resolution, with no manual Print Screen step. The camera parameters
used for a shot can be recorded and rerun later, which a manual screenshot
has no way to do.

It can't drive a theme change or force a CSS reload, so it's no help
reproducing an issue that only shows up after switching themes by hand.
But for documenting a reproducible issue in the scene itself, it's a real
upgrade over a text description. Reading the scene state and capturing a
screenshot together gets you the exact operation timeline and a matching
image at a known camera angle, so a bug report can point at precisely what
produced the result instead of asking a maintainer to guess and re-create
it by hand.

