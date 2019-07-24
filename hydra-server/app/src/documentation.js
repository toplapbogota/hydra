
let GLSL_FUNCS = require('./composable-glsl-functions-extra.json')
let _ = require('lodash');
class Documentation extends EventTarget{
  /**
   * create dom elements
   * @param  {[type]}  document_     [description]
   * @param  {[type]}  container     [description]
   * @return {[type]}                [description]
   */
  constructor(container){
    super();
    this.is_copying = false;
    this.glsl_function = '';
    this.title = 'Composable glsl functions';
    this.do_set_dom_elements(container);
  }
  do_set_dom_elements(container){  
    if(container){
      this.container = container;
    }else{
      this.container = document.createElement('div');
      document.body.appendChild(this.container);
    }
    this.container.classList.add('docs');
    // this.container = null;
    this.container_data  = document.createElement('div');
    this.open_close_btn  = document.createElement('div');
    this.open_close_btn.innerHTML="X"
    this.open_close_btn.classList.add('toggle-btn')
    this.open_close_btn.classList.add('table-open-close')
    this.container_data.classList.add('div-help');

    this.open_close_btn.addEventListener('click',this.toggle_position.bind(this))
    this.container.appendChild(this.container_data);
    this.container.appendChild(this.open_close_btn);
    //
    let head_div = document.createElement('div');
    this.container_data.appendChild(head_div);
    this.head_div=head_div;
    //
    let table_div = document.createElement('div');
    table_div.classList.add('main-grid')
    this.container_data.appendChild(table_div);
    this.table_div=table_div;
    //
    let o = this.create_card();
    this.card           = o.card;
    this.card.innerHTML='No documentation loaded yet!'
    this.card_container = o.card_container;
    this.container.appendChild(this.card_container);
  }
  hide(){
    this.container.classList.add('invisible');
    this.container.classList.add('hidden');
  }
  show(){
    // this.container.classList.remove('invisible');
    // this.container.classList.remove('hidden');
  }
  toggle_display(){
    this.container.classList.toggle('invisible');
    this.container.classList.add('hidden');
  }
  toggle_position(){
    this.container.classList.toggle('hidden');
  }
  load(){
    let data = {glslfuncs:GLSL_FUNCS}
    this.load_from_data(data);
  }
  create_card(){
    let card_container = document.createElement('div');
    card_container.classList.add('card-container')
    card_container.classList.add('hidden')
    let card = document.createElement('div');
    let card_open_close = document.createElement('div');
    this.card_open_close = card_open_close;
    card_container.appendChild(card);
    card_container.appendChild(card_open_close);
    card_open_close.addEventListener('click',on_open_close)
    function on_open_close(argument) {
      card_container.classList.toggle('hidden')
    }
    card_open_close.innerHTML = "X";
    card_open_close.classList.add('toggle-btn');
    card_open_close.classList.add('card-open-close');
    card_open_close.classList.add('hidden');
    card.id="card";
    return {card_container,card};
  }
  _get_types_and_inputs() {
    let glslfuncs = this.data.glslfuncs;
    let types           = new Set();
    let inputs_types    = new Set();
    var key;
    for( key in glslfuncs ){
      
      var f = glslfuncs[key];

      let type = f.type;
      types.add(type);

      let inputs = f.inputs
      if(inputs){
        inputs.forEach(x=>inputs_types.add(x.type))
      }else{
        inputs_types.add('none'); 
      }
    }
    return {
      types:Array.from(types).sort()
      ,inputs_types:Array.from(inputs_types).sort()
    }
  }
  /**
   * set data and display it
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  load_from_data(data){
    this.data = data;
    this.types_and_inputs = this._get_types_and_inputs();
    this.do_display_app(this.title);
  }
  /**
   * display filter manager and table
   * @param  {[type]} title [description]
   * @return {[type]}       [description]
   */
  do_display_app(title) {
    let glslfuncs = this.data.glslfuncs;
    this.do_display_head(title);
    this.do_display_table(glslfuncs);
  }
  do_display_head(title) {
    let head_div = this.head_div;
    let types = this.types_and_inputs.types;
    let inputs_types = this.types_and_inputs.inputs_types;
    head_div.innerHTML = `<h1>${title}<h1>`;
    //
    let spans_filter_by_type = types.map(x=>{
      return `<span data-name="${x}" class="type" name="${x}">${x}</span>`
    })
    let types_span = spans_filter_by_type.join(' ')+` <span class="type highlight" name="all">show all</span>`;
    //
    let spans_inputs = inputs_types.map(x=>{
      return `<span data-name="${x}" class="label ${x}">${x}</span>`
    })
    head_div.innerHTML += `<p class="filter-btns">filter by types: ${types_span}</p>`
    head_div.innerHTML += `<p>input types labels: ${spans_inputs.join(' ')}</p>`
    head_div.innerHTML += `<label  for="is-copying">is copying to editor</label>`
    head_div.innerHTML += `<input type="checkbox" id="is-copying"></input>`
    let is_copying_input = document.querySelector("input#is-copying")
    console.log("is_copying_input : ",is_copying_input);
    is_copying_input.addEventListener('click',(ev)=>{
      // console.log("ev : ",ev);
      // console.log("ev : ",ev.target);
      let chkbx = ev.target;
      // console.log("chkbx : ",chkbx);
      // console.log("chkbx : ",chkbx.value);
      // console.log("chkbx : ",chkbx.checked);
      this.is_copying = chkbx.checked;
      console.log("is_copying : ",this.is_copying);
      // console.log("this : ",this);
    })
    let types_spans = document.querySelectorAll("span.type")
    types_spans.forEach( (argument)=> {
      argument.addEventListener('click',this.on_type_click.bind(this),false)
    })
  }
  on_type_click(e){
    this._do_remove_highlight('type');
    let btn = e.target;
    btn.classList.add('highlight');
    let name = btn.getAttribute('name')
    let glslfuncs = this.data.glslfuncs;
    let filtered;
    if(name==='all'){
      filtered = glslfuncs;
    }else{
      filtered = {}
      var key;
      for( key in glslfuncs ){
        var object = glslfuncs[key];
        if(object['type']===name){
          filtered[key] = object
        }
      }
    }
    this.do_display_table(filtered)
  }
  do_display_table(glslfuncs_) {
    // console.log("parsed : ",parsed);
    let self = this;
    document.querySelectorAll('.row').forEach( (row)=> {
      row.removeEventListener('click',this.on_row_click.bind(this),true)
    })
    let inner_html='';
    let sorted_by_type = _.sortBy(glslfuncs_, ['type','name' ]);
    inner_html += `<div class="item header">`;
    inner_html += `<div class="header cell">Name</div>`;
    inner_html += `<div class="header cell">doc-type</div>`;
    inner_html += `<div class="cell">inputs</div>`;
    inner_html += `</div>`;
    sorted_by_type.forEach(glsl_function=>{
      let name = glsl_function.name;
      inner_html += `<div data-name="${name}" class="row">`;//open row
      inner_html += `<div class="cell">${name} </div>`;
      inner_html += `<div class="cell">${glsl_function.category} </div>`;
      let inputs = glsl_function.inputs
      if(inputs){
        inputs.forEach(function (input) {
          let classes = ['cell','input-name'];
          let input_type = input.type;
          classes.push(input.type)
          let classes_string = classes.join(' ');
          let div_string = `<div class="${classes_string}">${input.name}</div>`
          inner_html+=div_string;
        })
      }else{
        inner_html += `<div class="cell input-type none">none</div>`;
      }
      inner_html += `</div>`;//close row
    })
    this.table_div.innerHTML = inner_html;
    document.querySelectorAll('.row').forEach((row)=> {

      row.addEventListener('click',this.on_row_click.bind(this),true)
    })
  }
  on_row_click(e){
    this._do_remove_highlight('row');
    let target = e.target;
    let has_row = target.classList.contains('row');
    //Don't know why I had to hack this:
    if(!has_row){
      // console.warn('picking parent');
      target=target.parentNode
    }
    target.classList.add('highlight');
    let name = target.getAttribute('data-name');
    this.do_show_card(name);
    let glsl_function = this.data.glslfuncs[name];
    this.glsl_function = glsl_function;
    // let example = glsl_function.example;
    // let event = new CustomEvent('example-code',{detail:{example}});
    this.container.classList.add('hidden')
    // console.log("container : ",this.container);
    if(this.is_copying){
      this.do_copy_example()
    }
    this.card_open_close.classList.remove('hidden');
  }
  do_show_card(name){
    let glsl_function = this.data.glslfuncs[name];
    let example   = glsl_function.example;
    let category  = glsl_function.category;
    let inputs    = glsl_function.inputs;
    let type      = glsl_function.type;
    let glsl      = glsl_function.glsl;
    //
    let btn = document.querySelector('.copy-2-editor-btn');
    if(btn)
        btn.removeEventListener('click',this.do_copy_example.bind(this))
    let card = this.card
    card.innerHTML='';
    let inner_html = '';
    inner_html+=`<h2><div class="card-name">${name}<div></h2>`
    inner_html+=`<h3><span class="field-name">type:</span> ${type}</h3>`
    inner_html+=`<h3><span class="field-name">documentation category:</span> ${category}</h3>`
    inner_html+=`<h3><span class="field-name">inputs:</span></h3>`
    if(inputs){
      inner_html+=`<ul>`
      inputs.forEach(function (input) {
        inner_html+=`<li><h4>${input.name}, <span class="label ${input.type}">${input.type}</span>`
        if(input.default){
          inner_html+=`, ${input.default}`
        }
        inner_html+=`</h4></li>`

      })
      inner_html+=`</ul>`
    }else{

      inner_html+=`<h4><span class="none">none</span></h4>`
    }
    inner_html+=`<h3><span class="field-name">glsl:</span></h3>`
    inner_html+=`<pre>${glsl}</pre>`
    if(example){
      if(example.trim()){

        inner_html+=`<h3><span class="field-name">Example:</span></h3>`
        inner_html+=`<pre>${example}</pre>`
      }

    }
    card.innerHTML=inner_html;
    if(!this.is_copying&&example.trim()){
      console.log("example : ",example);
        card.innerHTML+=`<button class="copy-2-editor-btn">copy example to editor</button>`
        let btn = document.querySelector('.copy-2-editor-btn');
        btn.addEventListener('click',this.do_copy_example.bind(this))
    }
    this.card_container.classList.remove('hidden')
  }
  do_copy_example(ev){
    let glsl_function = this.glsl_function
    let example = glsl_function.example;
    let event = new CustomEvent('example-code',{detail:{example}});
    this.dispatchEvent(event)
  }
  _do_remove_highlight(class_name) {
    document.body.querySelectorAll('.'+class_name+'.highlight').forEach(function (argument) {
      argument.classList.remove('highlight');
    })
  }
}

module.exports = Documentation;
