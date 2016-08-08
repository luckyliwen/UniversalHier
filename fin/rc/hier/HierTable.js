jQuery.sap.declare("fin.rc.hier.HierTable");
jQuery.sap.require("sap.ui.table.TreeTable");

//??not good, 
fin = {};
fin.rc={};
fin.rc.hier =  {};

//internal dependency
jQuery.sap.require("fin.rc.hier.Util");
jQuery.sap.require("fin.rc.hier.UpdateType");
jQuery.sap.require("fin.rc.hier.UpdateAction");
jQuery.sap.require("fin.rc.hier.ODataActionMng");
jQuery.sap.require("fin.rc.hier.UpdateMergeMng");
jQuery.sap.require("fin.rc.hier.UpdateMng");
jQuery.sap.require("fin.rc.hier.HierModel");
jQuery.sap.require("fin.rc.hier.HierTableHelper");

sap.ui.table.TreeTable.extend("fin.rc.hier.HierTable", { metadata : {

        publicMethods : [
            "submitChange", "cancelChange"
        ],

        // ---- control specific ----
        library : "fin.rc.hier",
        properties : {
            //the funnction import name used to get the hier node
            // funcName:  {type : "string", defaultValue : 'GetHierarchyNodes'},

            // odataModel:  {type : "sap.ui.model.odata.ODataModel", defaultValue : null}
            //here the oData use oData so it will create name setODataInfo, the OData will have same name for other OData
            'oDataInfo':  {type : "object", group : "Data", defaultValue : null},
            'editable':  {type : "boolean", group : "Data", defaultValue : true}, 
            'hierModel':  {type : "object", group : "Data", defaultValue : null}, 
        },

        events : {
            //the change log have changed, for example done one change, or undo one change
            "changeLogChanged" : {},
        }
    },

    renderer : 'sap.ui.table.TreeTableRenderer',
});


fin.rc.hier.HierTable.prototype.setEditable = function ( flag ) {
    this.setProperty('editable', flag, true);
};

fin.rc.hier.HierTable.prototype.setODataInfo = function ( oDataInfo ) {
    this.setProperty('oDataInfo', oDataInfo, true);

    var hierModel = new fin.rc.hier.HierModel();
    this.hierModel = hierModel;
    this.setHierModel(hierModel);

    console.debug('hierModel', hierModel.getMetadata());

    hierModel.setOdataInfo(oDataInfo);
    hierModel.setHierTable(this);

    this.createUpdateMng();

    return this;
};

/**
 * This function will create the default columns, and some default settings
 * @return {[type]} [description]
 */
fin.rc.hier.HierTable.prototype.applyDefaultSetting = function () {
   //for the columns, only if usr not set then will set
   if (this.getColumns.length === 0) {
        var aCol = fin.rc.hier.HierTableHelper.createDefaultColumns();
        for (var i = 0; i < aCol.length; i++) {
            var col = aCol[ i ] ; 
            this.addColumn(col);
        }
   } 
   this.setSelectionMode( sap.ui.table.SelectionMode.Single );
   this.setAllowColumnReordering (true);
   this.setExpandFirstLevel(true);
   this.setVisibleRowCount( 50); //??
};        

fin.rc.hier.HierTable.prototype.createUpdateMng = function () {
    this.updateMng = new fin.rc.hier.UpdateMng(this, this.hierModel);
};

fin.rc.hier.HierTable.prototype.getUpdateMng = function ( context ) {
    return this.updateMng;
};

fin.rc.hier.HierTable.prototype.performMoveUp = function ( context ) {
    this.performByActionType( fin.rc.hier.UpdateType.MoveUp, context);
};

fin.rc.hier.HierTable.prototype.performMoveDown = function ( context ) {
    this.performByActionType( fin.rc.hier.UpdateType.MoveDown, context);
};

fin.rc.hier.HierTable.prototype.performMoveHead = function ( context ) {
    this.performByActionType( fin.rc.hier.UpdateType.MoveHead, context);
};

fin.rc.hier.HierTable.prototype.performMoveTail = function ( context ) {
    this.performByActionType( fin.rc.hier.UpdateType.MoveTail, context);
};

fin.rc.hier.HierTable.prototype.performDelete = function ( context ) {
    this.performByActionType(fin.rc.hier.UpdateType.Delete);
};

/**
 * [performchangeProperty description]
 * @param  {[type]} context [description]
 * @param  {[type]} mProp   The new property map, so can easily change multiple property one time like 
 *                {
 *                    Name: 'New Prop'
 *                }
 * @return {[type]}         [description]
 */
fin.rc.hier.HierTable.prototype.performChangeProperty = function ( context , mProp) {
    this.performByActionType(fin.rc.hier.UpdateType.ChangeProperty, context, mProp);
};


/**
 * As later it may be provide several method to change parent, for example just provide the parentId, or 
 * provide the parent node context or by drag and drop
 *     ( if by select from a TreeTable/Tree, then it is easy to provide)
 * !!here use a map style is more flexible.  One more reason is that just from the parentId it is very slow to found out the real position
 *
 *  
 * 
 * @param  {[type]} context [description]
 * @parem  destinationInfor   a map contain the detail parent informaiton, 
 *       --------------the parent,  either parentId  or parentContext
 *              destinationInfor.parentId  :  the parent node
 *              destinationInfor.parentContext:  the context of parent node
 *
 *               
 *              destinationInfor.position   : the index where want to put the node. 
 *                         0  means to the head,   
 *                         xx  (>0  and <last one)  means user define position
  *                         
 *                        if omit then put to the end of parent node.  
 *                     One example if the destination parent has 3 child,and you want to put it to the last, 
 *                     then the position can be: 2 or omit it
 * 
 * @return {[type]}         [description]
 */
