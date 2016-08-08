/**
 * This class will be responsible for merge the user action
 * @type {Object}
 */
jQuery.sap.declare("fin.rc.hier.UpdateMergeMng");


/**
 * The internal class, which contain information for the action done for one node
 * @param {[type]} nodeId [description]
 */
fin.rc.hier.NodeAction = function (nodeId) {
    this.nodeId = nodeId;
    this.init();
};

fin.rc.hier.NodeAction.prototype.init = function() {
    //set some default 
    this.chgPropAction = null;
    this.chgParentAction = null;
    this.chgPositionAction = null;  //this action will be added when analyze the position
    this.insertAction = null;
    this.delAction = null;  //save the del action so later can use it to create odata command
};

/**
 * Accoding to the new action,update the current actions
 * @param  {[type]} updateAction [description]
 * @return {[type]}              [description]
 */
fin.rc.hier.NodeAction.prototype.merge = function(updateAction) {
    switch (updateAction.type) {
        case fin.rc.hier.UpdateType.MoveUp:   //fall down
        case fin.rc.hier.UpdateType.MoveDown: //fall down
        case fin.rc.hier.UpdateType.MoveHead: //fall down
        case fin.rc.hier.UpdateType.MoveTail: //fall down
            //?? for move, no need do anything
            // this.bChgPosition = true;
            break;    
        case fin.rc.hier.UpdateType.Delete: 
            //when meet delete , if is normal node, then all the old action no meaning, 
            //                   for the inserted node, it means no need sending anyting to backend 
            if (this.insertAction) {
                this.init();    
            } else {
                this.delAction = updateAction;    
            }
            break;    
        case fin.rc.hier.UpdateType.InsertNode: 
            //it should be the first and only one action
            jQuery.sap.assert( this.insertAction ===null, "One node can be insert only once!");
            this.insertAction = updateAction;
            break;    
        case fin.rc.hier.UpdateType.ChangeProperty: 
            if (this.chgPropAction)
                this.chgPropAction.merge(updateAction);
            else
                this.chgPropAction = updateAction;
            break;    
        case fin.rc.hier.UpdateType.ChangeParent:
            //even the ChangeParent happens multiple times, only need the last time
            this.chgParentAction = updateAction;
            // this.bChgPosition = false; //??
            break;    
        default:
            break;
    }
};

/**
 * Return the merged action
 * @return {[type]} an array
 */
fin.rc.hier.NodeAction.prototype.getMergedActions = function() {
    var arr = [];

    if (this.chgPropAction)
        arr.push(this.chgPropAction);

    if (this.chgParentAction)
        arr.push(this.chgParentAction);

    if (this.chgPositionAction)
        arr.push(this.chgPositionAction);

    if (this.insertAction)
        arr.push(this.insertAction);

    if (this.delAction)
        arr.push(this.delAction);

    return arr; 
};

fin.rc.hier.UpdateMergeMng = function(hierModel)  {
    this.hierModel = hierModel;

    //?? //use the nodeId as key, so it will contain all the action for one node
    // this.mNodeAction = {};
};


/*fin.rc.hier.UpdateMergeMng.prototype.reset = function() { 
    this.mNodeAction = {};
};
*/
/**
 * Smartly merge the action according to following logic:
 *   1:  From the action queue take out action, by the node id can merge them by:
 *     A:  Simple action like ChangeProperty only need save the first time old value and last time new value. ( so finally can check and ensure new value != old vlaue)
 *     B:  Meet one Delete action then means previous all action can be 'delete'
 *     C:  For all the Move action, no need care, as finally it will check and update the postion
 *     D:  For the 'ChangeParent', only the last need take care
 *     D:  For the InsertNode 
 *
 *  2:  After all the action be merged, then need check the position in the big tree, which may create  new action
 * 
 * @return {[type]} [description]
 */
fin.rc.hier.UpdateMergeMng.prototype.mergeActions = function(aAction) {
    var i, action,nodeAction; 

    var mNodeAction={};

    for (i = 0; i < aAction.length; i++) {
        action = aAction[i];

        if (!(action.nodeId in mNodeAction) ) {
            nodeAction = new fin.rc.hier.NodeAction(action.nodeId);
            mNodeAction[ action.nodeId] = nodeAction;
        } else {
            nodeAction = mNodeAction[ action.nodeId];    
        }
        nodeAction.merge(action);
    }

    //now after the action merge, then need check whether need update the postion: whether explicit or implicit
    this._doPositionUpdate(mNodeAction);

    //now create the new merged action queue, include the new generatd positon update action 
    var aMergedAction = [];
    for (var nodeId in mNodeAction) {
        nodeAction = mNodeAction[ nodeId ];
        var mergedActions = nodeAction.getMergedActions();
        aMergedAction = aMergedAction.concat(mergedActions);
    }


    //then from the mergedAction to create the OData command
    var aODataAction=[];
    for (i = 0; i < aMergedAction.length; i++) {
        action = aMergedAction[i];
        var cmd = action.createODataCommand();
        if (cmd)
            aODataAction.push(); 
    }

    return aODataAction;
};


/**
 * ?? now don't have better solution about how to do it smartly, leave to CO team to implement it
 * @return {[type]} [description]
 */
fin.rc.hier.UpdateMergeMng.prototype._doPositionUpdate = function(mNodeAction) {
    //??
};



