window.setDevMode(!0);
//document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/ToolsPageContent.js',type:'text/javascript'}));
//document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/EventsMapPage.js',type:'text/javascript'}));

Vue.component('EventsMapPage',{
  template:`<EventsMapGpon2 v-bind="$props"/>`,
  props:{
    templateId:{type:[String,Number],default:'',required:true}
  },
  data:()=>({
    isYmaps:false
  }),
  beforeRouteEnter(to,from,next){
    document.querySelector(`#ptvtb-app`).style.maxWidth='unset';
    document.querySelector(`#ptvtb-app > div[name="AppLogo"] > a`).style.display='none';
    document.querySelector(`#ptvtb-app > header[name="TheAppHeader"]`).style.display='none';
    next(vm=>{
      vm.isYmaps=vm.addYmapsSrc();
    });
  },
  beforeRouteUpdate(to,from,next){
    this.isYmaps=this.addYmapsSrc();
    next()
  },
  methods:{
    addYmapsSrc(){
      const id=`ya-map`;
      if(document.querySelector(`#${id}`)){return true};
      const src=document.querySelector(`meta[name="mapuri"]`)?.content;
      if(!src){console.warn('Not found ymaps uri');return};
      return document.querySelector(`head`).appendChild(Object.assign(document.createElement('script'),{type:'text/javascript',src,id}));
    },
  },
  beforeRouteLeave(to,from,next){
    document.querySelector(`#ptvtb-app`).style.maxWidth='';
    document.querySelector(`#ptvtb-app > div[name="AppLogo"] > a`).style.display='';
    document.querySelector(`#ptvtb-app > header[name="TheAppHeader"]`).style.display='';
    //document.querySelector(`#ya-map`)?.remove();
    next()
  },
});
app.$router.addRoutes([{
  path:'/events-map/:templateId',
  name:'events-map',
  component:Vue.component('EventsMapPage'),
  props:true,
}]);
//app.$router.push({name:'events-map',params:{templateId:'nsk-gpon-test-2'}})

const CACHE_1HOUR=60;
const CACHE_1DAY=CACHE_1HOUR*24;

const CIRCLE_RADIUS_M=32;

