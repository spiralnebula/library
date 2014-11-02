(function ( window, module ) {

	if ( window.define && window.define.amd ) {
		define(module)
	} else { 

		var current_scripts, this_script, module_name

		current_scripts     = document.getElementsByTagName("script")
		this_script         = current_scripts[current_scripts.length-1]
		module_name         = this_script.getAttribute("data-module-name") || "configuration_sort"
		window[module_name] = module
	}
})( 
	window,
	{
		convert_package_configuration_into_require_paths : function ( convert ) {

			var self = this
			// this should a loop rather than this, with an array specifing
			// what values in the configuration shoud be taken 
			// into account when generating require paths
			return {
				style  : self.convert_path_definition_to_array({ 
					definition    : convert.configuration.style || [],
					previous_path : convert.previous_path
				}),
				module : self.convert_path_definition_to_array({ 
					definition    : [].concat( convert.configuration.main, convert.configuration.module ),
					previous_path : convert.previous_path
				})
			}
		},

		convert_path_definition_to_array : function ( path ) {
			var final_definition
			final_definition = []

			if ( path.definition.constructor === Array ) {
				final_definition = path.definition
			}

			if ( path.definition.constructor === String ) {
				final_definition = [].concat( path.definition )
			}

			return this.nebula.morph.index_loop({
				subject : final_definition,
				else_do : function ( loop ) {
					return loop.into.concat( path.previous_path + loop.indexed )
				}
			})
		}
	}
)