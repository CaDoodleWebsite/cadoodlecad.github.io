# About CaDoodle 


## What is CaDoodle?

The description on the CaDoodle site is:

> A simple yet powerful CAD solution for designers and engineers 

CaDoodle is a drag-and-drop editor for 3D objects.

# Inspiration

CaDoodle is inspired by Tinkercad. The workflow of Tinkercad is an excellent experience for novice users of CAD: 

1. Drag and drop shape
2. Group and ungroup
3. Solid and Hole status
4. Undo of operations
5. Stretch and move handles
6. Library of examples
7. Nearest Surface snappping

However, this workflow suffers from a few fundemental problems:

1. Web based UI means it is enclosed by whomever runs the server
2. Subscription model is precarious (Autodesk is not known as a reliable partner for free tools over time)
3. Proprietary source files

# Solution 

This application is Java based and uses BowerStudio as the CAD kernel.

All scripts will be compatible BowlerStudio scripts. 

UI will be laid out in SceneBuilder / JavaFX.

OpenJDK 17 

# Hardware Requirements

The following platforms will be targeted:

* Windows
* Mac OS (Arch 64)
* Linux Ubuntu .deb and Flatpak)
* ChromeOS
* 8 GB of ram is required.
  
The following platforms will not be targeted:

* Android
* iOS

## Chrome OS Instructions

- First, set up Linux using the instructions : https://support.google.com/chromebook/answer/9145439?hl=en

- Next download the Linux .DEB installer from : https://github.com/CommonWealthRobotics/CaDoodle/releases

- Finally double-click on the .DEB to install CaDoodle.

- You can now launch CaDoodle from the applications launcher window.
