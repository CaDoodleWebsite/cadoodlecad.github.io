# Plugin Architecture

CaDoodle works alongside a set of external tools. Each tool is packaged as a plugin: a small JSON file that tells CaDoodle where to download the tool from, how to unpack it, and which executable inside it to run. This page documents the plugin system and every plugin in the current registry, with a direct download link for each platform.

## How the plugin system works

The plugin registry lives in the [ExternalEditorsBowlerStudio](https://github.com/CommonWealthRobotics/ExternalEditorsBowlerStudio) repository. It contains one JSON file per plugin. When CaDoodle needs a tool, it clones this repository, finds the JSON file matching the plugin name, and follows the instructions in it.

For each plugin, CaDoodle:

1. Picks the JSON entry that matches the current platform (`Linux-x64`, `Linux-aarch64`, `Mac-x64`, `Mac-aarch64`, or `Windows-x64`).
2. Downloads the archive from `url` + `name` + `.` + `type`, for example `https://files.openscad.org/snapshots/` + `OpenSCAD-2026.01.03-x86_64` + `.AppImage`.
3. Extracts the archive into the plugin install directory. Supported archive types are `zip`, `tar.gz`, `tar.xz`, `7z`, `sfx`, `dmg`, `AppImage`, `msi`, and `jar`.
4. Resolves the `executable` path inside the extracted folder, or the `configExecutable` path when a tool is only being configured.
5. Launches the tool and hands it the file to open.

Plugins install under `~/bin/CaDoodle-ApplicationInstall/`, each in a sub-folder named after the plugin key. Set the `BOWLER_PLUGIN_LOCATION` environment variable to install plugins somewhere else. See [Where Are My Files](where-are-my-files.md) for the full layout.

Several fields let a plugin use an existing installation instead of downloading a private copy:

- `ospath`: check a well-known system location first, for example `/Applications/` on MacOS or `C:\Program Files\7-zip\` on Windows. If the executable already exists there, CaDoodle uses it and skips the download.
- On every platform, CaDoodle also searches the `PATH` for the executable by name before downloading. On MacOS it additionally scans `/Applications` for a matching app bundle. An installed copy of the tool is reused in place of the plugin download.
- `installer`: names another plugin to download and run first. Arduino IDE uses this to install its Windows MSI helper.
- `environment`: extra environment variables set when the tool runs. Eclipse sets `WEBKIT_DISABLE_DMABUF_RENDERER` this way.
- `version`: pins a plugin build. When the value changes, CaDoodle deletes the cached install and re-downloads.
- `jvmargs`: JVM options recorded for Java plugins, for example `-Dprism.forceGPU=true`.
- `Meta-Configuration`: a list of command lines run against `configExecutable` after extraction, used to configure the tool on first install.

## Registry file reference

Each JSON file maps platform keys to download recipes. All fields are required except the optional ones marked below.

| Field | Meaning |
| --- | --- |
| `url` | Base URL of the download directory, kept with a trailing slash |
| `type` | Archive or file type: `zip`, `tar.gz`, `tar.xz`, `7z`, `sfx`, `dmg`, `AppImage`, `msi`, or `jar` |
| `name` | File name of the archive, without extension |
| `executable` | Path inside the extracted folder to the launcher |
| `configExecutable` | Path to the executable used for configuration commands |
| `ospath` | Optional system directory checked before downloading |
| `installer` | Optional list of other plugins to download and run first |
| `environment` | Optional map of environment variables for the tool |
| `version` | Optional pin; changing it forces a fresh download |
| `jvmargs` | Optional JVM arguments for Java plugins |
| `osEXE`, `osCONFIG` | Optional overrides for executables already installed by the OS package |
| `Meta-Configuration` | Optional list of post-install configuration command lines |

## Plugin catalog

Every JSON file in the registry is listed here. The download links are the exact URLs the plugins resolve to on each platform.

### admesh

[Project website](https://github.com/CommonWealthRobotics/admesh)

ADMesh repairs STL meshes. CaDoodle runs it automatically on STL files loaded into the library of parts, filling holes, connecting nearby facets, and fixing normal directions so later operations start from a valid solid.

| Platform | Download |
| --- | --- |
| Linux x64 | [Download](https://github.com/CommonWealthRobotics/admesh/releases/download/v1.0.0-beta.3/admesh-linux-x86_64-gcc-v1.0.0-beta.3.zip) |
| Linux aarch64 | [Download](https://github.com/CommonWealthRobotics/admesh/releases/download/v1.0.0-beta.3/admesh-linux-aarch64-gcc-v1.0.0-beta.3.zip) |
| Windows x64 | [Download](https://github.com/CommonWealthRobotics/admesh/releases/download/v1.0.0-beta.3/admesh-windows-x86_64-mingw-v1.0.0-beta.3.zip) |
| MacOS aarch64 | [Download](https://github.com/CommonWealthRobotics/admesh/releases/download/v1.0.0-beta.3/admesh-macos-arm64-clang-v1.0.0-beta.3.zip) |

---

### arduino-cli

[Project website](https://www.arduino.cc/pro/cli/)

The Arduino command line toolchain. It compiles and uploads firmware for embedded projects driven from CaDoodle scripts.

| Platform | Download |
| --- | --- |
| Linux x64 | [Download](https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Linux_64bit.tar.gz) |
| Windows x64 | [Download](https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Windows_64bit.zip) |
| MacOS x64 | [Download](https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_macOS_64bit.tar.gz) |
| MacOS aarch64 | [Download](https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_macOS_arm64.tar.gz) |

---

### arduino-installer

[Project website](https://www.arduino.cc/en/software)

The Windows MSI installer for Arduino IDE 2. A helper plugin: the `arduino2` plugin lists it in its `installer` field, so on Windows CaDoodle downloads the MSI and runs it through `msiexec` alongside the portable IDE.

| Platform | Download |
| --- | --- |
| Windows x64 | [Download](https://downloads.arduino.cc/arduino-ide/arduino-ide_2.3.2_Windows_64bit.msi) |

---

### arduino2

[Project website](https://www.arduino.cc/en/software)

Arduino IDE 2. CaDoodle launches it for `.ino`, `.c`, `.cpp`, and related firmware files. The plugin downloads the portable IDE, and on Windows also runs the `arduino-installer` MSI helper. On MacOS the app lands in `/Applications/`.

| Platform | Download |
| --- | --- |
| Linux x64 | [Download](https://downloads.arduino.cc/arduino-ide/arduino-ide_2.3.2_Linux_64bit.zip) |
| Windows x64 | [Download](https://downloads.arduino.cc/arduino-ide/arduino-ide_2.3.2_Windows_64bit.zip) |
| MacOS x64 | [Download](https://downloads.arduino.cc/arduino-ide/arduino-ide_2.3.2_macOS_64bit.dmg) |
| MacOS aarch64 | [Download](https://downloads.arduino.cc/arduino-ide/arduino-ide_2.3.2_macOS_arm64.dmg) |

---

### blender

[Project website](https://www.blender.org/)

Blender 4.2. CaDoodle launches it for `.blend` files and calls it headlessly to convert Blender scenes into STL geometry that loads into a design.

| Platform | Download |
| --- | --- |
| Linux x64 | [Download](https://mirrors.iu13.net/blender/release/Blender4.2/blender-4.2.3-linux-x64.tar.xz) |
| Windows x64 | [Download](https://mirrors.iu13.net/blender/release/Blender4.2/blender-4.2.3-windows-x64.zip) |
| MacOS x64 | [Download](https://mirrors.iu13.net/blender/release/Blender4.2/blender-4.2.3-macos-x64.dmg) |
| MacOS aarch64 | [Download](https://mirrors.aliyun.com/blender/release/Blender4.2/blender-4.2.3-macos-arm64.dmg) |

---

### build123d

[Project website](https://github.com/gumyr/build123d) · [Portable build used by the plugin](https://github.com/jdegenstein/cadoodle-build123d-portable)

build123d is a Python based parametric CAD library. The plugin ships a portable Python runtime with build123d preinstalled. CaDoodle runs `.py` and `.build123d` scripts through it and loads the resulting geometry. The `version` field pins the portable build so upgrades re-download cleanly.

| Platform | Download |
| --- | --- |
| Linux x64 | [Download](https://github.com/jdegenstein/cadoodle-build123d-portable/releases/download/v0.0.9/cadoodle-b123d_v0.0.9-linux-x86_64.tar.gz) |
| Windows x64 | [Download](https://github.com/jdegenstein/cadoodle-build123d-portable/releases/download/v0.0.9/cadoodle-b123d_v0.0.9-windows-x86_64.sfx) |
| MacOS aarch64 | [Download](https://github.com/jdegenstein/cadoodle-build123d-portable/releases/download/v0.0.9/cadoodle-b123d_v0.0.9-macos-x86_64.zip) |

---

### cadoodle

[Project website](https://github.com/CommonWealthRobotics/CaDoodle)

CaDoodle itself, packaged as a plugin. This entry lets one CaDoodle installation open, edit, and save another user's `.doodle` and `.cadoodle` design files, the same way it opens a Blender or FreeCAD file. The links point at the latest release build.

| Platform | Download |
| --- | --- |
| Linux x64 | [Download](https://github.com/CommonWealthRobotics/CaDoodle/releases/latest/download/CaDoodle-Linux-x86_64.AppImage) |
| Linux aarch64 | [Download](https://github.com/CommonWealthRobotics/CaDoodle/releases/latest/download/CaDoodle-Linux-arm64.AppImage) |
| Windows x64 | [Download](https://github.com/CommonWealthRobotics/CaDoodle/releases/latest/download/CaDoodle-Windows-x86_64.zip) |
| MacOS x64 | [Download](https://github.com/CommonWealthRobotics/CaDoodle/releases/latest/download/CaDoodle-MacOS-x86_64.dmg) |
| MacOS aarch64 | [Download](https://github.com/CommonWealthRobotics/CaDoodle/releases/latest/download/CaDoodle-MacOS-arm64.dmg) |

---

### eclipse

[Project website](https://www.eclipse.org/ide/)

Eclipse with the Groovy tooling, packaged by CommonWealth Robotics. It is the advanced editor for Groovy scripts and supporting files. The Linux entry sets `WEBKIT_DISABLE_DMABUF_RENDERER=1` in its `environment` field to keep the embedded browser rendering reliably.

| Platform | Download |
| --- | --- |
| Linux x64 | [Download](https://github.com/CommonWealthRobotics/ExternalEditorsBowlerStudio/releases/download/0.2.3/Eclipse-Groovy-Linux-x86_64.tar.gz) |
| Windows x64 | [Download](https://github.com/CommonWealthRobotics/ExternalEditorsBowlerStudio/releases/download/0.2.3/Eclipse-Groovy-Windows-x86_64.zip) |
| MacOS aarch64 | [Download](https://github.com/CommonWealthRobotics/ExternalEditorsBowlerStudio/releases/download/0.2.3/Eclipse-Groovy-Mac-arm64.zip) |

---

### freecad

[Project website](https://www.freecad.org/)

FreeCAD 1.1. CaDoodle launches it for `.FCStd` documents and calls it headlessly to convert FreeCAD designs into SVG sketches and STL geometry.

| Platform | Download |
| --- | --- |
| Linux x64 | [Download](https://github.com/FreeCAD/FreeCAD/releases/download/1.1.3/FreeCAD_1.1.3-Linux-x86_64-py311.AppImage) |
| Windows x64 | [Download](https://github.com/FreeCAD/FreeCAD/releases/download/1.1.3/FreeCAD_1.1.3-Windows-x86_64-py311.7z) |
| MacOS x64 | [Download](https://github.com/FreeCAD/FreeCAD/releases/download/1.1.3/FreeCAD_1.1.3-macOS-x86_64-py311.dmg) |
| MacOS aarch64 | [Download](https://github.com/FreeCAD/FreeCAD/releases/download/1.1.3/FreeCAD_1.1.3-macOS-arm64-py311.dmg) |

---

### inkscape

[Project website](https://inkscape.org/)

Inkscape 1.3.2. CaDoodle launches it for SVG files so sketches imported from FreeCAD or drawn by hand can be edited in a full vector editor.

| Platform | Download |
| --- | --- |
| Linux x64 | [Download](https://inkscape.org/gallery/item/44616/Inkscape-091e20e-x86_64.AppImage) |
| Windows x64 | [Download](https://inkscape.org/gallery/item/44622/inkscape-1.3.2_2023-11-25_091e20e-x64.7z) |
| MacOS x64 | [Download](https://inkscape.org/gallery/item/44623/Inkscape-1.3.2_x86_64.dmg) |
| MacOS aarch64 | [Download](https://inkscape.org/gallery/item/44624/Inkscape-1.3.2_arm64.dmg) |

---

### meshlab

[Project website](https://www.meshlab.net/)

MeshLab 2025.07, a mesh processing and inspection tool. Available as a plugin for working on meshes outside CaDoodle's repair pipeline.

| Platform | Download |
| --- | --- |
| Linux x64 | [Download](https://github.com/cnr-isti-vclab/meshlab/releases/download/MeshLab-2025.07/MeshLab2025.07-linux_x86_64.AppImage) |
| Linux aarch64 | [Download](https://github.com/cnr-isti-vclab/meshlab/releases/download/MeshLab-2025.07/MeshLab2025.07-linux_aarch64.AppImage) |
| Windows x64 | [Download](https://github.com/cnr-isti-vclab/meshlab/releases/download/MeshLab-2025.07/MeshLab2025.07-windows_x86_64.zip) |
| MacOS x64 | [Download](https://github.com/cnr-isti-vclab/meshlab/releases/download/MeshLab-2025.07/MeshLab2025.07-macos_x86_64.dmg) |
| MacOS aarch64 | [Download](https://github.com/cnr-isti-vclab/meshlab/releases/download/MeshLab-2025.07/MeshLab2025.07-macos_arm64.dmg) |

---

### openscad

[Project website](https://openscad.org/)

OpenSCAD, the constructive solid geometry modeler. CaDoodle launches it for `.scad` files, and its geometry kernel pairs with CaDoodle's CSG engine for designs authored in OpenSCAD's language.

| Platform | Download |
| --- | --- |
| Linux x64 | [Download](https://files.openscad.org/snapshots/OpenSCAD-2026.01.03-x86_64.AppImage) |
| Linux aarch64 | [Download](https://files.openscad.org/snapshots/OpenSCAD-2023.09.11.ai-aarch64.AppImage) |
| Windows x64 | [Download](https://files.openscad.org/snapshots/OpenSCAD-2026.01.03-x86-64.zip) |
| MacOS aarch64 | [Download](https://files.openscad.org/snapshots/snapshots/OpenSCAD-2026.01.03.dmg) |

---

### scenebuilder

[Project website](https://gluonhq.com/products/scene-builder/)

Gluon SceneBuilder 8.5.0, a visual editor for JavaFX FXML layouts. CaDoodle launches it for `.fxml` UI files, running the single cross-platform JAR on a bundled Java 17 runtime, so one download serves every platform.

| Platform | Download |
| --- | --- |
| All platforms | [Download](https://download2.gluonhq.com/scenebuilder/8.5.0/scenebuilder-8.5.0-all.jar) |

---

### sevenzip

[Project website](https://www.7-zip.org/) · [Release builds](https://github.com/ip7z/7zip/releases)

7-Zip. An internal plugin: CaDoodle's downloader uses it to unpack `.7z` archives on Windows, including the FreeCAD and Inkscape downloads above. On Windows it prefers the copy in `C:\Program Files\7-zip\` through its `ospath` field.

| Platform | Download |
| --- | --- |
| Windows x64 | [Download](https://github.com/ip7z/7zip/releases/download/26.01/7z2601-extra.7z) |

## Adding or updating a plugin

Plugin definitions live in the [ExternalEditorsBowlerStudio](https://github.com/CommonWealthRobotics/ExternalEditorsBowlerStudio) repository. To add a tool, add one JSON file named after the plugin key, for example `mytool.json`, with an entry per supported platform. Follow the field reference above. To move a tool to a newer release, update `url`, `name`, and `type` in each platform entry, and bump the `version` field when one is present so existing installs refresh.

To change which tools CaDoodle offers for a file type, the editor side lives in the application's `ExternalEditorController`, which binds file extensions to plugins. Application source: [CaDoodle-Application](https://github.com/CommonWealthRobotics/CaDoodle-Application).
