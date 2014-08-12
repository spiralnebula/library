(function ( window, module ) {

	if ( window.define && window.define.amd ) {
		define(module)
	} else { 

		var current_scripts, this_script, module_name

		current_scripts     = document.getElementsByTagName("script")
		this_script         = current_scripts[current_scripts.length-1]
		module_name         = this_script.getAttribute("data-module-name") || "nebula"
		window[module_name] = module
	}
})( 
	window,
	{
		get_module_name_from_path : function ( path ) {
			var split
			split = path.split("/")
			return split[split.length-1]
		},

		get_indexes_of_every_occurance_in_array : function ( get ) { 
			get.at   = ( get.at === undefined ? get.from.length-1 : get.at )
			get.into = get.into || []
			if ( get.at < 0 ) {
				return get.into.reverse()
			} else {
				return this.get_indexes_of_every_occurance_in_array({
					into : ( get.what === get.from[get.at] ? get.into.concat(get.at) : get.into ),
					at   : get.at - 1,
					from : get.from.slice(0),
					what : get.what
				})
			}
		},

		get_common_values_of_two_arrays : function ( get ) {

			if ( get.at === undefined  ) {
				if ( get.from[0].length > get.from[1].length )  { 
					get.array = { 
						counting  : get.from[0].slice(0),
						comparing : get.from[1].slice(0)
					}
				} else { 
					get.array = { 
						counting  : get.from[1].slice(0),
						comparing : get.from[0].slice(0)
					}
				}
				get.at   = get.array.counting.length-1
				get.into = []
			}

			if ( get.at < 0 ) {
				return get.into
			} else {

				var arrays_have_value_in_common, value_is_already_noted
				arrays_have_value_in_common = ( get.array.comparing.indexOf( get.array.counting[get.at] ) > -1 )
				value_is_already_noted      = ( get.into.indexOf( get.array.counting[get.at] ) > -1 )

				return this.get_common_values_of_two_arrays({
					at    : get.at - 1,
					array : get.array,
					into  : ( 
						arrays_have_value_in_common && !value_is_already_noted ? 
							get.into.concat( get.array.counting[get.at] ) : 
							get.into
					)
				})
			}
		},

		do_all_members_of_an_array_equal : function ( equal ) {

			equal.ammount = equal.ammount || 0
			equal.at      = equal.at      || 0

			if ( equal.at >= equal.array.length ) {
				return ( equal.ammount === equal.array.length )
			} else { 
				return this.do_all_members_of_an_array_equal({
					at      : equal.at + 1,
					array   : equal.array,
					value   : equal.value,
					ammount : ( equal.array[equal.at] === equal.value ? equal.ammount + 1 : equal.ammount )
				})
			}
		},

		create_updated_load_completion_map : function ( create ) {

			var path_index, index_is_true, indentical_false_indexes
			path_index               = create.map.path.indexOf( create.path )
			index_is_true            = create.map.load[path_index]
			indentical_false_indexes = this.get_common_values_of_two_arrays({
				from : [
					this.get_indexes_of_every_occurance_in_array({
						from : create.map.path,
						what : create.path
					}),
					this.get_indexes_of_every_occurance_in_array({
						from : create.map.load,
						what : false
					})
				]
			})
			if ( index_is_true && indentical_false_indexes.length > 0 ) {
				create.map.load[indentical_false_indexes[0]] = true
			} else {
				create.map.load[path_index] = true
			}

			return {
				path : create.map.path.slice(0),
				load : create.map.load.slice(0)
			}
		},

		create_load_completion_map : function ( create ) {
			
			create.at     = create.at     || 0
			create.into   = create.into   || create.from || { path : [], load : [] }
			create.module = create.module || []
			if ( create.added ) { 
				create.module = create.module.concat( create.added )
			}
			if ( create.from ) { 
				create.at = create.module.length-1
			}
			if ( create.at >= create.module.length ) { 
				return create.into
			} else {
				return this.create_load_completion_map({
					at     : create.at + 1,
					module : create.module,
					into   : {
						path : create.into.path.concat( create.module[create.at] ),
						load : create.into.load.concat( false )
					}
				})
			}
		},

		make    : function () {
			var self
			self = this
			return {
				modules             : [],
				loaded              : [],
				loading_done        : [],
				load_completion_map : {
					path : [],
					load : []
				},
				loading_done_method : {},
				loading_module : function ( module ) {

					this.load_completion_map = self.create_load_completion_map({
						module: this.modules.slice(0),
						added : module.path,
						from  : this.load_completion_map
					})
					this.modules             = this.modules.concat( module.path )

				},
				loaded_module  : function ( module ) {
					var all_modules_have_loaded
					// this.modules             = this.modules.concat( module.returned || [] )
					this.loaded              = this.loaded.concat( module.returned || [] )
					this.load_completion_map = self.create_updated_load_completion_map({
						map  : this.load_completion_map,
						path : module.path
					})

					all_modules_have_loaded  = self.do_all_members_of_an_array_equal({
						value : true,
						array : this.load_completion_map.load
					})

					if ( all_modules_have_loaded ) {
						this.loading_done = this.loading_done.concat( true )
						this.loading_done_method.call({}, {
							path : this.loaded
						})
					}
				},				
				call_this_method_on_load_completion : function ( method ) {
					this.loading_done_method = method
				},

				is_module_loading_done    : self.is_module_loading_done,
				get_module_name_from_path : self.get_module_name_from_path
			}
		}
	}
)