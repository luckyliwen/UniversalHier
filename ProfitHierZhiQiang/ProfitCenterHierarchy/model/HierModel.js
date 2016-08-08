jQuery.sap.declare("model.HierModel");

model.HierModel = {
	_oData : {},
	oModel : new sap.ui.model.json.JSONModel(),

	getRootNode : function(oData) {
		for ( var i = 0; i < oData.length - 1; i++) {
			if (oData[i].ParentID == "") {
				return oData[i];
			}
		}
	},

	fnSort : function(a, b) {
		return a.SeqNR > b.SeqNR;
	},

	getChildNodes : function(oData, oNode) {
		var oChildNodes = [];
		for ( var i = 0; i < oData.length; i++) {
			if (oData[i].ParentID == oNode.NodeID) {
				oChildNodes.push(oData[i]);
			}
		}
		oChildNodes.sort(this.fnSort);
		return oChildNodes;
	},

	loadOData : function(fnSuccess) {
		var uri = "proxy/sap/opu/odata/sap/FIN_UNIVERSAL_HIERARCHY/";
		var model = new sap.ui.model.odata.ODataModel(uri, true);
		var oParameters = {
			"HierarchyType" : "PCH",
			"HierarchyID" : "0001",
			"RootNodeID" : "PCGR_01",
			"Version" : "0001"
		};
		var that = this;

		function _fnSuccess(oData, response) {

			var oRootNode = that.getRootNode(oData.results);
			var oChildNodes = that.getChildNodes(oData.results, oRootNode);

			console.log("Odata call was success");
			console.log(oData);
			console.log(response);

			that._oData["root"] = {
				id : oRootNode.NodeID,
				name : oRootNode.Name,
				seqNR : oRootNode.SeqNR
			};

			that.oDataListToJsonTree(oData.results, that._oData["root"],
					oChildNodes);
			console.log(that._oData);

			fnSuccess(that._oData);
		}

		function _fnError(oError) {
			console.log("Odata call was failed");
		}

		model.callFunction("GetHierarchyNodes", "GET", oParameters, "",
				_fnSuccess, _fnError);

	},

	oDataListToJsonTree : function(oData, oParentNode, oChildNodes) {
		for ( var i = 0; i < oChildNodes.length; i++) {
			oParentNode[i] = oChildNodes[i];
			oParentNode[i] = {
				id : oChildNodes[i].NodeID,
				name : oChildNodes[i].Name,
				seqNR : oChildNodes[i].SeqNR
			};
			this.oDataListToJsonTree(oData, oParentNode[i], this.getChildNodes(
					oData, oChildNodes[i]));
		}
	},

	getJsonData : function(fnSuccess) {
		this.loadOData(fnSuccess);
	}
};
