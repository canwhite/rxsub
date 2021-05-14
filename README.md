# rxsub
用于学习react中rxjs的状态管理和自己使用

# install  
npm install git+ssh://git@github.com:canwhite/rxsub.git  

# use  

store.js
```
//用现在新的写法
import {of,from} from "rxjs";
import { map } from "rxjs/operators";
import { state } from "rxsub";

//1.同步使用，加减1的实现
const count$ = state({
    name: "count",//当作key
    defaultValue: 0,//数据初始化
    producer(next,value,action){
        let num = value;
        console.log(num);
        switch(action.type){
            case "add":
                num ++ ;
                //next传值，不要在里边做计算
                next(num)
                break;
            case "sub":
                num--;
                next(num)
                break;
        }
    }
});

//2.异步使用，数据请求之类的
const async_res$ = state({ 
    name:"async_res",
    //实际上可以根据返回数据结构置初值 initial
    initial: from(new Promise(resolve=>{})),
    producer(next,value,action){
        let params = action.params;
        let cb = action.cb;
        switch (action.type){
            case "async":
                next(
                    from(cb(params))
                )
                break;
        }
    }
}) 

//3.当然也可以根据pipe的状态衍生

export {
    count$,
    async_res$,
}

```

App.js

```

import React from "react";
//subscription这个是订阅，dispatch主要是为了走subject的next
import { subscription, dispatch } from "rxsub"
import { count$,async_res$ } from "./store";

//sunscription返回一个函数，这个函数的参数是一整个函数组件
//同步计数组件
const Cou = subscription({
    count: count$//主要是value，key可以随意命名
  })((props) =>{
    return (
      <span>{props.count}</span>
    );
}) 
//异步请求结果显示组件
const AsyncData  = subscription({
    async:async_res$
})((props)=>{
    // 这里用可选链
    return (
        <span>{props.async?.data || "loading"}</span>
    );
})

function App() {
    //异步请求
    const getRequestData = (params)=>{
        return new Promise((resolve,reject)=>{
            setTimeout(() => {
                resolve({data:"content"})
            }, 3000);
        })
    }

    function add(){
        dispatch("count",{
            type:"add"
        })
    }
    function sub(){
        dispatch("count", {
            type: "sub",
        });
    }
    function asyncPush(){
        dispatch("async_res",{
            type:"async",
            params:{a:"123"},
            cb:getRequestData//传进去一个函数变量在里边调用
        })
    }
    return (
        <div className="App">
            <div><Cou /></div>
            <button onClick={()=>add()}>+</button>
            <button onClick={()=>sub()}>-</button>

            <div><button onClick={()=>asyncPush()}> async test</button> </div>
            <div> 
                <AsyncData />
            </div>
        </div>
    );
}
export default App;

```

POST:  
[build](https://github.com/canwhite/rxsub-build)  

Demo:  
[demo](https://github.com/canwhite/qc-react-rxsub)  

Origion:  

[floway](https://github.com/shayeLee/floway)
