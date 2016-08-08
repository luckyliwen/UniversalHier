jQuery.sap.declare("fin.rc.hier.HierTableHelper");
// jQuery.sap.require("fin.rc.hier.HierTable");

/**
 * This class just create some helper function for the HierTable 
 */
fin.rc.hier.HierTableHelper = {
    /*
    now node like 
    CreatedBy: "FANGZH"
    CreatedDate: Fri Apr 11 2014 08:00:00 GMT+0800 (China Standard Time)
    LastUpdatedBy: "FANGZH"
    LastUpdatedDate: Fri Apr 11 2014 08:00:00 GMT+0800 (China Standard Time)
    Name: "Profit center group 01"
    NodeID: "PCGR_01"
    ParentID: ""
    SeqNR: 0
    */
    createDefaultColumns: function (  ) {
        var aName = ['NodeID', 'ParentID', 'Name', 'LastUpdatedDate', 'LastUpdatedBy', 'SeqNR'];

        var ret=[];
        for (var i = 0; i < aName.length; i++) {
            var name = aName[ i ] ; 
            var col = new sap.ui.table.Column(
                    {   label: name, 
                        template: new sap.m.Text({text: {path: name}}),
                        sortProperty: name, 
                        filterProperty: name, 
            });

            ret.push(col);
        }
        return ret;
    }
};