class GeocodeResult {
  constructor(sample,response){
    this.sample=sample
    this.address=response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject?.metaDataProperty?.GeocoderMetaData?.text||''
    this.coordinates=response?.GeoObjectCollection?.metaDataProperty?.GeocoderResponseMetaData?.Point?.coordinates||null
    if(Array.isArray(this.coordinates)){this.coordinates.reverse()};
    //console.log(this)
  }
};
class FeatureCollection {
  constructor(features){
    this.type='FeatureCollection'
    this.features=features
  }
};
class PointGeometry {
  constructor(coordinates){
    this.type='Point'
    this.coordinates=coordinates
  }
};
class PolygonGeometry {
  constructor(coordinates){
    this.type='Polygon'
    this.coordinates=coordinates
  }
};
class CircleIconShape {
  constructor(radius){
    this.type='Circle'
    this.coordinates=[0, 0]
    this.radius=radius
  }
};
class RectangleIconShape {
  constructor(half){
    this.type='Rectangle'
    this.coordinates=[[-half,-half],[half,half]]
  }
};
class IconImageSizeOffset {
  #size;
  constructor(_size=48){
    const size=this.#size=_size||48
    const offset=-size/2
    this.iconImageSize=[size,size]
    this.iconImageOffset=[offset,offset]
  }
  get size(){
    return this.#size
  }
  get radius(){
    return this.#size / 2
  }
};
const EVENTS_MAP_ZINDEX={
  ONT:100,
  PON:50,
  OLT:20,
  AREA:10,
};
const EVENTS_MAP_ICONS={
  LOADER_GIF:'data:image/gif;base64,R0lGODlhFAASALMIAPJlau9CSPvLzfvMze9MU/////R5f+wdJP///wAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1OUQ1N0FDNkQ2REUxMUU0OTNDQUQ3OTM1MzU2RDhGMyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo1OUQ1N0FDN0Q2REUxMUU0OTNDQUQ3OTM1MzU2RDhGMyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjU5RDU3QUM0RDZERTExRTQ5M0NBRDc5MzUzNTZEOEYzIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjU5RDU3QUM1RDZERTExRTQ5M0NBRDc5MzUzNTZEOEYzIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Af/+/fz7+vn49/b19PPy8fDv7u3s6+rp6Ofm5eTj4uHg397d3Nva2djX1tXU09LR0M/OzczLysnIx8bFxMPCwcC/vr28u7q5uLe2tbSzsrGwr66trKuqqainpqWko6KhoJ+enZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSDgoGAf359fHt6eXh3dnV0c3JxcG9ubWxramloZ2ZlZGNiYWBfXl1cW1pZWFdWVVRTUlFQT05NTEtKSUhHRkVEQ0JBQD8+PTw7Ojk4NzY1NDMyMTAvLi0sKyopKCcmJSQjIiEgHx4dHBsaGRgXFhUUExIREA8ODQwLCgkIBwYFBAMCAQAAIfkEBRQACAAsAAAAABQAEgAABEhQlCKOPcAYcLEG09Rp2kiGhVlepIGqBvyypBzCtkivVjv3tZ3rJsylisLfoWXEJYlA3vIEnUp9VeZTF41tj12YpDDoZDbmTwQAIfkEBRQACAAsAAAAABQAEgAABFkQGAOQRaIUcVEgRDBNnaZ1IDgapYmma3teKRFfZvGqo6zTsB7OBeSRhjNL7WbJ7WzCJlEZPEqTiGUU4SxCrdxptspC/qjG8vU8TvuezDC2JqF0MoVB5xOKAAAh+QQFFAAIACwAAAAAFAASAAAEWTAQEpBFwBhwkSiFME2dpnUgOBKliaZre15pEV+m8aqjrNOwHs4F5JGGM0vtZsntbMImURk8SpOIZRThLEKt3Gm2ykL+qMby9TxO+57MMLYmoXQym86nMIgAACH5BAUUAAgALAAAAAAUABIAAARJEBgDkEWBkHCRpNPUaVoXnsZImqh4kQTbquXVuhYso3Rs373dKfibvVZF3rFmuaWWviYQKgwRpcYcEqvUMhHOKzj0qVwym045AgA7',
  OLT:'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1NS41OTcgNTUuNTk3Ij48cGF0aCBmaWxsPSIjZjNkNTViIiBkPSJtMjcuNTk3IDcuNzktMjQgNDJoNDl6Ii8+PHBhdGggZmlsbD0iIzU1NjA4MCIgZD0iTTU1LjQ1OCA1MC4zMDcgNDQuMTk2IDMxLjA4NmwtLjc3LTEuMzE0TDI4LjQ5IDQuMjgyYS45OTUuOTk1IDAgMCAwLTEuNzIxLjAwNUwxMi4zNjMgMjkuMThsLTEuMjE0IDIuMDk3TC4xMzUgNTAuMzEyYS45OTYuOTk2IDAgMCAwIC44NjIgMS40OTVoNTMuNjAxYS45OTYuOTk2IDAgMCAwIC44Ni0xLjV6bS00OS4wMTItMi41IDguMDk5LTEzLjk5NSA0Ljk1Mi04LjU1OSA4LjM4OS0xNC40OTcgOC41NjMgMTQuNjEzIDQuODQ5IDguMjc0IDguMjk5IDE0LjE2NEg2LjQ0NnoiLz48cGF0aCBmaWxsPSIjZTZlN2U4IiBkPSJNNDQuNTM4IDMwLjc3N2MtOS4zNzMgOS4zNzMtMjQuNTY5IDkuMzczLTMzLjk0MSAwIDkuMzcyLTkuMzcyIDI0LjU2OC05LjM3MiAzMy45NDEgMHoiLz48Y2lyY2xlIGZpbGw9IiM0OGEwZGMiIGN4PSIyNy41OTciIGN5PSIzMC43OSIgcj0iNiIvPjxjaXJjbGUgZmlsbD0iIzU1NjA4MCIgY3g9IjI3LjU5NyIgY3k9IjMwLjc5IiByPSIzIi8+PC9zdmc+',
  ONT_21A3DD:'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik04MzcuODE4IDc5MS4yNzNjMCAyNS42Ny0yMC44NzUgNDYuNTQ1LTQ2LjU0NSA0Ni41NDVIMjMyLjcyN2MtMjUuNjcgMC00Ni41NDUtMjAuODc1LTQ2LjU0NS00Ni41NDV2LTkzLjA5MWg2NTEuNjM2djkzLjA5ek0yNDguNTc2IDIyNi4wMjVhNDYuNzc4IDQ2Ljc3OCAwIDAgMSA0Ni4wNTctMzkuODQzaDQzNC43MzRhNDYuNzc4IDQ2Ljc3OCAwIDAgMSA0Ni4wNTcgMzkuODQzbDYxLjkwNSA0MjUuNjExSDE4Ni42NzFsNjEuOTA1LTQyNS42MTF6bTU3Mi45MDUtNi43MDNhOTMuMDkgOTMuMDkgMCAwIDAtOTIuMTE0LTc5LjY4NkgyOTQuNjMzYTkzLjA5IDkzLjA5IDAgMCAwLTkyLjExNCA3OS42ODZsLTYyLjg4MyA0MzIuMzE0djEzOS42MzdhOTMuMDkgOTMuMDkgMCAwIDAgOTMuMDkxIDkzLjA5aDU1OC41NDZhOTMuMDkgOTMuMDkgMCAwIDAgOTMuMDktOTMuMDlWNjUxLjYzNmwtNjIuODgyLTQzMi4zMTR6IiBmaWxsPSIjMjFBM0REIi8+PHBhdGggZD0iTTI1NiA3NDQuNzI3aDQ2LjU0NXY0Ni41NDZIMjU2di00Ni41NDZ6bTkzLjA5IDBoNDYuNTQ2djQ2LjU0NmgtNDYuNTQ1di00Ni41NDZ6bTkzLjA5MiAwaDQ2LjU0NXY0Ni41NDZoLTQ2LjU0NXYtNDYuNTQ2em05My4wOSAwaDQ2LjU0NnY0Ni41NDZoLTQ2LjU0NXYtNDYuNTQ2em05My4wOTIgMGg0Ni41NDV2NDYuNTQ2aC00Ni41NDV2LTQ2LjU0NnptOTMuMDkgMEg3Njh2NDYuNTQ2aC00Ni41NDV2LTQ2LjU0NnptLTI2Ni42MTItMjQ0LjQxYy0xMi40MDQgOC42MTEtMjYuNzYzIDEyLjg5My00My4xMjQgMTIuODkzLTIwLjQ4IDAtMzYuMDI2LTcuMDI4LTQ2LjY2Mi0yMS4wNjItMTAuNjM2LTE0LjAzMy0xNS45NjUtMzQuMzUtMTUuOTY1LTYwLjk1IDAtMjUuNjk0IDUuMTQzLTQ1LjgwMiAxNS40NTMtNjAuMzI0IDEwLjMxLTE0LjUyMiAyNi4wNDItMjEuNzgzIDQ3LjE3NC0yMS43ODMgNy42MSAwIDE1LjE1Ljk3NyAyMi42MiAyLjkwOSA3LjQ3MSAxLjk1NSAxMy41IDQuNTE1IDE4LjAzNyA3LjcyN2wtNi4wNSAxNC40NTJhNjguOTM0IDY4LjkzNCAwIDAgMC0zNC42MDctOC45NmMtMTQuNTY5IDAtMjUuMzkgNS4yODMtMzIuNDg5IDE1Ljg0OS03LjA5OCAxMC41NjUtMTAuNjM2IDI3LjI3NS0xMC42MzYgNTAuMTMgMCA0My45MTUgMTQuMzYgNjUuODYgNDMuMTI1IDY1Ljg2IDEyLjE3MSAwIDI0LjY0Ni0zLjcyMyAzNy40LTExLjE3bDUuNzI0IDE0LjQzem0yMy4xMS0xNDguMmg0MC4wOTljMTUuMTUgMCAyNy4yOTkgMy44MTYgMzYuMzk4IDExLjQwMyA5LjEyMyA3LjYzMyAxMy42ODUgMTguMTUzIDEzLjY4NSAzMS41MTEgMCAxMy40MjktNC41MzggMjQuMTU3LTEzLjYxNSAzMi4xODYtOS4wNzYgOC4wMy0yMC45NjggMTIuMDU2LTM1LjY3NyAxMi4wNTZoLTIyLjUyOHY3MC45MTJINDc3LjkzVjM1Mi4xMTZ6bTE4LjM4NSA3MS4xNDRoMTkuOTIyYzIxLjU3NCAwIDMyLjM3Mi05LjA1MyAzMi4zNzItMjcuMTEzIDAtOC4zNzgtMi45MzItMTUuMTI3LTguNzk3LTIwLjI5My01Ljg2NS01LjE0NC0xMy40MjgtNy43MjctMjIuNjktNy43MjdoLTIwLjgzdjU1LjEzM3ptMTc4LjU3MiA4Ni45MjRoLTgyLjU3MlYzNTIuMTE2aDgxLjkydjE2LjAxMmgtNjMuNTM0djQ4Ljk2Nmg2MS4wNDR2MTYuMDExaC02MS4wNDR2NjEuMDQ1aDY0LjE4NnYxNi4wMzV6IiBmaWxsPSIjMjFBM0REIi8+PC9zdmc+',
  PON_21A3DD:'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGZpbGw9IiMyMUEzREQiIGQ9Ik0xMDE5LjcxMiAxNzIuN2MwLTkzLjU3NS03NS44NTYtMTY5LjQzMi0xNjkuNDMtMTY5LjQzMkgxNzIuNTlDNzkuMDE3IDMuMjY4IDMuMTYgNzkuMTI1IDMuMTYgMTcyLjd2Njc3LjY5YzAgOTMuNTc0IDc1Ljg1NyAxNjkuNDMxIDE2OS40MyAxNjkuNDMxaDY3Ny42OTJjOTMuNTc0IDAgMTY5LjQzLTc1Ljg1NyAxNjkuNDMtMTY5LjQzVjE3Mi42OThabS04NC44MSA2NDcuOTUyYzAgNjMuODAxLTUxLjcyIDExNS41MjItMTE1LjUyIDExNS41MjJIMjAyLjMyOWMtNjMuOCAwLTExNS41MjEtNTEuNzItMTE1LjUyMS0xMTUuNTIyVjIwMy42YzAtNjMuODAxIDUxLjcyLTExNS41MjIgMTE1LjUyLTExNS41MjJoNjE3LjA1NWM2My44IDAgMTE1LjUyMSA1MS43MiAxMTUuNTIxIDExNS41MjJ2NjE3LjA1MmgtLjAwMVpNODM1LjM2IDU3MS44MjdjLTI3LjcxMyAyNy43MDEtNzIuNjI0IDI3LjcwMS0xMDAuMzI0IDAtOC4wMDctOC4wMDctMTMuNDItMTcuNTE3LTE2LjgwNS0yNy41NjNINjA3LjczM2MtNi40NTMgMTkuMDQxLTE4LjUwNyAzNS40My0zNC4wNTUgNDcuNTA1bDcyLjE4OCAxMjUuMDM2YzEwLjk3NS0yLjU1MyAyMi42MzMtMi44MzIgMzQuMjgyLjI4OCAzNy44MzUgMTAuMTQzIDYwLjMwMiA0OS4wMzggNTAuMTU4IDg2Ljg4My0xMC4xMzUgMzcuODQ1LTQ5LjA0IDYwLjMtODYuODg0IDUwLjE1Ny0zNy44NDYtMTAuMTM0LTYwLjMwMi00OS4wMjktNTAuMTU3LTg2Ljg3NCAzLjE4Ni0xMS45MTYgOS40NjEtMjIuMDY5IDE3LjQyNy0zMC40MDNsLTczLjQ3NC0xMjcuMjUzYy04LjE1NSAyLjExOC0xNi41OTcgMy41NDMtMjUuNDI1IDMuNTQzLTIwLjYyNSAwLTM5Ljc4Ni02LjE5NS01NS44LTE2Ljc4NEwzMDAuMzY4IDc1MS45ODhjNS4zOTMgMTAuMDA2IDguNzM4IDIxLjI2OCA4LjczOCAzMy40NDEgMCAzOS4xNzItMzEuNzU4IDcwLjk0LTcwLjk0IDcwLjk0cy03MC45NC0zMS43NjgtNzAuOTQtNzAuOTRjMC0zOS4xOSAzMS43NTgtNzAuOTQxIDcwLjk0LTcwLjk0MSAxMi4yMTIgMCAyMy41MzUgMy4zNjUgMzMuNTcgOC44MDlsMTU1LjU3OC0xNTUuNTc4Yy0xMC42MzgtMTYuMDM0LTE2Ljg2NC0zNS4yNDQtMTYuODY0LTU1LjkxOCAwLTIwLjgwMiA2LjI4NC00MC4xMjIgMTcuMDMzLTU2LjIxNEwzMTAuMDM2IDMzOC4xNTNjLTEyLjE0MyA3LjI0NS0yNi4yOTYgMTEuNS00MS40NjggMTEuNS00NC43NzMgMC04MS4wNzQtMzYuMzAxLTgxLjA3NC04MS4wNzUgMC00NC43ODMgMzYuMzAyLTgxLjA3NCA4MS4wNzQtODEuMDc0IDQ0Ljc3NCAwIDgxLjA3NiAzNi4yOTEgODEuMDc2IDgxLjA3NCAwIDE0Ljg5NS00LjA4OCAyOC44MS0xMS4xMDYgNDAuODE0bDExNy43MDMgMTE3LjY5M2MxNS45NjQtMTAuNDkxIDM1LjAyNi0xNi42MjYgNTUuNTUyLTE2LjYyNiAxMC42MSAwIDIwLjgyMyAxLjY0MiAzMC40MzIgNC42Nmw2Mi43MzYtMTA4LjY1N2MtNS43My02LjY5LTEwLjIzNC0xNC41ODgtMTIuNjY3LTIzLjY2My04LjY5LTMyLjQzMiAxMC41Ni02NS43ODQgNDMuMDAyLTc0LjQ3NCAxMS45MjYtMy4xOTYgMjMuOTYtMi41NTQgMzQuODY2IDEuMDggNC4yOTUtLjU4NCA4Ljc4OC4xMTggMTIuODI2IDIuNDU0IDQuMDY4IDIuMzQ2IDYuOTM5IDUuOTI5IDguNTcgOS45NzYgOC41MTIgNy42MSAxNS4wMzQgMTcuNjM2IDE4LjIwMSAyOS40ODMgOC43IDMyLjQ0LTEwLjU2IDY1Ljc4NC00Mi45OTIgNzQuNDgzLTkuMDI1IDIuNDE2LTE4LjA2MSAyLjQ3NC0yNi42NzEuODkxbC02Mi40NSAxMDguMTYzYzE5Ljc3NCAxNi45NDMgMzIuODU4IDQxLjM1OSAzNS4wMzUgNjguODcyaDEwNC4xNzNjMy4wNzktMTEuNzc3IDguOTQ3LTIzIDE4LjE4LTMyLjIyNCAyNy43MDItMjcuNzEyIDcyLjYxMy0yNy43MTIgMTAwLjMyNSAwIDE0LjM1IDE0LjM1IDIxLjExIDMzLjMyMyAyMC41ODUgNTIuMTM2IDAgLjExOC4wNC4yMzcuMDQuMzU2IDAgMS40ODUtLjE4OSAyLjkyLS40ODUgNC4zMTUtMS40OTUgMTUuODc1LTcuOTg2IDMxLjM2My0yMC4xNCA0My41MTdaIi8+PC9zdmc+',
  PON_0060F0:'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGZpbGw9IiMwMDYwZjAiIGQ9Ik0xMDE5LjcxMiAxNzIuN2MwLTkzLjU3NS03NS44NTYtMTY5LjQzMi0xNjkuNDMtMTY5LjQzMkgxNzIuNTlDNzkuMDE3IDMuMjY4IDMuMTYgNzkuMTI1IDMuMTYgMTcyLjd2Njc3LjY5YzAgOTMuNTc0IDc1Ljg1NyAxNjkuNDMxIDE2OS40MyAxNjkuNDMxaDY3Ny42OTJjOTMuNTc0IDAgMTY5LjQzLTc1Ljg1NyAxNjkuNDMtMTY5LjQzVjE3Mi42OThabS04NC44MSA2NDcuOTUyYzAgNjMuODAxLTUxLjcyIDExNS41MjItMTE1LjUyIDExNS41MjJIMjAyLjMyOWMtNjMuOCAwLTExNS41MjEtNTEuNzItMTE1LjUyMS0xMTUuNTIyVjIwMy42YzAtNjMuODAxIDUxLjcyLTExNS41MjIgMTE1LjUyLTExNS41MjJoNjE3LjA1NWM2My44IDAgMTE1LjUyMSA1MS43MiAxMTUuNTIxIDExNS41MjJ2NjE3LjA1MmgtLjAwMVpNODM1LjM2IDU3MS44MjdjLTI3LjcxMyAyNy43MDEtNzIuNjI0IDI3LjcwMS0xMDAuMzI0IDAtOC4wMDctOC4wMDctMTMuNDItMTcuNTE3LTE2LjgwNS0yNy41NjNINjA3LjczM2MtNi40NTMgMTkuMDQxLTE4LjUwNyAzNS40My0zNC4wNTUgNDcuNTA1bDcyLjE4OCAxMjUuMDM2YzEwLjk3NS0yLjU1MyAyMi42MzMtMi44MzIgMzQuMjgyLjI4OCAzNy44MzUgMTAuMTQzIDYwLjMwMiA0OS4wMzggNTAuMTU4IDg2Ljg4My0xMC4xMzUgMzcuODQ1LTQ5LjA0IDYwLjMtODYuODg0IDUwLjE1Ny0zNy44NDYtMTAuMTM0LTYwLjMwMi00OS4wMjktNTAuMTU3LTg2Ljg3NCAzLjE4Ni0xMS45MTYgOS40NjEtMjIuMDY5IDE3LjQyNy0zMC40MDNsLTczLjQ3NC0xMjcuMjUzYy04LjE1NSAyLjExOC0xNi41OTcgMy41NDMtMjUuNDI1IDMuNTQzLTIwLjYyNSAwLTM5Ljc4Ni02LjE5NS01NS44LTE2Ljc4NEwzMDAuMzY4IDc1MS45ODhjNS4zOTMgMTAuMDA2IDguNzM4IDIxLjI2OCA4LjczOCAzMy40NDEgMCAzOS4xNzItMzEuNzU4IDcwLjk0LTcwLjk0IDcwLjk0cy03MC45NC0zMS43NjgtNzAuOTQtNzAuOTRjMC0zOS4xOSAzMS43NTgtNzAuOTQxIDcwLjk0LTcwLjk0MSAxMi4yMTIgMCAyMy41MzUgMy4zNjUgMzMuNTcgOC44MDlsMTU1LjU3OC0xNTUuNTc4Yy0xMC42MzgtMTYuMDM0LTE2Ljg2NC0zNS4yNDQtMTYuODY0LTU1LjkxOCAwLTIwLjgwMiA2LjI4NC00MC4xMjIgMTcuMDMzLTU2LjIxNEwzMTAuMDM2IDMzOC4xNTNjLTEyLjE0MyA3LjI0NS0yNi4yOTYgMTEuNS00MS40NjggMTEuNS00NC43NzMgMC04MS4wNzQtMzYuMzAxLTgxLjA3NC04MS4wNzUgMC00NC43ODMgMzYuMzAyLTgxLjA3NCA4MS4wNzQtODEuMDc0IDQ0Ljc3NCAwIDgxLjA3NiAzNi4yOTEgODEuMDc2IDgxLjA3NCAwIDE0Ljg5NS00LjA4OCAyOC44MS0xMS4xMDYgNDAuODE0bDExNy43MDMgMTE3LjY5M2MxNS45NjQtMTAuNDkxIDM1LjAyNi0xNi42MjYgNTUuNTUyLTE2LjYyNiAxMC42MSAwIDIwLjgyMyAxLjY0MiAzMC40MzIgNC42Nmw2Mi43MzYtMTA4LjY1N2MtNS43My02LjY5LTEwLjIzNC0xNC41ODgtMTIuNjY3LTIzLjY2My04LjY5LTMyLjQzMiAxMC41Ni02NS43ODQgNDMuMDAyLTc0LjQ3NCAxMS45MjYtMy4xOTYgMjMuOTYtMi41NTQgMzQuODY2IDEuMDggNC4yOTUtLjU4NCA4Ljc4OC4xMTggMTIuODI2IDIuNDU0IDQuMDY4IDIuMzQ2IDYuOTM5IDUuOTI5IDguNTcgOS45NzYgOC41MTIgNy42MSAxNS4wMzQgMTcuNjM2IDE4LjIwMSAyOS40ODMgOC43IDMyLjQ0LTEwLjU2IDY1Ljc4NC00Mi45OTIgNzQuNDgzLTkuMDI1IDIuNDE2LTE4LjA2MSAyLjQ3NC0yNi42NzEuODkxbC02Mi40NSAxMDguMTYzYzE5Ljc3NCAxNi45NDMgMzIuODU4IDQxLjM1OSAzNS4wMzUgNjguODcyaDEwNC4xNzNjMy4wNzktMTEuNzc3IDguOTQ3LTIzIDE4LjE4LTMyLjIyNCAyNy43MDItMjcuNzEyIDcyLjYxMy0yNy43MTIgMTAwLjMyNSAwIDE0LjM1IDE0LjM1IDIxLjExIDMzLjMyMyAyMC41ODUgNTIuMTM2IDAgLjExOC4wNC4yMzcuMDQuMzU2IDAgMS40ODUtLjE4OSAyLjkyLS40ODUgNC4zMTUtMS40OTUgMTUuODc1LTcuOTg2IDMxLjM2My0yMC4xNCA0My41MTdaIi8+PC9zdmc+',
  ONT_WARN_ORANGE_PNG:'data:image/png;base64,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RiAARiAARqCMQACMQACMQBmBABiBABiBMgIBMAIBMAJlBAJgBAJgBMoIBPD670UAwAiUEQiAEQiAESgjEAAjEAAjUEYgAEYgAEagjEAAjEAAjEAZgQAYgQAYgTICATACATACZQQCYAQCYATKCATACATACJQRCIARCIARKCMQACMQACNQRiAARiCAFwEZgQAYgQAYgTICATACATACZQQCYAQCYATKCATACATACJQRCIARCIARKCMQACMQACNQRiAARiAARqCMQACMQACMQBmBABiBABiBMgIBMAIBMAJlBAJgBAJgBBqB/hwAGIEAGIEyAgEwAgEwAmUEAmAEAmAEyggEwAgEwAiUEQiAEQiAESgjEAAjEAAjUEYgAEYgAEagjEAAjEAAjEAZgQAYgQAYgTICATACATACZQQCYAQCYATK6z+AEQiAESgjEAAjEAAjUEYgAEYgAEagjEAAjEAAjEAZgQAYgQAYgTICATACATACZQQCYAQCYATKCATACATACJQRCIARCIARKCMQACMQACNQRiAARiAARqCMQACv/x4EgBEoIxAAIxAAI1BGIABGIABGoIxAAIxAAIxAGYEAGIEAGIEyAgEwAgEwAmUEAmAEAmAEyggEwAgEwAiUEQiAEQiAESgjEAAjEAAjUEYgAEYgAEagjEAAvAgAGIEyAgEwAgEwAmUEAmAEAmAEyggEwAgEwAiUEQiAEQiAESgjEAAjEAAjUEYgAEYgAEagjEAAjEAAjEAZgQAYgQAYgTICATACATACZQQCYAQCYATKCATACATwIiAjEAAjEAAjUEYgAEYgAEagjEAAjEAAjEAZgQAYgQAYgTICATACATACZQQCYAQCYATKCATACATACJQRCIARCIARKCMQACMQACNQRiAARiAARqCMQACMQACMQCPQnwEAIxAAI1BGIABGIABGoIxAAIxAAIxAGYEAGIEAGIEyAgEwAgEwAmUEAmAEAmAEyggEwAgEwAiUEQiAEQiAESgjEAAjEAAjUEYgAEYgAEagjEAAjEAAjEB5/QcwAj0MACNQRiAARiAARqCMQACMQACMQBmBABiBABiBMgIBMAIBMAJlBAJgBAJgBMoIBMAIBMAIlBEIgBEIgBEoIxAAIxAAI1BGIABGIABGoIxAAIxAAIxAGYEAXv+9CAAYgTICATACATACZQQCYAQCYATKCATACATACJQRCIARCIARKCMQACMQACNQRiAARiAARqCMQACMQACMQBmBABiBABiBMgIBMAIBMAJlBAJgBAJgBMoIBMAIBPAiICMQACMQACNQRiAARiAARqCMQACMQACMQBmBABiBABiBMgIBMAIBMAJlBAJgBAJgBMoIBMAIBMAIlBEIgBEIgBEoIxAAIxAAI1BGIABGIABGoIxAAIxAAMwgIxAAIxAAI1BGIABGIABGoIxAAIxAAIxAGYEAGIEAGIEyAgEwAgEwAmUEAmAEAmAEyggEwAgEwAiUEQiAEQiAESgjEAAjEAAjUEYgAEYgAEagjEAAjEAAjEB5/QcwAgEwAmUEAmAEAmAEyggEwAgEwAiUEQiAEQiAESgjEAAjEAAjUEYgAEYgAEagjEAAjEAAjEAZgQAYgQAYgTICATACATACZQQCYAQCYATKCATACATACJQRCGAEehAARqCMQACMQACMQBmBABiBABiBMgIBMAIBMAJlBAJgBAJgBMoIBMAIBMAIlBEIgBEIgBEoIxAAIxAAI1BGIABGIABGoIxAAIxAAIxAGYEAGIEAGIEyAgG8/nsRADACZQQCYAQCYATKCATACATACJQRCIARCIARKCMQACMQACNQRiAARiAARqCMQACMQACMQBmBABiBABiBMgIBMAIBMAJlBAJgBAJgBMoIBMAIBMAIlBEIgBEI4EVARiAARiAARqCMQACMQACMQBmBABiBABiBMgIBMAIBMAJlBAJgBAJgBMoIBMAIBMAIlBEIgBEIgBEoIxAAIxAAI1BGIABGIABGoIxAAIxAAIxAGYEAGIEAGIFGoD8DAEYgAEagjEAAjEAAjEAZgQAYgQAYgTICATACATACZQQCYAQCYATKCATACATACJQRCIARCIARKCMQACMQACNQRiAARiAARqCMQACMQACMQBmBABiBABiB8voPYAQCYATKCATACATACJQRCIARCIARKCMQACMQACNQRiAARiAARqCMQACMQACMQBmBABiBABiBMgIBMAIBMAJlBAJgBAJgBMoIBMAIBMAIlBEIgBEIgBEoIxDA678XAQAjUEYgAEYgAEagjEAAjEAAjEAZgQAYgQAYgTICATACATACZQQCYAQCYATKCATACATACJQRCIARCIARKCMQACMQACNQRiAARiAARqCMQACMQACMQBmBABiBAEagjEAA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',
  ONT_NORMAL_7B68EE:'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODQ2IDg0NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSI0MjMiIGN5PSI0MjMiIHI9IjQyMyIgZmlsbD0iIzdCNjhFRSIvPgogIDxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNDQ3LjY4NCAxNzAuOTU4Yy02LjE2NS0yLjQzNS0xNS4xMjgtLjAxNC0zMy4wNTYgNC44MjdsLTE3NS45MTUgNDcuNTA3Yy0xNy44MjIgNC44MTMtMjYuNzM0IDcuMjE5LTMwLjgzMSAxMi40MDNhMjAuMDAyIDIwLjAwMiAwIDAgMC00LjA5MyAxNS4zMzVjLjk2OSA2LjUzNyA3LjQ5NiAxMy4wNjMgMjAuNTUgMjYuMTE3bDI4Ljg4NSAyOC44ODUtMTA2LjEyMyAxMDYuMTIzYy01LjQ2OCA1LjQ2Ny01LjQ2OCAxNC4zMzIgMCAxOS43OTlsNTAuODU2IDUwLjg1N2M1LjQ2OCA1LjQ2NyAxNC4zMzIgNS40NjcgMTkuNzk5IDBMMzIzLjg4IDM3Ni42ODhsMjguODY4IDI4Ljg2OGMxMy4wNTMgMTMuMDU0IDE5LjU4IDE5LjU4IDI2LjExNyAyMC41NWEyMC4wMDIgMjAuMDAyIDAgMCAwIDE1LjMzNS00LjA5M2M1LjE4NC00LjA5OCA3LjU5LTEzLjAwOSAxMi40MDMtMzAuODMxbDQ3LjUwNi0xNzUuOTE1LjAwMS0uMDAxYzQuODQxLTE3LjkyNyA3LjI2Mi0yNi44OTEgNC44MjYtMzMuMDU1YTE5Ljk5NyAxOS45OTcgMCAwIDAtMTEuMjUyLTExLjI1M1ptLTYwLjYzNiA0OTIuODMxYy0yLjQzNS02LjE2NC0uMDE0LTE1LjEyOCA0LjgyNy0zMy4wNTVsNDcuNTA3LTE3NS45MTZjNC44MTMtMTcuODIyIDcuMjE5LTI2LjczMyAxMi40MDMtMzAuODNhMTkuOTk3IDE5Ljk5NyAwIDAgMSAxNS4zMzUtNC4wOTNjNi41MzYuOTY5IDEzLjA2MyA3LjQ5NiAyNi4xMTcgMjAuNTQ5bDI4Ljg4NSAyOC44ODVMNjI4LjI0MSAzNjMuMjFjNS40NjctNS40NjcgMTQuMzMyLTUuNDY3IDE5Ljc5OSAwbDUwLjg1NyA1MC44NTdjNS40NjcgNS40NjcgNS40NjcgMTQuMzMyIDAgMTkuNzk5TDU5Mi43NzggNTM5Ljk4NWwyOC44NjggMjguODY4YzEzLjA1NCAxMy4wNTQgMTkuNTggMTkuNTgxIDIwLjU1IDI2LjExN2EyMCAyMCAwIDAgMS00LjA5MyAxNS4zMzVjLTQuMDk4IDUuMTg0LTEzLjAwOSA3LjU5MS0zMC44MzEgMTIuNDA0bC0xNzUuOTE1IDQ3LjUwNmgtLjAwMWMtMTcuOTI3IDQuODQxLTI2Ljg5MSA3LjI2Mi0zMy4wNTUgNC44MjdhMjAuMDAxIDIwLjAwMSAwIDAgMS0xMS4yNTMtMTEuMjUzWiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K',
  ONT_NORMAL_7B68EE99:'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODQ2IDg0NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSI0MjMiIGN5PSI0MjMiIHI9IjQyMyIgZmlsbD0iIzdCNjhFRTk5Ii8+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik00NDcuNjg0IDE3MC45NThjLTYuMTY1LTIuNDM1LTE1LjEyOC0uMDE0LTMzLjA1NiA0LjgyN2wtMTc1LjkxNSA0Ny41MDdjLTE3LjgyMiA0LjgxMy0yNi43MzQgNy4yMTktMzAuODMxIDEyLjQwM2EyMC4wMDIgMjAuMDAyIDAgMCAwLTQuMDkzIDE1LjMzNWMuOTY5IDYuNTM3IDcuNDk2IDEzLjA2MyAyMC41NSAyNi4xMTdsMjguODg1IDI4Ljg4NS0xMDYuMTIzIDEwNi4xMjNjLTUuNDY4IDUuNDY3LTUuNDY4IDE0LjMzMiAwIDE5Ljc5OWw1MC44NTYgNTAuODU3YzUuNDY4IDUuNDY3IDE0LjMzMiA1LjQ2NyAxOS43OTkgMEwzMjMuODggMzc2LjY4OGwyOC44NjggMjguODY4YzEzLjA1MyAxMy4wNTQgMTkuNTggMTkuNTggMjYuMTE3IDIwLjU1YTIwLjAwMiAyMC4wMDIgMCAwIDAgMTUuMzM1LTQuMDkzYzUuMTg0LTQuMDk4IDcuNTktMTMuMDA5IDEyLjQwMy0zMC44MzFsNDcuNTA2LTE3NS45MTUuMDAxLS4wMDFjNC44NDEtMTcuOTI3IDcuMjYyLTI2Ljg5MSA0LjgyNi0zMy4wNTVhMTkuOTk3IDE5Ljk5NyAwIDAgMC0xMS4yNTItMTEuMjUzWm0tNjAuNjM2IDQ5Mi44MzFjLTIuNDM1LTYuMTY0LS4wMTQtMTUuMTI4IDQuODI3LTMzLjA1NWw0Ny41MDctMTc1LjkxNmM0LjgxMy0xNy44MjIgNy4yMTktMjYuNzMzIDEyLjQwMy0zMC44M2ExOS45OTcgMTkuOTk3IDAgMCAxIDE1LjMzNS00LjA5M2M2LjUzNi45NjkgMTMuMDYzIDcuNDk2IDI2LjExNyAyMC41NDlsMjguODg1IDI4Ljg4NUw2MjguMjQxIDM2My4yMWM1LjQ2Ny01LjQ2NyAxNC4zMzItNS40NjcgMTkuNzk5IDBsNTAuODU3IDUwLjg1N2M1LjQ2NyA1LjQ2NyA1LjQ2NyAxNC4zMzIgMCAxOS43OTlMNTkyLjc3OCA1MzkuOTg1bDI4Ljg2OCAyOC44NjhjMTMuMDU0IDEzLjA1NCAxOS41OCAxOS41ODEgMjAuNTUgMjYuMTE3YTIwIDIwIDAgMCAxLTQuMDkzIDE1LjMzNWMtNC4wOTggNS4xODQtMTMuMDA5IDcuNTkxLTMwLjgzMSAxMi40MDRsLTE3NS45MTUgNDcuNTA2aC0uMDAxYy0xNy45MjcgNC44NDEtMjYuODkxIDcuMjYyLTMzLjA1NSA0LjgyN2EyMC4wMDEgMjAuMDAxIDAgMCAxLTExLjI1My0xMS4yNTNaIiBmaWxsPSIjRkZGRkZGIi8+Cjwvc3ZnPgo=',
  ONT_WARN_FF8000:'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODQ2IDg0NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSI0MjMiIGN5PSI0MjMiIHI9IjQyMyIgZmlsbD0iI0ZGODAwMCIvPgogIDxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNDQ3LjY4NCAxNzAuOTU4Yy02LjE2NS0yLjQzNS0xNS4xMjgtLjAxNC0zMy4wNTYgNC44MjdsLTE3NS45MTUgNDcuNTA3Yy0xNy44MjIgNC44MTMtMjYuNzM0IDcuMjE5LTMwLjgzMSAxMi40MDNhMjAuMDAyIDIwLjAwMiAwIDAgMC00LjA5MyAxNS4zMzVjLjk2OSA2LjUzNyA3LjQ5NiAxMy4wNjMgMjAuNTUgMjYuMTE3bDI4Ljg4NSAyOC44ODUtMTA2LjEyMyAxMDYuMTIzYy01LjQ2OCA1LjQ2Ny01LjQ2OCAxNC4zMzIgMCAxOS43OTlsNTAuODU2IDUwLjg1N2M1LjQ2OCA1LjQ2NyAxNC4zMzIgNS40NjcgMTkuNzk5IDBMMzIzLjg4IDM3Ni42ODhsMjguODY4IDI4Ljg2OGMxMy4wNTMgMTMuMDU0IDE5LjU4IDE5LjU4IDI2LjExNyAyMC41NWEyMC4wMDIgMjAuMDAyIDAgMCAwIDE1LjMzNS00LjA5M2M1LjE4NC00LjA5OCA3LjU5LTEzLjAwOSAxMi40MDMtMzAuODMxbDQ3LjUwNi0xNzUuOTE1LjAwMS0uMDAxYzQuODQxLTE3LjkyNyA3LjI2Mi0yNi44OTEgNC44MjYtMzMuMDU1YTE5Ljk5NyAxOS45OTcgMCAwIDAtMTEuMjUyLTExLjI1M1ptLTYwLjYzNiA0OTIuODMxYy0yLjQzNS02LjE2NC0uMDE0LTE1LjEyOCA0LjgyNy0zMy4wNTVsNDcuNTA3LTE3NS45MTZjNC44MTMtMTcuODIyIDcuMjE5LTI2LjczMyAxMi40MDMtMzAuODNhMTkuOTk3IDE5Ljk5NyAwIDAgMSAxNS4zMzUtNC4wOTNjNi41MzYuOTY5IDEzLjA2MyA3LjQ5NiAyNi4xMTcgMjAuNTQ5bDI4Ljg4NSAyOC44ODVMNjI4LjI0MSAzNjMuMjFjNS40NjctNS40NjcgMTQuMzMyLTUuNDY3IDE5Ljc5OSAwbDUwLjg1NyA1MC44NTdjNS40NjcgNS40NjcgNS40NjcgMTQuMzMyIDAgMTkuNzk5TDU5Mi43NzggNTM5Ljk4NWwyOC44NjggMjguODY4YzEzLjA1NCAxMy4wNTQgMTkuNTggMTkuNTgxIDIwLjU1IDI2LjExN2EyMCAyMCAwIDAgMS00LjA5MyAxNS4zMzVjLTQuMDk4IDUuMTg0LTEzLjAwOSA3LjU5MS0zMC44MzEgMTIuNDA0bC0xNzUuOTE1IDQ3LjUwNmgtLjAwMWMtMTcuOTI3IDQuODQxLTI2Ljg5MSA3LjI2Mi0zMy4wNTUgNC44MjdhMjAuMDAxIDIwLjAwMSAwIDAgMS0xMS4yNTMtMTEuMjUzWiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K',
  
};

