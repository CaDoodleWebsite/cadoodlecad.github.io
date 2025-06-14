CaDoodle supports running a remote server that will process the compute/ram heave operations and return the result into your running application.

# 0 Functionality

When a client is connected to a server, then all CSG operations in the application will be tested for size, and off-loaded if the Operation is on more than 200 polygons. 

# 1. Setup the Server

On the server you will need:

BowlerStudio.jar v3.10.3+

Java17 JDK+JFX

A file containing valid API keys (In the tutorial it will be called File.txt)

JAVA_HOME configured to point towards the JVM installed

Using the auto-updater is not recommended for server use. 


# 2. Run the server

Assuming JAVA_HOME is set to the java installation

Assuming File.txt is in the current directory and contains the API keys

Assuming BowlerStudio.jar is in the current directory

Assuming this server will run on the default port of 3742

`$JAVA_HOME/bin/java -Dprism.forceGPU=true -XX:MaxRAMPercentage=90.0 --add-exports javafx.graphics/com.sun.javafx.css=ALL-UNNAMED --add-exports javafx.controls/com.sun.javafx.scene.control.behavior=ALL-UNNAMED --add-exports javafx.controls/com.sun.javafx.scene.control=ALL-UNNAMED --add-exports javafx.base/com.sun.javafx.event=ALL-UNNAMED --add-exports javafx.controls/com.sun.javafx.scene.control.skin.resources=ALL-UNNAMED --add-exports javafx.graphics/com.sun.javafx.util=ALL-UNNAMED --add-exports javafx.graphics/com.sun.javafx.scene.input=ALL-UNNAMED --add-opens javafx.graphics/javafx.scene=ALL-UNNAMED  -jar BowlerStudio.jar -csgserver /opt/File.txt 3742`

## Server launch script

`git clone https://github.com/CommonWealthRobotics/CSGServerScripts.git`

`cd CSGServerScripts`

`bash launch.sh /opt/File.txt 3742`

## Docker

Put your API keys in `/opt/File.txt` and populate the file with API keys. 

To compile the image from the dockerfile:

`sudo bash docker-launch.sh`

or install the Dockerfile and Docker Compose files as needed. 

To just run the server, add the docker-compose.yml to your server and it will load the latest image from dockerhub. 


# 3. Connect to the server

For BowlerStudio scripts add this line to your code:

`
CSGClient.start("127.0.0.1", 3742, new File("/opt/File.txt"));
`

## 3.1 Configure client 

By default the client will only off-load CSG operations that are more than 200 polygons. 

To configure this call:

`
// Set a low number to ensure the Server is used. this defaults to 200
CSG.setMinPolygonsForOffloading(4);
`

## 3.2 Close the client

When you are done running with a client, you can close it by calling:

`
CSGClient,close()
`
`



`


