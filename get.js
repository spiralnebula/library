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

		make : function ( package ) {
			
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
				this.loop({
					array    : package.require.package,
					into     : [],
					start_at : 0,
					if_done  : function () {},
					else_do  : function ( loop ) {
						
						package.sort.loading_module({
							path : loop.array[loop.start_at]
						})			

						loop.start_at += 1
						return loop
					}
				})

				this.loop({
					array    : package.require.package,
					into     : [],
					start_at : 0,
					if_done  : function () {},
					else_do  : function ( loop ) {

						var get_package_path

						get_package_path = function () { 
							return loop.array[loop.start_at-1]
						}	

						requirejs([ package.previous_path + loop.array[loop.start_at] +"/configuration" ], function ( configuration ) {

							var package_path, previous_path
							package_path  = get_package_path()
							previous_path = self.get_previous_path({
								previous : package.previous_path,
								package  : package_path
							})
							
							self.make({
								require        : configuration,
								sort           : package.sort,
								root_directory : package.root_directory,
								previous_path  : previous_path
							})

							package.sort.loaded_module({
								path     : package_path,
								returned : self.loop({
									array    : [].concat( configuration.main, configuration.module ),
									start_at : 0,
									into     : [],
									if_done  : function ( loop ) { 
										return loop.into
									},
									else_do : function ( loop ) {
										return { 
											array    : loop.array,
											start_at : loop.start_at + 1,
											into     : loop.into.concat( previous_path + loop.array[loop.start_at] ),
											if_done  : loop.if_done,
											else_do  : loop.else_do,
										}
									}
								})
							})

						})

						loop.start_at += 1
						return loop
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

			var module_paths, self

			self         = this
			module_paths = require.load_map.slice(0)

			requirejs( module_paths, function () {
				
				var module_by_path, module_by_name

				module_by_path = self.sort_module_paths_and_objects_into_module_path_map({
					path   : module_paths,
					object : arguments
				})
				module_by_name = self.sort_module_path_map_to_module_by_name_map( module_by_path )

				for ( var path in module_by_path ) {

					var pure_library, premited_library

					pure_library = self.get_required_modules_as_a_module_library_based_on_definition({
						define      : module_by_path[path].define || {},
						location    : path,
						map_by_name : module_by_name,
					})

					premited_library = self.get_modules_which_are_allowed_from_library_based_on_location({
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
		},

		get_previous_path : function ( path ) { 
			return ( 
				path.previous ?
					path.previous + this.add_slash_at_the_end_of_path_if_it_has_none( path.package ) :
					this.add_slash_at_the_end_of_path_if_it_has_none( path.package ) 
			)
		},

		get_modules_which_are_allowed_from_library_based_on_location : function ( get ) {

			var module_name, allowed_library

			allowed_library = {}
			for ( module_name in get.library ) {

				if ( get.library.hasOwnProperty( module_name ) ) {
					var this_module_has_premission_to_be_used
					this_module_has_premission_to_be_used = this.is_path_allowed_to_access_module({
						path   : get.path,
						module : {
							location   : get.library[module_name].path,
							premission : ( 
								get.library[module_name].object.define ? 
									get.library[module_name].object.define.allow : 
									{}
							)
						}
					})
					if ( this_module_has_premission_to_be_used ) { 
						allowed_library[module_name] = get.library[module_name].object
					}
				}
			}
			return allowed_library
		},

		is_path_allowed_to_access_module : function ( allow ) {

			if ( allow.module.premission === undefined ) { 
				allow.module.premission = "."
			} 

			if ( allow.module.premission === "*" ) {
				return true
			}

			if ( allow.module.premission === "." )  { 
				return ( this.get_path_directory( allow.path ) === this.get_path_directory( allow.module.location ) )
			}

			if ( allow.module.premission === ">" ) {
				return ( 
					this.get_path_directory( allow.path ).indexOf( this.get_path_directory( allow.module.location ) ) === 0 
				)
			}

			if ( allow.module.premission !== "." && allow.module.premission !== "." ) { 

				var requesting_module_name

				requesting_module_name = allow.path.split("/")
				requesting_module_name = requesting_module_name[requesting_module_name.length-1]
				return ( requesting_module_name === allow.module.premission )
			}
		},

		get_required_modules_as_a_module_library_based_on_definition : function ( module ) {
			if ( !module.define.require || module.define.require.length === 0 ) { 
				return {}
			} else {
				var required_modules
				required_modules = this.get_required_modules_from_map_by_name({
					require     : module.define.require,
					location    : module.location,
					map_by_name : module.map_by_name,
					into        : {
						name    : [],
						module  : []
					},
				})
				return this.get_an_object_from_combining_two_arrays({
					key   : required_modules.name,
					value : required_modules.module
				})
			}
		},

		get_required_modules_from_map_by_name : function ( sort ) {
			
			var module, module_name, modules_left_to_require

			module_name             = sort.require.slice(sort.require.length-1)
			modules_left_to_require = this.remove_last_member_of_array_and_return_leftover( sort.require )
			module                  = this.get_module_from_library_if_it_exists({
				name     : module_name,
				location : sort.location,
				library  : sort.map_by_name
			})

			if ( module === false ) {
				throw new Error("Module "+ module_name +" does not exist in this library compilation check to see if it has been mis spelt")
			}

			var library = {
				name   : sort.into.name.concat( module_name ),
				module : sort.into.module.concat( module )
			}

			if ( modules_left_to_require.length > 0 ) { 
				return this.get_required_modules_from_map_by_name({
					require     : modules_left_to_require,
					location    : sort.location,
					map_by_name : sort.map_by_name,
					into        : library
				})
			} else { 
				return library
			}

		},

		get_module_from_library_if_it_exists : function ( module ) {
			
			if ( module.library.hasOwnProperty( module.name ) ) { 
				return this.get_the_closest_library_version_for_module_based_on_its_location({
					library           : module.library[ module.name ],
					location          : module.location,
					name              : module.name
				})				
			} else {
				return false
			}
		},

		remove_slash_from_the_end_of_path_if_it_has_one : function ( path ) { 
			if ( path[path.length-1] === "/" ) { 
				return path.slice(0, path.length-1)
			} else { 
				return path
			}
		},

		add_slash_at_the_end_of_path_if_it_has_none : function ( path ) {
			if ( path[path.length-1] !== "/" ) { 
				return path + "/"
			} else { 
				return path
			}	
		},

		get_the_directory_name_that_comes_after_the_root_path_if_it_exists : function ( get ) { 
			
			if ( get.directory_path.indexOf( get.root_path ) === 0 ) {
				var split_directory_path, root_path
				root_path            = (
					get.root_path ?
						this.add_slash_at_the_end_of_path_if_it_has_none( get.root_path ) :
						""
				)
				split_directory_path = get.directory_path.replace( root_path, "" ).split("/")

				return ( split_directory_path.length > 1 ? split_directory_path[0] : false )

			} else { 
				return false
			}
		},

		get_folder_names_in_the_path_based_on_map_by_name : function ( folder ) {

			folder.count = folder.count || 0
			folder.names = folder.names || []

			if ( folder.count >= folder.name_list.length ) { 
				return folder.names
			} else {
				var local_folder_name
				local_folder_name = this.get_the_directory_name_that_comes_after_the_root_path_if_it_exists({
					directory_path : folder.name_list[folder.count],
					root_path      : folder.path
				})
				return this.get_folder_names_in_the_path_based_on_map_by_name({
					name_list : folder.name_list,
					count     : folder.count + 1,
					path      : folder.path,
					names     : ( 
						local_folder_name !== false ? 
							folder.names.concat(local_folder_name) : 
							folder.names
					),
				})
			}
		},

		get_module_that_is_in_a_folder_of_the_same_scope : function ( module ) { 
			
			var library_paths, local_directory_names, potential_paths, module_directory

			library_paths         = this.get_object_keys( module.library )
			module_directory      = ( module.location ? this.get_path_directory( module.location ) + "/" : "" )
			local_directory_names = this.get_folder_names_in_the_path_based_on_map_by_name({
				path      : module_directory,
				name_list : library_paths
			})

			potential_paths       = this.loop({
				array    : local_directory_names,
				start_at : 0,
				into     : [],
				if_done  : function ( loop ) {
					return loop.into
				},
				else_do  : function ( loop ) {
					return {
						array    : loop.array,
						into     : loop.into.concat( module_directory + loop.array[loop.start_at] + "/" + module.name ),
						start_at : loop.start_at + 1,
						if_done  : loop.if_done,
						else_do  : loop.else_do,
					}
				}
			})

			return this.loop({
				array    : potential_paths,
				start_at : 0,
				into     : "",
				if_done  : function ( loop ) {
					return loop.into
				},
				else_do  : function ( loop ) {
					
					var potential_module_path, potential_package_path
					potential_module_path  = loop.array[loop.start_at]
					potential_package_path = loop.array[loop.start_at] +"/"+ module.name

					if ( module.library.hasOwnProperty( potential_module_path ) ) { 
						loop.into = {
							path   : potential_module_path,
							object : module.library[potential_module_path]
						}
					}
					
					if ( module.library.hasOwnProperty( potential_package_path ) ) { 
						loop.into = {
							path   : potential_package_path,
							object : module.library[potential_package_path]
						}
					}

					return {
						array    : loop.array,
						into     : loop.into,
						start_at : ( loop.into ? loop.array.length : loop.start_at + 1 ),
						if_done  : loop.if_done,
						else_do  : loop.else_do,
					}	
				}
			})
		},

		get_the_closest_library_version_for_module_based_on_its_location : function ( module ) {
			
			if ( module.current_location === null ) { 
				throw new Error("The module \""+ module.name +"\" could not be found in the scope of the file \""+ module.location +"\"")
			}
			
			// slight clean up here necessary
						
			var module_path, is_module_in_local_scope

			module.current_location  = module.current_location || module.location
			module.current_location  = ( this.get_path_directory( module.current_location ) ? module.current_location : "" )
			module_path              = module.current_location +"/"+ module.name
			is_module_in_local_scope = this.get_module_that_is_in_a_folder_of_the_same_scope({
				library  : module.library,
				location : module.current_location,
				name     : module.name
			})
			

			if ( is_module_in_local_scope ) { 
				return is_module_in_local_scope
			}

			if ( module.library.hasOwnProperty(module_path) ) {
				return {
					path   : module_path,
					object : module.library[module_path]
				}
			} else {
				return this.get_the_closest_library_version_for_module_based_on_its_location({
					library          : module.library,
					location         : module.location,
					name             : module.name,
					current_location : this.get_path_directory( module.current_location )
				})
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

		sort_module_path_map_to_module_by_name_map : function ( map ) {

			var path, module_by_name_map
			module_by_name_map = {}

			for ( path in map ) {
				var split_path, module_name
				split_path  = path.split("/")
				module_name = split_path[split_path.length-1]
				if ( !module_by_name_map.hasOwnProperty( module_name ) ) {
					module_by_name_map[module_name] = {}
				}
				module_by_name_map[module_name][path] = map[path]
			}

			return module_by_name_map
		},

		remove_last_member_of_array_and_return_leftover : function ( array ) {
			if ( array.length === 1 ) {
				return []
			} else {
				return array.slice(0, array.length-1 )
			}
		},

		sort_module_paths_and_objects_into_module_path_map : function ( map ) {
			
			return this.loop({
				array    : map.path,
				start_at : 0,
				into     : {},
				if_done  : function (loop) {
					return loop.into 
				},
				else_do  : function (loop) {
					var path
					
					path            = loop.array[loop.start_at]
					loop.into[path] = map.object[loop.start_at]

					return { 
						array    : loop.array,
						into     : loop.into,
						start_at : loop.start_at + 1,
						if_done  : loop.if_done,
						else_do  : loop.else_do
					}
				}
			})
		},

		get_an_object_from_combining_two_arrays : function ( object ) {

			var key, value

			object.set = object.set || {}
			key        = this.remove_last_member_of_array_and_return_leftover( object.key )
			value      = this.remove_last_member_of_array_and_return_leftover( object.value )

			if ( object.value[object.value.length-1].constructor === Array ) {
				object.set[object.key.slice(object.key.length-1)] = object.value[object.value.length-1].slice(0)
			} else { 
				object.set[object.key.slice(object.key.length-1)] = object.value[object.value.length-1]
			}

			if ( key.length === 0 ) { 
				return object.set
			} else {
				return this.get_an_object_from_combining_two_arrays({
					key   : key,
					value : value,
					set   : object.set
				})
			}
		},

		get_object_keys : function ( object ) {
			var keys, property
			keys = []
			for ( property in object ) { 
				if ( object.hasOwnProperty( property ) ) { 
					keys = keys.concat( property )
				}
			}
			return keys
		},

		loop : function (loop) {
			if ( loop.start_at >= loop.array.length ) {
				return loop.if_done(loop)
			} else {
				return this.loop(loop.else_do({
					array    : loop.array.slice( 0 ),
					start_at : loop.start_at,
					into     : loop.into,
					if_done  : loop.if_done,
					else_do  : loop.else_do
				}))
			}
		},
	}
)