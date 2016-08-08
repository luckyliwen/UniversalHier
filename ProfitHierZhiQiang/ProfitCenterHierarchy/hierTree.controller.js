
		
sap.ui.controller("profitcenterhierarchy.hierTree", 		
		{


	/**
	 * Called when a controller is instantiated and its View controls (if
	 * available) are already created. Can be used to modify the View before it
	 * is displayed, to bind event handlers and do other one-time
	 * initialization.
	 * 
	 * @memberOf profitcenterhierarchy.hierTree
	 */
	onInit : function() {
		
	},

	/**
	 * Similar to onAfterRendering, but this hook is invoked before the
	 * controller's View is re-rendered (NOT before the first rendering!
	 * onInit() is used for that one!).
	 * 
	 * @memberOf profitcenterhierarchy.hierTree
	 */
	// onBeforeRendering: function() {
	//
	// },
	/**
	 * Called when the View has been rendered (so its HTML is part of the
	 * document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * 
	 * @memberOf profitcenterhierarchy.hierTree
	 */
	// onAfterRendering: function() {
	//
	// },
	/**
	 * Called when the Controller is destroyed. Use this one to free resources
	 * and finalize activities.
	 * 
	 * @memberOf profitcenterhierarchy.hierTree
	 */
	// onExit: function() {
	//
	// }

	onSearchButtonPressed : function(oTable, oSearchText) {

		// find all entries containing the searchText
		var oBinding = oTable.getBinding("rows");
		var aExpandContexts = [];
		var aResultContexts = [];
		var iCount = 0;
		var iFirstMatchedIndex = 0;
		var oFirstMatchedContext = 0;
		var fnLookup = function(aContexts, sPath, sString) {
			var bMatches = false;
			jQuery.each(aContexts, function(iIndex, oContext) {
				iCount++;
				var bSelfMatch = false;				
				var bInnerMatches = fnLookup(
						oBinding.getNodeContexts(oContext), sPath, sString);
				if (oContext.getProperty(sPath).indexOf(sString) >= 0) {
					bSelfMatch = true;
				}
				if (bInnerMatches || bSelfMatch) {
					aExpandContexts.push(oContext);
					bMatches = true;
					if (!iFirstMatchedIndex) {
						iFirstMatchedIndex = iCount - 1;
						oFirstMatchedContext = oContext;						
					}
				}
				if (bSelfMatch) {
					aResultContexts.push(oContext);
				}
			});
			return bMatches;
		};
		var fnGetRowFromContext = function(oTable, oContext) {
			for ( var i = 0; i <= oTable.getRows().length - 1; i++) {
				if (oTable.getContextByIndex(i) == oContext) {
					return i;
				}
			}
		};

		fnLookup(oBinding.getRootContexts(), "id", oSearchText);

		// expand all contexts containing the searchText		
		for ( var i = aExpandContexts.length - 1; i >= 0; i--) {
			oBinding.expandContext(aExpandContexts[i]);
		}
		
				
		// scroll to the first result
		oTable.setFirstVisibleRow(fnGetRowFromContext(oTable,
				oFirstMatchedContext));
		
		// highlight all results
		var oRows = oTable.getRows();
		for ( var i = aResultContexts.length - 1; i >= 0; i--) {						
			var iRow = fnGetRowFromContext(oTable, aResultContexts[i]);
			oRows[iRow].getCells()[0].addStyleClass("important");
		}

	},
	
	onBtnMoveUp : function(oTable) {
		var iIndex = oTable.selectedIndex;
		var oContext = oTable.getContextByIndex(iIndex);
	}
	

});