fin.rc.hier.HierTable.prototype.performChangeParent = function ( context, destinationInfor ) {
    this.performByActionType(fin.rc.hier.UpdateType.ChangeParent, context, destinationInfor);
};


/**
 * Insert a new node to the parent
 * @param  {[type]} context          [description]
 * @param  {[type]} destinationInfor The parent information, format see  fin.rc.hier.HierTable.prototype.performchangeParent
 * @param  {[type]} nodeEntry        The new node entry, as we need support different secenario, so here just use an entry, caller need ensuere it have 
 *                                   enough data.
 * @return {[type]}                  [description]
 */


/**
 * In order to provide the uniform foramt, now all the extra information will just put inside one param 
 * @param  {[type]} context   [description]
 * @param  {[type]} mInfor : contain both the destination and extra information, the destionation is same as the performChangeParent
 * 
 *             ??so now   
 * 
 *              mInfor.position   : the index where want to put the node. 
 *                         0  means to the head,   
 *                         xx  (>0  and <last one)  means user define position
 *                         
 *                        if omit then put to the end of parent node.  
 *                     One example if the destination parent has 3 child,and you want to put it to the last, 
 *                     then the position can be: 2 or omit it
 *
 *             mInfo.nodeEntry : the new node entry 
 * 
 * @return {[type]}           [description]
 */
fin.rc.hier.HierTable.prototype.performInsertNode = function ( context, mInfor ) {
    context = this._getContextFromSelectionIfNotProvided(context);
    //as want to unify the interface for UpdateMng so here combine two parameter together

    this.updateMng.doUpdate(fin.rc.hier.UpdateType.InsertNode, context, mInfor);
};


fin.rc.hier.HierTable.prototype.performSubmit = function ( context ) {
    this.updateMng.submit();
};

fin.rc.hier.HierTable.prototype.performCancel = function ( context ) {
    this.updateMng.cancel();
};


/**
 * Undo action from the stack
 * @param  {[type]} steps -- if omit then means just undo the last steps
 * @return {[type]}       [description]
 */
fin.rc.hier.HierTable.prototype.performUndo = function(steps) {
    this.updateMng.undoUnpdate(steps);
};

fin.rc.hier.HierTable.prototype.getContextFromSelection = function() {
    return this._getContextFromSelectionIfNotProvided();
};

/**
 * return the context from selection if not provide by user
 */
fin.rc.hier.HierTable.prototype._getContextFromSelectionIfNotProvided = function(context) {
    if (!context) {
        var selIdx = this.getSelectedIndex();
        if (selIdx != -1) {
            context = this.getContextByIndex(selIdx);
            if ( !context) {
                jQuery.sap.assert(false, "return null from getContextByIndex ,index is " + selIdx);
            }
        } else {
            jQuery.sap.assert(false, "getSelectedIndex return -1, should not called from UI");
        }
    }
    return context;
};

fin.rc.hier.HierTable.prototype.performByActionType = function ( updateType, context, extraParam ) {
    //now for the Undo, Submit, Cancel no need the context 
    switch (updateType) {
        case fin.rc.hier.UpdateType.Undo:
            return this.performUndo();
        case fin.rc.hier.UpdateType.Submit:
            return this.performSubmit();
        case fin.rc.hier.UpdateType.Cancel:
            return this.performCancel();
        default: 
            //so for the others just fall down
            context = this._getContextFromSelectionIfNotProvided(context);
            this.updateMng.doUpdate(updateType, context, extraParam);    
    }   
};

/**
 * Return the change log as an array
 * @return {[type]} [description]
 */
fin.rc.hier.HierTable.prototype.getChangeLog = function () {
    return this.updateMng.getChangeLog();
};

/**
 * Initialization of the HierTrable control
 * @private
 */
fin.rc.hier.HierTable.prototype.init = function() {
    sap.ui.table.TreeTable.prototype.init.apply(this, arguments);
};


/**
 * Termination of the Table control
 * @private
*/
fin.rc.hier.HierTable.prototype.exit = function() {
    sap.ui.table.TreeTable.prototype.exit.apply(this, arguments);  
};


/**
 * Just check for few action whether it is possible. 
 * !!Here only check from the UI 
 * @param  {[type]} context [description]
 * @param  {[type]} aAction [description]
 * @return {[type]}         [description]
 */
fin.rc.hier.HierTable.prototype.checkActionStatus = function(context) {
    return this.updateMng.checkActionStatus(context);
};

fin.rc.hier.HierTable.prototype.checkCanUndo = function(context) {
    return this.updateMng.checkCanUndo(context);
};

fin.rc.hier.HierTable.prototype.checkCanCancel = function(context) {
    return this.updateMng.checkCanCancel(context);
};

fin.rc.hier.HierTable.prototype.checkCanSubmit = function(context) {
    return this.updateMng.checkCanSubmit(context);
};

/**
 * When move up is possible, it means the move head also possible
 * @return {[type]} [description]
 */
fin.rc.hier.HierTable.prototype.checkCanMoveUp = function(context) {
    return this.updateMng.checkCanMoveUp(context);
};

/**
 * When move down is possible, it means the move tail also possible
 * @return {[type]} [description]
 */
fin.rc.hier.HierTable.prototype.checkCanMoveDown = function(context) {
    return this.updateMng.checkCanMoveDown(context);
};
