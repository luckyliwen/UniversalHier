/**
 * Define the common update type for the universal hierarchal consumer.  Don't confuse it with the action will send to the backend
 * @type {Object}
 */
jQuery.sap.declare("fin.rc.hier.UpdateMng");

/**
 * Update manager class
 */
fin.rc.hier.UpdateMng = function(hierTable, hierModel) {
    this.hierTable = hierTable;
    this.hierModel = hierModel;

    //the update action queue
    this.aAction = [];

    //??late can create merge mng for feasible
    var dftMergeMng = new fin.rc.hier.UpdateMergeMng(this.hierModel);
    this.setMergeMng( dftMergeMng );
};

/**
 * Set the merge mng, so later can easily change the merge mng
 * @param {[type]} mergeMng [description]
 */
fin.rc.hier.UpdateMng.prototype.setMergeMng = function(mergeMng) {
    this.mergeMng = mergeMng;
};

fin.rc.hier.UpdateMng.prototype.getActionArray = function() {
    return this.aAction;
};

//??later considerate add the notifaction for the action, now just get it dynamic
fin.rc.hier.UpdateMng.prototype.getChangeLog = function() {
    var arr = [];
    for (var i=0; i< this.aAction.length; i++) {
        var action = this.aAction[i];
        arr.push( action.getDescription());
    }
    return arr;
};

fin.rc.hier.UpdateMng.prototype.doUpdate = function(updateType, context, extraParam) {
    if (!context) {
        throw new Error("In UpdateMng the context is null");
    }

    var action = new fin.rc.hier.UpdateAction(this.hierModel, updateType, context, extraParam);
    this.aAction.push(action);

    action.do();

    this.notifyChangeLogChanged(updateType);
};

fin.rc.hier.UpdateMng.prototype.undoUnpdate = function(steps) {
    steps = steps || 1;
    if (steps > this.aAction.lengh)
        steps = this.aAction.length;

    for (var i = 0; i < steps; i++) {
        var action = this.aAction.pop();
        if (action)
            action.undo();
    }

    this.notifyChangeLogChanged(fin.rc.hier.UpdateType.Undo, steps);
};

/**
 * action:  which action trigger the event, it choose value from fin.rc.hier.UpdateType
 * @param  {[type]} updateType [description]
 * @return {[type]}            [description]
 */
fin.rc.hier.UpdateMng.prototype.notifyChangeLogChanged = function(updateType, extraParam) {
    var desc = "";
    switch (updateType) {
        case fin.rc.hier.UpdateType.Undo: 
            desc = 'Undo';
            if (extraParam == 1)
                desc += ' one step';
            else
                desc += extraParam + ' steps';
            break;
        case fin.rc.hier.UpdateType.Cancel:
            desc = 'Cancel all previous actions';
            break;
        case fin.rc.hier.UpdateType.Submit:
            desc = 'Submit all changes';
            break; 
        default:
            //for others just get from the action 
            var idx = this.aAction.length-1;
            jQuery.sap.assert(idx>=0);
            desc = this.aAction[idx].getDescription();
            break;        
    }
     
    var param = {
        'actionType': updateType,  //just for last one action
        'actionCount': this.aAction.length,   //so from this can know whether can: undo, cancel, submit
        //the last action description, for the normal action just choose the action.getDescription(), for the undo, cancel, 
        //submit now just create manually, so it can't undo
        'actionDescription': desc,
    };
    this.hierTable.fireChangeLogChanged(param);
};

/**
 * Now for the cancel just for all the action do the 'undo'
 * @return {[type]} [description]
 */
fin.rc.hier.UpdateMng.prototype.cancel = function() {
    for (var i=this.aAction.length-1; i>=0; i--) {
        var action = this.aAction[i];

        action.undo();
    }

    //now have done all, just clear the array
    //!! just reset the length will clean up the array
    this.aAction.length = 0;

    this.notifyChangeLogChanged(fin.rc.hier.UpdateType.Cancel);
};


fin.rc.hier.UpdateMng.prototype.submit = function() {
    var aODataAction = this.mergeMng.mergeActions(this.aAction);

    //??know to know whether update successful or fail 
    this.hierModel.performODataUpdate(aODataAction);

    //!!just reset the acton queue
    this.aAction.length = 0;

    this.notifyChangeLogChanged(fin.rc.hier.UpdateType.Submit);
};

