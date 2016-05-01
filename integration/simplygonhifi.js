//
//  examples.js
//  examples
//
//  Created by Eric Levin on 8 Jan 2016
//  Copyright 2016 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

Script.include([
    "libraries/toolBars.js",
]);

var toolIconUrl = Script.resolvePath("assets/images/tools/");

var EXAMPLES_URL = "https://metaverse.highfidelity.com/examples";
var examplesWindow = new OverlayWebWindow({
    title: 'Simplygon',
    source: "about:blank",
    width: 900,
    height: 700,
    visible: false
});

var toolHeight = 50;
var toolWidth = 50;
var TOOLBAR_MARGIN_Y = 0;

/*
function showExamples(marketplaceID) {
    var url = EXAMPLES_URL;
    if (marketplaceID) {
        url = url + "/items/" + marketplaceID;
    }
    print("setting examples URL to " + url);
    examplesWindow.setURL(url);
    examplesWindow.setVisible(true);
}

function hideExamples() {
    examplesWindow.setVisible(false);
    examplesWindow.setURL("about:blank");
}

function toggleExamples() {
    if (examplesWindow.visible) {
        hideExamples();
    } else {
        showExamples();
    }
}
*/

var assetURL =  "atp:/fan/hull_ceiling_fan_stalk.obj";
var NASA_API_ENDPOINT = "https://api.nasa.gov/planetary/apod?api_key=XNmgPJvVK8hGroZHB19PaQtlqKZk4q8GorWViuND";
var simplygonAPI = "http://localhost:5000/simplygon";
/*function simplygonAction() {
    print("RAJRAJSimplygon");    
    var request = new Asset.downloadData();
    request.open("GET", NASA_API_ENDPOINT, false);
    request.send();
    var responseText = request.responseText;

    print(responseText.length);
    print(assetURL);
    print(request);
};*/

var assetURL2 = "atp:4db3ffc82139424916428c389d4fe9c0fc12e1d1a49e648376b835fdd9b31c13.obj";
var assetURL3 = "atp:272abfac67b50318456a0d20008db13f94148ed71626821050268d17354e58c1.fbx"


function uploadOBJToAssetServer(path, data) {
    Assets.uploadData(data, ".obj", function (url) {
        print("data uploaded to:" + url);
        uploadedFile = url;
        print(url);
    });
}

function simplygonAction() {
    Script.setTimeout(function(){
        print("adasasddasdasd");
    }, 2000);
    print("RAJRAJSimplygon");    
    print(assetURL2);
    Assets.downloadData(assetURL2, function (data) {
        //print("data downloaded from:" + url + " the data is:" + data);
        print(data.length);
   
        var request = new XMLHttpRequest();
        request.open("POST", simplygonAPI + "/create", false);
        request.send(data);
        var responseText = request.responseText;
        print(request.status);
        var response = JSON.parse(responseText);
        print(response.UUID);
        var response_func = function() {
            print("Callback for job " + response.UUID);
            var req2 = new XMLHttpRequest();
            req2.open("GET", simplygonAPI + "/status/" + response.UUID, true);
            req2.onreadystatechange = function() {
                var newResponse = JSON.parse(req2.responseText);
                print(newResponse.status);
                if(newResponse.status != "DONE") {
                    /*req2 = null;
                    req2 = new XMLHttpRequest();
                    req2.open("GET", simplygonAPI + "/status/" + response.UUID, true);
                    req2.onreadystatechange = response_func;
                    req2.send();*/
                    Script.setTimeout(response_func, 3000);
                } else {                
                    var req3 = null;
                    req3 = new XMLHttpRequest();
                    req3.open("GET", simplygonAPI + "/download/" + response.UUID, true);
                    req3.onreadystatechange = function() {
                        print(req3.responseText);
                        // upload OBJ
                        uploadOBJToAssetServer("testname", req3.responseText);
                    };
                    req3.send();
                }
            };
            req2.send();
        };
        Script.setTimeout(response_func, 2000);
    });
}


var toolBar = (function() {
    var that = {},
        toolBar,
        browseExamplesButton;

    function initialize() {
        toolBar = new ToolBar(0, 0, ToolBar.HORIZONTAL, "highfidelity.examples.toolbar", function(windowDimensions, toolbar) {
            return {
                x: windowDimensions.x / 2,
                y: windowDimensions.y
            };
        }, {
            x: -toolWidth / 2,
            y: -TOOLBAR_MARGIN_Y - toolHeight
        });
        browseExamplesButton = toolBar.addTool({
            imageURL: toolIconUrl + "examples-01.svg",
            subImage: {
                x: 0,
                y: Tool.IMAGE_WIDTH,
                width: Tool.IMAGE_WIDTH,
                height: Tool.IMAGE_HEIGHT
            },
            width: toolWidth,
            height: toolHeight,
            alpha: 0.9,
            visible: true,
            showButtonDown: true
        });

        toolBar.showTool(browseExamplesButton, true);
    }

    var browseExamplesButtonDown = false;
    that.mousePressEvent = function(event) {
        var clickedOverlay,
            url,
            file;

        if (!event.isLeftButton) {
            // if another mouse button than left is pressed ignore it
            return false;
        }

        clickedOverlay = Overlays.getOverlayAtPoint({
            x: event.x,
            y: event.y
        });

        if (browseExamplesButton === toolBar.clicked(clickedOverlay)) {
            simplygonAction();
            return true;
        }

        return false;
    };

    that.mouseReleaseEvent = function(event) {
        var handled = false;


        if (browseExamplesButtonDown) {
            var clickedOverlay = Overlays.getOverlayAtPoint({
                x: event.x,
                y: event.y
            });
        }

        newModelButtonDown = false;
        browseExamplesButtonDown = false;

        return handled;
    }

    that.cleanup = function() {
        toolBar.cleanup();
    };

    initialize();
    return that;
}());

Controller.mousePressEvent.connect(toolBar.mousePressEvent)
Script.scriptEnding.connect(toolBar.cleanup);
