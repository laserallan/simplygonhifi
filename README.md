# Simplygon for High Fidelity

This is a very simple way of optimizing meshes using Simplygon from High Fidelity.

It requires a machine running Simplygon and the process python script. This may be the same machine as running High Fidelity but can also be a separate machine.

## Limitations
* It currently only processes obj-files without materials
* The scaling of processed meshes seem to be generally off
* It requires a lot of manual work to get things through but it should be easy to extend to automate more
* It is not production code, specially the download command is dangerous since it might access the entire file system of the processing machine. Don't deploy it on machines available for everyone

## Installation on the processing machine
* Install the latest version of Simplygon 8 and make sure the license is installed and valid
* Create the directories c:/simplygonhifi/jobs or edit the work_directory variable in simplygon.py to point to where you want jobs to be put
* Install Simplygon batch in the simplygon directory of the github in the SimplygonBatch directory
* Install flask and flask_restful, they are available through pip
* Run the simplygon script by running simplygon.py

## Installation in high fidelity
* Edit the simplygonAPI variable in simplygonhifi.js to point to the ip of the machine where the simplygon processing script is located
* Edit the path to the qml file to make sure it finds it locally or remotely in simplygonhifi.js
* Run the simplygon script from high fidelity.

## To use
* Import an obj-file and make sure you capture the content hash from the log
* Replace the content hash in the dialog with the one from the log
* Press Run
* Wait (look in the log for some progress information)
* When the mesh is processed it will be created in front of you

