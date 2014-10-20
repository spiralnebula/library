(function ( window, module ) {

	var loaded_scripts, last_loaded_script, paramaters

	loaded_scripts            = document.getElementsByTagName("script")
	last_loaded_script        = loaded_scripts[loaded_scripts.length-1]
	paramaters                = module.get_data_type_attribute_values( last_loaded_script )
	paramaters.root_directory = module.remove_slash_at_the_end_of_directory_if_it_has_it(
		paramaters.root_directory || 
		module.get_the_root_directory_based_on_last_loaded_script_src( last_loaded_script )
	)

	if ( typeof window.define === 'function' && window.define.amd) {
		console.log("amd exists")

	} else {

		if ( typeof window.jasmine === "object" ) {

			var module_name
			module_name         = this_script.getAttribute("data-module-name") || "entry"
			window[module_name] = module

		} else {

			var require_js
			require_js         = document.createElement("script")
			require_js.src     = paramaters.root_directory + "/require.js"
			require_js.onload  = function () {

				requirejs([
					paramaters.root_directory + "/nebula/configuration.js",
					paramaters.root_directory + "/nebula/morph/morph.js",
					paramaters.root_directory + "/configuration.js"
				], function ( tool_configuration, morph, module_configuration ) {

					require.config({
						map : {
							"*" : {
								"css" : paramaters.root_directory + "/nebula/require_css/css.js"
							}
						}
					})

					requirejs( 
						morph.index_loop({
							subject : [].concat( tool_configuration.main, tool_configuration.module ),
							else_do : function ( loop ) {
								return loop.into.concat( paramaters.root_directory + "/nebula/"+ loop.indexed +".js" )
							}
						}), 
						function () {

							var nebula_library, tool_name, tool_object
							
							tool_name      = [].concat( tool_configuration.module, "entry", "morph" )
							tool_object    = Array.prototype.slice.call( arguments ).slice(1).concat( module, morph )
							tools          = morph.get_object_from_array({
								key   : tool_name,
								value : tool_object
							})
							nebula_library = morph.index_loop({
								subject : Array.prototype.slice.call( arguments ).slice(1).concat( module, morph ),
								into    : {},
								else_do : function ( loop ) {
									loop.indexed.nebula              = loop.into
									loop.into[tool_name[loop.index]] = loop.indexed
									return loop.into
								}
							})

							arguments[0].make({
								paramaters    : paramaters,
								nebula        : nebula_library,
								configuration : module_configuration,
								root          : paramaters.root_directory
							})
						}
					)
				})
			}

			document.head.appendChild(require_js)
		}
	}

})( 
	window,
	{

		get_the_root_directory_based_on_last_loaded_script_src : function ( last_loaded_script ) {
			
			var root_path, script_source_from_attribute

			script_source_from_attribute = last_loaded_script.getAttribute("src")

			if ( last_loaded_script.src === script_source_from_attribute ) {
				return this.get_path_directory( this.get_path_directory( script_source_from_attribute ) )
			}
			
			root_path = last_loaded_script.src.replace( script_source_from_attribute, "" )

			if ( root_path[root_path.length-1] === "/" ) {
				return root_path.slice( 0, root_path.length-1 )
			} else { 
				return root_path
			}
		},

		get_path_directory : function ( path ) {

			var split_path, split_directory_path

			split_path           = path.split("/")
			split_directory_path = split_path.slice( 0, split_path.length-1 )

			if ( split_directory_path.length > 0 ) {
				return split_directory_path.join("/")
			} else { 
				return null
			}
		},

		remove_slash_at_the_end_of_directory_if_it_has_it : function ( directory ) { 
			if ( directory[directory.length-1] === "/" ) { 
				return directory.slice(0, directory.length-1 )
			} else { 
				return directory
			}
		},

		get_data_type_attribute_values : function ( node ) {

			var node_attributes = {}
			for ( var attribute in node.attributes ) {

				if ( !isNaN( attribute ) && node.attributes[attribute].name.match("data-") !== null ) {

					var attribute_name = node.attributes[attribute].name.replace(/(data-|-)/g, function ( match ) { 
						if ( match === "data-" ) { 
							return ""
						}
						if ( match === "-" ) { 
							return "_"
						}
					})
					node_attributes[attribute_name] = node.attributes[attribute].value
				}
			}
			return node_attributes
		}
	}
)