//из device_port_list
class DevicePortInfo {
  constructor(port={}){
    this.deviceName=port.device_name||''
    this.devicePortName=port.name||''
    this.ifIndex=port.snmp_number||0
    this.ifName=port.snmp_name||''
    this.ifAlias=port.snmp_description||''
  }
};
class DevicePortAbonInfo {
  constructor(sub={}){
    this.accountId=sub.account||''
    this.mac=sub.mac||''
    this.flatNumber=sub.flat||''
    this.abonName=sub.name||''
    this.abonType=sub.type||''
  }
};

//для сохранения в jbjectsInfj
class ObjectInfo {
  constructor(objectType,objectId,props={}){
    this.objectType=objectType||''
    this.objectId=objectId||''
    for(const [key,value] of Object.entries(props)){
      this[key]=value
    }
  }
};
class PortObjectInfo extends ObjectInfo {
  constructor(port={}){
    super('port',port.name)
    this.deviceName=port.device_name||''
  }
};
class AbonObjectInfo extends ObjectInfo {
  constructor(port={},sub={}){
    super('abon',sub.account)
    this.deviceName=port.device_name||''
    this.devicePortName=port.name||''
  }
};


//сдвиг вправо вверх на multipler=1 - около 33м
function nearCoordinates([lat=0,lon=0]=[],multipler=1){
  return [
    lat+(0.0002*multipler),
    lon+(0.0004*multipler)
  ];
};
//сдвиг разбросом на multipler=1 - около 33м
function nearCoordinatesRand([lat=0,lon=0]=[],multipler=1){
  const lat_adj=Math.random()*(0.0002*multipler);
  const lon_adj=Math.random()*(0.0004*multipler);
  return [
    lat+(Math.random()>0.5?lat_adj:-lat_adj),
    lon+(Math.random()>0.5?lon_adj:-lon_adj)
  ];
};

