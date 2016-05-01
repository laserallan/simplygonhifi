//ctrl + shift + X

import QtQuick 2.5
import QtQuick.Controls 1.4

Rectangle {
    id: root
    width: parent ? parent.width : 100
    height: parent ? parent.height : 100
    signal sendToScript(var message);
    property string progressText: "text"
    Text {
        id: label
        text: "Simplygon test "
    }
    Column{
        anchors { left: parent.left; right: parent.right; top: label.bottom; topMargin: 8; bottom: parent.bottom }
        spacing: 8
        TextField {
            width: 550
            id: assetHashField;
            placeholderText: qsTr("atp:asset_url.obj")
            text: "atp:fc347f39619715496d33ce1e04f80039e524e46c896a4dab9683662cc4ab5c76.obj"
        }
        TextField {
            width: 550
            id: newEntityName;
            placeholderText: qsTr("SimplygonMesh")
            text: "SimplygonMesh"
        }
        Button {
            text: "Run"
            onClicked: root.sendToScript(["process", assetHashField.text, newEntityName.text]);
        }
        /*Text {
            id: progress
            text: progressText
        }
        Timer {
            interval: 2000; running: true; repeat: true
            onTriggered: progress.text = root.sendToScript(["getProgress2"]);

        }*/
 
    }
}