fin.rc.hier.UpdateMng.prototype.toString = function() {
    var ret=[];
    for (var i = 0; i < this.aAction.length; i++) {
        var action = this.aAction[i];
        ret.push(action.toString());
    }
    return "Total " + this.aAction.length + ' actions \r\n' + ret.join('\r\n');
};


/**
 * [checkActionPermit description]
 * @param  {[type]} context:  Means the node for that context, if null then means now not select any node
 *                            ( As the undo/cancel/submit no need choose some node)
 * * @return {[type]}         [description]
 * *    
    Return an map the key is the each action in fin.rc.hier.UpdateType,  the value is true/false
    Delete: 'Delete',
    MoveUp: 'MoveUp',
    MoveDown: 'MoveDown',
    MoveHead:  'MoveHead',
    MoveTail:  'MoveTail',
    ChangeProperty: 'ChangeProperty',
    ChangeParent: 'ChangeParent',
    InsertNode:  'InsertNode', 
    Undo: 'Undo', 
    Submit: 'Submit',  
    Cancel: 'Cancel',
*/
 
fin.rc.hier.UpdateMng.prototype.checkActionStatus = function(context) {
    var mStatus = {
        Delete        : false,
        MoveUp        : false,
        MoveDown      : false,
        MoveHead      :  false,
        MoveTail      :  false,
        ChangeProperty: false,
        ChangeParent  : false,
        InsertNode    :  false, 
        Undo          : false, 
        Submit        : false,  
        Cancel        : false,
    };

    if (context) {
        var position = this.hierModel.getPositionFromContextOrPath(context);
        var parentEntry = this.hierModel.getParentEntryFromContextOrPath(context);
        
        //now only the Move will change, for others no need check 
        var childrenCount = parentEntry.children.length;

        if (childrenCount>1) {
            if ( position > 0 ) {
                mStatus.MoveUp = mStatus.MoveHead =  true;
            }

            if ( position < (childrenCount-1) ) {
                mStatus.MoveDown = mStatus.MoveTail =  true; 
            }
        }

        //
        mStatus.Delete = true;
        mStatus.InsertNode = true;
        mStatus.ChangeParent = true;
        mStatus.ChangeProperty = true;
        
    }

    //for the Undo, just need have action 
    if (this.aAction.length) {
        mStatus.Undo = true;
        mStatus.Submit = true;
        mStatus.Cancel = true;
    }

    //for the submit, undo, cancel need check the current 

    return mStatus;      
};

/**
 * Just some shortcut for the consumer easy coding
 * @return {[type]} [description]
 */
fin.rc.hier.UpdateMng.prototype.checkCanUndo = function() {
    return this.aAction.length > 0;
};

fin.rc.hier.UpdateMng.prototype.checkCanCancel = function() {
    return this.aAction.length > 0;
};

fin.rc.hier.UpdateMng.prototype.checkCanSubmit = function() {
    return this.aAction.length > 0;
};

/**
 * When move up is possible, it means the move head also possible
 * @return {[type]} [description]
 */
fin.rc.hier.UpdateMng.prototype.checkCanMoveUp = function(context) {
    if (context) {
        var position = this.hierModel.getPositionFromContextOrPath(context);
        var parentEntry = this.hierModel.getParentEntryFromContextOrPath(context);
        
        //now only the Move will change, for others no need check 
        var childrenCount = parentEntry.children.length;

        if (childrenCount>1) {
             if ( position < (childrenCount-1)) {
                return true;
            }
        }
    }
    return false;
};

/**
 * When move down is possible, it means the move tail also possible
 * @return {[type]} [description]
 */
fin.rc.hier.UpdateMng.prototype.checkCanMoveDown = function(context) {
    if (context) {
        var position = this.hierModel.getPositionFromContextOrPath(context);
        var parentEntry = this.hierModel.getParentEntryFromContextOrPath(context);
        
        //now only the Move will change, for others no need check 
        var childrenCount = parentEntry.children.length;

        if (childrenCount>1) {
            if ( position > 0 ) {
                return true;
            }
        }
    }
    return false;
};
