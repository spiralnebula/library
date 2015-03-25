(function ( window, entry ) {

	if ( entry.amd_exists() ) {
		entry.make();
	} else {
		entry.make();
	}

})( 

	window,

	{	
		make : function () {
			
			var paramaters;
			
			paramaters = this.get_package_paramaters();

			if ( paramaters.export_as ) {
				this.export_package( paramaters.export_as );
				this.export_package_methods( paramaters );
			} 

			if ( this.is_being_tested() ) {
				window[module_name] = module
			} else {
				this.load_requirejs( paramaters );
			}
		},

		load_requirejs : function ( paramaters ) {

			var script, self
			
			self          = this
			script        = document.createElement("script")
			script.src    = paramaters.root_directory + "/require.js"
			script.onload = function () {
				self.load_configuration( paramaters )
			}

			document.head.appendChild(script);
		},

		load_configuration : function ( paramaters ) {

			var self = this

			requirejs([
				paramaters.root_directory + "/nebula/configuration.js",
				paramaters.root_directory + "/configuration.js"
			], function ( configuration, package_configuration ) {

				self.configure_requirejs( paramaters )

				self.load_package({
					package_configuration : package_configuration,
					configuration : configuration,
					paramaters : paramaters,
				})
			})
		},

		configure_requirejs : function ( paramaters ) { 
			require.config({
				map : {
					"*" : {
						"css" : paramaters.root_directory + "/nebula/css.js"
					}
				},
			})
		},

		load_package : function ( given ) {
			this.load_nebula({
				configuration : given.configuration,
				paramaters : given.paramaters,
				package_configuration : given.package_configuration,
				nebula_module_paths : this.create_module_paths({
					configuration : given.configuration,
					root_directory : given.paramaters.root_directory
				})
			})
		},

		load_nebula : function ( given ) {
			var self = this
			requirejs( given.nebula_module_paths, function () {
				self.make_nebula({
					configuration : given.configuration,
					paramaters : given.paramaters,
					package_configuration : given.package_configuration,
					modules : arguments
				})
			})
		},

		make_nebula : function ( given ) {

			var library, main_module;
			
			main_module = given.modules[0]
			library = this.format_nebula_modules_by_name({
				modules              : given.modules,
				module_configuration : given.configuration,
			})

			main_module.make({
				paramaters    : given.paramaters,
				library       : library,
				configuration : given.package_configuration,
				root          : given.paramaters.root_directory
			})
		},

		create_module_paths : function ( from ) {

			var paths, module_paths
			paths = this.create_base_module_paths( from.configuration )
			module_paths = [];

			for (var index = 0; index < paths.length; index++) {
				module_paths.push( from.root_directory + "/nebula/"+ paths[index] +".js" )
			};

			return module_paths;
		},

		create_base_module_paths : function ( configuration ) { 
			return [].concat( configuration.main, configuration.module );
		},

		is_being_tested : function () { 
			return ( typeof window.jasmine === "object" );
		},

		amd_exists : function () {
			return ( typeof window.define === 'function' && window.define.amd );
		},

		export_package : function ( called ) { 
			window[called] = {
				called : [],
				made   : {},
			};
		},

		export_package_methods : function ( paramaters ) {

			var methods_to_export;
			methods_to_export = this.get_methods_to_export( paramaters );

			for (var index = 0; index < methods_to_export.length; index++) {
				this.export_package_method({
					package : paramaters.export_as,
					method : methods_to_export[index]
				});
			}
		},

		export_package_method : function ( export_as ) {

			window[export_as.package][export_as.method] = function () {
				this.called = this.called.concat({
					method    : export_as.method,
					arguments : Array.prototype.slice.call( arguments )
				})
			}
		},

		get_methods_to_export : function ( paramaters ) { 
			return ( paramaters.export_methods || "make" ).split(":");
		},

		get_package_paramaters : function () { 
			
			var last_loaded_script, paramaters;

			last_loaded_script = this.get_last_loaded_script();
			paramaters = this.get_data_type_attribute_values( last_loaded_script );
			paramaters.root_directory = this.get_path_without_end_slash(
				paramaters.root_directory || this.get_the_root_directory_of_script( last_loaded_script )
			);

			return paramaters;
		},

		get_last_loaded_script : function () {

			var scripts = document.getElementsByTagName("script");
			return scripts[scripts.length-1];
		},

		get_data_type_attribute_values : function ( node ) {

			var node_attributes, index;
			node_attributes = {};

			for (index = 0; index < node.attributes.length; index++) {

				var attribute, name;

				attribute = node.attributes.item(index);
				name = this.format_attribute_name_to_paramater( attribute.name );
				node_attributes[name] = attribute.value
			};

			return node_attributes;
		},

		format_attribute_name_to_paramater : function ( name ) {

			return name.replace(/(data-|-)/g, function ( match ) {
				
				if ( match === "data-" ) { 
					return "";
				}
				if ( match === "-" ) { 
					return "_";
				}
			})
		},

		get_path_without_end_slash : function ( path ) {

			if ( path[path.length-1] === "/" ) { 
				return path.slice(0, path.length-1 )
			} else { 
				return path
			}
		},

		get_the_root_directory_of_script : function ( last_loaded_script ) {
			
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

		format_nebula_modules_by_name : function ( given ) { 

			var module_names, modules, library;

            module_names = [].concat( given.module_configuration.module, "entry" );
            modules = Array.prototype.slice.call( given.modules ).slice(1);
            library = {}

            for (var index = 0; index < modules.length; index++) {
                var module = modules[index];
                module.library = library
                library[module_names[index]] = module
            };

            return library
		},
	}
)