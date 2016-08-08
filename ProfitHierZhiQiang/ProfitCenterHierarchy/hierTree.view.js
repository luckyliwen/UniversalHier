jQuery.sap.require("model.HierModel");

sap.ui.jsview("profitcenterhierarchy.hierTree", {

	/**
	 * Specifies the Controller belonging to this View. In the case that it is
	 * not implemented, or that "null" is returned, this View does not have a
	 * Controller.
	 * 
	 * @memberOf profitcenterhierarchy.hierTree
	 */
	getControllerName : function() {
		return "profitcenterhierarchy.hierTree";
	},

	/**
	 * Is initially called once after the Controller has been instantiated. It
	 * is the place where the UI is constructed. Since the Controller is given
	 * to this method, its event handlers can be attached right away.
	 * 
	 * @memberOf profitcenterhierarchy.hierTree
	 */
	createContent : function(oController) {

		// Create an instance of the table control
		var oTable = new sap.ui.table.TreeTable({
			columns : [ new sap.ui.table.Column({
				label : "Name",
				template : "id"
			}), new sap.ui.table.Column({
				label : "Description",
				template : "name"
			}), new sap.ui.table.Column({
				label : "SeqNR",
				template : "seqNR"
			}) ],
			selectionMode : sap.ui.table.SelectionMode.Single,
			enableColumnReordering : true,
			expandFirstLevel : true,
		// toggleOpenState: function(oEvent) {
		// var iRowIndex = oEvent.getParameter("rowIndex");
		// var oRowContext = oEvent.getParameter("rowContext");
		// var bExpanded = oEvent.getParameter("expanded");
		// alert("rowIndex: " + iRowIndex +
		// " - rowContext: " + oRowContext.getPath() +
		// " - expanded? " + bExpanded);
		// }
		});

		// Create a model and bind the table rows to this model
		model.HierModel.getJsonData(function(data) {
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(data);
			oTable.setModel(oModel);
			oTable.bindRows("/")
		});

		// Button to demonstrate collapse and expand feature
		var oBtn = new sap.ui.commons.Button({
			text : "Move Up",
			press : function() {
				//oController.onBtnMoveUp(oTable);
			}
		});
		var oSearch = new sap.ui.commons.SearchField({
			width : "100px",
			showListExpander : false,
			enableFilterMode : false,
			search : function(oEvent) {
				var sValue = oSearch.getValue();
				oController.onSearchButtonPressed(oTable, sValue);
			}
		});

		oTable.setToolbar(new sap.ui.commons.Toolbar({
			items : [ oBtn ],
			rightItems : [ oSearch ]
		}));

		return oTable;
	}

});
