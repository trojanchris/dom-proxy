# dom-proxy

### What it does
The dom proxy is an ES6 proxy implementation that allows for the dynamic generation of html in javascript based on variable inputs, providing the ability to attach event listeners to elements or multiple children of elements in the same step as they are created in, and facilitates dynamically using inline logic to modify the elements as they are made.

### Usage
Any element passed as a function call of the dom proxy will be created as an element.
```
dom.div() //creates a div element
dom.span() //creates a span element
dom.table() //creates a table element
```
generates
```
<div></div>
<span></span>
<table></table>
```

You can pass any attribute you want to be created as an object in the first argument of the function call.
```
dom.div({style:'color: green'})
dom.div({class:'myclass', id:'myid','data-value':'val'})

var id = 1;
dom.div({id: `${id}-id`, isone: (id==1) ? true : false})
```
generates
```
<div style="color:green;"></div>
<div class="myclass" id="myid" data-value="val"></div>

<div id="1-id" isone="true"></div>
```

You can specify child elements as an array either in the first argument or second argument of the function call. If supplied as the first argument, you are not able to set any attributes on the element.
```
dom.div({style:'text-decoration:underline', class:'outerdiv'},[
  dom.div([
    dom.span({style:'color: green'},[
      'Some green text.'
    ]),
    dom.span({style:'color: red'},[
      ' Some red text.'
    ])
  ]),
  dom.div([
    dom.span({style:'color:blue'},[
      'Some blue text'
    ])
  ])
]);
```
generates
```
<div style="text-decoration:underline" class="outerdiv">
  <div>
    <span style="color: green">Some green text.</span>
    <span style="color: red"> Some red text.</span>
  </div>
  <div>
    <span style="color:blue">Some blue text</span>
  </div>
</div>
```

You can specify event listeners in the third argument of the function call (second argument if you did not include attributes).
```
dom.div({class:'click_for_alert'},[
  'Click me!'
],{
  click: function(){
    alert('Clicked!');
    this.innerHTML = 'Thanks for clicking me!'
  }
})

function changecolor(){
  this.style.color = 'red';
}

dom.span(['hover to change me to red!'],{mouseover:changecolor})
```

If multiple children need the same event listener applied, you can do this by adding the 'sub_events' event, and then specifying the query selector to target the desired children, and the event type and function to execute by specifying the 'type' and 'func' keys respectively.
```
dom.div([
  dom.span({'data-value':1},['1']),
  dom.span({'data-value':2},['2']),
  dom.span({'data-value':3},['3']),
  dom.div({class:'click_for_alert'},['Click']),
  dom.div({class:'click_for_alert'},['Click me too'])
],{
  sub_events: {
    'span': {
      type:'mouseover',
      func: function(){
        console.log(this.dataset.value);
      }
    },
    '.click_for_alert': {
      type:'click',
      func: function(){
        alert('Clicked!');
      }
    }
  }
});
```

You can also specify an 'after' event, if you need to apply some logic after the element has already been created.
```
dom.div([],{
  after: function(el){
    el.innerHTML = '<span>Hi</span>'
  }
})
```

The dom proxy is built to allow the dynamic construction of entire web pages based on variable input.
```
var values = [
  {
    id: 1,
    text: 'one'
  },
  {
    id: 2,
    text: 'two'
  },
  {
    id: 3,
    text: 'three'
  }
];

dom.div([
  values.map(val =>
    dom.div({id:`id-${val.id}`},[val.text])
  )
])
```
generates
```
<div>
  <div id="id-1">one</div>
  <div id="id-2">two</div>
  <div id="id-3">three</div>
</div>
```

Furthermore, you can implement inline logic like so:
```
dom.div([
  dom.div([
    (function(){
      function return2(){
        return 2;
      }
      var el = dom.div([return2()]);
      return el;
    })()
  ])
])
```
generates
```
<div>
  <div>
    <div>2</div>
  </div>
</div>
```

You can use the features of the dom proxy to create dynamic webpages that are easy to update with new information
```
var values = [
  {
    id: 1,
    text: 'one'
  },
  {
    id: 2,
    text: 'two'
  },
  {
    id: 3,
    text: 'three'
  }
];

var ele = dom.div([
  values.map(val =>
    dom.div({id:`id-${val.id}`},[val.text])
  )
],{
  'newinfo':function(e){
    let data = e.detail;
    for(let value of data){
      this.querySelector(`#id-${value.id}`).textContent = value.text;
    }
  }
});

var new_values = [
  {
    id: 1,
    text: 'one updated'
  },
  {
    id: 2,
    text: 'two updated'
  },
  {
    id: 3,
    text: 'three updated'
  }
];

ele.dispatchEvent(new CustomEvent('newinfo',{detail:new_values}));
```
results in
```
<div>
  <div id="id-1">one updated</div>
  <div id="id-2">two updated</div>
  <div id="id-3">three updated</div>
</div>
```

It can be useful to separate your dynamic elements into functions to then call inline.
```
function returnSpan(text){
  return dom.span([text]);
}

dom.div([
  returnSpan('span one'),
  returnSpan('span two'),
  returnSpan('span three')
])
```

### Errors
The primary error you will see if misusing the dom proxy is:
```
Uncaught TypeError: Failed to execute 'appendChild' on 'Node': parameter 1 is not of type 'Node'.
```
This means you have incorrectly formatted either the element or one of its children, resulting in it returning either null or something other than an element which it cannot add to the dom.
