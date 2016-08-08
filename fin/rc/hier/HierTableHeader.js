jQuery.sap.declare("fin.rc.hier.HierTableHeader");
jQuery.sap.require('fin.rc.hier.HierTable');
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.core.Control");
/**
 * This class will provide the default implementation for the hierTable header part
 * As later it will be part of the UniHier control, so here we just inherit from Element
 */

//??so simple now just the
//later need check use the grid to make them align better
sap.ui.core.Control.extend("fin.rc.hier.HierTableHeader", {
    metadata : {
        library : "fin.rc.hier",
        properties : {
            //just put the most important property here, so other functions can easily get the current node id
            // 'hierModel' : {type: 'fin.rc.hier.HierModel', group : "Data", defaultValue: null},
            'hierModel' : {type: 'object', group : "Data", defaultValue: "null"},

            "visible" : {type : "boolean", group : "", defaultValue : true},

            //??aggregation better?
            // 'content': {type : "sap.ui.core.Control", group : "", defaultValue : null},
            'content': {type : "object", group : "", defaultValue : null},
        }
    },

    renderer : function(oRm, oControl) {
        if (!oControl.getVisible()) {
            return;
        }

        oRm.write("<div");
        oRm.writeControlData(oControl);
        oRm.writeStyles();
        oRm.writeClasses();
        oRm.write(">");

        var content = oControl.getContent();
        oRm.renderControl(content);

        oRm.write("</div>");
    }    
});

/**
 * When have the hierModel so can create content
 * @param {[type]} hierModel [description]
 */
fin.rc.hier.HierTableHeader.prototype.setHierModel = function ( hierModel ) {
    this.setProperty('hierModel', hierModel, true);
    this.setContent( this.createContent());
    return this;
};


/**
 * Create  the default control
 * @return {[type]} [description]
 */
fin.rc.hier.HierTableHeader.prototype.createContent = function () {
    var left = this.createLeftPart();

    var right = this.createRightPart();
    var hLayout = new sap.ui.layout.HorizontalLayout({
        content : [ left, right ]
        });

    //and set the Model 
    //??
    //here just set to Layout should no problem
    console.error('!! in HierTableHeader->createContent()', this.getHierModel());
    hLayout.setModel( this.getHierModel());

    var hierModel = this.getHierModel();
    hierModel.attachRequestCompleted( this.onRequestCompleted, this);

    return hLayout;

    // return gItem;
};

fin.rc.hier.HierTableHeader.prototype.onRequestCompleted = function (  ) {
    //?? if not add this then the ObjectListItem will not refresh, need check why
    this.invalidate();
};


//??now just choose the first top node
fin.rc.hier.HierTableHeader.prototype.createLeftPart = function () {
    var item = new sap.m.ObjectListItem({
        title: '{/children/0/Name} ({/children/0/NodeID})',

        number:  '2',  //??check later whether get from the input parameter or not
        numberUnit: 'Versions'
    });
    return item;
};

 /*"NodeID": "PCGR_01",
        "Name": "Profit center group 01",

 "LastUpdatedDate": "Fri Apr 11 2014 08:00:00 GMT+0800 (China Standard Time)",
        "LastUpdatedBy": "FANGZH",
        "CreatedDate": "Fri Apr 11 2014 08:00:00 GMT+0800 (China Standard Time)",
        "CreatedBy": "FANGZH",
*/

fin.rc.hier.HierTableHeader.prototype.createRightPart = function () {
    var item = new sap.m.ObjectListItem({
        attributes: [
            new sap.m.ObjectAttribute({
                //Created by : Alice Silver  - 8:01AM Wed Jul 04 2013 
                text: 'Created by: {/children/0/CreatedBy} - {/children/0/CreatedDate}' 
            }),

            new sap.m.ObjectAttribute({
                //Last Updated: Alice Silver  - 8:01AM Wed Mar 12 2014
                text: 'Last Updated by: {/children/0/LastUpdatedBy} - {/children/0/LastUpdatedDate}' 
            }),
        ]
    });

    return item;
};
