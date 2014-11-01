(function ( window, module ) {

	if ( window.define && window.define.amd ) {
		define(module)
	} else { 

		var current_scripts, this_script, module_name

		current_scripts     = document.getElementsByTagName("script")
		this_script         = current_scripts[current_scripts.length-1]
		module_name         = this_script.getAttribute("data-module-name") || module.define.name
		window[module_name] = module
	}
})( 
	window,
	{
		define : {
			name : "nebula_manager"
		},

		require_package_configuration : function ( package ) {
			
			var self
			self = this

			if ( package.main_package ) {
				package.sort.loading_module({
					path : package.require.name
				})
			}

			if ( 
				package.require.package && 
				package.require.package.length > 0 
			) {
				
				package.previous_path = package.previous_path || ""

				self.nebula.morph.index_loop({
					subject : package.require.package,
					else_do : function ( loop ) {

						var get_package_path, current_package_path, package_configuration_path

						current_package_path       = loop.indexed
						package_configuration_path = package.root_directory +"/"+ package.previous_path + current_package_path +"/configuration.js"
						get_package_path           = function () { 
							return loop.indexed
						}

						package.sort.loading_module({
							path : current_package_path
						})

						requirejs([ package_configuration_path ], function ( configuration ) {

							var package_path, previous_path

							package_path  = get_package_path()
							previous_path = self.nebula.sort.get_previous_path({
								previous : package.previous_path,
								package  : package_path
							})

							self.require_package_configuration({
								require        : configuration,
								sort           : package.sort,
								root_directory : package.root_directory,
								previous_path  : previous_path
							})

							package.sort.loaded_module({
								path      : package_path,
								returned  : self.nebula.configuration_sort.convert_package_configuration_into_require_paths({
									previous_path : previous_path,
									configuration : configuration
								})
							})

						})

						return loop.into
					}
				})
			}

			if ( package.main_package ) {
				package.sort.loaded_module({
					path     : package.require.name,
					returned : self.nebula.configuration_sort.convert_package_configuration_into_require_paths({
						previous_path : "",
						configuration : package.require
					})
				})
			}
		},

		require_package_modules : function ( require ) {

			var self, module_paths, module_load_paths

			self              = this
			module_paths      = require.load_map.slice(0)
			module_load_paths = this.nebula.sort.get_module_paths_with_appended_root_directory({
				root_directory : require.root_directory,
				module_paths   : module_paths
			})

			requirejs( module_load_paths, function () {

				var module_by_path, module_by_name

				module_by_path = self.nebula.sort.sort_module_paths_and_objects_into_module_path_map({
					path   : module_paths,
					object : arguments
				})
				module_by_name = self.nebula.sort.sort_module_path_map_to_module_by_name_map( module_by_path )
				
				for ( var path in module_by_path ) {

					module_by_path[path].library = self.nebula.sort.get_modules_which_are_allowed_from_library_based_on_location({
						path    : path,
						library : self.nebula.sort.get_required_modules_as_a_module_library_based_on_definition({
							define      : module_by_path[path].define || {},
							location    : path,
							map_by_name : module_by_name,
						})
					})
				}

				require.set_global( module_by_path[require.main_module_name] )
			})
		}

	}
)