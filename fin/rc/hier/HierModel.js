jQuery.sap.declare("fin.rc.hier.HierModel");
jQuery.sap.require("sap.ui.model.json.JSONModel");

jQuery.sap.require("fin.rc.hier.DataProcess");


//https://ldai2e91.wdf.sap.corp:44300/sap/opu/odata/sap/FIN_UNIVERSAL_HIERARCHY/GetHierarchyNodes?HierarchyType='PCH'&HierarchyArea='0001'&RootNodeID='PCGR_01'&Version='0001'

sap.ui.model.json.JSONModel.extend("fin.rc.hier.HierModel", {
    constructor: function(oData) {
        sap.ui.model.json.JSONModel.apply(this, arguments);

        this.funcName = '/GetHierarchyNodes';
        this.urlParams = {};
        this.odataModel = null;
        this.mKeyPropName = {
            NodeId:   'NodeID',
            ParentId: 'ParentID',
            SeqNumber: 'SeqNR'
        };

        this.hierTable = null;
   },

    metadata: {
        publicMethods: ["setJSON", "getJSON"],

    }
});

/**
 * set the OData related information
 * @param {[type]} funcName [description]
 */

/**
  @parm  map     :  one map may contain following information:
  -----------either provide url or odataModel
          mInfo.url:   
          mInfo.odataModel:
 
  -----------following all is optional
          mInfo.funcName:  function name, if omit then use the   'GetHierarchyNodes'               
          mInfo.urlParams   : the url parameters used for call the functions, same as the ODataModel.prototype.read   
                                  A map containing the parameters that will be passed as query strings 
                                  
          mInfo.mKeyPropName : the map of property name of three most properties: if not provided then use the standard odata name:  NodeID ParentID Position
                               {
                                   'NodeId':   'MyNodeID', 
                                   'ParentId:  'MyParentID', 
                                   'SeqNumber':  'SeqNR'
                               }       

    one sample would be: 

    mInfo
    {
        url: https://ldai2e91.wdf.sap.corp:44300/sap/opu/odata/sap/FIN_UNIVERSAL_HIERARCHY,

        urlParameters: {
            custom: {
                HierarchyType: 'PCH',
                HierarchyID:   '0001', 
                RootNodeID:   'PCGR_01'
                Version:       '0001'
            }
        },

        mKeyPropName: {
           'NodeId':   'MyNodeID', 
           'ParentId:  'MyParentID', 
           'SeqNumber':  'SeqNR'
        }
    }
*/
fin.rc.hier.HierModel.prototype.setOdataInfo = function(mInfo) {
    if (mInfo.url) {
        this.odataModel = new sap.ui.model.odata.ODataModel(mInfo.url, true);
    } else if (mInfo.odataModel) {
        if (!(mInfo.odataModel instanceof sap.ui.model.odata.ODataModel)) {
            throw new Error('mInfo.odataModel not an ODatModel');
        }
        this.odataModel = mInfo.odataModel;
    } else {
        throw new Error('Must provide the url or oDataModel');
    }

    if (mInfo.urlParams) {
        this.urlParams = mInfo.urlParams;
    }

    if (mInfo.funcName) {
        this.funcName = mInfo.funcName;
    }

    $.extend( this.mKeyPropName, mInfo.mKeyPropName);
};


/**
 * Send the update commands to the backend
 * @param  {[type]} mAction [description]
 * @return {[type]}         [description]
 */
fin.rc.hier.HierModel.prototype.performODataUpdate = function(aODataAction) {
    //??after zhiqiang define the OData interface then implement it 
    //now just print it out
    console.debug("** HierModel->performODataUpdate");
    aODataAction.forEach( function(action) {
        console.debug( action );
    });

    //??now just show it 
    alert('As now backend not ready, so Please see the Debug Console for detail OData command');
};

fin.rc.hier.HierModel.prototype.getKeyPropName = function() {
    return this.mKeyPropName;
};


fin.rc.hier.HierModel.prototype.getHierTable = function(hierTable) {
    return this.hierTable ;
};

/**
 * Set important key property from the entry to the destparam, 
 * @param  {[type]} entry     [description]
 * @param  {[type]} destParam [description]
 * @return {[type]}           [description]
 */
fin.rc.hier.HierModel.prototype.setKeyPropertyFromEntry = function(entry, destParam) {
    var mKeyProp = this.getKeyPropName();
    if (entry && destParam) {
        destParam.nodeId = entry[ mKeyProp.NodeId  ];
        destParam.parentId = entry[ mKeyProp.ParentId ];
        //??as name is most important, so here just put the name to seperate 
        //also can considerate let user take all information from entry
        destParam.name = entry.Name;
    }
};


