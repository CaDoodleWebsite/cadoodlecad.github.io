# CadoodleCAD Website


This is the source for the CaDoodle Website.

[https://cadoodlecad.com/](https://cadoodlecad.com/)

# Local Build

`sudo apt install mkdocs`


`cd docs`


`mkdocs serve`


Navigate to http://127.0.0.1:8000

# How to Add a Tutorial

The following instructions describe the steps for modifying the tutorial files using a command line terminal. 

These instructions assume that:
- the repository has already been cloned to a local directory
- the repository was cloned to the default directory used by GitHub Desktop `(~/Documents/GitHub/)`
- pushing to the repository from your GitHub account is working

## Add Markdown File to Repository

- Navigate to the tutorial directory: `cd ~/Documents/GitHub/cadoodlecad.github.io/docs/docs/tutorial`
- Create a Markdown file with the extension `nano <Name of Tutorial File>.md`
- Add tutorial content to the file
- Save file, commit and push changes

## Show Markdown File in Documentation

- Navigate to the local directory containing the file: `cd ~/Documents/GitHub/cadoodlecad.github.io/docs`

- Open the file: `nano mkdocs.yaml`

- Create a new line under nav > Tutorial using the following format: `<Display Page Name>: tutorial/<Name of Tutorial File>.md`
    - E.g. `Getting Started: tutorial/getting-started.md`
- Save file, commit and push changes
