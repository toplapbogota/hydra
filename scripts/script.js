// libraries
const fs = require('fs-extra')
const md_2_json = require('better-md-2-json');
const path = require('path')
//
const OUTPUT_PATH = path.normalize('../hydra-server/public/data/documentation/')
const PATH_TO_DOCS_MARK_DOWN = '../docs/funcs.md'
const docs_md = fs.readFileSync(PATH_TO_DOCS_MARK_DOWN,'utf8')
const json = md_2_json.parse(docs_md);
//pick just the 'Functions' field
const documentation_by_category = json.Functions;
const docs = ungroup(documentation_by_category);
/**
 * 'documentation_' is grouped by categories, 
 * rather 'functions' from composable-glsl-functions.js is an object of objects per function. 
 * This function ungroups 'documentation_' and returns an object similar to composable-glsl-functions.js 
 * for later mix and parse with composable-glsl-functions.js
 * This function also adds the 'category' field to each function field/object
 * The 'category' field is similar to already existing 'type' field
 * @param  {object} documentation_ object from md_2_json.Functions
 * @return {object}                an object with a field per composable function
 */
function ungroup(documentation_){

	let output = {};
	var type;
	for( type in documentation_ ){
		var type_group = documentation_[type];
		var func_name;
		for( func_name in type_group ){
			var func_object = type_group[func_name];
			output[func_name]={...func_object,category:type}
		}
	}
	return output;
}
//
//
//
//
const PATH_TO_COMPOSABLE_FUNCTIONS = '../node_modules/hydra-synth/src/composable-glsl-functions.js'
let functions = require(PATH_TO_COMPOSABLE_FUNCTIONS)
//
//
//
//
mix_and_parse(functions,docs);
/**
 * mix documentation properties, example and category, into (composable) functions object
 * in the inserted 'example' field, removes lines that contain md code tag short cut: '```';
 * @param  {object} functions_ the object passed is modified.
 * @param  {object} docs_      better have 'Example' and 'category' field name
 * @return {null}            nothing but modifies 'functions_' input
 */
function mix_and_parse(functions_,docs_){
	//iterate over 'documentation' and add extra info to ....
	var keyd;
	for( keyd in docs_ ){
		var doc = docs_[keyd];
		//special case: color --init
		let split = keyd.split('`vec4`')
		let keyh;
		if(split.length>1){
			keyh=split[0].trim()
		}
		if(keyh){
			keyd=keyh
		}
		//special case: color --end
		let f = functions_[keyd];
		if(f){
			if(doc.Example){
				if(doc.Example.raw){
					let example_raw = doc.Example.raw
			        let example = example_raw.split('\n');
					example = example.filter(x=>x.indexOf('```')===-1).join('\n')
					functions_[keyd].example=example
				}else{
					console.log("keyd : ",keyd);
				}
			}else{
				functions_[keyd].example='no example in documentation'
			}
			if(doc.category){
				functions_[keyd].category = doc.category;
			}
		}
	}

	//iterate over 'functions' and add extra info to ....
	var keyf;
	for( keyf in functions_ ){
		var function_field = functions_[keyf];
		function_field.name = keyf;
		if(!function_field.example){
			functions_[keyf].example = 'no example for function'
		}
		if(!function_field.category){
			functions_[keyf].category = 'no category for function'
			// console.log("keyf : ",keyf);
		}
	}
}
/**
 * write a file with composable functions as json objects with extra info per function
 * extra info per function: example and category; 
 * @type {[type]}
 */
fs.ensureDirSync(OUTPUT_PATH);
fs.writeJsonSync(OUTPUT_PATH+'composable-glsl-functions-extra.json',functions,{spaces:2})