jQuery.sap.declare("fin.rc.hier.BaseUpdatePanel");
jQuery.sap.require('fin.rc.hier.HierTable');
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.core.Control");
//??Now we need a easy method to register the function and liste
// : new signals.Signal()

/**
 * This class define the basic interface between the HierTable and the Main Update Panel, 
 * So user can create his own implementation based on this 
 * @type {Object}
 */
//??later need provide i18n text for the common actions
//confirmFunction: null, 
// pressFunction:   null, 
// interactionFunction: null 
//
fin.rc.hier.DefaultUpdatePanelSetting =  {
        //??i18n supported needed here, also later can create new Link which support icon and text
        Delete        : {
            text: 'Delete'
        },
        MoveUp        : {
            text: 'Move Up'
        },
        MoveDown      : {
            text: 'Move Down'
        },
        MoveHead      :  {
            text: 'Move to Top'
        },
        MoveTail      :  {
            text: 'Move to Bottom'
        },
       
        ChangeParent  : {
            text: 'Change Parent to'
        },

        InsertNode    :  {
            text: 'Inser Node', 
        }, 

        Undo          : {
            text: 'Undo'
        }, 

        //Even normally the submit and Cancel will put in other control, but it still can use the function
        //createButtonForAction  or createLinkForAction
        Submit        : {
            text: 'Submit'
        },  
        Cancel        : {
            text: 'Cancel'
        },
};


// sap.ui.core.Control.extend("fin.rc.hier.BaseUpdatePanel", {
sap.ui.core.Control.extend("fin.rc.hier.BaseUpdatePanel", {
    metadata : {
        publicMethods : [ ],
        library : "fin.rc.hier",
        properties : {
            // 'hierTable' : {type: 'fin.rc.hier.HierTable', defaultValue: "null"},
            'hierTable' : {type: 'object', group : "Data", defaultValue: "null"},

            //the default control type, now support 'Button' and 'Link'
            'defaultControlType' : {type: 'string', group : "Data", defaultValue: "Link"},

            "visible" : {type : "boolean", group : "Behavior", defaultValue : true},

            // 'autoRegister'
            
            // ?? which value is good ?
            "width" : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : '360px'},
        },
        

        //??not good, now just use it, so user are free to add more content here
        defaultAggregation : "content",
        aggregations : {
            "content" : {type : "sap.ui.core.Control", multiple : true, singularName : "content"}, 
        },

        events: 
        {
        },
    },
    renderer : function(oRm, oControl) {
        throw new Error('Must not directly use the Abstract class fin.rc.hier.BaseUpdatePanel');
    }
});

fin.rc.hier.BaseUpdatePanel.prototype.setHierTable = function(hierTable) {
    this.setProperty("hierTable", hierTable, true);

    //just set the hierTable for easy use 
    this.hierTable = hierTable;

    //??how to do more personlization for this event?
    hierTable.attachRowSelectionChange(this.defaultOnRowSelectionChangedHandler, this);

    hierTable.attachChangeLogChanged(this.defaultOnChangeLogChangedHandler, this);

    return this;
};


/**
 * Now for the Row selection change, main function is to adjust the corresponding control status.
 *     !!?? As for some business it may need extra logic, so later can considerate for each action register an call back
 * @param  {[type]} evt [description]
 * @return {[type]}     [description]
 */
