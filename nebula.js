define({

	make    : function () {

		return {

			map     : {},

			modules : {},

			load_completion_method : {},
			
			module_is_loading : function ( module ) {
				this.modules[module.called] = null
			},
			
			module_has_loaded : function ( module ) {
				
				this.modules[module.called] = module.returned

				if ( this.is_module_loading_done() ) {
					this.load_completion_method(this.modules)
				}
			},
			
			is_module_loading_done : function () {

				var is_loading_done = true

				for ( module_name in this.modules ) {
					if ( this.modules[module_name] === null ) {
						is_loading_done = false
					}
				}

				return is_loading_done
			},

			call_this_method_upon_load_completion : function ( method ) {
				this.load_completion_method = method
			}
		}
	},
})