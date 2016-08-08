jQuery.sap.declare("fin.rc.hier.UpdateAction");

/**
 * Update action is corresponding to one user action, it internal can be split to several backend action
 * 
 * Now use a smart way to do the undo:
 *     Just change the actonType to the opposite, so if previous is the MoveUp,then just do another MoveDown then it can restore
 *     So in order to resue some logic, here some property must keep very clear:
 *
 *     oldPosition:  the position of the entry before do the action. 
 *     newPosition:  the postion after the entry have done the action ( for the move)
 */
fin.rc.hier.UpdateAction = function(hierModel, updateType, context, extraParam) {
    this.hierModel = hierModel;
    this.type = updateType;
    this.context = context;

    var mKeyPropName = hierModel.getKeyPropName();
    this.strNodeId =  mKeyPropName.NodeId;
    this.strParentId = mKeyPropName.ParentId;
    this.strSeqNumber = mKeyPropName.SeqNumber;

    //get the necessary data such as the node id
    this._getNecessaryData();

    //for some 
    if (extraParam) {
        //just save temporty, later will handle by different process
        this.extraParam = extraParam;
    }
    // this.processExtraParam(extraParam);

    //first do the action, so it will create necessary information for the description
    this._createDescription();
};

/**
 * Just one short type to easily compare the action type
 * @param  {[type]} type [description]
 * @return {[type]}      [description]
 */
fin.rc.hier.UpdateAction.prototype.equalType = function(type) {
    return this.type === type;
};


/**
 * Some interface used by outside
 * @param  {[type]} type [description]
 * @return {[type]}      [description]
 */
fin.rc.hier.UpdateAction.prototype.getNodeId = function(type) {
    return this.nodeId;
};

fin.rc.hier.UpdateAction.prototype.getType = function(type) {
    return this.type;
};


/**
 * [doAction description]
 * @return {[type]} [description]
 */
fin.rc.hier.UpdateAction.prototype.do = function() {
    switch (this.type) {
        case fin.rc.hier.UpdateType.MoveUp:  
            this.newPosition = this.oldPosition -1;
            this._doMoveToPosition();
            break;
        case fin.rc.hier.UpdateType.MoveDown: 
            this.newPosition = this.oldPosition + 1;
            this._doMoveToPosition();
            break;
        case fin.rc.hier.UpdateType.MoveHead: 
            this.newPosition = 0;
            this._doMoveToPosition();
            break;
        case fin.rc.hier.UpdateType.MoveTail:  
            this.newPosition = this.parentEntry.children.length -1 ;
            this._doMoveToPosition();
            break;
        case  fin.rc.hier.UpdateType.Delete:
            this.deletedNode = this.parentEntry.children.splice(  this.oldPosition, 1 )[0];
            break;   
        case  fin.rc.hier.UpdateType.ChangeParent:
            this._prepareForChangeParent();
            this._doChangeParent();
            //no need so can delete now 
            delete this.newParentEntry;
            break;
        case  fin.rc.hier.UpdateType.ChangeProperty:
            this._doChangeProperty();
            break;
        case  fin.rc.hier.UpdateType.InsertNode:
            this._doInsertNode();
            break;
        default:
            alert('Noe implemented now');
            return;
            // break;
    }

    this.hierModel.notifyDataChanged();

    //now have enough information,so can create the description easily
    this._createDescription();
 
    delete this.parentEntry;
    delete this.extraParam;
};


/**
 * undo the action
 * @return {[type]} [description]
 */
fin.rc.hier.UpdateAction.prototype.undo = function() {

    switch (this.type) {
        case fin.rc.hier.UpdateType.MoveUp:  //fall down
        case fin.rc.hier.UpdateType.MoveDown: //fall down
        case fin.rc.hier.UpdateType.MoveHead: //fall down
        case fin.rc.hier.UpdateType.MoveTail:  //fall down
            //need re get the parent
            this.parentEntry = this._getParentEntry();
            this._switchOldNewPosition();
            this._doMoveToPosition();
            break;
        case  fin.rc.hier.UpdateType.Delete:
            this.parentEntry = this._getParentEntry();
            this.parentEntry.children.splice(this.oldPosition,0, this.deletedNode);
            delete this.deletedNode;
            break;   
        case  fin.rc.hier.UpdateType.ChangeParent:
            this._prepareForChangeParent_forUndo();
            this._doChangeParent();

            //no need so can delete now 
            //??this.newParentEntry = null;
            break;
        case  fin.rc.hier.UpdateType.ChangeProperty:
            this._doChangeProperty_undo();
            delete this.mProp;
            break;
        case  fin.rc.hier.UpdateType.InsertNode:
            this._doInsertNode_undo();            
            break;
        default:
            jQuery.sap.assert(false, 'Not handle for type ' + type);
            break;
    }

    this.hierModel.notifyDataChanged();

    //??this.parentEntry = null;
};

