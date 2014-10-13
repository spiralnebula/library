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
					path : package.main_package.name
				})
			}

			if ( package.require.package && package.require.package.length > 0 ) {
				
				package.previous_path = package.previous_path || ""

				// make a way for nebula to accept an array of packages to load rather 
				// than having to do this here loop thingy
				self.nebula.morph.index_loop({
					subject : package.require.package,
					else_do : function ( loop ) {

						package.sort.loading_module({
							path : loop.indexed
						})

						return loop.into
					}
				})

				self.nebula.morph.index_loop({
					subject : package.require.package,
					else_do : function ( loop ) {

						var get_package_path

						get_package_path = function () { 
							return loop.indexed
						}	

						requirejs([ 
							package.root_directory +"/"+ package.previous_path + loop.indexed +"/configuration.js" 
						], function ( configuration ) {

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
								path     : package_path,
								returned : self.nebula.morph.index_loop({
									subject : [].concat( configuration.main, configuration.module ),
									else_do : function ( loop ) {
										return loop.into.concat( previous_path + loop.indexed )
									}
								})
							})

						})

						return loop.into
					}
				})
			}

			if ( package.main_package ) {
				package.sort.loaded_module({
					path     : package.main_package.name,
					returned : package.main_package.loaded
				})
			}
		},

		require_package_modules : function ( require ) {
			var module_paths, self, module_load_paths

			self              = this
			module_paths      = require.load_map.slice(0)
			module_load_paths = this.nebula.morph.index_loop({
				subject : module_paths,
				else_do : function ( loop ) {

					return loop.into.concat( self.nebula.sort.get_full_url_from_root_and_path({
						root : require.root_directory,
						path : loop.indexed
					}))
				}
			})
			
			requirejs( module_load_paths, function () {
				var module_by_path, module_by_name

				module_by_path = self.nebula.sort.sort_module_paths_and_objects_into_module_path_map({
					path   : module_paths,
					object : arguments
				})

				module_by_name = self.nebula.sort.sort_module_path_map_to_module_by_name_map( module_by_path )
				
				for ( var path in module_by_path ) {

					var pure_library, premited_library

					pure_library = self.nebula.sort.get_required_modules_as_a_module_library_based_on_definition({
						define      : module_by_path[path].define || {},
						location    : path,
						map_by_name : module_by_name,
					})

					premited_library = self.nebula.sort.get_modules_which_are_allowed_from_library_based_on_location({
						path    : path,
						library : pure_library
					})

					module_by_path[path].library = premited_library
				}
				// can put a filter in here that filters all the global variables that decide 
				// what does into the the app
				// console.log( require )
				// console.log( module_by_path )
				// console.log( module_by_path[require.main_module_name] )
				require.set_global( module_by_path[require.main_module_name] )
			})
		}

	}
)