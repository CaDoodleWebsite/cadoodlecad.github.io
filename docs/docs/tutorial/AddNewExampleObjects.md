<p>I Absolutly want to have folks add more example shapes! The shapes pallet is defined by the contents of this repo:&nbsp;<a href="https://github.com/CommonWealthRobotics/CaDoodle-ShapesPalet-Content" class="relative pointer-events-auto a cursor-pointer          underline  " rel="noopener nofollow ugc" target="_blank">https://github.com/CommonWealthRobotics/CaDoodle-ShapesPalet-Content</a>&nbsp;and cloned into&nbsp;<code>~/Documents/CaDoodle-workspace/gitcache/github.com/CommonWealthRobotics/CaDoodle-ShapesPalet-Content/</code></p>

<p>If you wanted to experement, you can modify the existing .json files, or create your own to make a new menu item. Just close CaDoodle and open it up again to see your changes.</p>


<p>The lines in the json</p>


<p>"Cube":{</p>


<p>"git":"<a href="https://github.com/madhephaestus/CaDoodle-Example-Objects.git" class="relative pointer-events-auto a cursor-pointer          underline  " rel="noopener nofollow ugc" target="_blank">https://github.com/madhephaestus/CaDoodle-Example-Objects.git</a>",</p>


<p>"file":"cube.groovy",</p>


<p>"order":"2"</p>


<p>},</p>


<p>Is the URL to the git location of the file, and the file ke is the location of that file within the repository. The file can be any type supported for import. The order term is where the button should be in the grid of buttons.</p>


<p>In the case of files you would like the uer to edit, just add the key:</p>


<p>"copyFile":true</p>


<p>This will make a copy of the source file into the users directory and provide an editor button in the UI for the user to edit the file. If you make a blender file you wan the user to sculpt on, then you would use that flag.</p>


<p>If you would like to add your example shapes to the whole community, make a pull request with your updated&nbsp;<a href="https://github.com/CommonWealthRobotics/CaDoodle-ShapesPalet-Content" class="relative pointer-events-auto a cursor-pointer          underline  " rel="noopener nofollow ugc" target="_blank">https://github.com/CommonWealthRobotics/CaDoodle-ShapesPalet-Content</a></p>


<p>Once I merge your PR, that object will be availible to the whole community as an example object.</p>


<p>Supported file types are:</p>

<p>Doodle files (CaDoodle native file format)</p>


<p>BowlerStudio scripted cad (Groovy)</p>


<p>FreeCAD files</p>


<p>Blender Files</p>


<p>Inkscape SVG's (where all objects are paths) for extrusion</p>


<p>Inkscape SCG's as sweep inputs (rings, threads, spirals)</p>


<p>OpenSCAD files (you need to wrap it in a groovy file to expose the parametrics)</p>


<p>STL files</p>


<p>OBJ Files</p>