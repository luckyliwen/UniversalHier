

var gt, guh, gt, gum, ghm; 

function createSampleUniversalHier(bMock)
{
    var oHierTable = new fin.rc.hier.HierTable({
    });

    if (bMock) {
        var hierModel = new fin.rc.hier.HierModel(mDemoData);
        oHierTable.hierModel = hierModel;
        oHierTable.setHierModel(hierModel);

        oHierTable.setModel(hierModel);
        oHierTable.bindRows('/');
        oHierTable.createUpdateMng();
    } else {
        oHierTable.setODataInfo( mODataInfo );
    }
    oHierTable.applyDefaultSetting();

    var oUniversalHier = new fin.rc.hier.UniversalHier({
        hierTable: oHierTable
    });

    oUniversalHier.createDefaultContent();

    //??debug 
    gt = oHierTable;
    guh = oUniversalHier;
    gum = gt.getUpdateMng();
    ghm = gt.getHierModel();

    return oUniversalHier;
}
//--just for easy debug



function createSampleApp(bMock) 
{
    var universalHier = createSampleUniversalHier(bMock);
    var updatePanel = universalHier.getUpdatePanel();

    //just use the UpdatePanel to create Cancel and Submit button easily
    var cancelBtn = updatePanel.createControlForAction(fin.rc.hier.UpdateType.Cancel, undefined, 'Button');
    var submitBtn = updatePanel.createControlForAction(fin.rc.hier.UpdateType.Submit, undefined, 'Button');
    var footerBar = new sap.m.Bar({
        contentRight: [
            cancelBtn, submitBtn
        ]
    });

    var page = new sap.m.Page('page1', {
                title: 'Sample Universal Hierarchy App, if OData is not work, just change in html file createSampleApp(false) to (true)',
                content: [
                    universalHier
                ],
                footer: footerBar
    });

    var app = new sap.m.App('myApp', {
        pages:  page   
    });
    return app;
}