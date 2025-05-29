CaDoodle supports running a remote server that will process the compute/ram heave operations and return the result into your running application.

# 1. Setup the Server

On the server you will need:

BowlerStudio.jar v3.10.0+

Java17 JDK+JFX

A file containing valid API keys (In the tutorial it will be called File.txt)

JAVA_HOME configured to point towards the JVM installed

Using the auto-updater is not recommended for server use. 


# 2. Run the server

Assuming JAVA_HOME is set to the java installation

Assuming File.txt is in the current directory and contains the API keys

Assuming BowlerStudio.jar is in the current directory

Assuming this server will run on the default port of 3742

`$JAVA_HOME/bin/java -Dprism.forceGPU=true -XX:MaxRAMPercentage=90.0 --add-exports javafx.graphics/com.sun.javafx.css=ALL-UNNAMED --add-exports javafx.controls/com.sun.javafx.scene.control.behavior=ALL-UNNAMED --add-exports javafx.controls/com.sun.javafx.scene.control=ALL-UNNAMED --add-exports javafx.base/com.sun.javafx.event=ALL-UNNAMED --add-exports javafx.controls/com.sun.javafx.scene.control.skin.resources=ALL-UNNAMED --add-exports javafx.graphics/com.sun.javafx.util=ALL-UNNAMED --add-exports javafx.graphics/com.sun.javafx.scene.input=ALL-UNNAMED --add-opens javafx.graphics/javafx.scene=ALL-UNNAMED  -jar BowlerStudio.jar -csgserver File.txt 3742`

# 3. Connect to the server

For BowlerStudio scripts add this line to your code:

`
CSGClient.start("127.0.0.1", 3742, new File("File.txt"));
`


