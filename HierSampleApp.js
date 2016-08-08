var mDemoData = {
    "children": [{
        "NodeID": "PCGR_01",
        "Name": "Profit center group 01",
        "ParentID": "",
        "SeqNR": 0,
        "LastUpdatedDate": "Fri Apr 11 2014 08:00:00 GMT+0800 (China Standard Time)",
        "LastUpdatedBy": "FANGZH",
        "CreatedDate": "Fri Apr 11 2014 08:00:00 GMT+0800 (China Standard Time)",
        "CreatedBy": "FANGZH",
        "children": [{
            "NodeID": "PCGR_02",
            "Name": "Profit center group 02",
            "ParentID": "PCGR_01",
            "SeqNR": 1,
            "LastUpdatedDate": "Fri Apr 11 2014 08:00:00 GMT+0800 (China Standard Time)",
            "LastUpdatedBy": "FANGZH",
            "CreatedDate": "Fri Apr 11 2014 08:00:00 GMT+0800 (China Standard Time)",
            "CreatedBy": "FANGZH",
            "children": [{
                "NodeID": "PCTR_01",
                "Name": "Profit center 01",
                "ParentID": "PCGR_02",
                "SeqNR": 1,
                "LastUpdatedDate": "Fri Apr 11 2014 08:00:00 GMT+0800 (China Standard Time)",
                "LastUpdatedBy": "FANGZH",
                "CreatedDate": "Fri Apr 11 2014 08:00:00 GMT+0800 (China Standard Time)",
                "CreatedBy": "FANGZH"
            }]
        }, {
            "NodeID": "PCGR_03",
            "Name": "Profit center group 03",
            "ParentID": "PCGR_01",
            "SeqNR": 2,
            "LastUpdatedDate": "Fri Apr 11 2014 08:00:00 GMT+0800 (China Standard Time)",
            "LastUpdatedBy": "FANGZH",
            "CreatedDate": "Fri Apr 11 2014 08:00:00 GMT+0800 (China Standard Time)",
            "CreatedBy": "FANGZH",
            "children": [{
                "NodeID": "PCGR_04",
                "Name": "Profit center group 04",
                "ParentID": "PCGR_03",
                "SeqNR": 1,
                "LastUpdatedDate": "Fri Apr 11 2014 08:00:00 GMT+0800 (China Standard Time)",
                "LastUpdatedBy": "FANGZH",
                "CreatedDate": "Fri Apr 11 2014 08:00:00 GMT+0800 (China Standard Time)",
                "CreatedBy": "FANGZH",
                "children": [{
                    "NodeID": "PCTR_02",
                    "Name": "Profit center 02",
                    "ParentID": "PCGR_04",
                    "SeqNR": 1,
                    "LastUpdatedDate": "Fri Apr 11 2014 08:00:00 GMT+0800 (China Standard Time)",
                    "LastUpdatedBy": "FANGZH",
                    "CreatedDate": "Fri Apr 11 2014 08:00:00 GMT+0800 (China Standard Time)",
                    "CreatedBy": "FANGZH"
                }, {
                    "NodeID": "PCTR_03",
                    "Name": "Profit center 03",
                    "ParentID": "PCGR_04",
                    "SeqNR": 2,
                    "LastUpdatedDate": "Fri Apr 11 2014 08:00:00 GMT+0800 (China Standard Time)",
                    "LastUpdatedBy": "FANGZH",
                    "CreatedDate": "Fri Apr 11 2014 08:00:00 GMT+0800 (China Standard Time)",
                    "CreatedBy": "FANGZH"
                }, {
                    "NodeID": "PCRN_01",
                    "Name": "Profit center range 01",
                    "ParentID": "PCGR_04",
                    "SeqNR": 3,
                    "LastUpdatedDate": "Fri Apr 11 2014 08:00:00 GMT+0800 (China Standard Time)",
                    "LastUpdatedBy": "FANGZH",
                    "CreatedDate": "Fri Apr 11 2014 08:00:00 GMT+0800 (China Standard Time)",
                    "CreatedBy": "FANGZH"
                }]
            }]
        }]
    }]
};


//Create an instance of the table control
// var oHierTable = new sap.ui.table.hierTable({
var mODataInfo = {
    url: 'https://ldai2e91.wdf.sap.corp:44300/sap/opu/odata/sap/FIN_UNIVERSAL_HIERARCHY',

    urlParams: {
        HierarchyType: "'PCH'",
        HierarchyID: "'0001'",
        RootNodeID: "'PCGR_01'",
        Version: "'0001'"
    }
};

