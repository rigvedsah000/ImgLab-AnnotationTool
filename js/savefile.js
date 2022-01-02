function selectFileTypeToSave(){
    $.dialog({
        title: 'Save/Export as',
        content: `<div style="text-align:center;">
                <div>
                    <button class="btn btn-primary savebtn"  onclick="javascript:saveAsNimn()" id="saveAsNimn">Project File</button>
                </div>
                <div>
                    <button class="btn btn-primary savebtn" onclick="javascript:saveAsCSV()" id="saveAsCSV">Simple CSV</button>
                </div>
                <!-- 
                <div>
                    <button class="btn btn-primary savebtn" onclick="javascript:saveAsDlibXML()" id="saveAsNimn">Dlib XML</button>
                </div>
                <div>
                    <button class="btn btn-primary savebtn" onclick="javascript:saveAsDlibPts()" id="saveAsNimn">Dlib pts</button>
                </div>
                <div>
                    <button class="btn btn-primary savebtn" onclick="javascript:saveAsCOCO()" id="saveAsCOCO">COCO JSON</button>
                </div>
                <div>
                    <button class="btn btn-primary savebtn" onclick="javascript:saveAsPascalVOC()" id="saveAsPascalVOC">Pascal VOC XML</button>
                </div>
                -->
            <div>`,
        escapeKey: true,
        backgroundDismiss: true,
    });
}

/**
 * Save project file in Nimn format
 */
function saveAsNimn(){
    askFileName(Object.keys(labellingData).length + ".nimn", function(fileName){
        analytics_reportExportType("nimn");
        report_UniqueCategories();

        // Workaround for saving "value" field of attributes in "label" field as "nimn" is not saving it
        var images = Object.keys(labellingData);

        // Picking an image
        for(var image_i = 0 ; image_i < images.length; image_i++){
            var imageName = images [image_i];

            // Picking a bounding region
            for(var shape_i=0; shape_i < labellingData[ imageName ].shapes.length;  shape_i++ ){
                
                var shape = labellingData[ imageName ].shapes[ shape_i ];

                // Picking an attribute
                for(var i=0; i<shape.attributes.length; i++){
                    shape.attributes[i]['label'] = shape.attributes[i]['label'] + "#" + shape.attributes[i]['value']
                }
            }
        }

        download(nimn.stringify(nimnSchema, labellingData), fileName, "application/nimn");

        // Reversing above workaround
        for(var image_i = 0 ; image_i < images.length; image_i++){
            var imageName = images [image_i];
    
            // Picking a bounding region
            for(var shape_i=0; shape_i < labellingData[ imageName ].shapes.length;  shape_i++ ){
                
                var shape = labellingData[ imageName ].shapes[ shape_i ];
    
                // Picking an attribute
                for(var i=0; i<shape.attributes.length; i++){
                    key_value = shape.attributes[i]['label']
    
                    shape.attributes[i]['label'] = key_value.split("#")[0]
                    shape.attributes[i]['value'] = key_value.split("#")[1]
                }
            }
        }
        
        //download( JSON.stringify(labellingData), fileName, "application/json");
    });
}

function report_UniqueCategories(){
    var imgNames = Object.keys(labellingData);
    var setData = new Set();
    for(var i=0; i< imgNames.length; i++){
        var image = labellingData[ imgNames[i] ];
        for(var shape_i=0; shape_i < image.shapes.length; shape_i++){
            setData.add( (image.shapes[ shape_i ].category || 'X') + "|" + (image.shapes[ shape_i ].label || 'X') );
        }
    }

    try{
        setData.forEach(labelData => {
            var reportData = labelData.split(/\|(.+)/);

            gtag('event', 'label', {
                'event_category': reportData[0], //Human
                'event_label': reportData[1], //Face
                'value' : 1
            });
        });

    }catch(e){

    }
}