fin.rc.hier.BaseUpdatePanel.prototype.defaultOnRowSelectionChangedHandler = function(evt) {
    var rowContext = evt.getParameter('rowContext');
    var mStatus = this.hierTable.checkActionStatus(rowContext);

    for (var key in mStatus) {
        if ( key in this.mActionControl) {
            //here direct set as the UI5 will compare whether it is same or not
            if ('setEnabled'  in this.mActionControl[key]) {
                this.mActionControl[key].setEnabled(  mStatus[key]);
            }
        }
    }

    //in order for user easy know the node selection changed and get the information, here will 
    //call the call back of user if provided
    var mParam = {
        rowContext: rowContext, 
        nodeId: "",
        name: "",
        parentId: "", 
        entry: null,
    };

    if (rowContext) {
        //now provide following information: 
        //nodeId, name, parentId ( As the )
        var hierModel = this.hierTable.getHierModel();
        var entry = hierModel.getEntryFromContextOrPath(rowContext);
        hierModel.setKeyPropertyFromEntry(entry, mParam);
        mParam.entry = entry;
    }

    //call the sub-class handler
    if (this.onRowSelectionChanged) {
        this.onRowSelectionChanged.call( this, evt, mParam);
    }
};

fin.rc.hier.BaseUpdatePanel.prototype.defaultOnChangeLogChangedHandler= function(evt) {
    //call the sub-class handler
    if (this.onChangeLogChanged) {
        this.onChangeLogChanged.call( this, evt);
    }
};


fin.rc.hier.BaseUpdatePanel.prototype.init = function() {

    //this is used to control the control for different action status
    this.mActionControl = {};

    // hierTable.detatchRowSelectionChange(this.onhierTableRowSelectionChanged, this);
/*    if (this.createContent) {
        var aContent = this.createContent();
        this.setContent( aContent);
    }
*/};


fin.rc.hier.BaseUpdatePanel.prototype.exit = function() {
    if (this.hierTable) {
        hierTable.detatchRowSelectionChange(this.onhierTableRowSelectionChanged, this);
        hierTable.detatchOnChangeLogChanged(this.defaultOnChangeLogChangedHandler, this);
    }

    delete this.mActionControl;
};

/**
 * [setControlForAction description]
 * @param {[type]} actionType [description]
 * @param {[type]} control    Not null means register, null means unregister
 */
fin.rc.hier.BaseUpdatePanel.prototype.setControlForAction = function(actionType, control) {
    if (control) {
        this.mActionControl[ actionType ] = control;
    } else {
        if ( actionType in this.mActionControl )
            delete this.mActionControl[ actionType ];
    }
};


/**
 * Just one shortcut, so for some action which no need extra parameter which can just call this.
 * @param  {[type]} updateType [description]
 * @param  {[type]} context    [description]
 * @param  {[type]} extraParam [description]
 * @return {[type]}            [description]
 */
fin.rc.hier.BaseUpdatePanel.prototype.performByActionType = function(updateType, context, extraParam) {
    this.hierTable.performByActionType(updateType, context, extraParam);
};

/**
 * So user is easy to switch between the Button / Link by just set the defaultControlType
 * @param  {[type]} updateType [description]
 * @param  {[type]} mInfo      [description]
 * @return {[type]}            [description]
 */
fin.rc.hier.BaseUpdatePanel.prototype.createControlForAction = function(updateType, mInfo, manualType) {
    var ret;
    var type = this.getDefaultControlType();
    if (manualType)
        type = manualType;

    if ( type == 'Link') {
        ret =  this.createLinkForAction(updateType, mInfo);
    } else if ( type == 'Button') {
        ret = this.createButtonForAction(updateType, mInfo);
    } else {
        throw new Error('Now only support Button and Link for the Action Control');
    }
    if (ret) {
        this.setControlForAction(updateType,ret);
    }

    //?? 
    ret.setEnabled(false);
    return ret;
};

fin.rc.hier.BaseUpdatePanel.prototype.createButtonForAction = function(updateType, mInfo) {
    var mDefaultParam = fin.rc.hier.DefaultUpdatePanelSetting[ updateType ];
    var mParam = $.extend({}, mDefaultParam, mInfo);

    var button = new sap.m.Button({
        text: mParam.text    
    });

    //??now just let user overwrite some function to provide the extra information, later can support both method 
    button.attachPress(updateType,  this.onButtonForActionPressed, this);
    return button;
};

