# Tips & Shortcuts

Three features that are easy to miss, because nothing in the app points at
them directly. It's common to use CaDoodle for weeks without finding any of
them.

## Align

If you've ever eyeballed lining up the center of one shape with another,
there's a dedicated feature for it. Align snaps shapes into position along a
chosen axis instead of making you drag them by hand.

To align two or more shapes:

1. Select the shapes you want to align. `Ctrl` + `A` selects everything in
   the scene.
2. Press `L`, or click the Align button in the toolbar.
3. Alignment handles appear around the selection. There are three for each
   axis: one at either end and one in the middle.
4. Hover over a handle to preview where that alignment would put the shapes.
   A handle that's greyed out means they're already aligned that way.
5. Click the handle you want.

Every alignment is one of three positions on a given axis. You're picking the
low end, the middle, or the high end, for each of X, Y and Z independently.
That's why the handles come in threes.

Alignment works against the bounding box of the whole selection, so which
shapes you select changes where they all end up. If the result isn't what you
wanted, `Ctrl` + `Z` undoes it and you can adjust the selection and try
again.

## Uniform Scale

Dragging a corner resize handle resizes freely on each axis independently.
That's useful when you want to stretch a shape unevenly. It also means an
exact proportional resize (scaling a hexagon up by 20% in every dimension at
once) normally means doing the math yourself and typing exact dimensions in.

Hold `Shift` before clicking a corner handle to drag or type instead. This
puts the resize into Uniform Scale mode, which preserves the aspect ratio of
the other dimensions automatically. No calculator needed.

## Browsing the shapes palette (the "Vitamins" category and friends)

The shapes panel doesn't only hold the basic primitives you see when you
first open a new file. Click the dropdown at the top of the panel (it starts
on "Basic Shapes") to switch to the other categories: My Doodles,
Mechanisms, Plug-ins, Symbols, VEX Parts and Vitamins. Vitamins is a set of
pre-built hardware and fastener shapes, including cap screws, nuts, heat-set
inserts and motors. Plug-ins holds real, usable gears generated on the fly
by the [`build123d`](https://build123d.readthedocs.io/) plugin.

This is the same `build123d` plugin mechanism that [Adding New Example
Objects](AddNewExampleObjects.md) covers in depth from the *contributor* side
(writing a Groovy script and registering it as a new palette entry). This
section is the other half: browsing what's *already* in the palette as an end
user. It's easy to miss, since the dropdown gives no visual hint that
switching categories reveals more than the default "Basic Shapes" set.

If you're looking for a specific kind of part (screws, gears, common
hardware) before writing your own, check the other categories in this
dropdown first. There may already be one.