fin.rc.hier.UpdateAction.prototype.getDescription = function() {
    return this.description;
};

/**
 * For debug 
 * @return {[type]} [description]
 */
fin.rc.hier.UpdateAction.prototype.toString = function() {
    return this.getDescription();
};

/**
 * Merge the action with another UpdateAction. For example for the ChangeProperty, can combine all action together
 * @param  {[type]} action another UpdateAction
 * @return {[type]}        [description]
 */
fin.rc.hier.UpdateAction.prototype.merge = function(newAction) {
    function mergeChangeProperty(oldAction, newAction) {
        for (var key in newAction.mProp) {
            var arr = newAction.mProp[ key ];
            if (key in oldAction.mProp) {
                //change twice, just need save the changed to value of last time 
                //as in the do: 0 is the old value, 1 is the new value, so only need change the 1
                oldAction.mProp[key][1] = newAction.mProp[key][1];
            } else {
                oldAction.mProp[key] = newAction.mProp[key];                    
            }
        }
    }

    switch (this.type) {
        case fin.rc.hier.UpdateType.MoveUp: 
        case fin.rc.hier.UpdateType.MoveDown: 
        case fin.rc.hier.UpdateType.MoveHead: 
        case fin.rc.hier.UpdateType.MoveTail: 
            //for all the move action, no need do anything, just at the last time check how many nodes need chagne postion
            break;    
        case fin.rc.hier.UpdateType.Delete: 
            jQuery.sap.assert(false, "The Delete action should delete other action automatically");
            break;    
        case fin.rc.hier.UpdateType.InsertNode: 
            break;    
        case fin.rc.hier.UpdateType.ChangeProperty: 
            mergeChangeProperty(this, newAction);
            break;    
        case fin.rc.hier.UpdateType.ChangeParent:
            //?? 
            break;    
        default:
            jQuery.sap.assert(false, 'Not handle for type ' + type);
            break;
    }
};

/**
 * According to the backend interface, generate the corresonding odata action
 * @return null if no need do anything,
 *         else the map contain needed information
 */
fin.rc.hier.UpdateAction.prototype.createODataCommand = function() {

    var mAction = {
        nodeId: this.nodeId,
        //so later can check whether need create command or not, mainly used for ChangeProperty: when old==new, then can omit it
        actionType: ""
    };

    //as so many need the entry, so here need get the entry
    var entry = this._getEntry();

    switch (this.type) {
        case fin.rc.hier.UpdateType.MoveUp:   //fall down
        case fin.rc.hier.UpdateType.MoveDown: //fall down
        case fin.rc.hier.UpdateType.MoveHead: //fall down
        case fin.rc.hier.UpdateType.MoveTail: //fall down
            mAction.actionType = fin.rc.hier.ODataActionType.ChgSeq ;
            mAction.parentId = entry[  this.strParentId];
            mAction.seqNumber = entry[  this.strSeqNumber];
            break;    
        case fin.rc.hier.UpdateType.Delete: 
            //??one -->two
            mAction.actionType = fin.rc.hier.ODataActionType.DelNode ;            
            break;    
        case fin.rc.hier.UpdateType.InsertNode: 
            mAction.actionType = fin.rc.hier.ODataActionType.NewNode;
            mAction.parentId = entry[  this.strParentId];
            mAction.seqNumber = entry[  this.strSeqNumber];
            break;    
        case fin.rc.hier.UpdateType.ChangeProperty: 
            mAction.newValue = {};

            for (var key in this.mProp) {
                var arr = this.mProp[key];
                if ( arr[0] != arr[1]) {
                    mAction.newValue[key] = arr[1];
                    //At least have one property changes, so can set type here
                    mAction.actionType = fin.rc.hier.ODataActionType.ChgFields ;
                } 
            }
            break;    
        case fin.rc.hier.UpdateType.ChangeParent:
            mAction.actionType = fin.rc.hier.ODataActionType.ChgParent ;   
            mAction.oldValue = this.oldParentId;
            mAction.newValue = this.newParentId;     
            break;    
        default:
            jQuery.sap.assert(false, 'Not handle for type ' + type);
            break;
    }

    if (mAction.actionType === "")
        return null;
    else 
        return mAction;
};
 


