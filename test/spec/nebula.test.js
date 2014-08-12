var nebula

nebula = window.nebula_object

describe("nebula make", function() {
	it("detects a finished load once and only once even if there are duplicate names", function() {
		var module, load_list
		load_list = [
			"library/test_package", 
			"library/test_package2", 
			"library/test_package3", 
			"library/test_package/test_package", 
			"library/test_package", 
			"library/test_package2/test_package2", 
			"library/test_package/library/test_package3/test_package3", 
			"library/test_package3", 
			"library/test_package"
		]
		module    = nebula.make()
		module.call_this_method_on_load_completion(function () {
			return "some some"
		})
		for (var index = 0; index < load_list.length; index++) {
			module.loading_module({
				path : load_list[index]
			})
		}
		for (var index = 0; index < load_list.length; index++) {
			module.loaded_module({
				path     : load_list[index],
				returned : ["a"]
			})
		}
		expect(module.loading_done.length).toEqual(1)
	})

	it("knows if loading has not finished", function() {
		var module, load_list
		load_list = ["some/some", "some/more", "some/mo/some"]
		module    = nebula.make()

		for (var index = 0; index < load_list.length; index++) {
			module.loading_module({
				path : load_list[index]
			})
		}
		for (var index = 0; index < load_list.length-2; index++) {
			module.loaded_module({
				path     : load_list[index],
				returned : ["a"]
			})
		}
		expect(module.loading_done.length).toEqual(0)
	})

	it("calls the final method on load completion that has been assigned with the right arguments", function() {
		var module, load_list
		load_list = ["some/some", "some/more", "some/mo/some"]
		module    = nebula.make()
		module.call_this_method_on_load_completion(function () {
			return "some some"
		})
		spyOn( module, "loading_done_method" )
		for (var index = 0; index < load_list.length; index++) {
			module.loading_module({
				path : load_list[index]
			})
		}
		for (var index = 0; index < load_list.length; index++) {
			module.loaded_module({
				path     : load_list[index],
				returned : ["a"]
			})
		}
		expect(module.loading_done_method).toHaveBeenCalled()
	})
})

describe("do all members of an array equal", function() {
	
	it("returns true when all the members are the same", function() {
		expect(nebula.do_all_members_of_an_array_equal({
			value : true,
			array : [true, true, true]
		})).toEqual( true )
	})

	it("returns false when not all members are the same", function() {
		expect(nebula.do_all_members_of_an_array_equal({
			value : "some",
			array : ["some", "some", true]
		})).toEqual( false )		
	})
})

describe("create updated load completion map", function() {
	it("updates based on single load", function() {
		expect(nebula.create_updated_load_completion_map({
			path : "main/name/name",
			map  : {
				path   : [
					"some/name",
					"main/name/name",
					"main/some/some"
				],
				load : [
					false,
					false,
					false
				]
			}
		})).toEqual({
			path   : [
				"some/name",
				"main/name/name",
				"main/some/some"
			],
			load : [
				false,
				true,
				false
			]
		})
	})

	it("updates two identical paths", function() {
		expect(nebula.create_updated_load_completion_map({
			path : "some/name",
			map  : {
				path   : [
					"some/name",
					"some/name",
					"main/name/name",
					"main/some/some"
				],
				load : [
					true,
					false,
					false,
					false
				]
			}
		})).toEqual({
			path   : [
				"some/name",
				"some/name",
				"main/name/name",
				"main/some/some"
			],
			load : [
				true,
				true,
				false,
				false
			]
		})			
	})
})


describe("create load completion map", function() {
	it("creates a map from an existing one and just adds onto the new values", function() {
		expect(nebula.create_load_completion_map({
			module : [
				"some/name"
			],
			added  : [
				"some/other"
			],
			from : { 
				path : ["some/name"],
				load : [ false ]
			},
		})).toEqual({
			path : [
				"some/name",
				"some/other"
			],
			load : [
				false,
				false
			]
		})	
	})
	it("creates a pure map from given to load modules", function() {
		expect(nebula.create_load_completion_map({
			module : [
				"some/name",
				"main/name/name",
				"main/some/some"
			],
		})).toEqual({
			path   : [
				"some/name",
				"main/name/name",
				"main/some/some"
			],
			load : [
				false,
				false,
				false
			]
		})
	})
	it("creates a map from an existing one", function() {
		expect(nebula.create_load_completion_map({
			module : [
				"some/name",
				"main/name/name"
			],
			added : [
				"main/some/some"
			]
		})).toEqual({
			path   : [
				"some/name",
				"main/name/name",
				"main/some/some"
			],
			load : [
				false,
				false,
				false
			]
		})		
	})
})

describe("get indexes of every occurance in array", function() {
	it("dosent fail", function() {
		expect(nebula.get_indexes_of_every_occurance_in_array({
			from : ["s", "a", "d", "s", "s"],
			what : "s"
		})).toEqual([0,3,4])	
	})
})

describe("get common values of two arrays", function() {
	it("does what it says", function() {
		expect(nebula.get_common_values_of_two_arrays({
			from : [
				["s", "d", "s", "b"],
				["s", "d", "c"]
			]
		})).toEqual(["s", "d"])
	})	
})