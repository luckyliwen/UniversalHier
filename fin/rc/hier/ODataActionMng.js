jQuery.sap.declare("fin.rc.hier.ODataActionMng");

/**
 * The class will be responsible map the user action to the odata backend action, detail action please refer the OData interface
 * @type {Object}
 */

fin.rc.hier.ODataActionType = {
    /**
     * In order for easy write and read, here the Action type use human readable foramt like ChgFields,  and the real value choose the OData interface value
     * @type {Object}
     */
    ChgFields: 'CHG_FIELDS',

    ChgParent: 'CHG_PARENT',

    ChgSeq: 'CHG_SEQNR',

    NewRelation: 'NEW_RELATION', 

    NewNode: 'NEW_NODE',

    DelNode: 'DEL_NODE',

    DelRelation: 'DEL_RELATION'

};