fin.rc.hier.UpdateAction.prototype._getNecessaryData = function() {
    var path = this.context.getPath();

    this.oldPosition = this.hierModel.getPositionFromContextOrPath ( this.context );

    //??for simple just use this way to get the nodeId, 
    this.nodeId = this.context.getProperty( this.strNodeId );

    if (this.type != fin.rc.hier.UpdateType.ChangeProperty) {
        this.parentEntry = this._getParentEntry(); 
    } 
};

/**
 * Shortcut for get the parent entry
 * @param  {[type]} pathOrContext [description]
 * @return {[type]}               [description]
 */
fin.rc.hier.UpdateAction.prototype._getParentEntry = function (pathOrContext) {
    pathOrContext = pathOrContext ||  this.context;
    return this.hierModel.getParentEntryFromContextOrPath(pathOrContext);
};

/**
 * Shortcut for get the entry
 * @param  {[type]} pathOrContext [description]
 * @return {[type]}               [description]
 */
fin.rc.hier.UpdateAction.prototype._getEntry = function (pathOrContext) {
    pathOrContext = pathOrContext ||  this.context;
    return this.hierModel.getEntryFromContextOrPath(pathOrContext);
};


//??later can create both the short and long action
fin.rc.hier.UpdateAction.prototype._createDescription = function() {
    function getDetailForChangeProperty(action) {
        var ret="";
        for (var key in action.mProp) {
            var arr = action.mProp[key];
            ret += key + ": old {" + arr[0] + "}, new {" + arr[1] + "}";
        }
        return ret;
    }
    
    function getDetailForInsertNode(action) {
        var ret="";
        //??
        return ret;
    }

    //??later need support multiple language and adjust 
    var desc = "Node [" + this.nodeId + "] ";
    switch (this.type) {
        case fin.rc.hier.UpdateType.MoveUp: 
            desc += 'Move up';
            break;
        case fin.rc.hier.UpdateType.MoveDown: 
            desc += 'Move down';
            break;    
        case fin.rc.hier.UpdateType.MoveHead: 
            desc += 'Move to head';
            break;    
        case fin.rc.hier.UpdateType.MoveTail: 
            desc += 'Move to tail';
            break;    
        case fin.rc.hier.UpdateType.Delete: 
            desc += 'Delete';
            break;    
        case fin.rc.hier.UpdateType.InsertNode: 
            desc += 'Insert node. ';
            desc += getDetailForInsertNode(this);
            break;    
        case fin.rc.hier.UpdateType.ChangeParent: 
            desc += 'Change Parent: Old parentId ' + this.oldParentId + " new parentId " + this.newParentId;
            break;    
        case fin.rc.hier.UpdateType.ChangeProperty: 
            desc += 'Change Property:';
            desc += getDetailForChangeProperty(this);
            break;    
        default:
            jQuery.sap.assert(false, 'Not handle for type ' + type);
            break;
    }

    this.description = desc;
};


/**
 * This is just used for the moveHead/moveTail undo, 
 * @return {[type]} [description]
 */
fin.rc.hier.UpdateAction.prototype._doMoveToPosition = function(){
    var movingEntry = this.parentEntry.children.splice(this.oldPosition,1)[0];
    this.parentEntry.children.splice( this.newPosition,0, movingEntry);
};

/**
 * the passed in param see fin.rc.hier.HierTable.prototype.update_changeParent 
 * @return {[type]} [description]
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

 *
 *     After the parepare, following information is ready: (and will keep)
 *         newParentPath
 *         newParentId
 *         newPosition
 * 
 *         oldParentPath
 *         oldParentId  
 *         oldPosition
 *         
 *
 *       ----following just keep for tempory  ( so will be delete after the action)
 *       parentEntry ( as the other action also get this)
 *       newParentEntry
 */
fin.rc.hier.UpdateAction.prototype._prepareForChangeParent = function(){
    //first step need handle the param, as use may provide different param for change parent 
    var mDest = this.extraParam;
    
    //need just save the path so later can easily rever it 
    if (mDest.parentId) {
        var newParentPath = this.hierModel.findPathByNodeId(mDest.parentId);
        if (newParentPath === "") {
            throw new Error('In _prepareForChangeParent by parentIdId ' + mDest.parentId + " can't find the node ");
        }

        this.newParentPath = newParentPath;
        this.newParentEntry = this._getEntry(this.newParentPath);
        this.newParentId = mDest.parentId;
    } else if (mDest.parentContext){
        this.newParentPath = mDest.parentContext.getPath();
        this.newParentEntry = this._getEntry(this.newParentPath);
        this.newParentId = this.newParentEntry[ this.strNodeId ];
    } else {
        throw new Error('Provide either parentId or parentContext for update_changeParent()');
    }

    //then decide the position 
    if ( 'position' in mDest) {
        this.newPosition = mDest.position;
    } else {
        //just put to the end 
        if ( 'children' in this.newParentEntry)
            this.newPosition = this.newParentEntry.children.length;
        else 
            this.newPosition = 0;
    }

    //fill the old parentPath and id 
    this.oldParentId = this.parentEntry[ this.strNodeId];
    this.oldParentPath = this.hierModel.getParentPathFromContextOrPath(this.context);
};



