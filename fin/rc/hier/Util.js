jQuery.sap.declare("fin.rc.hier.Util");
/**
 * This file will contain some common utils for the treeBinding, tree,model
 * @type {Object}
 */
fin.rc.hier.Util = {
    /**
     * Exchange two property for one parent.  one example 
     *         m = {
     *             oldPosition: 0, 
     *             newPosition: 100
     *         } 
     *       after call swtichProperty(m, 'oldPosition', 'newPosition') then m like 
     *         m = {
     *             oldPosition: 100, 
     *             newPosition: 0
     *         } 
     * @param  {[type]} parent [description]
     * @param  {[type]} keyA   [description]
     * @param  {[type]} keyB   [description]
     * @return {[type]}        [description]
     */
    switchProperty: function ( parent, keyA, keyB ) {
        var tmp = parent[ keyA];
        parent[ keyA ] = parent[ keyB];
        parent[ keyB ] = tmp;
    },

    /**
     * Expand the context from the root root context recursively to it
     * ??this impplement is not good now, need check later
     * @param  {[type]} treeBinding [description]
     * @param  {[type]} context [description]
     * @return {[type]}         [description]
     */
    expandContext: function(treeBinding, context) {
        //so it will like, then need split it "/root/children/0/children/0/children/0"
        var bindPath = treeBinding.getPath();

        var longPath = context.getPath();
        longPath = longPath.substr(bindPath.length);

        /*var pattern = new RegExp("(\/children\/\\d+)", "g" );
        var path = "/root/children/0/children/1/children/2";
        var matches;
        while (matches = pattern.exec( path )){
            console.log(matches);
        }*/
    },

    /**
     * Find property under an contexts array, so user can search under one node
     * @param  {[type]} aContext    [description]
     * @param  {[type]} aContext    [description]
     * @param  {[type]} aProperty   [description]
     * @param  {[type]} searchValue [description]
     * @param  {[type]} bOnlyFirst  [description]
     * @return {[type]}             The found context array
     */
    findPropertiesInsideContexts: function(treeBinding, aContext, aProperty, searchValue, bOnlyFirst) {
        var i, context;
        var aRet = [];

        //now we search from top to down, so first search the high level, then drill down if possible
        for (i = 0; i < aContext.length; i++) {
            context = aContext[i];
            //one by one find the context
            for (var iProp = 0; iProp < aProperty.length; iProp++) {
                var prop = aProperty[iProp];

                //!!later can support more search ( for example toUpperCase() here )
                if (context.getProperty(prop).indexOf(searchValue) >= 0) {
                    aRet.push(context);
                    break;
                } 
            }

            //check if need faster break
            if ( bOnlyFirst && aRet.length) {
                break;
            }
        }

        if (bOnlyFirst && aRet.length) {
            return aRet;
        }

        //then drill down
        for (i = 0; i < aContext.length; i++) {
            context = aContext[i];
            //one by one find the context
            if (treeBinding.hasChildren(context)) {
                var aSubContext = treeBinding.getNodeContexts(context);
                var subRet = this.findPropertiesInsideContexts(treeBinding, aSubContext, aProperty, searchValue, bOnlyFirst);

                aRet = aRet.concat(subRet);

                //check if need faster break
                if ( bOnlyFirst && aRet.length) {
                    break;
                }
            }
        }        

        return aRet;
    },

    // ===================================================
    /**
     * [findByProperties description]
     * @param  {[type]} treeBinding   the treeBinding of tree
     * @param  {[type]} aProperty the property array used to for search
     * @param  {[type]} value     the searched value
     * @param  {[type]} bFirst    whether just return first value
     * @return {[type]}           The founded array, if not found then just return an empty array
     */

    findProperties: function(treeBinding, aProperty, searchValue, bOnlyFirst) {
        var rootContexts = treeBinding.getRootContexts();
        return this.findPropertiesInsideContexts(treeBinding, rootContexts,aProperty,searchValue,bOnlyFirst);
    }

};
