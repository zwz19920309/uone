webpackJsonp([15],{"4rA6":function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var a=n("Xxa5"),i=n.n(a),o=n("exGp"),l=n.n(o),c=n("1h8J"),s={components:{},data:function(){return{value:"",dialogShow:!1,cSignonList:this.signonList||[],cData:[]}},created:function(){this.initData()},methods:{initData:function(){var t=this;return l()(i.a.mark(function e(){var n;return i.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(t.cSignonList.length){e.next=5;break}return e.next=3,Object(c.o)();case 3:200===(n=e.sent).status&&n.data.list.length&&(t.cSignonList=n.data.list);case 5:case"end":return e.stop()}},e,t)}))()},handleSelectionChange:function(t){this.cData=t},inSure:function(){this.callBack&&this.callBack(this.cData)},open:function(){this.dialogShow=!0},close:function(){this.dialogShow=!1}},props:["callBack","signonList"],watch:{signonList:function(t,e){this.cSignonList=t}}},r={render:function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("el-dialog",{attrs:{title:"签到活动列表",visible:t.dialogShow},on:{"update:visible":function(e){t.dialogShow=e}}},[n("el-table",{ref:"multipleTable",staticStyle:{width:"100%"},attrs:{border:"",data:t.cSignonList,"tooltip-effect":"dark"},on:{"selection-change":t.handleSelectionChange}},[n("el-table-column",{attrs:{type:"selection",width:"55"}}),t._v(" "),n("el-table-column",{attrs:{prop:"name",label:"名称"}}),t._v(" "),n("el-table-column",{attrs:{prop:"date",label:"签到类型",width:"180"},scopedSlots:t._u([{key:"default",fn:function(e){return[n("span",[t._v(t._s(e.row.checktypename))])]}}])}),t._v(" "),n("el-table-column",{attrs:{prop:"name",label:"签到周期",width:"180"},scopedSlots:t._u([{key:"default",fn:function(e){return[n("span",[t._v(t._s(e.row.cycle_text.name))]),t._v(" "),5==e.row.cycle_text.type?n("span",[t._v(":"+t._s(e.row.cycle_text.number)+"(天)")]):t._e()]}}])})],1),t._v(" "),n("div",{staticClass:"mar10 pad10 t-right"},[n("el-button",{attrs:{type:"primary"},on:{click:t.inSure}},[t._v("确认")])],1)],1)},staticRenderFns:[]};var u=n("VU/8")(s,r,!1,function(t){n("E6tQ")},null,null);e.default=u.exports},E6tQ:function(t,e){}});
//# sourceMappingURL=15.45760e861b21a615ef77.js.map