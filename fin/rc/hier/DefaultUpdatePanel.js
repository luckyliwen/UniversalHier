jQuery.sap.declare("fin.rc.hier.DefaultUpdatePanel");
jQuery.sap.require('fin.rc.hier.BaseUpdatePanel');

/**
 * This class will provide the default implementation for the right side update panel, here I just provide some sample implemenation 
 */
fin.rc.hier.BaseUpdatePanel.extend("fin.rc.hier.DefaultUpdatePanel", {
    metadata : {
        library : "fin.rc.hier",
        properties : {
            //just put the most important property here, so other functions can easily get the current node id
            'nodeId' : {type: 'string', defaultValue: "null"},
        }
    },

     renderer : function(oRm, oControl) {
        if (!oControl.getVisible()) {
            return;
        }
        oRm.write("<div");
        oRm.writeControlData(oControl);
        if (oControl.getWidth() && oControl.getWidth() !== '') {
            oRm.addStyle("width", oControl.getWidth());
        }
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
fin.rc.hier.DefaultUpdatePanel.prototype.onBeforeRendering = function() {
    this.createDefaultContent();
};

fin.rc.hier.DefaultUpdatePanel.prototype.onChangeParentCalled = function(context) {
    //??just domo show
    var parentId = prompt('Provide the parent node id where you want to change', 'PCGR_01');
    var position = prompt("Provide the position you want to put to: start from 0");
    var destInfo = {
        parentId: parentId,
        position: position,
    };

    this.performByActionType( fin.rc.hier.UpdateType.ChangeParent, context, destInfo);
};


/**
 * The return value see fin.rc.hier.HierTable.prototype.performInsertNode.
 * @param  {[type]} context [description]
 * @return {[type]}         [description]
 */
fin.rc.hier.DefaultUpdatePanel.prototype.onInserNodeCalled = function(context) {
    //??just demo show
    var nodeId = prompt('Provide the new node id', 'PCGR_XX');

    //now it just append to the end of current node
    // var parentId = prompt('Provide the parent node id where you want to insert', 'PCGR_01');
    // var position = prompt("Provide the position you want to put to: start from 0");
    var parentId = this.getNodeId();   //as just insert to current selected node 
    var nodeEntry = {
        "NodeID": nodeId,
        "Name": "New insert node",
        "ParentID": parentId,
    };

    var destInfo = {
        parentId: parentId,
        // position: position,
        nodeEntry: nodeEntry
    };

    this.performByActionType( fin.rc.hier.UpdateType.InsertNode, context, destInfo);
};

/**
 * So here can easily set the new value
 * @param  {[type]} evt    [description]
 * @param  {[type]} mParam [description]
 * @return {[type]}        [description]
 */
fin.rc.hier.DefaultUpdatePanel.prototype.onRowSelectionChanged = function(evt, mParam) {
    //??need check whether when no row selected the previous value need change or not
    this.nameEditLabel.setText( mParam.name);
    this.nameEditInput.setValue( mParam.name);

    this.setNodeId( mParam.nodeId);
};

/**
 * [onChangeLogChanged description]
 * @param  {[type]} evt [description]
 * @return {[type]}     [description]
 *
 *   it include following extra information in the parameter
 *     var param = {
        'actionType': updateType,  //just for last one action
        'actionCount': this.aAction.length,   //so from this can know whether can: undo, cancel, submit
        //the last action description, for the normal action just choose the action.getDescription(), for the undo, cancel, 
        //submit now just create manually, so it can't undo
        'actionDescription': desc,
    };

 */
fin.rc.hier.DefaultUpdatePanel.prototype.onChangeLogChanged = function(evt) {
    var value = this.changeLogTextArea.getValue().trim();
    var actionDescription = evt.getParameter('actionDescription');
    if (value.length > 0) {
        value = value + '\r\n' + actionDescription;
    } else {
        value = actionDescription;
    }

    this.changeLogTextArea.setValue(value);

    //need ajust the Undo enable/disable status here 
    var actionCount = evt.getParameter('actionCount');
    var flag = actionCount >0 ? true : false;

    //Perhaps the Undo, submit, Cancel have register here 
    if ( 'Undo' in this.mActionControl) {
        if ('setEnabled' in this.mActionControl.Undo)
            this.mActionControl.Undo.setEnabled(flag);
    }

    if ( 'Submit' in this.mActionControl) {
        if ('setEnabled' in this.mActionControl.Submit)
            this.mActionControl.Submit.setEnabled(flag);
    }

    if ( 'Cancel' in this.mActionControl) {
        if ('setEnabled' in this.mActionControl.Cancel)
            this.mActionControl.Cancel.setEnabled(flag);
    }
};

/**
 * Avoid name conflict with the sap.m.Panel.addContent so here name it addNewContent, 
 * it can be a single content or an array
 */
fin.rc.hier.DefaultUpdatePanel.prototype.addNewContent = function(contents) {
    //As later  the sub class can overwrite some thing to return null to omit some control, so here need check first
    //?? as now the content is too close, so need add some space between them, now just use an empty HTML to do so, 
    //need check later 
    function createMargin() {
        return new sap.ui.core.HTML({content: '<div style="height:1em;"></div>'});    
    }
    

    if (contents) {
        if (contents instanceof Array) {
            for (var i = 0; i < contents.length; i++) {
                this.vBox.addItem(contents[i]);
                this.vBox.addItem( createMargin());
            }
        } else {
            this.vBox.addItem(contents);
            this.vBox.addItem( createMargin());
        }
    }
};

/**
 * ??
 * Create content for the left part
 * @return {[type]} [description]
 */
fin.rc.hier.DefaultUpdatePanel.prototype.createDefaultContent = function () {
    //only do it once 
    if ( this.getContent().length>0)
        return;

    this.vBox = new sap.m.VBox(); 
    this.addNewContent(new sap.m.Label({
            text: 'Draft Changes',  design: 'Bold'
        })
    );

    this.addNewContent(this.createChangeLogControl());

    this.addNewContent(this.createNameEditControl());    

    //??
    this.addNewContent( this.createControlForAction( fin.rc.hier.UpdateType.InsertNode) );

    //??
    this.addNewContent( this.createControlForAction( fin.rc.hier.UpdateType.ChangeParent) );
    
    this.addNewContent(this.createChangePositionControl());    

    this.addNewContent( this.createControlForAction( fin.rc.hier.UpdateType.Delete) );
    
    this.addContent(this.vBox);
};


fin.rc.hier.DefaultUpdatePanel.prototype.createChangeLogControl = function () {
    //??just show case of how to control the change log
    var textArea = new sap.m.TextArea( {
        rows: 5, 
        editable: false,
        width: '100%'
    });

    var clearLink  = new sap.m.Link({text: 'Clear', 
        press: function() {
            textArea.setValue("");
        }
    });
    
    function createMargin() {
        return new sap.ui.core.HTML({content: '<div style="width:5em;"></div>'});    
    }

    //also add the undo 
    var undoLink = this.createControlForAction(fin.rc.hier.UpdateType.Undo);
    var hbox = new sap.m.HBox({
        items: [
            clearLink,
            createMargin(),
            undoLink
        ]
    });

    this.changeLogTextArea = textArea;
    return [hbox, textArea]; 
};

fin.rc.hier.DefaultUpdatePanel.prototype.createNameEditControl = function () {
    var hBox = new sap.m.HBox(); 
    hBox.addItem( new sap.m.Label({text: 'Edit:', design: 'Bold'}));
    this.nameEditLabel = new sap.m.Label();
    hBox.addItem( this.nameEditLabel);

    var that =this;

    //then the input control 
    this.nameEditInput = new sap.m.Input({
        change: function( evt) {
            var val = evt.getSource().getValue();
            mProp = {
                Name:  val
            };
            that.performByActionType(fin.rc.hier.UpdateType.ChangeProperty, undefined, mProp);
        }
    });
    return [hBox, this.nameEditInput];
};


fin.rc.hier.DefaultUpdatePanel.prototype.createChangePositionControl = function () {
    function createMargin() {
        return new sap.ui.core.HTML({content: '<div style="width:5em;"></div>'});    
    }

    var hBox0 = new sap.m.HBox();
    //?? also the two link need seperate, choose better solution later 
    hBox0.addItem( this.createControlForAction( fin.rc.hier.UpdateType.MoveUp ) );
    hBox0.addItem( createMargin());
    hBox0.addItem( this.createControlForAction( fin.rc.hier.UpdateType.MoveDown ) );

    var hBox1 = new sap.m.HBox();
    hBox1.addItem( this.createControlForAction( fin.rc.hier.UpdateType.MoveHead ) );
    hBox1.addItem( createMargin());
    hBox1.addItem( this.createControlForAction( fin.rc.hier.UpdateType.MoveTail ) );
    return [hBox0, hBox1];
};

fin.rc.hier.DefaultUpdatePanel.prototype.createChangeParentControl = function () {
    var hBox = new sap.m.HBox();
    hBox.addItem( new sap.m.Label({text: 'Parent:', design: 'Bold'}) );
    this.changeParentLabel = new sap.m.Label();
    hBox.addItem( this.changeParentLabel);

    var link = this.createControlForAction( fin.rc.hier.UpdateType.ChangeParent);
    return [hBox, link];
};
