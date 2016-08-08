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


var mODataInfo = {
    url: 'https://ldai2e91.wdf.sap.corp:44300/sap/opu/odata/sap/FIN_UNIVERSAL_HIERARCHY',

    urlParams: {
        HierarchyType: "'PCH'",
        HierarchyArea: "'0001'",
        RootNodeID: "'PCGR_01'",
        Version: "'0001'"
    }
};