function sortPointsToArea(points=[]){
  const centroid_lat=points.reduce((sum,[lat])=>sum+lat,0)/points.length;
  const centroid_lon=points.reduce((sum,[,lon])=>sum+lon,0)/points.length;
  const calc=points.reduce((calc,[lat,lon])=>{
    const adjacent=lat-centroid_lat;
    const opposite=lon-centroid_lon;
    const hypotenuse=Math.sqrt(adjacent**2+opposite**2);
    const sin=Math.abs(opposite)/hypotenuse;
    let angle=(Math.asin(sin)*180.0)/Math.PI;//rad to deg
    if(adjacent<0&&opposite>0){
      angle=180-angle;
    }else if(adjacent<0&&opposite<0){
      angle+=180;
    }else if(adjacent>0&&opposite<0){
      angle=360-angle;
    };
    calc.push([angle,hypotenuse,lat,lon]);
    return calc
  },[]);
  calc.sort(([a1,h1],[a2,h2])=>a1-a2+h1-h2);//sort by angle and dist center-point
  calc.push(calc[0]);//add first as last, close line
  return calc.map(([angle,hypotenuse,lat,lon])=>[lat,lon]);
};

(function(id=`YMaps-css`){
  document.getElementById(id)?.remove();
  const el=Object.assign(document.createElement('style'),{type:'text/css',id});
  //нужно задать размеры начально
  el.appendChild(document.createTextNode(`
    [name="YMapsBalloon"]{
      width:500px;
      height:300px;
      font-family:Inter;
      font-size:11px;
      line-height:12px;
    }
    [name="YMapsHint"]{
      min-width:200px;
      min-height:100px;
      width:fit-content;
      height:fit-content;
      font-family:Inter;
      font-size:11px;
      line-height:12px;
    }
    .ymaps-2-1-79-hint--- {
      padding: 0 !important;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 !important;
      border: 0 !important;
      max-width: 270px;
    }
    .ymaps-2-1-79-hint__text--- {
      padding: 8px 16px !important;
      background: #fff !important;
      font: inherit important;
      display: block;
      float: initial;
      color: #212121;
      font-size: 14px;
      line-height: 20px;
    }
  `));
  document.body.insertAdjacentElement('afterBegin',el);
}());

const YMAPS_HINT_VIEW_NAME=`YMapsHint`;
const YMAPS_BALLOON_VIEW_NAME=`YMapsBalloon`;
function mountView(name,properties={}){
  return new Vue({
    store,
    template:`<div name="${name}">
      <div>mapObjectId: {{mapObjectId}}</div>
      <div>mapObjectType: {{mapObjectType}}</div>
      <div>objectId: {{objectId}}</div>
      <div>objectType: {{objectType}}</div>
      <template v-if="objectType=='abon'">
        <OntInfo v-if="abonOnt&&abonOntPort" v-bind="{ont:abonOnt,port:abonOntPort}" class="margin-top-16px margin-bottom-unset margin-left-right-unset"/>
        <pre>{{devicePortAbonInfo}}</pre>
        <pre>{{abonOnt}}</pre>
      </template>
      <device-info v-else-if="objectType=='device'" :networkElement="getDeviceInfo(objectId)" addBorder autoSysInfo hideEntrances showLocation/>
      <device-info v-else-if="objectType=='port'" :networkElement="getDeviceInfo(deviceName)" :ports="[getDevicePort(deviceName,devicePortName)]" addBorder autoSysInfo hideEntrances showLocation/>
    </div>`,
    data:()=>({
      name,
      ...properties,
    }),
    created(){},
    mounted(){},
    computed:{
      ...mapGetters({
        getDeviceInfo:'em_gpon/getDeviceInfo',
        getDevicePort:'em_gpon/getDevicePort',
        getDevicePortAbonInfo:'em_gpon/getDevicePortAbonInfo',
        getAbonOnt:'em_gpon/getAbonOnt',
      }),
      devicePortAbonInfo(){return this.objectType=='abon'?this.getDevicePortAbonInfo(this.deviceName,this.devicePortName,this.accountId):null},
      abonOnt(){return this.objectType=='abon'?this.getAbonOnt(this.accountId):null},
      abonOntPort(){return this.objectType=='abon'?this.getDevicePort(this.deviceName,this.devicePortName):null},
    },
    destroyed(){},
  }).$mount(`[name="${name}"]`);
};