/**
 * So later if need the icon then we just change this function
 * @return {[type]} [description]
 */

/**
 * ??later need considerate provide the default text and icon if not provide,
 * [createLinkForAction description]
 * @param  {[type]} updateType [description]
 * @param  {[type]} mInfo      one map with following information:
 *                           {
 *                               text: the text, if need use use the i18n binding,then can provide text like {i18n>KKK}
 *                               icon: the icon url 
 *                  -------------following three action all choose the format like attachXX event, now support two scenario:
 *                  only the function,  or an array, first is function, then second is listener             
 *                  
 *                               confirmFunction: the function will called before do the action, for example for delete can ask user first confirm 
 *                                                only when return 'true' will do the action
 *                               pressFunction:   the function will called if user press the link, if not provided,then just choose the default action 
 *                               
 *                               interactionFunction: the function which will ask user to provide extra information, used for change parent/inser node 
 *                                               if return null means user cancel the operation, otherwise the return value will be used to call the action
 *                           }
 * @return {[type]}            [description]
 */
fin.rc.hier.BaseUpdatePanel.prototype.createLinkForAction = function(updateType, mInfo) {
    
    var mDefaultParam = fin.rc.hier.DefaultUpdatePanelSetting[ updateType ];
    var mParam = $.extend({}, mDefaultParam, mInfo);

    var link = new sap.m.Link({
        text: mParam.text    
    });

    //??now just let user overwrite some function to provide the extra information, later can support both method 
    link.attachPress(updateType,  this.onLinkForActionPressed, this);
    return link;
};

/**
 * Just call the base function. Also the sub-class can overwrite this function if need pre or post hook
 * @param  {[type]} evt        [description]
 * @param  {[type]} updateType [description]
 * @return {[type]}            [description]
 */
fin.rc.hier.BaseUpdatePanel.prototype.onButtonForActionPressed = function(evt, updateType) {
    return this.onControlForActionPressed(evt, updateType);
};

fin.rc.hier.BaseUpdatePanel.prototype.onLinkForActionPressed = function(evt, updateType) {
    return this.onControlForActionPressed(evt, updateType);
};

fin.rc.hier.BaseUpdatePanel.prototype.onControlForActionPressed = function(evt, updateType) {
    //for the simple, just call the 
    var extraParam = null;
    var context;
    var userCancel = false;

    //??now not considerte user pass his own funciton,
    if (updateType == fin.rc.hier.UpdateType.ChangeParent) {
        context = this.hierTable.getContextFromSelection();
        extraParam = this.onChangeParentCalled.call( this, context);
        if (!extraParam)
            userCancel = true;
    } else if (updateType == fin.rc.hier.UpdateType.InsertNode) {
        context = this.hierTable.getContextFromSelection();
        extraParam = this.onInserNodeCalled.call( this, context);
        if (!extraParam)
            userCancel = true;
    }

    if (!userCancel) {
        this.performByActionType(updateType, context, extraParam);
    }
};


/**!! the following function need implemented by user, if used in default overwrite mode 
 * [onChangeParentCalled description]
 * The return value see fin.rc.hier.HierTable.prototype.performChangeParent.
 * @param  {[type]}  The context for which get from the HierTable selection, can ensure not null
 * @return {[type]}     [description]
 */
fin.rc.hier.BaseUpdatePanel.prototype.onChangeParentCalled = function(context) {
    //as user must overwrite this function, so here throw exception to ensure user done it.
    throw new Error("User must overwrite onChangeParentCalled function()");
};


/**
 * The return value see fin.rc.hier.HierTable.prototype.performInsertNode.
 * @param  {[type]} context [description]
 * @return {[type]}         [description]
 */
fin.rc.hier.BaseUpdatePanel.prototype.onInserNodeCalled = function(context) {
    throw new Error("User must overwrite onInserNodeCalled function()");
};

// onInserNodeCalled 
// onChangeParentCalled