/**
 * Save project file as csv in txt format
 */
 function saveAsCSV(){
    var textData = textFormater.toTXT(labellingData);
    // console.log(textData)
    askFileName(Object.keys(labellingData).length + ".txt", function(fileName){
        download(textData, fileName, "application/txt", "utf-8");
    });
}

/**
 * Save labelled data as DLIB supported XML file. It captures only boundary box detail.
 */
function saveAsDlibXML(){
    var dlibXMLData = toDlibXML(labellingData);
    askFileName(Object.keys(labellingData).length + "_imglab.xml", function(fileName){
        analytics_reportExportType("dlib_xml");
        download(dlibXMLData, fileName, "text/xml", "iso-8859-1");
    });
}

/**
 * Save feature point detail of selected label as DLIB supported point file (pts).
 */
function saveAsDlibPts(){
    var ptsData,shape;
    if(!imgSelected){
        showSnackBar("This option is applicable on the image loaded in workarea.");
        return;
    }else if(selectedElements.length === 1){
        //TODO: bug element gets unselected when select any tool
        shape  = getShape(selectedElements[0].id);
    }else if(labellingData[imgSelected.name].shapes.length === 1){
        shape  = labellingData[imgSelected.name].shapes[ 0 ];
    }else{
        showSnackBar("Please create or select one shape.");
        return;
    }

    ptsData = toDlibPts( shape );
    askFileName(imgSelected.name + "_imglab.pts", function(fileName){
        analytics_reportExportType("dlib_pts", shape.featurePoints.length );
        download(ptsData, fileName, "text/plain");
    });
}

/**
 * Save labelled data as COCO supported JSON file. 
 * It captures only boundary box detail and categories.
 */
function saveAsCOCO(){
    var cocoData = cocoFormater.toCOCO(labellingData);
    askFileName(Object.keys(labellingData).length + "_coco_imglab.json", function(fileName){
        analytics_reportExportType("coco");
        download(JSON.stringify(cocoData), fileName, "application/json", "utf-8");
    });
}

/**
 * Save labelled data as Pascal VOC supported XML file. 
 * It captures only boundary box detail of currently loaded/selected image.
 */
function saveAsPascalVOC(){

    if(!imgSelected){
        showSnackBar("This option is applicable on the image loaded in workarea.");
        return;
    }else if(labellingData[ imgSelected.name ].shapes.length === 0){
        showSnackBar("You need to label the currently loaded image.");
        return;
    }else{
        var data = pascalVocFormater.toPascalVOC();
        askFileName(Object.keys(labellingData[ imgSelected.name ].shapes.length ).length + "_pvoc_imglab.xml", function(fileName){
            analytics_reportExportType("pascal_voc");
            download(data, fileName, "text/xml", "utf-8");
        });
    }

}

/**
 * Save given data to a file
 * @param {*} data 
 * @param {string} filename 
 * @param {string} type : Mime type
 */
function download(data, filename, type, encoding) {
    encoding || (encoding = "utf-8")
    var blobData = new Blob([data], {type: type + ";charset="+encoding})
    saveAs(blobData, filename);
}

/**
 * Ask user to provide output filename
 * @param {string} suggestedName 
 * @param {function} cb 
 */
function askFileName(suggestedName, cb){
    suggestedName || (suggestedName = "Untitled_imgLab" )
    $.confirm({
        title: 'File Name',
        content: `<input class="form-control"  type"text" id="fileName" value="${suggestedName}" >`,
        buttons: {
            confirm: {
                text: 'Save',
                btnClass: 'btn-blue',
                action: function () {
                    var fname = this.$content.find('#fileName').val();
                    if(!fname){
                        $.alert('provide a valid name');
                        return false;
                    }
                    cb(fname);
                }
            },
            cancel: function () {
                //close
            },
        }//buttons
    })
}

function analytics_reportExportType(type, len){
    try{
        gtag('event', 'save_as', {
            'event_category': type,
            'event_label': len || Object.keys(labellingData).length,
            'value' : 1
        });
    }catch(e){

    }

}