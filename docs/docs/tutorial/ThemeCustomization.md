 # Theme Customization

CaDoodle's colors, icons, and general look come from a separate repository,
[Style-Cadoodle](https://github.com/CommonWealthRobotics/Style-Cadoodle),
pulled down at launch into:

```
$HOME/Documents/CaDoodle-workspace/gitcache/github.com/CommonWealthRobotics/Style-Cadoodle/
```

Each theme is a single CSS file in that folder. Swap between them from the
About page's [Themes section](../landing.md#themes). Current official
themes, worth opening as real examples while you're learning the format:

- `Bens-PinkerCAD.css`
- `Courtnah.css`
- `Dark-Blue.css`
- `High-Contrast.css`
- `Kala.css`
- `Lavender.css`

This page covers a basic local edit and the PR procedure for contributing
a theme back. It doesn't cover the full CSS attribute reference or icon
assets. See [What this page doesn't cover yet](#what-this-page-doesnt-cover-yet).

## Making a basic CSS edit

CSS edits take effect on next launch. No rebuild needed.

1. Select a theme close to what you want as your active theme (About
   page's Themes section).
2. Open that same file in your Style-Cadoodle clone, e.g.
   `Dark-Blue.css`.
3. Change a value (a color, a border, a font size) and save.
4. Fully quit and relaunch CaDoodle to see the change.
5. Repeat steps 3-4 until you're happy with it.

Once you're happy with the result, copy your edited file to a new
filename. Keep your original starting theme intact, both for comparison
and because it's still another available theme.

## Contributing a theme back to Style-Cadoodle

Normal GitHub contribution flow. No CaDoodle-specific tooling needed,
just a GitHub account and `git`:

1. Fork [Style-Cadoodle](https://github.com/CommonWealthRobotics/Style-Cadoodle)
   to your own account.
2. Clone your fork, add your new theme file (short, distinctive name,
   `.css`, matching the existing naming pattern).
3. Commit and push to your fork.
4. Open a pull request back to
   `CommonWealthRobotics/Style-Cadoodle`.
5. A maintainer reviews and merges. Once merged, every CaDoodle launch
   picks it up automatically for every user.

## The design-plane grid doesn't follow themes yet

The grid doesn't repaint when you switch themes. That's a confirmed
limitation, not something wrong with your theme.

The grid's pixels are generated programmatically, rather than
painted by a themeable JavaFX node the way the rest of the interface is. 

Two known results of this architecture:

- The grid doesn't auto-repaint on theme switch. That's
  app-side behavior, not something a Style-Cadoodle CSS change can fix.
- CSS can't influence the grid's color either. None of the
  official theme files reference the grid or workplane at all, and there's
  no hook in the app for one to reach.

The grid renders at 45% opacity, blending its baked-in color with your
theme's real background instead of showing the raw hex value directly.

The grid's colors are hardcoded in the app itself, which lines up with the
grid consistently reading blue/violet no matter which theme is active:

<span style="display:inline-block;width:0.9em;height:0.9em;background:#C7D0FF;border-radius:2px;vertical-align:middle;margin-right:0.3em;"></span>`#C7D0FF` &mdash; approximate on-screen color, sampled from a screenshot of the grid surface
<br>
<span style="display:inline-block;width:0.9em;height:0.9em;background:#3838A8;border-radius:2px;vertical-align:middle;margin-right:0.3em;"></span>`#3838A8` &mdash; the plane's own noised base fill
<br>
<span style="display:inline-block;width:0.9em;height:0.9em;background:#202060;border-radius:2px;vertical-align:middle;margin-right:0.3em;"></span>`#202060` &mdash; minor gridlines
<br>
<span style="display:inline-block;width:0.9em;height:0.9em;background:#0000FF;border-radius:2px;vertical-align:middle;margin-right:0.3em;"></span>`#0000FF` &mdash; major gridlines, at each 10mm tile boundary

That's why the grid looks lighter and less saturated than the raw hex values
above, and why it shifts a little depending on which theme is active. The
blend math accounts for most of that shift. 

If the grid competing visually with your models is the problem, try:

- `Ctrl+W`: toggle wireframe.
- `T`: toggle transparency.

Wireframe can look confusing on holes and rounded features, since every
edge shows as a wire rather than a shaded surface. Test it to see if it
integrates well with your regular workflow.

## What this page doesn't cover yet

- Where the per-shape menu icons (light and dark variants) live and how
  to customize them.