/**
 * 
 * @return {[type]} [description]
 */
fin.rc.hier.UpdateAction.prototype._prepareForChangeParent_forUndo = function(){
    //first step need handle the param, as use may provide different param for change parent 

    fin.rc.hier.Util.switchProperty(this, 'oldPosition', 'newPosition');
    fin.rc.hier.Util.switchProperty(this, 'oldParentPath', 'newParentPath');
    fin.rc.hier.Util.switchProperty(this, 'oldParentId', 'newParentId');

    this.parentEntry = this._getParentEntry(this.oldParentPath);

    this.newParentEntry = this._getEntry(this.newParentPath);
};

/**
 * Do the real change parent action according to the prepared data,so can be reused when do the 'undo'
 * @return {[type]} [description]
 */
fin.rc.hier.UpdateAction.prototype._doChangeParent = function(){
    alert('Now have bug, check later');
    throw new Error('Now have bug, check later');
    //??!! need do more test here
    // here can't directly first remove from the old position, as after remove from the old position, 
    //it may affect the newParentEntry 
    //!!just for save, first get a link from old position, then do insert, then remove the old again 
    var movingEntry = this.parentEntry.children.slice(this.oldPosition, this.oldPosition + 1)[0];

    if ( ! ('children' in this.newParentEntry)) {
        //then it is the first time to add child
        this.newParentEntry.children = [];
    }

    this.newParentEntry.children.splice( this.newPosition,0, movingEntry);

    //then delete the old 
    this.parentEntry.children.splice(this.oldPosition, 1);    
};


fin.rc.hier.UpdateAction.prototype._doInsertNode_undo = function(){
    //just delete it enough
    var parentEntry = this._getEntry();

    parentEntry.children.splice(this.newPosition, 1);
};

/**
 * Save the old and new property, so latr can easily revert them
 * @return {[type]} [description]
 */
fin.rc.hier.UpdateAction.prototype._doInsertNode = function(){
    //as for insertNode the parent is itself, so just need get itself
    var parentEntry = this._getEntry();

    var insertEntry = this.extraParam.nodeEntry;
    var position ;

    if ('position' in this.extraParam) {
        position = this.extraParam.position;
    } else {
        //just put to the end 
        if ( 'children' in parentEntry)
            position = parentEntry.children.length;
        else {
            position = 0;
            //also add the children 
            parentEntry.children = [];
        }
    }

    //now also need add the parentId 
    insertEntry[ this.strParentId ] = this.nodeId;

    //for the new inserted node, oldPosition no meaning, so just need save the new
    this.oldPosition = this.newPositon = position;

    //now do insert
    parentEntry.children.splice(position, 0, insertEntry);

};

/**
 * Save the old and new property, so latr can easily revert them
 * @return {[type]} [description]
 */
fin.rc.hier.UpdateAction.prototype._doChangeProperty = function(){
    var entry = this._getEntry();

    var mProp = {};
    for (var key in this.extraParam) {
        var newVal = this.extraParam[ key ];
        var oldVal = entry[ key ];
        //first save
        mProp[key] = [oldVal, newVal]; 

        //!! here directly change the data property for performance 
        //!!  another way is call setProperty one by one
        entry[key] = newVal;
    }

    //here need save the mProp so later can undo
    this.mProp = mProp;
};

fin.rc.hier.UpdateAction.prototype._doChangeProperty_undo = function(){
    var entry = this._getEntry();

    for (var key in this.mProp) {
        var aVal = this.mProp[ key ];
        var oldVal = aVal[0];   // 0 is the old value, 1 is the new value

        //!! here directly change the data property for performance 
        //!!  another way is call setProperty one by one
        entry[key] = oldVal;
    }
};


fin.rc.hier.UpdateAction.prototype._switchOldNewPosition = function() {
/*    var tmp = this.oldPosition;
    this.oldPosition = this.newPosition;
    this.newPosition = tmp;        
*/
    fin.rc.hier.Util.switchProperty(this, 'oldPosition', 'newPosition');
};