store.registerModule('em_gpon',{
  namespaced:true,
  state:()=>({
    loads:{},
    sitesNodesInfo:{},
    devices:{},
    devicesInfo:{},
    devicesPorts:{},
    devicesPortsLinks:{},
    devicesPortsDdm:{},
    devicesPortsOnts:{},
    devicesPortsInfo:{},
    objectsInfo:{},
    timer:null,
    started:false,
    userActionPause:false,
    setObjectInfoPause:false,
    setMapObjects:()=>{},
    abonsOnt:{},
  }),
  getters:{
    timer:state=>state.timer,
    started:state=>state.started,
    userActionPause:state=>state.userActionPause,
    setObjectInfoPause:state=>state.setObjectInfoPause,
    loads:state=>state.loads,
    sitesNodesInfo:state=>state.sitesNodesInfo,
    devices:state=>state.devices,
    devicesList:(state,getters)=>Object.entries(getters.devices).filter(([deviceName,selected])=>selected).map(([deviceName])=>deviceName),
    devicesCount:(state,getters)=>getters.devicesList.length,
    devicesInfo:state=>state.devicesInfo,
    getDeviceInfo:(state,getters)=>(deviceName)=>getters.devicesInfo[deviceName],
    getDeviceSiteCoordinates:(state,getters)=>(deviceName)=>{
      const siteNode=getters.sitesNodesInfo[getters.getDeviceInfo(deviceName)?.uzel?.name];
      if(!siteNode){return};
      return [siteNode.coordinates.latitude,siteNode.coordinates.longitude]
    },
    devicesPortsInfo:state=>state.devicesPortsInfo,
    devicesPorts:state=>state.devicesPorts,
    objectsInfo:state=>state.objectsInfo,
    getDevicePorts:state=>(deviceName)=>state.devicesPorts[deviceName]||[],
    //потом добавить условие PON_ONLY
    getDevicePortsHasAbons:(state,getters)=>(deviceName)=>getters.getDevicePorts(deviceName).filter(({subscriber_list})=>subscriber_list?.length),
    getDevicePort:(state,getters)=>(deviceName,devicePortName)=>getters.getDevicePorts(deviceName).find(({name})=>name===devicePortName),
    getDeviceAbons:(state,getters)=>(deviceName)=>{
      return getters.getDevicePorts(deviceName).reduce((abons,port)=>{
        for(const sub of port.subscriber_list||[]){
          abons.push({...new DevicePortAbonInfo(sub),...new DevicePortInfo(port)});
        };
        return abons
      },[])
    },
    getDeviceObjectsIds:(state,getters)=>(deviceName)=>{
      return [...getters.getDevicePorts(deviceName).reduce((ids,port)=>{
        ids.add(port.name);
        for(const sub of port.subscriber_list||[]){
          ids.add(sub.account);
        };
        return ids;
      },new Set())];
    },
    getDeviceAbsentObjectsIds:(state,getters)=>(deviceName)=>{
      return [...getters.getDeviceObjectsIds(deviceName).reduce((ids,objectId)=>{
        if(!getters.getObjectInfo(objectId)){ids.add(objectId)};
        return ids
      },new Set())];
    },
    getDeviceAbsentObjectsInfo:(state,getters)=>(deviceName)=>{
      return getters.getDevicePorts(deviceName).reduce((absentObjectsInfo,port)=>{
        if(!getters.getObjectInfo(port.name)){
          absentObjectsInfo[port.name]=new PortObjectInfo(port);
        };
        for(const sub of port.subscriber_list||[]){
          if(!getters.getObjectInfo(sub.account)){
            absentObjectsInfo[sub.account]=new AbonObjectInfo(port,sub);
          };
        };
        return absentObjectsInfo;
      },{});
    },
    getObjectInfo:(state,getters)=>(objectId)=>getters.objectsInfo[objectId],
    getDevicePortAbonsCount:(state,getters)=>(deviceName,devicePortName)=>{
      const port=getters.getDevicePort(deviceName,devicePortName);
      return port?.subscriber_list?port.subscriber_list?.length:0;
    },
    getDevicePortAbons:(state,getters)=>(deviceName,devicePortName)=>{
      const port=getters.getDevicePort(deviceName,devicePortName);
      if(!port){return []};
      return (port.subscriber_list||[]).map(sub=>{
        return {...new DevicePortAbonInfo(sub),...new DevicePortInfo(port)};
      });
    },
    getDevicePortAbonInfo:(state,getters)=>(deviceName,devicePortName,accountId)=>{
      const port=getters.getDevicePort(deviceName,devicePortName);
      if(!port){return};
      const sub=(port.subscriber_list||[]).find(({account})=>account==accountId);
      if(!sub){return};
      return {...new DevicePortAbonInfo(sub),...new DevicePortInfo(port)};
    },
    getDeviceObjectsInfo:(state,getters)=>(deviceName)=>select(getters.objectsInfo,{deviceName}),
    getDevicePortAreaCoordinates:(state,getters)=>(deviceName,devicePortName)=>{
      const objectsInfo=getters.getDeviceObjectsInfo(deviceName);
      const portAbons=getters.getDevicePortAbons(deviceName,devicePortName);
      
      const points=portAbons.reduce((points,{accountId})=>{
        const [lat,lon]=objectsInfo[accountId]?.coordinates||[];
        if(!lat||!lon){return points};
        points.push([lat,lon]);
        return points;
      },[]);
      return points.length>2?[sortPointsToArea(points),[]]:null;
    },
    devicesPortsLinks:state=>state.devicesPortsLinks,
    getDevicePortsLinks:(state,getters)=>(deviceName)=>getters.devicesPortsLinks[deviceName]||[],
    getDevicePortLink:(state,getters)=>(deviceName,ifIndex)=>getters.getDevicePortsLinks(deviceName).find(({index_iface})=>index_iface===ifIndex),
    devicesPortsDdm:state=>state.devicesPortsDdm,
    getDevicePortsDdm:(state,getters)=>(deviceName)=>getters.devicesPortsDdm[deviceName]||[],
    getDevicePortDdm:(state,getters)=>(deviceName,ifIndex)=>getters.getDevicePortsDdm(deviceName).find(({DdmInfoIndex})=>DdmInfoIndex===ifIndex),
    devicesPortsOnts:state=>state.devicesPortsOnts,
    getDevicePortOnts:(state,getters)=>(devicePortName)=>getters.devicesPortsOnts[devicePortName]||[],
    abonsOnt:state=>state.abonsOnt,
    getAbonOnt:(state,getters)=>(accountId)=>getters.abonsOnt[accountId],
  },
  mutations:{
    setVal(state,[key,value]){
      if(!key){return};
      Vue.set(state,key,value);
    },
    setItem(state,[path,value]){
      const [section,_key,..._keyParts]=path.split('/');
      const key=[_key,..._keyParts].join('/');//костыль для имен со слешами
      if(!key){return};
      Vue.set(state[section],key,value);
    },
    delItem(state,[path,value]){
      const [section,_key,..._keyParts]=path.split('/');
      const key=[_key,..._keyParts].join('/');//костыль для имен со слешами
      if(!key){return};
      delete state[section][key];
    },
  },
  actions:{
    startUpdate({commit,getters,dispatch},setMapObjects){
      if(getters.started){return};
      commit('setVal',['started',!0]);
      commit('setVal',['setMapObjects',setMapObjects]);//для обновления объектов карты
      dispatch('update');
    },
    setUserActionPause({commit},value){
      commit('setVal',['userActionPause',Boolean(value)]);
      console.log('userActionPause',Boolean(value))
    },
    setObjectInfoPause({commit},value){
      commit('setVal',['setObjectInfoPause',Boolean(value)]);
      console.log('setObjectInfoPause',Boolean(value))
    },
    async update({commit,getters,dispatch}){
      if(getters.userActionPause||getters.setObjectInfoPause){
        //await new Promise(resolve=>setTimeout(resolve,22222));
      }else{
        await Promise.allSettled(getters.devicesList.map(deviceName=>dispatch('updateDevice',deviceName)));
      };
      commit('setVal',['timer',setTimeout(()=>{
        dispatch('update');
      },10000)]);
    },
    async addDevice({commit,dispatch},deviceName=''){
      commit('setItem',['devices/'+deviceName,!0]);
      dispatch('updateDevice',deviceName)
    },
    async delDevice({commit,getters,dispatch},deviceName=''){
      commit('setItem',['devices/'+deviceName,!1]);
      for(const objectId of Object.keys(getters.getDeviceObjectsInfo(deviceName))){
        commit('delItem',['objectsInfo/'+objectId]);
      };
      
      for(const {name,subscriber_list} of Object.values(getters.getDevicePorts(deviceName))){
        commit('delItem',['devicesPortsInfo/'+name]);
        commit('delItem',['devicesPortsOnts/'+name]);
        commit('delItem',['objectsInfo/'+name]);
        for(const sub of subscriber_list||[]){
          commit('delItem',['objectsInfo/'+sub.account]);
          commit('delItem',['abonsOnt/'+sub.account]);
        };
      };
      commit('delItem',['devicesPorts/'+deviceName]);
      
      commit('delItem',['devicesInfo/'+deviceName]);
      commit('delItem',['devicesPortsLinks/'+deviceName]);
      commit('delItem',['devicesPortsDdm/'+deviceName]);
    },
    async updateDevice({commit,getters,dispatch,state},deviceName=''){
      const loadKey=`updateDevice-${deviceName}`;
      if(getters.loads[loadKey]){return};
      commit('setItem',['loads/'+loadKey,!0]);
      await dispatch('getDeviceInfo',deviceName);
      const device=getters.getDeviceInfo(deviceName);
      if(device){
        await Promise.allSettled([
          dispatch('getSiteNodeInfo',device.uzel.name),//раз в сутки, или реже
          dispatch('getDevicePorts',deviceName),
        ]).then(state.setMapObjects);
        //после получения портов и абонентов устройства
        await dispatch('getDeviceAbsentObjectsInfo',deviceName);
        //сохранение пустышек дочерних объектов
        dispatch('setDeviceAbsentObjectsInfo',deviceName).then(state.setMapObjects);
        
        //сервис асинхронный, нет контроля версий, может не сразу вернуть обновления через setDeviceAbsentObjectsInfo
        //dispatch('getDeviceAbsentObjectsInfo',deviceName).then(state.setMapObjects);
        
        //нет небходимости так как есть subscriber_list в device_port_list
        //for(const {name:devicePortName} of getters.getDevicePortsList(deviceName)){
        //  dispatch('getDevicePortInfo',{deviceName,devicePortName,trunk:false});
        ///};
        
        //оперативные данные, обновлять каждые 10-60 сек
        await dispatch('getDevicePortsLinks',deviceName);
        await dispatch('getDevicePortsDdm',deviceName);
        for(const {name:devicePortName,snmp_number:ifIndex,snmp_name:ifName} of getters.getDevicePortsHasAbons(deviceName)){
          await dispatch('getDevicePortOnts',{deviceName,devicePortName,ifIndex,ifName});
          dispatch('fillDevicePortAbonsOnts',{deviceName,devicePortName});
        };
      };
      commit('setItem',['loads/'+loadKey,!1]);
    },
    async getDeviceInfo({getters,commit},deviceName){
      if(!deviceName){console.warn('getDeviceInfo.error.deviceName');return};
      const loadKey=`search_ma-${deviceName}`;
      if(getters.loads[loadKey]){return};
      commit('setItem',['loads/'+loadKey,!0]);
      const cache=localStorageCache.getItem(`device/${deviceName}`);
      if(cache){
        commit('setItem',['devicesInfo/'+deviceName,Object.freeze(cache)]);
      }else{
        try{
          const response=await httpGet(buildUrl('search_ma',{pattern:deviceName},'/call/v1/search/'));
          if(response?.data){
            localStorageCache.setItem(`device/${deviceName}`,response.data,CACHE_1HOUR);
            commit('setItem',['devicesInfo/'+deviceName,Object.freeze(response.data)]);
          };
        }catch(error){
          console.warn('search_ma.error',error);
        };
      };
      commit('setItem',['loads/'+loadKey,!1]);
    },
    async getSiteNodeInfo({getters,commit},nodeName){
      if(!nodeName){console.warn('getSiteNodeInfo.error.nodeName');return};
      const loadKey=`sitesNodesInfo-${nodeName}`;
      if(getters.loads[loadKey]){return};
      commit('setItem',['loads/'+loadKey,!0]);
      const cache=localStorageCache.getItem(`siteNodeInfo-${nodeName}`);
      if(cache){
        commit('setItem',['sitesNodesInfo/'+nodeName,Object.freeze(cache)]);
      }else{
        try{
          const response=await httpGet(buildUrl('search_ma',{pattern:nodeName},'/call/v1/search/'));
          if(response?.data?.id){
            localStorageCache.setItem(`siteNodeInfo-${nodeName}`,response.data,CACHE_1DAY);
            commit('setItem',['sitesNodesInfo/'+nodeName,Object.freeze(response.data)]);
          };
        }catch(error){
          console.warn('search_ma.error',error);
        };
      };
      commit('setItem',['loads/'+loadKey,!1]);
    },
    async getDevicePorts({getters,commit},deviceName){
      if(!deviceName){console.warn('getDevicePorts.error.deviceName');return};
      const loadKey=`device_port_list-${deviceName}`;
      if(getters.loads[loadKey]){return};
      commit('setItem',['loads/'+loadKey,!0]);
      const cache=localStorageCache.getItem(`device_port_list/${deviceName}`)||localStorageCache.getItem(`ports-map:device_port_list/${deviceName}`);
      if(cache?.response){
        commit('setItem',['devicesPorts/'+deviceName,Object.freeze(cache.response)]);
      }else{
        try{
          const response=await httpGet(buildUrl('device_port_list',{device:deviceName},'/call/device/'));
          if(Array.isArray(response)){
            const cache={date:new Date(),response};
            localStorageCache.setItem(`device_port_list/${deviceName}`,cache,CACHE_1HOUR);
            for(const port of response){//т.к структура идентичная сваливаем порты в кэш
              localStorageCache.setItem(`port/PORT-${port.device_name}/${port.snmp_number}`,port);
            };
            commit('setItem',['devicesPorts/'+deviceName,Object.freeze(response)]);
          }else{
            commit('setItem',['devicesPorts/'+deviceName,[]]);
          };
        }catch(error){
          console.warn('device_port_list.error',error);
          commit('setItem',['devicesPorts/'+deviceName,[]]);
        };
      };
      commit('setItem',['loads/'+loadKey,!1]);
    },
    async getObjectInfo({getters,commit,dispatch},objectId=''){
      if(!objectId){console.warn('getObjectInfo.error.objectId');return};
      const ids=Array.isArray(objectId)?objectId:objectId?.split(',');
      if(!ids.length){return};
      const MAX_IDS_PER_QUERY=100;//ограничение длинны url
      if(ids.length>MAX_IDS_PER_QUERY){//делим на запросы
        return await Promise.allSettled(ids.reduce((p,c)=>{
          if(p[p.length-1].length==MAX_IDS_PER_QUERY){p.push([])};
          p[p.length-1].push(c);
          return p;
        },[[]]).map(ids=>dispatch('getObjectInfo',ids)));
      };
      //console.log(ids)
      for(const objectId of ids){
        const loadKey=`getObjectInfo-${objectId}`;
        commit('setItem',['loads/'+loadKey,true]);
      };
      try{
        const response=await fetch(`https://script.google.com/macros/s/AKfycbzWu5nNAkKO7H7hgd9tAjg4srIf430lZdU1HTauUP7MNjNPoZAyoVlpHsMGhNjL0NPn/exec?action=select_objectId&objectId=${ids.map(encodeURIComponent).join(',')}`).then(r=>r.json())
        if(response){
          for(const [objectId,objectInfo] of Object.entries(response)){
            commit('setItem',['objectsInfo/'+objectId,objectInfo]);
          };
        };
      }catch(error){
        console.warn('getObjectInfo.error',error);
      };
      for(const objectId of ids){
        const loadKey=`getObjectInfo-${objectId}`;
        commit('setItem',['loads/'+loadKey,!true]);
      };
    },
    async getDeviceAbsentObjectsInfo({getters,commit,dispatch},deviceName=''){
      if(!deviceName){console.warn('getDeviceAbsentObjectsInfo.error.deviceName');return};
      const loadKey=`getDeviceAbsentObjectsInfo-${deviceName}`;
      commit('setItem',['loads/'+loadKey,!0]);
      await dispatch('getObjectInfo',getters.getDeviceAbsentObjectsIds(deviceName));
      commit('setItem',['loads/'+loadKey,!1]);
    },
    async getDevicePortInfo({getters,commit},{deviceName,devicePortName,trunk=false}={}){
      if(!deviceName||!devicePortName){return};
      const loadKey=`port_info-${devicePortName}`;
      if(getters.loads[loadKey]){return};
      commit('setItem',['loads/'+loadKey,!0]);
      const cache=localStorageCache.getItem(`port_info:cp/${devicePortName}`);
      if(cache){
        commit('setItem',['devicesPortsInfo/'+devicePortName,Object.freeze(cache)]);
      }else{
        try{
          const response=await httpGet(buildUrl('port_info',{device:deviceName,port:devicePortName,trunk},'/call/device/'));
          if(Array.isArray(response)){
            localStorageCache.setItem(`port_info:cp/${devicePortName}`,response,CACHE_1HOUR);
            commit('setItem',['devicesPortsInfo/'+devicePortName,Object.freeze(response)]);
          }else{
            commit('setItem',['devicesPortsInfo/'+devicePortName,[]]);
          };
        }catch(error){
          console.warn('search_ma.error',error);
          commit('setItem',['devicesPortsInfo/'+devicePortName,[]]);
        };
      };
      commit('setItem',['loads/'+loadKey,!1]);
    },
    async getDevicePortsLinks({getters,commit},deviceName=''){
      if(!deviceName){console.warn('getDevicePortsLinks.error.deviceName');return};
      const loadKey=`port_statuses-${deviceName}`;
      if(getters.loads[loadKey]){return};
      commit('setItem',['loads/'+loadKey,!0]);
      try{
        const response=await httpPost(buildUrl('port_statuses',{},'/call/hdm/'),{devices:[{DEVICE_NAME:deviceName}]});
        if(Array.isArray(response?.[deviceName]?.ports)){
          commit('setItem',['devicesPortsLinks/'+deviceName,Object.freeze(response[deviceName].ports)]);
        }else{
          commit('setItem',['devicesPortsLinks/'+deviceName,[]]);
        };
      }catch(error){
        console.warn('port_statuses.error',error);
        commit('setItem',['devicesPortsLinks/'+deviceName,[]]);
      };
      commit('setItem',['loads/'+loadKey,!1]);
    },
    async getDevicePortsDdm({getters,commit},deviceName){
      if(!deviceName){console.warn('getDevicePortsDdm.error.deviceName');return};
      const loadKey=`sfp_info-${deviceName}`;
      if(getters.loads[loadKey]){return};
      commit('setItem',['loads/'+loadKey,!0]);
      try{
        const response=await httpGet(buildUrl('sfp_info',{device_name:deviceName},'/call/hdm/'));
        if(Array.isArray(response)){
          commit('setItem',['devicesPortsDdm/'+deviceName,Object.freeze(response)]);
        }else{
          commit('setItem',['devicesPortsDdm/'+deviceName,[]]);
        };
      }catch(error){
        console.warn('sfp_info.error',error);
        commit('setItem',['devicesPortsDdm/'+deviceName,[]]);
      };
      commit('setItem',['loads/'+loadKey,!1]);
    },
    async getDevicePortOnts({getters,commit},{deviceName,devicePortName,ifIndex,ifName}={}){
      if(!deviceName){console.warn('getDevicePortOnts.error.deviceName');return};
      if(!devicePortName){console.warn('getDevicePortOnts.error.devicePortName');return};
      if(!ifIndex){console.warn('getDevicePortOnts.error.ifIndex');return};
      if(!ifName){console.warn('getDevicePortOnts.error.ifName');return};
      const loadKey=`onu_info-${devicePortName}`;
      if(getters.loads[loadKey]){return};
      commit('setItem',['loads/'+loadKey,!0]);
      try{
        const response=await httpGet(buildUrl('onu_info',{device_name:deviceName,port:ifName,port_index:ifIndex},'/call/hdm/'));
        if(Array.isArray(response)){
          commit('setItem',['devicesPortsOnts/'+devicePortName,Object.freeze(response)]);
        }else{
          commit('setItem',['devicesPortsOnts/'+devicePortName,[]]);
        };
      }catch(error){
        console.warn('sfp_info.error',error);
        commit('setItem',['devicesPortsOnts/'+devicePortName,[]]);
      };
      commit('setItem',['loads/'+loadKey,!1]);
    },
    async setObjectInfo({getters,commit,dispatch},{objectId='',objectType='',...props}={}){
      if(!objectId){console.warn('setObjectInfo.error.objectId');return};
      if(!objectType){console.warn('setObjectInfo.error.objectType');return};
      dispatch('setObjectInfoPause',!0);
      commit('setItem',['objectsInfo/'+objectId,{objectId,objectType,...getters.getObjectInfo(objectId)||null,...props}]);
      const loadKey=`setObjectInfo-${objectId}`;
      commit('setItem',['loads/'+loadKey,!0]);
      try{
        const response=await fetch(`https://script.google.com/macros/s/AKfycbzWu5nNAkKO7H7hgd9tAjg4srIf430lZdU1HTauUP7MNjNPoZAyoVlpHsMGhNjL0NPn/exec`,{
          method:'POST',mode:'no-cors',
          headers:{'Content-Type':'application/json;charset=utf-8'},
          body:JSON.stringify({objectId,objectType,...props})
        });
      }catch(error){
        console.warn('setObjectInfo.error',error);
      };
      commit('setItem',['loads/'+loadKey,!1]);
      dispatch('setObjectInfoPause',!1);
    },
    async setObjectsInfo({getters,commit,dispatch},objects=[]){
      if(!objects){console.warn('setObjectsInfo.error.objects');return};
      if(!objects?.length){return};
      //dispatch('setObjectInfoPause',!0);
      for(const object of objects){
        commit('setItem',['objectsInfo/'+object.objectId,object]);
        const loadKey=`setObjectInfo-${object.objectId}`;
        commit('setItem',['loads/'+loadKey,!0]);
      };
      try{
        const response=await fetch(`https://script.google.com/macros/s/AKfycbzWu5nNAkKO7H7hgd9tAjg4srIf430lZdU1HTauUP7MNjNPoZAyoVlpHsMGhNjL0NPn/exec`,{
          method:'POST',mode:'no-cors',
          headers:{'Content-Type':'application/json;charset=utf-8'},
          body:JSON.stringify(objects)
        });
      }catch(error){
        console.warn('setObjectInfo.error',error);
      };
      for(const object of objects){
        const loadKey=`setObjectInfo-${object.objectId}`;
        commit('setItem',['loads/'+loadKey,!1]);
      };
      //dispatch('setObjectInfoPause',!1);
    },
    async setDeviceAbsentObjectsInfo({getters,commit,dispatch},deviceName=''){
      if(!deviceName){console.warn('setDeviceAbsentObjectsInfo.error.deviceName');return};
      const objects=Object.values(getters.getDeviceAbsentObjectsInfo(deviceName));
      if(!objects?.length){return};
      const loadKey=`setDeviceAbsentObjectsInfo-${deviceName}`;
      if(getters.loads[loadKey]){return};
      commit('setItem',['loads/'+loadKey,!0]);
      await dispatch('setObjectsInfo',objects);
      commit('setItem',['loads/'+loadKey,!1]);
    },
    fillDevicePortAbonsOnts({getters,commit},{deviceName='',devicePortName=''}){
      if(!deviceName){console.warn('fillDevicePortAbonsOnts.error.deviceName');return};
      if(!devicePortName){console.warn('fillDevicePortAbonsOnts.error.devicePortName');return};
      const abons=getters.getDevicePortAbons(deviceName,devicePortName);
      for(const {accountId,mac} of abons){
        commit('setItem',['abonsOnt/'+accountId,null]);
        if(!mac?.match){continue};
        const abonMac=(mac.match(/[0-9A-Fa-f]/g)||[]).join('').toLowerCase();
        const onts=getters.getDevicePortOnts(devicePortName);
        const ont=onts.find(ont=>ont.macOnu&&abonMac===ont.macOnu.match(/[0-9A-Fa-f]/g).join('').toLowerCase());
        if(ont){
          commit('setItem',['abonsOnt/'+accountId,ont]);
          continue
        };
        const abonMacLast6=abonMac.slice(6,12);
        const ont2=onts.find(ont=>ont.serialNum&&abonMacLast6===(parseInt(ont.serialNum.slice(6,12),16)+3).toString(16).toLowerCase());
        if(ont2){
          commit('setItem',['abonsOnt/'+accountId,ont2]);
          continue
        };
      }
    }
  },
});