/*fin.rc.hier.HierModel.prototype.setHierTable = function(hierTable) {
    this.hierTable = hierTable;
    this._loadData();
};*/

fin.rc.hier.HierModel.prototype.setHierTable = function(hierTable) {
    this.hierTable = hierTable; 
    this._loadData();
};


/**
 * Get the path by search the whole tree, 
 * @param  {[type]} 
 * @return {[type]} the path for found entry, "" if not found  
 */
fin.rc.hier.HierModel.prototype.findPathByNodeId = function ( nodeId ) {
    var tree = this.getData();
    return fin.rc.hier.DataProcess.findPathByNodeId(tree, nodeId, this.mKeyPropName.NodeId);
};

/**
 * Get the parent entry from the path
 * @param  {[type]} pathOrContext [description]
 * @return {[type]}      [description]
 */
fin.rc.hier.HierModel.prototype.getParentEntryFromContextOrPath = function ( pathOrContext ) {
    var path = this.getPathFromContextOrPath(pathOrContext);
    var aPath = path.split('/');
    aPath.shift();   //as first is ""

    var parentEntry = this.getData();
    var idx;
    for (var i = 0; i < aPath.length-2; i+=2) {
        //??now just support the d3 format
        idx = parseInt(aPath[i+1]); 
        parentEntry = parentEntry.children[ idx ];
    }
    return parentEntry;
};

fin.rc.hier.HierModel.prototype.getParentPathFromContextOrPath = function (pathOrContext) {
    var path = pathOrContext;
    if ( path instanceof sap.ui.model.Context) {
        path = pathOrContext.getPath();
    }

    //path like /children/0/children/1, so the parent path will be /children/0 
    var pos = path.lastIndexOf('/children');

    return path.substr(0, pos);
};

/**
 * Get the entry from the path
 * @param  {[type]} pathOrContext [description]
 * @return {[type]}      [description]
 */
fin.rc.hier.HierModel.prototype.getEntryFromContextOrPath = function ( pathOrContext ) {
    //path like /children/0/children/1 
    var path = this.getPathFromContextOrPath(pathOrContext);
    var aPath = path.split('/');
    aPath.shift();  //first is "" so need remove

    var idx;
    var entry = this.getData();
    if (!entry) {
        throw new Error("hierMode.getData() is empty");    
    }

    for (var i = 0; i < aPath.length; i+=2) {
        //??now just support the d3 format
        idx = parseInt(aPath[i+1]); 
        if ( 'children' in entry ) {
            entry = entry.children[ idx ];    
        } else {
            throw new Error("Logic error in getEntryFromContextOrPath for " + path );    
        }
    }

    return entry;
};

/**
 * Get the position under the parent from the path
 * @param  {[type]} path [description]
 * @return {[type]}      [description]
 */
fin.rc.hier.HierModel.prototype.getPositionFromContextOrPath = function ( pathOrContext ) {
    var path = this.getPathFromContextOrPath(pathOrContext);
    var pos = path.lastIndexOf('/');
    var idx = path.substr( pos + 1);

    return parseInt( idx );
};


fin.rc.hier.HierModel.prototype.getPathFromContextOrPath = function (pathOrContext) {
    var path = pathOrContext;
    if ( path instanceof sap.ui.model.Context) {
        path = pathOrContext.getPath();
    }
    return path;
};

/**
 * Used by other class to notify the hier model that:  the internal data have been changed, so need notify the observer to do update
 * @return {[type]} [description]
 */
fin.rc.hier.HierModel.prototype.notifyDataChanged = function() {
    this.checkUpdate();
};

fin.rc.hier.HierModel.prototype._loadData = function() {
    var that = this;
    var mParam = {
        urlParameters: this.urlParams,
        success: function(data) {
            var treeData = fin.rc.hier.DataProcess.convertArrayToHierTree(data.results, that.mKeyPropName);
            that.setData(treeData);

            //also binding the row for table, as the data is control by framework, so user no need care for it 
            that.hierTable.setModel(that);

            that.hierTable.bindRows('/');

            //??now when load data, the header not refresh, need check why
            that.fireRequestCompleted();

        },
        error: function(error) {
            //??how to inform table
            jQuery.sap.assert(false, "odata.read error " + error);

            //??
            var treeData = {children: []};
            that.setData(treeData);

            //also binding the row for table, as the data is control by framework, so user no need care for it 
            that.hierTable.setModel(that);

            that.hierTable.bindRows('/');
        },
    };

    this.odataModel.read(this.funcName, mParam);
};
