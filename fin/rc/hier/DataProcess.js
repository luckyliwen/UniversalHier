jQuery.sap.declare("fin.rc.hier.DataProcess");

/**
 * This class will conver the OData flat format into the d3 style hierarchy data
 * @type {Object}
 */
fin.rc.hier.DataProcess = {
/*    CreatedBy: "FANGZH"
    CreatedDate: Fri Apr 11 2014 08:00:00 GMT+0800 (China Standard Time)
    LastUpdatedBy: "FANGZH"
    LastUpdatedDate: Fri Apr 11 2014 08:00:00 GMT+0800 (China Standard Time)
    Name: "Profit center group 01"
    NodeID: "PCGR_01"
    ParentID: ""
    SeqNR: 0
*/

    /**
     * Find inside the tree by match the node id.
     * @param  {[type]} tree        The tree or the sub node of the tree
     * @param  {[type]} nodeId      [description]
     * @param  {[type]} strNodeId   [description]
     * @param  {[type]} initialPath the path of the tree. If omit then means it was search the big tree
     * @return {[type]}             
     *                 The found path, or "" or not found
     */
    findPathByNodeId : function(tree, nodeId, strNodeId, initialPath) {
        var parentPath = initialPath || "";
        return this._doFindPathByNodeId(tree, nodeId, strNodeId, parentPath);
    },

    _doFindPathByNodeId : function(tree, searchNodeId, strNodeId, parentPath) {
        //as this function usual use to find the paretn, so we use bread first algorithm 
        var i, entry, newParentPath, ret; 
        
        //first check the node itself         
        for (i=0; i< tree.children.length; i++) {
            entry= tree.children[i] ; 
            //check whether have child, if so then recursively call
            if ( searchNodeId === entry[strNodeId]) {
                ret = parentPath + '/children/' + i;
                return ret;
            } 
        }

        //not found then try to search recursively
        for (i=0; i< tree.children.length; i++) {
            entry= tree.children[i] ;
            if ( 'children'  in entry) {
                newParentPath = parentPath + '/children/' + i;
                ret = this._doFindPathByNodeId(entry, searchNodeId, strNodeId, newParentPath);
                if (ret.length )
                    return ret; 
            }
        }

        //reach here means not found any
        return "";
    },

   /**
     * 
     * @param  {[type]} result    [description]
     * @return {[type]}           [description]
     */
    convertArrayToHierTree: function (aResult,  mKeyPropName) {
        var strNodeId =  mKeyPropName.NodeId,
            strParentId = mKeyPropName.ParentId,
            strSeqNumber = mKeyPropName.SeqNumber;
        var i;
        var tree = {
            children: []
        };

        //used to hold the children information
        var mRelation = {};    

        //first step to build the relation map and add the topmost node
        for (i = 0; i < aResult.length; i++) {
            var nodeId = aResult[ i ] [strNodeId] ; 
            var parentId = aResult[ i ] [strParentId] ; 

            if (parentId === "") {
                //so it is the topmost node, can add it directly
                this._addToChildrenByPosition(tree, aResult[ i ] );
            } else {
                if ( ! (parentId in mRelation)) {
                    mRelation[ parentId ] = {};
                } 
                //record the child position in the big array, so later can easy get it
                mRelation[ parentId ] [ nodeId ] = i;
            }
        }

        //so now have add the topmost child, then recursive add the next level 
        this._addChildForOneNode(tree, mRelation, aResult, strNodeId, strParentId, strSeqNumber);

        return tree;
    },

    /**
     * As now the CreatedDate LastUpdatedDate was Date, it need change to string, otherwise the tree display will have problem
     * @param  {[type]} entry [description]
     * @return {[type]}       [description]
     */
    _processSingleEntry: function ( entry ) {
        var newEntry = {};
        for (var key in entry) {
            //no need the __metadata
            if (key == '__metadata')
                continue;

            var val = entry[ key ];
            if ( typeof val === 'object') {
                val = val.toString();
            } 
            newEntry[key] = val;
        }
        return newEntry;
    },

    _addToChildrenByPosition: function ( tree, entry, strSeqNumber) {
        if ( !('children' in tree)) {
            tree.children = [];
        }

        var newEntry = this._processSingleEntry(entry);

        if ( tree.children.length === 0) {
            tree.children.push(newEntry);
        } else {
            var seq = entry[ strSeqNumber];
            var i;
            for (i = 0; i < tree.children.length; i++) {
                if (seq < tree.children[i] [strSeqNumber ] ) {
                    //find the position, so can insert
                    tree.children.splice(i, 0, newEntry);
                    break; 
                }
            }

            //not found then just add to the last 
            if (i === tree.children.length) {
                tree.children.push(newEntry);
            }
        }
    },


    _addChildForOneNode: function ( tree, mRelation, aResult, strNodeId, strParentId, strSeqNumber) {
        for (var i=0; i< tree.children.length; i++) {
            var topNodeEntry = tree.children[i] ; 
            
            //check whether have child, if so then recursively call
            var nodeId = topNodeEntry[strNodeId];
            if ( nodeId in mRelation) {
                var mChildren = mRelation[ nodeId];
                //as it may have many children, so it was an map again, the key is the child id, value is te position in array 
                for (var childId in mChildren) {
                    var pos = mChildren[ childId ];

                    this._addToChildrenByPosition(topNodeEntry, aResult[pos],  strSeqNumber);
                }

                //then recursive handle the children
                this._addChildForOneNode(topNodeEntry, mRelation, aResult, strNodeId, strParentId, strSeqNumber);
            }   
        }
    },



};