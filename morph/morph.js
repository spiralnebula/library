(function ( window, module ) {
	if ( window.define && window.define.amd ) { 
		define(module)
	} else { 
		window.morph = module
	}
})( 
	window, 
	{
		define : { 
			allow : "*"
		},
		// a structure perserving map
		homomorph : function (what) {
			
			var set, with_function_for_nested_objects, with_function, count

			count                            = -1
			set                              = ( what.set === "array" ? [] : {} )
			with_function_for_nested_objects = function (member) {
				return member.value
			}
			with_function                    = what.with || with_function_for_nested_objects


			for ( var property in what.object ) {

				if ( what.object.hasOwnProperty(property) ) {

					var new_value, count
					count     = count + 1
					new_value = what.object[property]

					if ( what.object[property].constructor === Object )
						new_value = this.homomorph({
							object : what.object[property],
							with   : with_function_for_nested_objects
						})

					if ( what.object[property].constructor === Array )
						new_value = what.object[property].slice(0)

					if ( set.constructor === Array ) {
						var return_value = with_function.call({}, {
							value         : new_value,
							property_name : property,
							set           : set,
							count         : count
						})
						set = set.concat(( 
							return_value.constructor === Array ?
							[return_value] :
							return_value
						))
					}
					
					if ( set.constructor === Object )
						set[property] = with_function.call({}, {
							value         : new_value,
							property_name : property,
							set           : set,
							count         : count
						})
				}
			}

			return set
		},

		inject_array : function ( what ) {
			
			if ( what.with.constructor === Array ) { 
				return what.array.concat( what.with )
			}

			if ( what.with.constructor === Object ) {
				return what.array.concat( this.homomorph({
					object : what.with,
					set    : "array"
				}) )
			}

			if ( what.with.constructor === Function ) {
				return what.array.concat(this.index_loop({
					subject : what.array,
					else_do : function ( loop ) {
						var evaluated
						evaluated = what.with.call( {}, loop.subject[loop.index] )
						if ( evaluated ) {
							return loop.into.concat( evaluated )
						} else { 
							return loop.into
						}
					}
				}))
			}
		},

		surject_array : function ( what ) {

			return this.index_loop_base({
				subject         : what.array,
				start_at        : 0,
				into            : {
					extracted : [],
					leftover  : []
				},
				if_done  : function ( loop ) {

					if ( what.take === "extracted" ) {
						return loop.into.extracted
					}
					
					return loop.into.leftover
				},
				else_do  : function ( loop ) {

					var index_of_value
					index_of_value = ( what.by === "index" ? loop.start_at : loop.subject[loop.start_at] )
					return {
						subject         : loop.subject,
						start_at        : loop.start_at + 1,
						into            : { 
							extracted : ( 
								what.with.indexOf( index_of_value ) > -1 ? 
									loop.into.extracted.concat(loop.subject[loop.start_at]) :
									loop.into.extracted.slice(0)
							),
							leftover  : ( 
								what.with.indexOf( index_of_value ) < 0 ?
									loop.into.leftover.concat(loop.subject[loop.start_at]) :
									loop.into.leftover.slice(0)	
							)
						},
						if_done  : loop.if_done,
						else_do  : loop.else_do
					}
				},
			})
		},

		surject_object : function ( what ) { 
			var key, value, what_to_remove
			key   = this.get_the_keys_of_an_object( what.object )
			value = this.get_the_values_of_an_object( what.object )

			if ( what.by === "key" ) { 
				var removed_key_index, new_key
				removed_key_index = this.index_loop({
					subject : key,
					else_do : function ( loop ) { 
						return ( what.with.indexOf( loop.indexed ) > -1 ?
							loop.into.concat( loop.index ) : 
							loop.into 
						)
					}
				})
				
				return this.get_object_from_array({
					key : this.surject_array({
						array : key,
						with  : removed_key_index,
						by    : "index",
					}),
					value : this.surject_array({
						array : value,
						with  : removed_key_index,
						by    : "index",
					})
				})
			}
		},

		are_these_two_values_the_same : function( value ) {
			// this method is far to large to warrant existing on its own, thus it should be split up 
			// into logical parts, such as ( are arrays idnetical, are objects identical, so forth )
			// must find more logical parts to divide in as its a bit trickey
			var self, first_value_type

			self               = this
			first_value_type   = toString.call( value.first )
			value.first_stack  = value.first_stack  || []
			value.second_stack = value.second_stack || []

			if ( value.first === value.second ) {
				return ( value.first !== 0 ) || ( 1 / value.first === 1 / value.second )
			}

			if ( value.first == null || value.second == null) {
				return value.first === value.second
			}

			if ( first_value_type !== toString.call( value.second ) ) {
				return false
			}

			if ( first_value_type === '[object RegExp]' || first_value_type === '[object String]' ) {
				return '' + value.first === '' + value.second
			}

			if ( first_value_type === '[object Number]' ) {

				if ( +value.first !== +value.first ) {
					return +value.second !== +value.second
				}

				return ( 
					+value.first === 0 ? 
						1 / +value.first === 1 / +value.second :
						+value.first === +value.second 
				)
			}

			if ( first_value_type === '[object Date]' || first_value_type === '[object Boolean]' ) { 
				return +value.first === +value.second
			}

    		if (typeof value.first !== 'object' || typeof value.second !== 'object') {
    			return false
    		}

    		var does_any_value_match_the_stack

    		does_any_value_match_the_stack = this.while_greater_than_zero({
				count   : value.first_stack.length,
				into    : {
					first_value_is_the_same  : false,
					second_value_is_the_same : false
				},
				else_do : function ( loop ) {
					if ( loop.into.do_we_return === false ) {
						return { 
							first_value_is_the_same  : value.first_stack[loop.count] === value.first,
							second_value_is_the_same : value.second_stack[loop.count] === value.second
						}
					} else { 
						return loop.into
					}
    			}
    		})

    		if ( does_any_value_match_the_stack.first_value_is_the_same ) { 
    			return does_any_value_match_the_stack.second_value_is_the_same
    		}
			
			var first_constructor, second_constructor

			first_constructor = value.first.constructor
			second_constructor = value.second.constructor

			if (
				first_constructor !== second_constructor &&
				'constructor' in value.first             && 
				'constructor' in value.second            &&
				!(
					first_constructor.constructor === Function       &&
					first_constructor instanceof first_constructor   &&
					second_constructor.constructor === Function      &&
					second_constructor instanceof second_constructor
				)
			) {
				return false
			}

			value.first_stack  = value.first_stack.concat(value.first)
			value.second_stack = value.second_stack.concat(value.second)

			if ( first_value_type === '[object Array]' ) {
				return this.are_these_two_arrays_the_same( value )
			}

			if ( first_value_type === "[object Object]" ) {
				return this.are_these_two_objects_the_same( value )
			}
  		},

  		are_these_two_arrays_the_same : function ( value ) {

  			var first_object_keys, self

  			self              = this
			first_object_keys = this.get_the_keys_of_an_object( value.first )

      		if ( this.get_the_keys_of_an_object( value.second ).length === first_object_keys.length ) {
      			return this.while_greater_than_zero({
					count   : first_object_keys.length,
					into    : false,
					else_do : function ( loop ) {

						var key_name
						key_name = first_object_keys[loop.count]

						return (
							self.are_these_two_values_the_same( value.first[key_name], value.second[key_name], value.first_stack, value.second_stack )
						)
      				}
      			})
			} else { 
				return false
			}
  		},

  		are_these_two_objects_the_same : function ( value ) {

  			var self, first_object_keys

  			self              = this
			first_object_keys = this.get_the_keys_of_an_object( value.first )

      		if ( this.get_the_keys_of_an_object( value.second ).length === first_object_keys.length ) {
      			return this.while_greater_than_zero({
					count   : first_object_keys.length,
					into    : false,
					else_do : function ( loop ) {

						var key_name
						key_name = first_object_keys[loop.count]

						return (
							value.second.hasOwnProperty( key_name ) && 
							self.are_these_two_values_the_same( value.first[key_name], value.second[key_name], value.first_stack, value.second_stack )
						)
      				}
      			})
			} else { 
				return false
			}
  		},

  		get_the_keys_of_an_object : function ( object ) { 
  			var keys
  			keys = []
  			for ( var property in object ) { 
  				if ( object.hasOwnProperty( property ) ) { 
  					keys = keys.concat( property )
  				}
  			}
  			return keys
  		},

  		get_the_values_of_an_object : function ( object ) { 
  			
  			var keys
  			keys = []
  			for ( var property in object ) { 
  				if ( object.hasOwnProperty( property ) ) {
  					var value
  					value = object[property]
  					if ( value.constructor === Array ) {
  						keys = keys.concat([ value ])
  					} else { 
  						keys = keys.concat( value )
  					}
  				}
  			}

  			return keys
  		},

		biject : function () {

		},

		get_object_from_array : function ( array ) {
			return this.index_loop({
				subject : array.key,
				into    : {},
				if_done : function ( loop ) { 
					return ( array.if_done ? array.if_done.call( {}, loop ) : loop.into )
				},
				else_do : function ( loop ) {
					var value
					if ( array.else_do ) { 
						value = array.else_do.call( {}, {
							index : loop.index,
							key   : loop.indexed,
							value : array.value[loop.index],
							set   : loop.into
						})
					} else { 
						value = array.value[loop.index]
					}
					loop.into[loop.indexed] = value

					return loop.into
				}
			})
		},

		while_greater_than_zero : function ( loop ) { 
			return this.base_loop({
				count        : loop.count,
				into         : loop.into,
				is_done_when : function ( base_loop ) {
					return ( base_loop.count === 0 )
				},
				if_done      : function ( base_loop ) {
					return ( !loop.if_done ? base_loop.into : loop.if_done.call( {}, base_loop.into ) )
				},
				else_do      : function ( base_loop ) {
					return {
						count        : base_loop.count-1,
						into         : loop.else_do.call({}, {
							count : base_loop.count,
							into  : base_loop.into
						}),
						is_done_when : base_loop.is_done_when,
						if_done      : base_loop.if_done,
						else_do      : base_loop.else_do,
					}
				}
			})
		},

		base_loop : function ( loop ) {
			if ( loop.is_done_when.call({}, loop) ) { 
				return loop.if_done.call( {}, loop);
			} else {
				return this.base_loop( loop.else_do.call( {}, loop ) );
			}
		},

		index_loop : function (loop) {

			var self = this

			return this.index_loop_base({
				subject  : loop.subject,
				start_at : loop.start_at || 0,
				into     : this.replace_with_default({ what : loop.into, default : [] }),
				if_done  : loop.if_done  || function (base_loop) {
					return base_loop.into
				},
				else_do : function (base_loop) {
					return {
						subject  : self.copy({ what : base_loop.subject }),
						into     : loop.else_do({
							subject : self.copy({ what : base_loop.subject }),
							index   : base_loop.start_at,
							into    : base_loop.into,
							indexed : self.copy({
								what : base_loop.subject[base_loop.start_at]
							})
						}),
						start_at : base_loop.start_at + 1,
						if_done  : base_loop.if_done,
						else_do  : base_loop.else_do
					}
				}
			})
		},

		index_loop_base : function (loop) {
			
			if ( loop.subject === undefined ) {
				console.error("The loop \"subject\" has not been specified")
			}

			var length
			
			if ( loop.subject.constructor === Array )
				length = loop.subject.length
			
			if ( loop.subject.constructor === Number )
				length = loop.subject

			if ( loop.start_at >= length ) {
				return loop.if_done.call( {}, loop)
			} else {
				return this.index_loop_base(loop.else_do({
					subject  : loop.subject,
					length   : length,
					start_at : loop.start_at,
					into     : loop.into,
					if_done  : loop.if_done,
					else_do  : loop.else_do
				}))
			}
		},

		object_loop : function ( loop ) { 
			
			var key, value, self
			self  = this
			key   = this.get_the_keys_of_an_object( loop.subject )
			value = this.get_the_values_of_an_object( loop.subject )
			return this.base_loop({
				length       : key.length,
				index        : 0,
				subject      : key.slice(0),
				map          : {
					"key"   : [],
					"value" : [],
					"into"  : loop["into?"] || ""
				},
				is_done_when : function ( base_loop ) {
					return ( base_loop.index === key.length )
				},
				if_done     : function ( base_loop ) {
					var result, object
					object = self.get_object_from_array({
						key   : base_loop.map.key,
						value : base_loop.map.value
					})

					if ( loop["if_done?"] ) { 
						result = loop["if_done?"].call({}, { 
							key    : base_loop.map.key.slice(0),
							value  : base_loop.map.value.slice(0),
							into   : base_loop.map.into,
							object : object
						})
					}
					
					if ( loop["into?"] !== undefined ) {
						result = base_loop.map.into
					}

					return result || object
				},
				else_do      : function ( base_loop ) {
					var given
					given = loop.else_do.call({}, {
						"key"   : key[base_loop.index],
						"value" : value[base_loop.index],
						"into"  : base_loop.map.into,
						"index" : base_loop.index
					})
					return {
						length       : base_loop.length,
						map          : {
							key   : base_loop.map.key.concat(   given.key   || base_loop.map.key ),
							value : base_loop.map.value.concat( given.value || base_loop.map.value ),
							into  : given.into || base_loop.map.into
						},
						index        : base_loop.index + 1,
						is_done_when : base_loop.is_done_when,
						if_done      : base_loop.if_done,
						else_do      : base_loop.else_do,
					}
				}
			})

		},

		copy : function (copy) {
			
			if ( copy.what.constructor === Array && copy.object_array ) {
				return this.index_loop({
					array   : copy.what,
					else_do : function (loop) {
						return loop.into.concat(loop.indexed)
					}
				})
			}
			
			if (copy.what.constructor === Array) {
				return copy.what.slice(0)
			}
			
			if (copy.what.constructor === Object) {
				return this.homomorph({
					object : copy.what,
					with   : function (member) {
						return member.value
					}
				})
			}
			
			return copy.what
		},

		replace_with_default : function (replace) {
			if ( replace.what === undefined )
				return replace.default
			else
				return replace.what
		},

		exceptions : { 
			definition : function (message) { 
				this.name    = "Definition Error"
				this.message = message
			}
		},
		// someting that construct a list from something
	}
)