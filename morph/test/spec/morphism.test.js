
	var module = window.morph

	describe("inject object", function() {

		it("injects an object into an object", function() {
			expect( module.inject_object({
				object : { 
					s : "some",
					d : "some other"
				},
				with : { 
					c : "another some"
				}
			})).toEqual({
				s : "some",
				d : "some other",
				c : "another some"
			})
		})

		it("injects an array into an object", function() {
			expect( module.inject_object({
				object : { 
					a : "some",
					b : "some other"
				},
				with : ["a", "b", "c"]
			})).toEqual({
				"a" : "some",
				"b" : "some other",
				"0" : "a",
				"1" : "b",
				"2" : "c"
			})
		})
	})

	describe("inject array", function() {
		var definition, input
		definition = { 
			array : [],
			with  : [] || {} || function () {}
		}

		it("injects array into an array", function() {
			expect( module.inject_array({
				array : [1,2,3,4],
				with  : [5,6,7,8]
			})).toEqual( [1,2,3,4,5,6,7,8] )
		})

		it("injects an the values of an object into an array", function() {
			expect( module.inject_array({
				array : [1,2,3,4],
				with  : { s : "a", ss : "b", sss : "c" },
			})).toEqual( [1,2,3,4, "a", "b", "c" ] )
		})

		it("injects with the return values of a function", function () {
			expect( module.inject_array({
				array : [1,2,3,4],
				with  : function ( member ) { 
					return member * 2
				}
			})).toEqual( [1,2,3,4,2,4,6,8] )
		})

		it("injects only sometimes with a function", function () {
			expect( module.inject_array({
				array : [1,2,3,4],
				with  : function ( member ) { 
					if ( member % 2 === 0 ) {
						return member * 2
					} else {
						return false
					}
				}
			})).toEqual( [1,2,3,4,4,8] )
		})
	})

	describe("surject array", function() {
		
		var definition
		definition = {
			array : [],
			with  : [] || {} || function () {},
			by    : "(removing|extracting)"
		}
		definition = {
			array : [],
			with  : [] || {} || function () {},
			by    : "(index|value)"
		}

		it("removes number members of an array and returns whats left over", function() {
			expect(module.surject_array({
				array : [1,2,3,4], 
				with  : [2,4]
			})).toEqual( [1,3] )
		})

		it("cant remove object members of an array based on value #!", function() {
			expect(module.surject_array({
				array : [{ s : 1 }, 2, { d : 2 }, 4],
				with  : [{ s : 1 }, { d : 2 }]
			})).not.toEqual([2,4])
		})

		it("removes object members of an array based on index and returns whats left over ", function() {
			expect(module.surject_array({
				array : [{ s : 1 }, 2, { d : 2 }, 4],
				with  : [0,2],
				by    : "index"
			})).toEqual( [2,4] )
		})

		it("leftover members of an array which are objects still contain references to the orignal ones #!", function() {
			
			var pass, result
			pass   = {
				array : [{ s : 1 }, 2, { d : 2 }, 4],
				with  : [1,2,3],
				by    : "index"
			}
			result = module.surject_array(pass)
			expect(result[0]).toBe(pass.array[0])
		})
	})

	describe("surject object", function() {
		it("removes a single key and value by key", function() {
			var pass, result
			pass = {
				object : { "some" : "name", "another" : "value" },
				with   : ["some"],
				by     : "key"

			}
			result = module.surject_object(pass)
			expect(result).toEqual({ "another" : "value" })
		})

		it("removes a several keys and values by key", function() {
			var pass, result
			pass = {
				object : { 
					"some"     : "name", 
					"another"  : "value",
					"another2" : "values",
				},
				with   : ["some", "another"],
				by     : "key"

			}
			result = module.surject_object(pass)
			expect(result).toEqual({ "another2" : "values" })
		})
	})

	describe("biject object", function() {

		it("bijects and returns both key and value", function() {
			expect( module.biject_object({
				object : {
					"some"    : "here",
					"another" : "over there",
				},
				with   : function ( loop ) {
					return { 
						key   : loop.key   +"some",
						value : loop.value +"some",
					}
				}
			})).toEqual({
				"somesome"    : "heresome",
				"anothersome" : "over theresome",
			})
		})

		it("bijects without returning key or value", function() {
			expect( module.biject_object({
				object : {
					"some"    : "here",
					"another" : "over there",
				},
				with   : function ( loop ) {
					return { 
						value : loop.value +"some",
					}
				}
			})).toEqual({
				"some"    : "heresome",
				"another" : "over theresome",
			})

			expect( module.biject_object({
				object : {
					"some"    : "here",
					"another" : "over there",
				},
				with   : function ( loop ) {
					return { 
						key : loop.key + "some"
					}
				}
			})).toEqual({
				"somesome"    : "here",
				"anothersome" : "over there",
			})	
		})

		it("bijects into an object of equal size", function() {
			expect( module.biject_object({
				object : { 
					s : "some",
					d : "some other"
				},
				into : {
					c : "another",
					b : "mother"
				},
				with : function ( loop ) {
					return { 
						key   : loop.key + loop.into.key,
						value : loop.value + " "+ loop.into.value,
					}
				}
			})).toEqual({
				"sc" : "some another",
				"db" : "some other mother",
			})
		})

		it("returns the original object if given an object and into object of different sizes", function() {
			expect( module.biject_object({
				object : { 
					s : "some",
					d : "some other"
				},
				into : {
					c : "another",
				},
				with : function ( loop ) {
					return {}
				}
			})).toEqual({ 
				s : "some",
				d : "some other"
			})
		})

		it("converts returned key back to its original if it has the same value as an existing ", function() {

			expect( module.biject_object({
				object : {
					"some"    : "here",
					"another" : "over there",
				},
				with   : function ( loop ) {
					return {
						key : "somesome"
					}
				}
			})).toEqual({
				"somesome"    : "here",
				"another" : "over there",
			})

			expect( module.biject_object({
				object : {
					"some"    : "here",
					"another" : "over there",
				},
				with   : function ( loop ) {
					return {
						key   : "somesome",
						value : "some"
					}
				}
			})).toEqual({
				"somesome" : "some",
				"another"  : "some",
			})
		})
	})

	describe("biject array", function() {

		it("bijects with a method that returns every value", function() {
			expect(module.biject_array({
				array : [1,2,3,4,5,6],
				with  : function ( loop ) { 
					return loop.index+loop.indexed
				}
			})).toEqual([1,3,5,7,9,11])
		})

		it("bijects into another array cleanly", function() {
			expect(module.biject_array({
				array : [1,2,3],
				into  : [4,5,6],
				with  : function ( loop ) { 
					return loop.indexed + loop.into.indexed
				}
			})).toEqual([5,7,9])
		})
	})

	describe("get object from arrays", function ( ) {
		it("merges", function() {
			expect(
				module.get_object_from_array({
					key   : ["s", "d"],
					value : [1,2]
				})
			).toEqual({
				"s" : 1,
				"d" : 2
			})
		})
		it("mergers with a method", function() {
			expect(
				module.get_object_from_array({
					key     : ["s", "d"],
					value   : [1,2],
					else_do : function ( loop ) {
						return loop.value + "some"
					}
				})
			).toEqual({
				"s" : "1some",
				"d" : "2some"
			})
		})
	})
	
	describe("index loop", function () {
		var input_1, input_2, input_3
		input_1 = {
			subject   : [1,2,3],
			else_do : function (loop) {
				return loop.into.concat("member "+ loop.subject[loop.index])
			}
		},
		input_2 = {
			subject   : [1,2,3],
			else_do : function (loop) {
				return loop.into.concat("member "+ loop.subject[loop.index])
			}
		},
		input_3 = {
			subject   : [{ s : 1 }, { s : 2 }],
			else_do : function (loop) {
				loop.indexed.s = "change"
				return loop.into.concat(loop.indexed)
			}
		}

		it("returns expected results", function () {
			expect(module.index_loop(input_1)).toEqual(["member 1", "member 2", "member 3"])
		})

		it("has no reference upon completion to the input subject", function () {
			var output = module.index_loop(input_2)
			input_2.subject.push("stuff")
			expect(output.indexOf("stuff")).toEqual(-1)
		})

		it("result has no reference to objects that were contianed in the input subject", function () {
			var output = module.index_loop(input_3)
			expect(input_3.subject[0].s).toEqual(1)
			expect(output[0].s).toEqual("change")
		})

	})

	describe("index loop base", function () {

		var input, input_2, output, input_3, input_4, input_5

		input   = {
			subject  : [1,2,3],
			start_at : 0,
			into     : [],
			if_done  : function (loop) {
				return loop.into
			},
			else_do  : function (loop) {
				loop.into = loop.into.concat("member "+ loop.subject[loop.start_at])
				loop.start_at += 1
				return loop
			}
		}
		input_2 = {
			subject  : 5,
			start_at : 0,
			into     : [],
			if_done  : function (loop) {
				return loop.into
			},
			else_do  : function (loop) {
				loop.into      = loop.into.concat(loop.start_at)
				loop.start_at += 1
				return loop
			}
		}
		input_3 = {
			subject  : 5,
			start_at : 2,
			into     : [],
			if_done  : function (loop) {
				return loop.into
			},
			else_do  : function (loop) {
				loop.into      = loop.into.concat(loop.start_at)
				loop.start_at += 1
				return loop
			}
		}
		input_4 = {
			subject  : 5,
			start_at : -1,
			into     : [],
			if_done  : function (loop) {
				return loop.into
			},
			else_do  : function (loop) {
				loop.into      = loop.into.concat(loop.start_at)
				loop.start_at += 1
				return loop
			}
		}
		output      = module.index_loop_base(input)

		it("indexes array", function () {
			expect( output ).toEqual(["member 1", "member 2", "member 3"])
		})

		it("indexes based on number", function() {
			expect( module.index_loop_base(input_2) ).toEqual([0,1,2,3,4])	
		})

		it("indexes using the \"start_at\" as a starting point", function() {
			expect( module.index_loop_base(input_3) ).toEqual([2,3,4])	
		})

		it("indexes using a negative \"start_at\" as a starting point", function() {
			expect( module.index_loop_base(input_4) ).toEqual([-1,0,1,2,3,4])	
		})

		it("has no reference on completion to the input.into array", function () {
			input.into.push("new stuff")
			expect(output.indexOf("new stuff")).toEqual(-1)
		})

	})

	describe("base loop", function() {
		it("loops basic stuff", function() {
			expect(module.base_loop({
				count        : 10,
				into         : [],
				is_done_when : function ( loop ) {
					return ( loop.count === 0 )
				},
				if_done      : function ( loop ) {
					return loop.into
				},
				else_do      : function ( loop ) {
					return {
						count        : loop.count-1,
						into         : loop.into.concat(loop.count*2),
						is_done_when : loop.is_done_when,
						if_done      : loop.if_done,
						else_do      : loop.else_do,
					}
				}
			})).toEqual([  20, 18, 16, 14, 12, 10, 8, 6, 4, 2 ])
		})	
	})

	describe("while greater than zero", function() {
		
		it("iterate with a if done and else do", function() {
			expect(module.while_greater_than_zero({
				count : 5,
				into  : [],
				if_done : function ( result ) {
					return result.join("") + "/" + result[result.length-1]
				},
				else_do : function ( loop ) {
					return loop.into.concat(loop.count*2)
				}
			})).toEqual("108642/2")
		})

		it("iterates without an if done", function() {
			expect(module.while_greater_than_zero({
				count : 5,
				into  : [],
				else_do : function ( loop ) {
					return loop.into.concat(loop.count*2)
				}
			})).toEqual( [10,8,6,4,2] )	
		})
	})

	describe("are these two values the same", function() {
		
		it("knows that two strings are the same", function() {
			expect( module.are_these_two_values_the_same({
				first  : "stuff",
				second : "stuff"
			})).toBe(true)
		})

		it("knows that two objects with one value are the same", function() {
			expect( module.are_these_two_values_the_same({
				first  : { some : "s" },
				second : { some : "s" }
			}) ).toBe(true)
		});

		it("knows that two objects are the same", function() {
			expect( module.are_these_two_values_the_same({
				first  : {
					s : "1",
					d : 2,
					c : [1,23,4]
				},
				second : {
					s : "1",
					d : 2,
					c : [1,23,4]
				}
			}) ).toBe(true)
		})

		it("knows that two nested objects are the same", function() {
			
			expect( module.are_these_two_values_the_same({
				first  : {
					s : "1",
					d : 2,
					b : { 
						a : "stuff",
						b : [1,2,4],
						c : { 
							a : "1",
							b : "cda"
						}
					},
					c : [1,23,4]
				},
				second : {
					s : "1",
					d : 2,
					b : { 
						a : "stuff",
						b : [1,2,4],
						c : { 
							a : "1",
							b : "cda"
						}
					},
					c : [1,23,4]
				}
			}) ).toBe(true)	
		})

		it("knows that two objects are not the same", function() {
			expect( module.are_these_two_values_the_same({
				first  : {
					s : "1",
					d : 2,
				},
				second : {
					s : "1",
					d : 2,
					b : { 
						a : "stuff",
						b : [1,2,4]
					},
					c : [1,23,4]
				}
			})).toBe(false)	
		})

		it("knows that two arrays are the same", function() {
			expect( module.are_these_two_values_the_same({
				first  : [1,2,4],
				second : [1,2,4]
			})).toBe(true)	
		})

		it("knows that two arrays are the same", function() {
			expect( module.are_these_two_values_the_same({
				first  : [1,2,4],
				second : [1,4]
			})).toBe(false)	
		})
	})

	describe("biject ", function() {
		
	})

	describe("get the values of an object", function() {
		it("gets the values", function() {
			expect(module.get_the_values_of_an_object({
				s : 1,
				d : 2
			})).toEqual([1,2])
		})
		it("gets arrays rather than joining them into one", function() {
			expect(module.get_the_values_of_an_object({
				s : [1,2,3],
				d : 2
			})).toEqual([ [1,2,3], 2 ])
		})
	})

	describe("get the keys of an object", function() {
		it("gets the values", function() {
			expect(module.get_the_keys_of_an_object({
				s : 1,
				d : 2
			})).toEqual([ "s", "d" ])
		})
	})

	describe("object loop", function() {

		it("loops through an object with a simple else do", function() {
			expect(module.object_loop({
				subject : {
					s : "d",
					b : "some"
				},
				else_do : function ( loop ) {
					return {
						key   : loop.index + "2" + loop.key,
						value : loop.value + loop.index + "4"
					}
				}
			})).toEqual({
				"02s" : "d04",
				"12b" : "some14",
			})
		})

		it("loops through an object with an if done", function() {
			expect(module.object_loop({
				subject : {
					s : "d",
					b : "some"
				},
				"if_done?" : function ( loop ) {
					return [ loop.key[0], loop.value[0], loop.key[1], loop.value[1] ].join(":")
				},
				else_do : function ( loop ) {
					return {
						key   : loop.index + "2" + loop.key,
						value : loop.value + loop.index + "4"
					}
				}
			})).toEqual("02s:d04:12b:some14")
		})

		it("loops through an object with the into string", function() {
			expect(module.object_loop({
				subject : {
					s : "d",
					b : "some"
				},
				"into?"    : "some",
				else_do : function ( loop ) {
					return {
						key   : loop.index + "2" + loop.key,
						value : loop.value + loop.index + "4",
						into  : loop.into + "s"
					}
				}
			})).toEqual("somess")
		})

		it("loops through an object that has empty values and dosent freak out", function() {
			expect(module.object_loop({
				subject : {
					s : "",
					d : "some",
					c : "",
				},
				else_do : function ( loop ) { 
					return {
						key   : loop.key,
						value : loop.value
					}
				}
			})).toEqual({
				s : "",
				d : "some",
				c : "",
			})
		})
	})

	describe("flatten object", function() {
		it("flattens nested objects", function() {
			expect(module.flatten_object({ 
				object : {
					some : "here",
					som  : {
						level : "2"
					},
					somesome : { 
						"level1" : {
							"level2" : "3"
						},
						"levelsome" : {
							"levelsomesome" : {
								"level3" : "4"
							}
						}
					}
				}
			})).toEqual({
				"some"   : "here",
				"level"  : "2",
				"level2" : "3",
				"level3" : "4"
			})
		})

		it("flattens objects to a specified depth level", function() {
			expect(module.flatten_object({
				to_level : 1,
				object   : {
					"some" : { 
						"level1" : 1
					},
					"somesome" : {
						"level1.1" : 2,
						"level2"   : {
							"level2.2" : 3,
							"moremore" : { 
								"level.3.3" : 4
							}
						}
					}
				}
			})).toEqual({
				"level1"   : 1,
				"level1.1" : 2,
				"level2"   : {
					"level2.2" : 3,
					"moremore" : { 
						"level.3.3" : 4
					}
				}
			})	
		})
	})

	// describe("does array contain this value", function() {
	// 	it("recoginses that it contains a object", function() {
	// 		expect(module.does_array_contain_this_value({
	// 			array : [{ some : "s" }, 2, 4, "some", { some : "d" }],
	// 			value : { some : "s" }
	// 		})).toBe( true )
	// 	})
	// });