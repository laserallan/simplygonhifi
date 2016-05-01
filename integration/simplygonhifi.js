

var simplygonAPI = "http://54.183.113.237:5000/simplygon";
//var assetURL2 = "atp:4db3ffc82139424916428c389d4fe9c0fc12e1d1a49e648376b835fdd9b31c13.obj";
//var assetURL3 = "atp:272abfac67b50318456a0d20008db13f94148ed71626821050268d17354e58c1.fbx";
//var assetURL4 = "atp:94496f8d59e646af0fb5ad714b970796be2c68b40345184c78bd84278231f238.obj";
//var assetURL4 = "atp:fc347f39619715496d33ce1e04f80039e524e46c896a4dab9683662cc4ab5c76.obj";
// heli: atp:94496f8d59e646af0fb5ad714b970796be2c68b40345184c78bd84278231f238.obj
// hummer atp:0818f6bf70cd9ba759a26d0720d8d63baf9b5664c7e0b6c5f18696698fcd9510.obj
// armchair atp:fc347f39619715496d33ce1e04f80039e524e46c896a4dab9683662cc4ab5c76.obj
function uploadOBJToAssetServer(newEntityName, data) {
	print("Uploading asset to asset server");
    Assets.uploadData(data, function (url) {
        print("data uploaded to:" + url);
        uploadedFile = url;
        print(url);
        var addPosition = Vec3.sum(MyAvatar.position, Vec3.multiply(2, Quat.getFront(MyAvatar.orientation)));
        //var entity = Entities.addModelEntity(newEntityName, url + ".obj", addPosition);
		print("Creating entity in the world");
		var test = Entities.addEntity({
			name: newEntityName,
		    type: 'Model',
		    modelURL: url + ".obj",
		    position: Vec3.sum(MyAvatar.position, Vec3.multiply(2, Quat.getFront(MyAvatar.orientation))),
		    dimensions: {x: 1, y: 1, z: 1},
		    collisionless: true
		});
    });
}

var progressVar = "Waiting"

function simplygonAction(assetURL, newEntityName, qmlWindow) {
    print("Start processing url: " + assetURL);
    print("Getting asset from asset server: " + assetURL);
    Assets.downloadData(assetURL, function (data) {
        //print("data downloaded from:" + url + " the data is:" + data);
        print("Data Size: " + data.length);
        print("Starting processing job");
   
        var request = new XMLHttpRequest();
        request.open("POST", simplygonAPI + "/create", false);
        request.send(data);
        var responseText = request.responseText;
        print(request.status);
        var response = JSON.parse(responseText);
        print(response.UUID);
        print("Job uploaded");

        var response_func = function() {
            print("Progress received for " + response.UUID);
            var req2 = new XMLHttpRequest();
            req2.open("GET", simplygonAPI + "/status/" + response.UUID, true);
            req2.onreadystatechange = function() {
                var newResponse = JSON.parse(req2.responseText);
                print(newResponse.status);
                if(newResponse.status != "DONE") {
                    Script.setTimeout(response_func, 3000);
                } else {                
			        print("Downloading result");
                    var req3 = null;
                    req3 = new XMLHttpRequest();
                    req3.open("GET", simplygonAPI + "/download/" + response.UUID, true);
                    req3.onreadystatechange = function() {

                        if(newEntityName === "") {
                        	newEntityName = "SimplygonMesh";
                        }
                        uploadOBJToAssetServer(newEntityName, req3.responseText);
                    };
                    req3.send();
                }
            };
            req2.send();
        };
        Script.setTimeout(response_func, 2000);
    });
}




qmlWindow = new OverlayWindow({
    title: 'Simplygon', 
    source: "https://raw.githubusercontent.com/laserallan/simplygonhifi/master/integration/simplygonhifi.qml", 
    height: 320, 
    width: 640, 
    toolWindow: false,
    visible: true
});
qmlWindow.fromQml.connect(function(message){
    print(message);
    if (message[0] === "process") {
		simplygonAction(message[1], message[2], qmlWindow);
    }
    if (message[0] === "getProgress") {
		return progressVar;
    }
});
qmlWindow.closed.connect(function() { Script.stop(); });







/*
var test = Entities.addEntity({
    name: 'DavidTest',
    type: 'Model',
    modelURL: "atp:fc347f39619715496d33ce1e04f80039e524e46c896a4dab9683662cc4ab5c76.obj",
    position: Vec3.sum(MyAvatar.position, Vec3.multiply(2, Quat.getFront(MyAvatar.orientation))),
    dimensions: {x: 1, y: 1, z: 1},
    color: {red: 200, green: 0, blue: 20},
    collisionless: true
});

*/