PORT_LINK_LOGS.getLinkStateRegExpByVendor=(vendor)=>{
    switch(vendor){
      case DEVICE_TYPE_VENDORS.ELTEX:return {//ETH_KR_78_06656_21 <134> 8-Apr-2024 14:55:41.140 CFA-6-Interface gi 0/4 link status UP
        linkUpRegExp:/link status UP/i,
        linkDnRegExp:/link status DOWN/i,
      };
      case DEVICE_TYPE_VENDORS.D_LINK:return {
        linkUpRegExp:/link up/i,
        linkDnRegExp:/link down/i,
      };
      case DEVICE_TYPE_VENDORS.HUAWEI:return {//IFNET/4/IF_STATE, IFPDT/4/IF_STATE
        linkUpRegExp:/into UP state/i,
        linkDnRegExp:/into DOWN state/i,
      };
      case DEVICE_TYPE_VENDORS.FIBERHOME:return {//IFM-LINKUP, IFM-LINKDOWN
        linkUpRegExp:/LinkUP|OperStatus=\[up\]/i,
        linkDnRegExp:/LinkDown|OperStatus=\[down\]/i,
      };
      case DEVICE_TYPE_VENDORS.H3C:return {//IFNET/3/PHY_UPDOWN
        linkUpRegExp:/changed to up/i,
        linkDnRegExp:/changed to down/i,
      };
      case DEVICE_TYPE_VENDORS.EDGE_CORE:return {
        linkUpRegExp:/link-up/i,
        linkDnRegExp:/link-down/i,
      };
      default:return {
        linkUpRegExp:/[^a-zA-Z0-9](link|)(-|\s|)up(\s|)(state|)[^a-zA-Z0-9]/i,
        linkDnRegExp:/[^a-zA-Z0-9](link|)(-|\s|)down(\s|)(state|)[^a-zA-Z0-9]/i,
      };
    };
  };
PORT_LINK_LOGS.DATE_REGEXP_LIST=[
    /\d{1,2}-\w{3}-\d{4}\s\d{2}:\d{2}:\d{2}.\d{1,3}/,//<134> 8-Apr-2024 14:55:41.140 (Eltex)
    /\d{4}(-|\/)\d{1,2}(-|\/)\d{1,2}\s{1,2}\d{2}:\d{2}:\d{2}/,//2023-3-8 10:53:09 (D-Link 3200, FiberHome, Huawei 3328)
    /\w{3}\s{1,2}\d{1,2}\s\d{2}:\d{2}:\d{2}:\d{3}\s\d{4}/,    //%Mar  8 09:08:55:598 2013 (H3C, HP) ETH_KR_58_00350_3
    /\w{3}\s{1,2}\d{1,2}\s\d{4}\s\d{2}:\d{2}:\d{2}/,          //Mar  8 2023 10:56:41+07:00 (Huawei 2328) ETH_54KR_00566_1
    /\w{3}\s{1,2}\d{1,2}\s\d{2}:\d{2}:\d{2}/,                 //Mar  8 10:21:17 (D-Link 1210, Huawei 5300)
    /\d{2}:\d{2}:\d{2}\s{1,2}\d{4}(-|\/)\d{1,2}(-|\/)\d{1,2}/,//10:27:39 2023-03-08 (Edge-Core)
  ];