function onhierTableRowSelectionChanged(evt) {
    console.debug("rowSelectionChanged", evt, evt.mParameters);
}


function onhierTableSearch(evt) {
    var binding = oHierTable.getBinding('rows');
    var aProp = ['name'];
    var searchValue = evhierTable.getSource().getValue();
    var aContext = fin.rc.hier.Util.findProperties(binding, aProp, searchValue);

    //?? later here need bring it ot the visible pane

    return aContext;
}


function createDemoCommandsToolBar(hierTable) {
    var btnMoveUp = new sap.ui.commons.Button({
        text: 'MoveUp',
        press: function() {
            hierTable.performMoveUp();
        }
    });

    var btnMoveDown = new sap.ui.commons.Button({
        text: 'MoveDown',
        press: function() {
            hierTable.performMoveDown();
        }
    });

    var btnMoveHead = new sap.ui.commons.Button({
        text: 'MoveHead',
        press: function() {
            hierTable.performMoveHead();
        }
    });

    var btnMoveTail = new sap.ui.commons.Button({
        text: 'MoveTail',
        press: function() {
            hierTable.performMoveTail();
        }
    });

    var btnDelete = new sap.ui.commons.Button({
        text: 'Delete',
        press: function() {
            hierTable.performDelete();
        }
    });

    var btnChangParent = new sap.ui.commons.Button({
        text: 'ChangParent',
        press: function() {
            var parentNode = prompt('Provide the parent node id where you want to change', 'PCGR_01');
            var position = prompt("Provide the position you want to put to: start from 0");
            var destInfo = {
                parentNode: parentNode,
                position: position,
            };

            hierTable.performChangeParent(undefined, destInfo);
        }
    });
    var btnChangProperty = new sap.ui.commons.Button({
        text: 'ChangProperty',
        press: function() {
            var newVal = prompt('Provide the new value for name');
            var mProp = {
                'Name': newVal
            };
            hierTable.performChangeProperty(undefined, mProp);
        }
    });

    var btnInsert = new sap.ui.commons.Button({
        text: 'InsertNode',
        press: function() {
            var node = prompt('Provide the new node id', 'PCGR_XX');
            var parentNode = prompt('Provide the parent node id where you want to insert', 'PCGR_01');
            var position = prompt("Provide the position you want to put to: start from 0");
            
            var destInfo = {
                parentNode: parentNode,
                position: position,
            };

            hierTable.performInsertNode(undefined, destInfo);
        }
    });

    var btnUndo = new sap.ui.commons.Button({
        text: 'Undo',
        press: function() {
            hierTable.performUndo();
        }
    });
    var searchField = new sap.ui.commons.SearchField({
        search: onhierTableSearch,
        value: 'item0-0-0'
    });

    var btnCancel = new sap.ui.commons.Button({
        text: 'Cancel',
        press: function() {
            hierTable.performCancel();
        }
    });

    var btnSubmit = new sap.ui.commons.Button({
        text: 'Submit',
        press: function() {
            hierTable.performSubmit();
        }
    });

    var btnShow = new sap.ui.commons.Button({
        text: 'Show UpdateMng Information',
        press: function() {
            var updateMng = hierTable.getUpdateMng();
            alert( updateMng.toString());
        }
    });

    return new sap.ui.commons.Toolbar({
        items: [btnMoveUp, btnMoveDown, btnMoveHead, btnMoveTail, btnDelete,
            btnChangParent, btnChangProperty,
            btnUndo, searchField,
            btnCancel, btnSubmit, btnShow
        ]
    });

}

function createDemoHierhierTable(bMock)
{
    var oHierTable = new fin.rc.hier.HierTable({
        columns: fin.rc.hier.HierTableHelper.createDefaultColumns(),
        selectionMode: sap.ui.table.SelectionMode.Single,
        allowColumnReordering: true,
        expandFirstLevel: true,
        visibleRowCount: 20,

        rowSelectionChange: onhierTableRowSelectionChanged,

        // editable: false,
    });

    oHierTable.setToolbar( createDemoCommandsToolBar(oHierTable));

    if (bMock) {
        var hierModel = new fin.rc.hier.HierModel(mDemoData);
        oHierTable.hierModel = hierModel;
        oHierTable.setModel(hierModel);
        oHierTable.bindRows('/');
        oHierTable.createUpdateMng();
    } else {
        oHierTable.setODataInfo( mODataInfo );
    }
    return oHierTable;
}



