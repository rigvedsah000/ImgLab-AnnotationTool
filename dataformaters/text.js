var textFormater = {
    
    fromTXT : function(textData){
        return "";
    },

    toTXT : function(labellingData){
        var textData = "filename,tx,ty,rx,ry,bx,by,lx,ly,category,label\n";
        var images = Object.keys(labellingData);

        //Add images
        for(var image_i = 0 ; image_i < images.length; image_i++){
            var imageName = images [image_i];

            //Add annotations
            for(var shape_i=0; shape_i < labellingData[ imageName ].shapes.length;  shape_i++ ){

                console.log("aaa")
                
                var shape = labellingData[ imageName ].shapes[ shape_i ];
                
                textData = textData + imageName
                textData = textData + "," + Math.round(shape.points[0]) + "," + Math.round(shape.points[1]) + "," + Math.round(shape.points[0]+shape.points[2]) + "," + Math.round(shape.points[1]) + "," + Math.round(shape.points[0]+shape.points[2]) + "," + Math.round(shape.points[1] + shape.points[3]) + "," +  Math.round(shape.points[0]) + "," + Math.round(shape.points[1] + shape.points[3])
                textData = textData + "," + (shape.category || "uncategorized")
                textData = textData + "," + (shape.label || "unlabelled") + "\n"

            }
        }

        return textData;
    }
}