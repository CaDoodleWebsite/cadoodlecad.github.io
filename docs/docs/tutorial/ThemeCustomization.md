# Theme Customization

CaDoodle's colors, icons, and general look come from a separate repository,
[Style-Cadoodle](https://github.com/CommonWealthRobotics/Style-Cadoodle),
pulled down at launch into:

```
$HOME/Documents/CaDoodle-workspace/gitcache/github.com/CommonWealthRobotics/Style-Cadoodle/
```

That path is the Linux and Windows one. On macOS the workspace lives under
`~/Library/Application Support/BowlerLauncher/`, reachable through the
`~/Documents/BowlerLauncher` symlink. See
[Where Are My Files](where-are-my-files.md).

Each theme is a single CSS file in that folder. Swap between them in
Settings, on the Basic tab, from the dropdown under Style and Colors. The
[Themes section](../landing.md#themes) of the About page shows the switch
in action. Current official themes, worth opening as real examples while
you're learning the format:

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

1. Select a theme close to what you want as your active theme (Settings,
   Basic tab, under Style and Colors).
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

## Theming shapes-palette buttons separately

As of CaDoodle 0.46.055, the buttons in the shapes palette use their own
CSS class, `image-button-shape-pallet`, instead of sharing `.image-button`
with the rest of the toolbar. This exists because the shapes shown on
those buttons are rendered from the part model itself — their colors are
fixed, not theme-controlled — so a dark theme with a dark background could
otherwise leave a dark shape icon sitting on a dark, low-contrast button.
Giving the palette buttons their own class lets a theme set a background
color behind them without touching every other button in the app.

```css
.image-button-shape-pallet {
    -fx-background-color: #cdd6f4AF;
    -fx-border-color: transparent;
    -fx-border-width: 3px;
    -fx-background-insets: 1;
}
.image-button-shape-pallet:focused { -fx-border-color: #f38ba8; }
.image-button-shape-pallet:pressed { -fx-background-color: #45475a; }
.image-button-shape-pallet:hover   { -fx-background-color: #313244; }
```

(`Dark-Blue.css`'s real values, shown above, are a good starting point — a
semi-transparent light tint behind the buttons so fixed-color shape icons
stay legible against a dark workspace. Light themes can generally leave
this transparent, as `Kala.css` does.)

## Theming the design-plane grid and ruler

The grid used to be hardcoded and untouched by theme switches. As of
CaDoodle 0.46.055 (2026-08-22), it isn't anymore: three CSS classes now
drive the grid's colors, and it regenerates automatically the moment you
pick a new theme from the Style and Colors dropdown in Settings. No
relaunch is needed for that part, though hand-editing a CSS file directly
still follows the normal "relaunch to see it" rule described above.

The three grid classes:

| CSS class | Built-in fallback | What it colors |
|---|---|---|
| `.grid-key-color` | `#0000FA` | Major gridlines (every 10th line) and the workplane outline |
| `.grid-dark-color` | `#4838A880` | Minor gridlines |
| `.grid-light-color` | `#40206080` | The plane's own base fill |

The fallbacks are what the 3D engine compiles in. Every shipped theme
overrides all three, so what you see on screen comes from the active CSS
file rather than from this column.

These aren't a new kind of CSS property — they're ordinary style classes,
read the same way regular text labels are. **Set `-fx-text-fill` on each
one**, not `-fx-background-color`:

```css
.grid-key-color   { -fx-text-fill: #0000FA; }
.grid-dark-color  { -fx-text-fill: #4838A880; }
.grid-light-color { -fx-text-fill: #40206080; }
```

All six official themes already define these three classes — open any of
them (`Dark-Blue.css` is a good one to start from) to see real values
rather than just fallbacks. Standard 8-digit hex (`#RRGGBBAA`) works too;
setting the alpha channel low or to `00` fades or fully suppresses that
grid layer, which several of the shipped themes already do.

### Ruler color

The ruler doesn't get its own CSS class. It's tied directly to whatever
`.label` already resolves to in your theme — the same `-fx-text-fill`
value used for ordinary text labels throughout the app. If you've already
set `.label`'s text color, the ruler already matches it; there's nothing
extra to configure. If you want the ruler to stand out from body text
specifically, that's not independently possible right now — changing
`.label` changes both.

If the grid competing visually with your models is the problem, try:

- `Ctrl+W`: toggle wireframe.
- `T`: toggle transparency.

Wireframe can look confusing on holes and rounded features, since every
edge shows as a wire rather than a shaded surface. Test it to see if it
integrates well with your regular workflow.

## What this page doesn't cover yet

- Where the per-shape menu icons (light and dark variants) live and how
  to customize them. (The 0.46.055 shapes-palette button update above
  covers the button's background/border, not the icon images themselves —
  that gap is unchanged.)