//app.$children[3].$children[0].ymap.balloon
Vue.component('EventsMapGpon2',{
  template:`<div name="EventsMapGpon2" class="position-relative" style="height:100vh;width:100vw;">
    <div name="YMap" class="position-absolute inset-0" style="width:100%;height:100%;"></div>
  </div>`,
  props:{
    templateId:{type:[String,Number],default:'',required:true}
  },
  mounted(){
    this.awaitYmapsReady();
  },
  data:()=>({
    ymapsReadyTimer:null,
    isYmapsReady:false,
    isYmapsInit:false,
    ymap:null,
    type:'yandex#map',
    //zoom:16,center:[55.19882141102037, 82.82566161923812],//Снт
    zoom:16,center:[54.99015329190864, 82.97480896759986],//Зар
    //zoom:19,center:[54.99390617498407, 82.96689562644377],//polygon test
    geocodeLoading:false,
    address:'',
    addressInfoButton:null,
    iconButton:null,
    controlListBox:null,
    bounds:null,
    cursor:null,
    mapObjects:{},
  }),
  created(){
    this.startUpdate(this.setMapObjects);
  },
  watch:{
    'type'(type){
      this.ymap.setType(type)
    },
    'center'(newCenter){
      this.ymap.setCenter(newCenter,this.zoom);
      this.setAddressByCoordinates(newCenter);
      //this.setMapObjects();
    },
    'zoom'(newZoom){
      this.ymap.setCenter(this.center,newZoom);
      this.setAddressByCoordinates(this.center);
      //this.setMapObjects();
    },
    'address'(address){
      this.addressInfoButton.data.set('content',address);
    },
    'devicesList'(){
      this.setMapObjects();
    },
    'loadingSome'(loadingSome){
      if(this.iconButton){
        this.iconButton.data.set('image',loadingSome?EVENTS_MAP_ICONS.LOADER_GIF:'');
      }
    }
  },
  computed:{
    ...mapGetters({
      loads:'em_gpon/loads',
      devices:'em_gpon/devices',
      devicesList:'em_gpon/devicesList',
      devicesCount:'em_gpon/devicesCount',
      getDeviceInfo:'em_gpon/getDeviceInfo',
      getDeviceSiteCoordinates:'em_gpon/getDeviceSiteCoordinates',
      getDeviceAbons:'em_gpon/getDeviceAbons',
      getObjectInfo:'em_gpon/getObjectInfo',
      getDevicePortsHasAbons:'em_gpon/getDevicePortsHasAbons',
      getDevicePortAreaCoordinates:'em_gpon/getDevicePortAreaCoordinates',
      getDevicePortAbonsCount:'em_gpon/getDevicePortAbonsCount',
    }),
    loadingSome(){return Object.values(this.loads).some(Boolean)},
  },
  methods:{
    ...mapActions({
      startUpdate:'em_gpon/startUpdate',
      setUserActionPause:'em_gpon/setUserActionPause',
      addDevice:'em_gpon/addDevice',
      delDevice:'em_gpon/delDevice',
      setObjectInfo:'em_gpon/setObjectInfo',
    }),
    awaitYmapsReady(){
      setTimeout(()=>{
        if(!Boolean(window.ymaps)){return this.awaitYmapsReady()};
        if(this.ymap){return};
        window.ymaps.ready(()=>{
          this.initYmaps();
        });
      },111);
    },
    async initYmaps(){
      const {type,center,zoom,address}=this;
      
      this.addressInfoButton=new window.ymaps.control.Button({
        data:{
          content:address,
        },
        options:{
          position:{top:8,left:8},
          size:'small',
          maxWidth:'unset',
          selectOnClick:false,
        },
        state:{
          enabled:false,
        },
      });
      this.iconButton=new window.ymaps.control.Button({
        data:{
          content:`<div style="margin-left:-12px;margin-right:-12px;text-align:center;">STBY</div>`,
          //image:EVENTS_MAP_ICONS.LOADER_GIF,//image:`../f/i/btn_red_loading.gif`,
        },
        options:{
          position:{top:8,right:72},
          size:'small',
          maxWidth:'28px;width:28',//maxWidth:28,
          selectOnClick:false,
        },
        state:{
          enabled:false,
        },
      });
      this.controlListBox=new window.ymaps.control.ListBox({
        data:{
          content:`Не выбран`,
        },
        items:[],
        options:{
          position:{top:40,left:8},
          size:'small',
          maxWidth:'unset',
        },
      });
      this.controlListBox.events.add(['select','deselect'],(event)=>{
        const listBoxItem=event.get('target');
        const content=listBoxItem.data.get('content');
        const deviceName=listBoxItem.data.get('deviceName');
        const coordinates=listBoxItem.data.get('coordinates');
        const zoom=listBoxItem.data.get('zoom');
        const selected=listBoxItem.state.get('selected');
        console.log('ymap.controlListBox.[select,deselect].{content,selected}',content,selected);
        if(selected){
          this.addDevice(deviceName);
          if(coordinates){this.center=coordinates};
          if(zoom){this.zoom=zoom};
        }else{
          this.delDevice(deviceName);
        };
        const {devicesCount}=this;
        event.originalEvent.currentTarget.data.set('content',devicesCount?`Выбрано ${devicesCount}`:`Не выбран`);
      });
      
      this.ymap=new window.ymaps.Map(document.querySelector(`div[name="YMap"]`),{
        type,
        center,
        zoom,
        controls:[
          this.addressInfoButton,
          this.controlListBox,
          this.iconButton,
          new window.ymaps.control.TypeSelector({
            //mapTypes:['yandex#map','yandex#satellite','yandex#hybrid'],
            options:{
              position:{top:8,right:40},
              size:'small',
              panoramasItemMode:'off',
            },
          }),
          new window.ymaps.control.GeolocationControl({
            options:{
              position:{top:8,right:8},
              size:'small',
            },
          }),
          new window.ymaps.control.ZoomControl({
            options:{
              position:{top:40,right:8},
              size:'large',
            },
          }),
          new window.ymaps.control.RulerControl({
            options:{
              position:{bottom:8,right:8},
              size:'small',
            },
          }),
        ].filter(Boolean),
      },{
        autoFitToViewport:'always',
        avoidFractionalZoom:false,
        maxZoom:19,
        minZoom:12,//14,
        //restrictMapArea:[[],[]],
        yandexMapAutoSwitch:false,
      });
      
      document.querySelector(`.ymaps-2-1-79-copyrights-pane`)?.remove();
      this.getDevicesListAndAddToListBox();
      
      //ymap.events
      this.ymap.events.add('boundschange',(event)=>{
        const newCenter=event.get('newCenter');console.log('ymap.boundschange.newCenter',newCenter);
        const newZoom=event.get('newZoom');console.log('ymap.boundschange.newZoom',newZoom);
        this.center=newCenter;
        this.zoom=newZoom;
      });
      this.ymap.events.add('mouseenter',(event)=>{
        this.cursor=event.originalEvent.map.cursors.push('crosshair');
      });
      this.ymap.events.add('mousemove',(event)=>{
        const coords=event.get('coords');//console.log('ymap.mousemove.coords',coords);
        this.setAddressByCoordinates(coords);
      });
      this.ymap.events.add('mouseleave',(event)=>{
        this.cursor?.remove();
      });
      this.ymap.events.add('typechange',(event)=>{
        const type=event.originalEvent.map.getType();console.log('ymap.typechange.type',type);
        this.type=type;
      });
      this.ymap.events.add('click',(event)=>{
        const coords=event.get('coords');console.log('ymap.click.coords',coords);
        this.center=coords;
      });
      this.ymap.events.add('contextmenu',(event)=>{//rclick
        const coords=event.get('coords');console.log('ymap.contextmenu.coords',coords);
      });
      
      //ymap.balloon.events
      this.ymap.balloon.events.add('click',(event)=>{
        console.log('ymap.balloon.click',event);
      });
      this.ymap.balloon.events.add('contextmenu',(event)=>{//rclick
        console.log('ymap.balloon.contextmenu',event);
      });
      this.ymap.balloon.events.add('close',(event)=>{
        console.log('ymap.balloon.close',event);
        this.ymap.balloon.customView?.$destroy();
      });
      this.ymap.balloon.events.add('open',(event)=>{
        console.log('ymap.balloon.open',event);
        this.ymap.balloon.customView=mountView(YMAPS_BALLOON_VIEW_NAME,event.originalEvent.target.properties.getAll());
      });
      
      //ymap.hint.events
      this.ymap.hint.events.add('click',(event)=>{
        console.log('ymap.hint.click',event);
      });
      this.ymap.hint.events.add('contextmenu',(event)=>{//rclick
        console.log('ymap.hint.contextmenu',event);
      });
      this.ymap.hint.events.add('close',(event)=>{
        console.log('ymap.hint.close',event);
        this.ymap.hint.customView?.$destroy();
      });
      this.ymap.hint.events.add('open',(event)=>{
        console.log('ymap.hint.open',event);
        this.ymap.hint.customView=mountView(YMAPS_HINT_VIEW_NAME,event.originalEvent.target.properties.getAll());
      });
    },
    async getDevicesListAndAddToListBox(){
      try{
        const cacheKey=`emp/devices/54`;
        const response=this.$cache.getItem(cacheKey)||await fetch(`https://script.google.com/macros/s/AKfycbyCr8L8OZDTTVuiQp4j_5chhXIMc1Wkzyt_6cCzMFrOdw0zjr0lhJGTawYzuStEpB7S/exec?regionId=54`).then(r=>r.json());
        if(Array.isArray(response)){
          this.$cache.setItem(cacheKey,response,CACHE_1HOUR);
          for(const {timestamp,mrId,regionId,deviceName,deviceIp,model,location,coordinates,zoom} of response){
            this.controlListBox.add(new window.ymaps.control.ListBoxItem({
              data:{
                content:[deviceName,model,location].filter(Boolean).join(' • '),
                deviceName,//deviceIp,model,location,
                coordinates,zoom,
              },
            }))
          };
        };
      }catch(error){
        console.warn('getDevicesList.error',error);
      };
    },
    async getSampleAddressCoordinates(sample){
      if(!window.ymaps){return new GeocodeResult(sample)};
      this.geocodeLoading=true;
      const response=await window.ymaps.geocode(sample,{json:true,results:1});
      this.geocodeLoading=!true;
      return new GeocodeResult(sample,response)
    },
    async setAddressByCoordinates(coordinates){//return
      if(this.geocodeLoading){return};
      const {address}=await this.getSampleAddressCoordinates(coordinates);
      this.address=address;
    },
    getBounds(){
      return this.bounds=this.ymap.getBounds();
    },
    addMapObject(object){
      if(!object){return};
      //console.log('addMapObject',object?.properties?.get('mapObjectId'));
      this.ymap.geoObjects.add(object);
    },
    delMapObject(object){
      if(!object){return};
      const mapObjectId=object?.properties?.get('mapObjectId');
      console.log('delMapObject',mapObjectId);
      this.mapObjects[mapObjectId]=this.ymap.geoObjects.remove(object);
    },
    setMapObjectCoordinates(mapObjectId,coordinates){
      const mapObject=this.mapObjects[mapObjectId];
      if(!mapObject){return};
      mapObject.geometry.setCoordinates(coordinates);
      mapObject.properties.set('lastUpdate',Date.now());
      //console.log('setMapObjectCoordinates',mapObjectId,coordinates);
    },
    setMapObjects(){
      const {devices,mapObjects}=this;
      for(const [deviceName,isSelected] of Object.entries(devices)){
        if(isSelected){
          this.setMapObjectDevice(deviceName);
        }else{
          const toDel={};
          this.ymap.geoObjects.each(object=>{
            if(object.properties.get('deviceName')==deviceName){
              toDel[object.properties.get('mapObjectId')]=object;
            };
          });
          for(const object of Object.values(toDel)){
            this.delMapObject(object);
          };
        };
      };
      this.invalidateMapObjects();
    },
    invalidateMapObjects(){
      const {mapObjects}=this;
      const curr=Date.now();
      const toDel={};
      this.ymap.geoObjects.each(object=>{
        const diff=object.properties.get('lastUpdate')-curr;
        if(diff>60000){
          toDel[object.properties.get('mapObjectId')]=object;
        };
      });
      for(const object of Object.values(toDel)){
        this.delMapObject(object);
      };
    },
    setMapObjectDevice(deviceName){
      const {mapObjects}=this;
      const device=this.getDeviceInfo(deviceName);
      if(!device){return};
      
      const coordinates=this.getDeviceSiteCoordinates(deviceName);
      if(!coordinates){return};
      const [latitude,longitude]=coordinates||[];
      if(!latitude||!longitude){return};
      
      const mapObjectId=atok('Point',deviceName);
      
      try{
        if(!mapObjects[mapObjectId]){
          this.addMapObject(mapObjects[mapObjectId]=new window.ymaps.Placemark([latitude,longitude],{
            mapObjectId,
            mapObjectType:'Point',
            
            lastUpdate:Date.now(),
            
            objectId:deviceName,
            objectType:'device',
            deviceName,
          },{
            balloonPanelMaxMapArea:0,
            hideIconOnBalloonOpen:false,
            openEmptyBalloon:true,
            openEmptyHint:true,
            balloonContentLayout:window.ymaps.templateLayoutFactory.createClass(`<div name="${YMAPS_BALLOON_VIEW_NAME}"></div>`),
            hintContentLayout:window.ymaps.templateLayoutFactory.createClass(`<div name="${YMAPS_HINT_VIEW_NAME}"></div>`),
            zIndex:EVENTS_MAP_ZINDEX.OLT,
            iconLayout:'default#image',
            iconImageHref:EVENTS_MAP_ICONS.OLT,
            iconShape:new CircleIconShape(24),
            ...new IconImageSizeOffset(48),
          }));
        }else{
          
        };
        
        mapObjects[mapObjectId].properties.set('lastUpdate',Date.now());
      }catch(error){
        console.warn('setMapObjectDevice.error',error)
      };
      for(const {accountId,devicePortName} of this.getDeviceAbons(deviceName)){
        this.setMapObjectDevicePortAbon(deviceName,devicePortName,accountId);
      };
      for(const {name:devicePortName} of this.getDevicePortsHasAbons(deviceName)){
        this.setMapObjectDevicePort(deviceName,devicePortName);
      };
    },
    setMapObjectDevicePortAbon(deviceName,devicePortName,accountId){
      const {mapObjects}=this;
      let [latitude,longitude]=this.getObjectInfo(accountId)?.point||[];
      if(!latitude||!longitude){//если нет позиции ONT берем позицию PON
        const coordinates=this.getObjectInfo(devicePortName)?.point||[];
        if(!coordinates){return};
        const [_latitude,_longitude]=coordinates;
        if(!_latitude||!_longitude){return};
        const [_lat,_lon]=nearCoordinatesRand([_latitude,_longitude],1);
        latitude=_lat;
        longitude=_lon;
      };
      if(!latitude||!longitude){//если не позиции PON берем позицию OLT
        const coordinates=this.getDeviceSiteCoordinates(deviceName);
        if(!coordinates){return};
        const [_latitude,_longitude]=coordinates;
        if(!_latitude||!_longitude){return};
        const [_lat,_lon]=nearCoordinatesRand([_latitude,_longitude],2);
        latitude=_lat;
        longitude=_lon;
      };
      
      const mapObjectId=atok('Point',accountId);
      try{
        if(!mapObjects[mapObjectId]){
          this.addMapObject(mapObjects[mapObjectId]=new window.ymaps.Placemark([latitude,longitude],{
            mapObjectId,
            mapObjectType:'Point',
            
            lastUpdate:Date.now(),
            
            objectId:accountId,
            objectType:'abon',
            accountId,
            deviceName,
            devicePortName,
          },{
            draggable:true,
            balloonPanelMaxMapArea:0,
            hideIconOnBalloonOpen:false,
            openEmptyBalloon:true,
            openEmptyHint:true,
            balloonContentLayout:window.ymaps.templateLayoutFactory.createClass(`<div name="${YMAPS_BALLOON_VIEW_NAME}"></div>`),
            hintContentLayout:window.ymaps.templateLayoutFactory.createClass(`<div name="${YMAPS_HINT_VIEW_NAME}"></div>`),
            zIndex:EVENTS_MAP_ZINDEX.ONT,
            iconLayout:'default#image',
            iconImageHref:EVENTS_MAP_ICONS.ONT_NORMAL_7B68EE99,
            iconShape:new RectangleIconShape(16),
            ...new IconImageSizeOffset(32),
          }));
          
          mapObjects[mapObjectId].events.add('dragstart',(event)=>{
            console.log('marker.events.dragstart');
            this.setUserActionPause(!0);
          });
          mapObjects[mapObjectId].events.add('drag',(event)=>{
            console.log('marker.events.drag');
          });
          mapObjects[mapObjectId].events.add('dragend',(event)=>{
            console.log('marker.events.dragend');
            const target=event.get('target');
            
            const coordinates=target.geometry.getCoordinates();
            const accountId=target.properties.get('accountId');
            const deviceName=target.properties.get('deviceName');
            const devicePortName=target.properties.get('devicePortName');
            this.setObjectInfo({objectId:accountId,objectType:'abon',coordinates,deviceName,devicePortName});
            this.setMapObjectDevicePort(deviceName,devicePortName);
            target.properties.set('lastUpdate',Date.now());
            this.setUserActionPause(!1);
          });
        }else{
          this.setMapObjectCoordinates(mapObjectId,[latitude,longitude]);
        };
        mapObjects[mapObjectId].properties.set('lastUpdate',Date.now());
      }catch(error){
        console.warn('setMapObjectDevicePortAbon.error',error)
      };
    },
    setMapObjectDevicePort(deviceName,devicePortName){
      const {mapObjects}=this;
      const coordinates=this.getDevicePortAreaCoordinates(deviceName,devicePortName);
      //console.log(devicePortName,coordinates);
      if(!coordinates){
        this.setMapObjectDevicePortPoint(deviceName,devicePortName);
      }else{
        const mapObjectPointId=atok('Point',devicePortName);
        if(mapObjects[mapObjectPointId]/*?.geometry?.getType()==='Point'*/){
          this.delMapObject(mapObjects[mapObjectPointId]);
          const mapObjectCircleId=atok('Circle',devicePortName);
          this.delMapObject(mapObjects[mapObjectCircleId]);
        };
        this.setMapObjectDevicePortArea(deviceName,devicePortName);
      };
    },
    setMapObjectDevicePortPoint(deviceName,devicePortName){
      const {mapObjects}=this;
      const devicePortAbonsCount=this.getDevicePortAbonsCount(deviceName,devicePortName);
      
      const coordinates=this.getObjectInfo(devicePortName)?.point;
      let [latitude,longitude]=coordinates||[];
      if(!latitude||!longitude){
        const coordinates=this.getDeviceSiteCoordinates(deviceName);
        if(!coordinates){return};
        const [_latitude,_longitude]=coordinates;
        if(!_latitude||!_longitude){return};
        const [_lat,_lon]=devicePortAbonsCount?nearCoordinatesRand([_latitude,_longitude],1):nearCoordinates([_latitude,_longitude],1);
        latitude=_lat;
        longitude=_lon;
      };
      
      const mapObjectPointId=atok('Point',devicePortName);
      const mapObjectCircleId=atok('Circle',devicePortName);
      
      try{
        if(!mapObjects[mapObjectPointId]){
          this.addMapObject(mapObjects[mapObjectPointId]=new window.ymaps.Placemark([latitude,longitude],{
            mapObjectId:mapObjectPointId,
            mapObjectType:'Point',
            mapObjectCircleId,//для синхронного перетаскивания
            
            lastUpdate:Date.now(),
            
            objectId:devicePortName,
            objectType:'port',
            deviceName,
            devicePortName,
          },{
            draggable:true,
            balloonPanelMaxMapArea:0,
            hideIconOnBalloonOpen:false,
            openEmptyBalloon:true,
            openEmptyHint:true,
            balloonContentLayout:window.ymaps.templateLayoutFactory.createClass(`<div name="${YMAPS_BALLOON_VIEW_NAME}"></div>`),
            hintContentLayout:window.ymaps.templateLayoutFactory.createClass(`<div name="${YMAPS_HINT_VIEW_NAME}"></div>`),
            zIndex:EVENTS_MAP_ZINDEX.PON,
            iconLayout:'default#image',
            iconImageHref:EVENTS_MAP_ICONS.PON_0060F0,
            iconShape:new RectangleIconShape(18),
            ...new IconImageSizeOffset(36),
          }));
          
          mapObjects[mapObjectPointId].events.add('dragstart',(event)=>{
            console.log('marker.events.dragstart');
            this.setUserActionPause(!0);
          });
          mapObjects[mapObjectPointId].events.add('drag',(event)=>{
            console.log('marker.events.drag');
            const target=event.get('target');
            
            const coordinates=target.geometry.getCoordinates();
            const mapObjectCircleId=target.properties.get('mapObjectCircleId');
            this.setMapObjectCoordinates(mapObjectCircleId,coordinates);
          });
          mapObjects[mapObjectPointId].events.add('dragend',(event)=>{
            console.log('marker.events.dragend');
            const target=event.get('target');
            
            const coordinates=target.geometry.getCoordinates();
            const deviceName=target.properties.get('deviceName');
            const devicePortName=target.properties.get('devicePortName');
            this.setObjectInfo({objectId:devicePortName,objectType:'port',coordinates,deviceName});
            target.properties.set('lastUpdate',Date.now());
            const mapObjectCircleId=target.properties.get('mapObjectCircleId');
            this.setMapObjectCoordinates(mapObjectCircleId,coordinates);
            this.setUserActionPause(!1);
          });
        }else{
          this.setMapObjectCoordinates(mapObjectPointId,[latitude,longitude]);
        };
        
        const lastUpdate=Date.now();
        
        const radius=this.getObjectInfo(devicePortName)?.radius||CIRCLE_RADIUS_M;
        
        if(devicePortAbonsCount&&coordinates){
          if(!mapObjects[mapObjectCircleId]){
            this.addMapObject(mapObjects[mapObjectCircleId]=new window.ymaps.Circle([[latitude,longitude],radius],{
              mapObjectId:mapObjectCircleId,
              mapObjectType:'Circle',
              
              lastUpdate:Date.now(),
              
              objectId:devicePortName,
              objectType:'port',
              deviceName,
              devicePortName,
            },{
              balloonPanelMaxMapArea:0,
              openEmptyBalloon:true,
              openEmptyHint:true,
              balloonContentLayout:window.ymaps.templateLayoutFactory.createClass(`<div name="${YMAPS_BALLOON_VIEW_NAME}"></div>`),
              hintContentLayout:window.ymaps.templateLayoutFactory.createClass(`<div name="${YMAPS_HINT_VIEW_NAME}"></div>`),
              zIndex:EVENTS_MAP_ZINDEX.AREA,
              fillColor:"#0060F011",
              //fillColor:'#00FF0020',
              //strokeColor:"#0000FF",
              //strokeWidth:1,
              //strokeColor:'#0060F011',
              //strokeWidth:48,
              //strokeStyle:'solid',
              //geodesic:true,
              interactivityModel:'default#transparent',
            }));
          }else{
            this.setMapObjectCoordinates(mapObjectCircleId,[latitude,longitude]);
          };
          mapObjects[mapObjectCircleId].properties.set('lastUpdate',lastUpdate);
        };
        mapObjects[mapObjectPointId].properties.set('lastUpdate',lastUpdate);
      }catch(error){
        console.warn('setMapObjectDevicePortPoint.error',error)
      };
    },
    setMapObjectDevicePortArea(deviceName,devicePortName){
      const {mapObjects}=this;
      const coordinates=this.getDevicePortAreaCoordinates(deviceName,devicePortName);
      if(!coordinates){return};
      
      const mapObjectId=atok('Polygon',devicePortName);
      try{
        if(!mapObjects[mapObjectId]){
          this.addMapObject(mapObjects[mapObjectId]=new window.ymaps.Polygon(coordinates,{
            mapObjectId,
            mapObjectType:'Polygon',
            
            lastUpdate:Date.now(),
            
            objectId:devicePortName,
            objectType:'port',
            deviceName,
            devicePortName,
          },{
            balloonPanelMaxMapArea:0,
            hideIconOnBalloonOpen:false,
            openEmptyBalloon:true,
            openEmptyHint:true,
            balloonContentLayout:window.ymaps.templateLayoutFactory.createClass(`<div name="${YMAPS_BALLOON_VIEW_NAME}"></div>`),
            hintContentLayout:window.ymaps.templateLayoutFactory.createClass(`<div name="${YMAPS_HINT_VIEW_NAME}"></div>`),
            zIndex:EVENTS_MAP_ZINDEX.AREA,
            fillColor:'#00FF0020',
            //strokeColor:'#0000FF',
            //strokeWidth:1,
            //strokeStyle:'dash'
            strokeColor:'#00FF0020',
            strokeWidth:48,
            strokeStyle:'solid',
            interactivityModel:'default#transparent',
          }));
        }else{
          this.setMapObjectCoordinates(mapObjectId,coordinates);
        };
        mapObjects[mapObjectId].properties.set('lastUpdate',Date.now());
      }catch(error){
        console.warn('setMapObjectDevicePortArea.error',error)
      };
    },
  },
  beforeDestroy(){
    this.ymap.balloon.customView?.$destroy();
    this.ymap.hint.customView?.$destroy();
    this.ymap?.destroy();
  },
});




















