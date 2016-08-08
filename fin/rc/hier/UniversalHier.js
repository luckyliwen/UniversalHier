jQuery.sap.declare("fin.rc.hier.UniversalHier");
//it will require all needed other panel 
jQuery.sap.require('fin.rc.hier.HierTable');
jQuery.sap.require('fin.rc.hier.DefaultUpdatePanel');
jQuery.sap.require('fin.rc.hier.HierTableHeader');

/**
 * This class will put HierTable, HierTableHeader and UpdatePanel together 
 */
sap.ui.core.Control.extend("fin.rc.hier.UniversalHier", {
    metadata : {
        library : "fin.rc.hier",
        properties : {
            //just put the most important property here, so other functions can easily get the current node id
            // 'hierTable' : { type: 'fin.rc.hier.HierTable', defaultValue: null},
            'hierTable' : { type: 'object', group : "Data", defaultValue: null},

            //more general 
            // 'hierTableHeader' : {type: 'sap.ui.core.Control', group : "Data", defaultValue: null },
            'hierTableHeader' : {type: 'object', group : "Data", defaultValue: null },

            //the update part, only need sap.ui.core.Control as more general
            // 'updatePanel' : { type: 'sap.ui.core.Control', group : "Data", defaultValue: null},
            'updatePanel' : { type: 'object', group : "Data", defaultValue: null},
        },

        //??not good, now just use it, so user are free to add more content here
        defaultAggregation : "content",
        aggregations : {
            "content" : {type : "sap.ui.core.Control", multiple : true, singularName : "content"}, 
        }
    }, 

    renderer : function(oRm, oControl) {
/*        if (!oControl.getVisible()) {
            return;
        }
*/
        oRm.write("<div");
        oRm.writeControlData(oControl);
        oRm.writeStyles();
        oRm.writeClasses();
        oRm.write(">");

        var aChildren = oControl.getContent();
        var iLength = aChildren.length;
        for (var i = 0; i < iLength; i++) {
            oRm.renderControl(aChildren[i]);
        }

        oRm.write("</div>");
    }    
});

/**
 * Just ensure if user not provide implementation, then it will create default value
 * @return {[type]} [description]
 */
fin.rc.hier.UniversalHier.prototype.onBeforeRendering = function() {
    this.createDefaultContent();
};


fin.rc.hier.UniversalHier.prototype.createDefaultContent = function () {
    this.checkAndCreateDefaultControl();

    //then create default layout
    if ( this.getContent().length>0)
        return;

    this.createDefaultLayout();
};

fin.rc.hier.UniversalHier.prototype.createDefaultLayout = function () {
/*    var mainPart = new sap.ui.layout.VerticalLayout({
        content : [ 
            this.getHierTableHeader(),
            this.getHierTable()
            ]
        });
*/
    var mainPart = new sap.m.VBox({
        width: '1200px',
        // width: '80%',
        items : [ 
            this.getHierTableHeader(),
            this.getHierTable()
            ]
        });

    var hLayout = new sap.ui.layout.HorizontalLayout({
        content : [ 
            mainPart, 
            this.getUpdatePanel()
            ]
        });

    this.addContent(hLayout);
};


/**
 * check if the hierTableHeader and updatePanel not set by user, then create the default implementation
 * @return {[type]} [description]
 */
fin.rc.hier.UniversalHier.prototype.checkAndCreateDefaultControl = function () {
    var hierTable = this.getHierTable();
    if (!hierTable) {
        throw new Error('In fin.rc.hier.UniversalHier->createDefaultControl() must first set the hierTable');
    }

    var hierTableHeader = this.getHierTableHeader();
    if (!hierTableHeader) {
        hierTableHeader = new fin.rc.hier.HierTableHeader( {
            hierModel: hierTable.getHierModel()
        }); 
        this.setHierTableHeader( hierTableHeader);   
    }

    var updatePanel = this.getUpdatePanel();
    if (!updatePanel) {
        updatePanel = new fin.rc.hier.DefaultUpdatePanel( {
            hierTable: hierTable
        }); 
        this.setUpdatePanel( updatePanel);   
    }
}; 

fin.rc.hier.UniversalHier.prototype.setHierModel = function ( hierModel ) {
    this.setProperty('hierModel', hierModel, true);
    // this.setContent( this.createContent());
};

