(function ( window, module ) {

	if ( window.define && window.define.amd ) {
		define(module)
	} else { 

		var current_scripts, this_script, module_name

		current_scripts     = document.getElementsByTagName("script")
		this_script         = current_scripts[current_scripts.length-1]
		module_name         = this_script.getAttribute("data-module-name") || "nebula_main"
		window[module_name] = module
	}
})( 
	window,
	{ 
		make : function ( module ) {

			var count_object

			count_object = module.library.nebula.make()
			count_object.call_this_method_on_load_completion( function ( given ) {

				requirejs( given.path.style )

				module.library.get.require_package_modules({
					main_module_name : module.configuration.name,
					load_map         : given.path.module,
					root_directory   : module.root,
					set_global       : function ( object ) {

						if ( module.paramaters.start_with ) {

							if (
								module.configuration.start && 
								module.configuration.start.with.hasOwnProperty( module.paramaters.start_with ) 
							) {

								var start_paths = module.library.morph.index_loop({
									"subject" : module.configuration.start.with[module.paramaters.start_with],
									else_do   : function ( loop ) {
										return loop.into.concat( module.root +"/"+ loop.indexed +".js" )
									}
								})

								requirejs( start_paths, function () {

									var paramaters = module.library.morph.object_loop({
										"subject" : module.library.morph.flatten_object({
											to_level : 1,
											object   : module.library.sort.sort_module_path_map_to_module_by_name_map( 
												module.library.sort.sort_module_paths_and_objects_into_module_path_map({
													path   : start_paths,
													object : arguments
												})
											)
										}),
										else_do  : function ( loop ) {
											return { 
												key   : module.library.sort.get_path_details( loop.key ).module_name,
												value : loop.value
											}
										}
									})

									if ( module.configuration.start.global ) { 
										window[module.configuration.name] = object.make( paramaters )
									} else { 
										object.make( paramaters )
									}
									
								})

							} else { 
								console.warn("package cant start with \""+ module.paramaters.start_with +"\" because it does not exists in the configuration.js file")
							}

						} else if ( module.paramaters.export_as ) {

							var made_instances

							if ( module.paramaters.export_name_method ) { 
								made_instances = module.library.morph.index_loop({
									subject : window[module.paramaters.export_as].called.slice(),
									into    : {},
									else_do : function ( loop ) {
										var instance_name
										instance_name            = object[ module.paramaters.export_name_method ].call(
											object,
											loop.indexed.arguments
										)
										loop.into[instance_name] = object[loop.indexed.method].call(
											object, 
											loop.indexed.arguments 
										)
										return loop.into
									}
								})	
							} else { 
								made_instances = module.library.morph.index_loop({
									subject : window[module.paramaters.export_as].called.slice(),
									else_do : function ( loop ) {
										return loop.into.concat(
											object[loop.indexed.method].call(
												object, 
												loop.indexed.arguments 
											)
										)
									}
								})
							}

							window[module.paramaters.export_as] = module.library.morph.inject_object({
								object : module.library.morph.biject_object({
									object : module.library.morph.surject_object({
										object : window[module.paramaters.export_as],
										with   : ["called"],
										by     : "key"
									}),
									with  : function ( loop ) {
										return {
											value : ( 
												loop.value.constructor === Function ? 
													function () { 
														object[loop.key].apply(
															object, 
															arguments 
														)
													} :
													loop.value
											)
										}
									}
								}),
								with : { 
									made : made_instances
								}
							})
							
						} else { 
							object.make()
						}
					}
				})
				
			})

			module.library.get.require_package_configuration({
				require        : module.configuration, 
				sort           : count_object,
				root_directory : module.root,
				main_package   : true
			})
		}
	}
)