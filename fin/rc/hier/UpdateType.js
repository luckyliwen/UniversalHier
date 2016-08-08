jQuery.sap.declare("fin.rc.hier.UpdateType");

/**
 * The update action type which will be used by the UI consumer. It is different with the ODataBackend update type
 * @type {Object}
 */
fin.rc.hier.UpdateType = {

    Delete: 'Delete',

    MoveUp: 'MoveUp',

    MoveDown: 'MoveDown',

    MoveHead:  'MoveHead',

    /**
     * Move to the tail
     */
    MoveTail:  'MoveTail',

    /**
     * Change properties
     */
    ChangeProperty: 'ChangeProperty',

    ChangeParent: 'ChangeParent',

    /**
     * ??need check whether one general insert node whether is enough
     * @type {String}
     */
    InsertNode:  'InsertNode', 

    /**
     * Means just undo the last step (not provide paramater or pass 1) or last multiple steps (defined by parameters)
     */
    Undo: 'Undo', 

    /**
     * Following two is the batch operation, can't undo!!
     * @type {String}
     */
    Submit: 'Submit',  

    Cancel: 'Cancel',


};