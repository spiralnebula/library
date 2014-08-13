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
			var sorter

			sorter = module.nebula.nebula.make()
			sorter.call_this_method_on_load_completion( function ( load_map ) {
				module.nebula.get.require_package_modules({
					main_module_name : module.configuration.name,
					load_map         : load_map.path,
					root_directory   : module.root,
					set_global       : function ( object ) { 
						
						if ( module.configuration.start ) { 
							
							if ( module.configuration.start.initiate ) { 
								object.make()
							}

							if ( module.configuration.start.test ) { 
								window[module.configuration.name] = object
								window[module.configuration.name].make( module.configuration.start.test.with || {} )
							}
						}
					}
				})
			})

			module.nebula.get.make({
				require        : module.configuration, 
				sort           : sorter,
				root_directory : module.root,
				main_package   : { 
					name   : module.configuration.name,
					loaded : [].concat( module.configuration.main, module.configuration.module )
				}
			})
		}
	}
)