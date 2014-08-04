
var module, hash_map, module_by_name_map
module   = window.manager
hash_map = {
	"js/node_maker"             : {},
	"js/morph"                  : {},
	"js/node_maker/morph"       : {},
	"js/node_maker/other/morph" : {},
}
module_by_name_map = {
	"morph" : {
		"js/morph"                  : "module:js/morph",
		"js/node_maker/morph"       : "module:js/node_maker/morph",
		"js/stuff/morph"            : "module:js/stuff/morph",
		"js/node_maker/other/morph" : "module:js/node_maker/other/morph",
	},
	"node_maker" : {
		"js/node_maker"             : "module:js/node_maker",
	},
	"event_master" : {
		"js/stuff/event_master" : "module:js/stuff/event_master"
	},
	"nubnub" : {
		"js/stuff/nub/nub/nubnub" : "module:js/stuff/nub/nub/nubnub",
		"js/ahem/nubnub"          : "module:js/ahem/nubnub",
		"js/ss/nubnub"            : "module:js/ss/nubnub",
		"js/nubnub"               : "module:js/nubnub",
		"js/nub/mub/nubnub"       : "module:js/nub/mub/nubnub",
		"js/nub/scrub/nubnub"     : "module:js/nub/scrub/nubnub",
		"js/scrub/scrub"          : "module:js/scrub/scrub"
	},
}

describe("get objects keys", function() {
	it("gets all the keys", function() {
		expect(module.get_object_keys({
			"js/s"       : 1,
			"js/stuff"   : 2,
			"some/stuff" : 3
		})).toEqual([
			"js/s",
			"js/stuff",
			"some/stuff",
		])
	})
})

describe("get path directory ", function() {

	it("gets the path directory from a path", function() {
		expect( module.get_path_directory( "js/stuff/folder/stuff" ) ).toBe( "js/stuff/folder" )
	})

	it("returns null if the path has no directory specified", function() {
		expect( module.get_path_directory( "js.js" ) ).toBe( null )	
	})
})

describe("remove slash from the end of path if it has one", function() {
	
	it("removes a slash from path", function() {
		expect(
			module.remove_slash_from_the_end_of_path_if_it_has_one("js/")
		).toEqual("js")
	})

	it("returns path as is because it has no slash at the end", function() {
		expect(
			module.remove_slash_from_the_end_of_path_if_it_has_one("js")
		).toEqual("js")	
	})
})

describe("get the directory name that comes after the root path if it exists", function() {

	it("finds the directory name of a valid path and root", function() {
		expect(module.get_the_directory_name_that_comes_after_the_root_path_if_it_exists({
			directory_path : "js/stuff/some/name",
			root_path      : "js/stuff"
		})).toEqual("some")
	})

	it("returns false if there is not directory name that comes after the path", function() {
		expect(module.get_the_directory_name_that_comes_after_the_root_path_if_it_exists({
			directory_path : "js/stuff/some",
			root_path      : "js/stuff"
		})).toBe(false)
	})

	it("returns false if the root path is not within the directory path", function() {
		expect(module.get_the_directory_name_that_comes_after_the_root_path_if_it_exists({
			directory_path : "js/stuff/some",
			root_path      : "stuff"
		})).toEqual(false)
	})

	it("dosent break if you offer it a root path with a slash (/) at the end", function() {
		expect(module.get_the_directory_name_that_comes_after_the_root_path_if_it_exists({
			directory_path : "js/stuff/some/name",
			root_path      : "js/stuff/"
		})).toEqual("some")
	})

	it("dosent break if you give it an empty root path", function() {
		expect(module.get_the_directory_name_that_comes_after_the_root_path_if_it_exists({
			directory_path : "js/stuff/some/name",
			root_path      : ""
		})).toEqual("js")		
	})
})

describe("get folder names in the path based on the map by name", function() {

	it("does what it says dammit", function() {
		expect(module.get_folder_names_in_the_path_based_on_map_by_name({
			name_list  : [
				"js/stuff",
				"js/some/name",
				"js/name/some"
			],
			path       : "js"
		})).toEqual([
			"some",
			"name"
		])
	})

	it("gets the foler names when the given root paht is empty meaning its absolute root", function() {
		expect(module.get_folder_names_in_the_path_based_on_map_by_name({
			name_list  : [
				"stuff",
				"some/name",
				"name/some"
			],
			path       : ""
		})).toEqual([
			"some",
			"name"
		])
	})
})

describe("get module that is in the a folder of the same scope ", function() {
	
	it("finds a module in the same scope", function() {
		expect(module.get_module_that_is_in_a_folder_of_the_same_scope({
			library  : module_by_name_map.event_master,
			location : "js/some_name",
			name     : "event_master"
		})).toEqual({
			path   : "js/stuff/event_master",
			object : module_by_name_map.event_master["js/stuff/event_master"]
		})
	})

	it("does a more extensive search", function() {
		expect(module.get_module_that_is_in_a_folder_of_the_same_scope({
			library  : module_by_name_map.nubnub,
			location : "js/stuff",
			name     : "nubnub"
		})).toEqual({
			path   : "js/ahem/nubnub",
			object : module_by_name_map.nubnub["js/ahem/nubnub"]
		})

		expect(module.get_module_that_is_in_a_folder_of_the_same_scope({
			library  : module_by_name_map.nubnub,
			location : "js/nub/mub",
			name     : "nubnub"
		})).toEqual({
			path   : "js/nub/mub/nubnub",
			object : module_by_name_map.nubnub["js/nub/mub/nubnub"]
		})
	})

	it("handles null directory searches", function() {
		expect(module.get_module_that_is_in_a_folder_of_the_same_scope({
			library  : module_by_name_map.nubnub,
			location : "",
			name     : "nubnub"
		})).toEqual({
			path   : "js/nubnub",
			object : module_by_name_map.nubnub["js/nubnub"]
		})
	})

	it("finds local scope packages", function() {
		expect(module.get_module_that_is_in_a_folder_of_the_same_scope({
			library  : module_by_name_map.nubnub,
			location : "",
			name     : "scrub"
		})).toEqual({
			path   : "js/scrub/scrub",
			object : module_by_name_map.nubnub["js/scrub/scrub"]
		})
	})
})

describe("get the closest library version for module based on its location", function() {

	it("finds the first closest library version", function() {
		expect( module.get_the_closest_library_version_for_module_based_on_its_location({
			library      : module_by_name_map.morph,
			location     : "js/node_maker",
			name         : "morph"
		})).toEqual({
			path   : "js/node_maker/morph",
			object : module_by_name_map.morph["js/node_maker/morph"]
		})
	})

	it("finds the later closest library verison for module based on its location", function() {
		expect( module.get_the_closest_library_version_for_module_based_on_its_location({
			library      : module_by_name_map.morph,
			location     : "js/node_maker/other/somethingelse/some",
			name         : "morph"
		})).toEqual({
			path   : "js/node_maker/other/morph",
			object : module_by_name_map.morph["js/node_maker/other/morph"] 
		})	
	})

	it("finds the closest library verison for module based on its location in an unrelated context", function() {
		expect( module.get_the_closest_library_version_for_module_based_on_its_location({
			library      : module_by_name_map.morph,
			location     : "js/node_maker/some",
			name         : "morph"
		})).toEqual({ 
			path   : "js/node_maker/other/morph",
			object : module_by_name_map.morph["js/node_maker/other/morph"]
		})
	})

	it("finds a module that is sideways in scope not just lexical", function() {
		expect( module.get_the_closest_library_version_for_module_based_on_its_location({
			library      : module_by_name_map.nubnub,
			location     : "js/node_maker",
			name         : "nubnub"
		})).toEqual({ 
			path   : "js/ahem/nubnub",
			object : module_by_name_map.nubnub["js/ahem/nubnub"]
		})
	})
	// supposed to test the error buts its being a punk
	// it("throws a fit if the module could not be found in the lexical scope of the file", function() {
	// 	expect(module.get_the_closest_library_version_for_module_based_on_its_location({
	// 		library      : module_by_name_map.morph,
	// 		location     : "js/node_maker/some",
	// 		name         : "some_stuff"
	// 	})).toThrow()
	// })

	// need to test here better
})

describe("gets module from library if it exists", function() {
	
	it("extracts the module", function() {
		expect( module.get_module_from_library_if_it_exists({
			library  : module_by_name_map,
			location : "js/node_maker",
			name     : "morph"
		})).toEqual({
			path   : "js/node_maker/morph",
			object : module_by_name_map.morph["js/node_maker/morph"]
		})
	})

	it("returns false if module does not exist", function() {
		expect( module.get_module_from_library_if_it_exists({
			library  : module_by_name_map,
			location : "js/node_maker",
			name     : "some_module"
		})).toBe( false )
	})
})

describe("remove the last member of an array and return the leftovers", function() {
	it("does what it says on the box", function() {
		expect( module.remove_last_member_of_array_and_return_leftover( 
			[1,2,3] ) 
		).toEqual( [1,2] )

		expect( 
			module.remove_last_member_of_array_and_return_leftover( [1] ) 
		).toEqual( [] )
	})
})

describe("get required modules from map by name", function() {
	it("return the desired modules", function() {
		expect(module.get_required_modules_from_map_by_name({
			require     : ["morph", "node_maker"],
			into        : {
				name   : [],
				module : []
			},
			location    : "js/node_maker",
			map_by_name : module_by_name_map,
		})).toEqual({
			name   : [
				"node_maker",
				"morph"
			],
			module : [
				{
					path   : "js/node_maker",
					object : "module:js/node_maker"
				},
				{
					path   : "js/node_maker/morph",
					object : "module:js/node_maker/morph"
				}
			]
		})
	})	
})

describe( "get an object from combining two arrays", function() {
	it("combines two arrays", function() {
		expect(module.get_an_object_from_combining_two_arrays({
			key   : ["a", "b"],
			value : ["1", "2"] 
		})).toEqual({
			"a" : "1",
			"b" : "2"
		})
	})

	it("has reference when combining a value of objects", function() {
		var value, key, result
		key    = ["a", "b"]
		value  = [{ a : 1 }, { b : 2 }]
		result = module.get_an_object_from_combining_two_arrays({
			key   : key,
			value : value,
		})
		expect(result["a"]).toBe(value[0])
	})

	it("has no reference when combining an value of arrays", function() {
		var value, key, result
		key    = ["a", "b"]
		value  = [["stuff", "1"], { b : 2 }]
		result = module.get_an_object_from_combining_two_arrays({
			key   : key,
			value : value,
		})
		expect(result["a"]).not.toBe(value[0])	
	})
})

describe("get required modules as module library based on definition", function() {

	it("returns an empty object if there are no modules required", function() {
		expect( module.get_required_modules_as_a_module_library_based_on_definition({
			define : {
				require : []
			},
			map_by_name : module_by_name_map
		})).toEqual({})
	})

	it("returns an empty object if the require key of the definition is not specified", function() {
		expect( module.get_required_modules_as_a_module_library_based_on_definition({
			define  : {
			},
		})).toEqual( {} )
	})

	it("retruns the desired modules", function() {
		expect( module.get_required_modules_as_a_module_library_based_on_definition({
			define  : {
				require : ["morph", "node_maker"]
			},
			location    : "js/node_maker",
			map_by_name : module_by_name_map,
		})).toEqual({
			"node_maker" : {
				path   : "js/node_maker",
				object : "module:js/node_maker"
			},
			"morph"      : {
				path   : "js/node_maker/morph",
				object : "module:js/node_maker/morph"
			}
		})	
	})
})

describe("is path allowed to access module", function() {

	it("has a default notatation that comes down to \".\" local notation", function() {
		expect(module.is_path_allowed_to_access_module({
			path   : "js/path/main",
			module : {
				location   : "js/path/stuff"
			}
		})).toBe(true)

		expect(module.is_path_allowed_to_access_module({
			path   : "js/stuff/main",
			module : {
				location   : "js/path/stuff"
			}
		})).toBe(false)	
	})

	it("understands the \"*\" global notation", function() {
		expect(module.is_path_allowed_to_access_module({
			path   : "js/path/main",
			module : {
				location   : "js/path/stuff",
				premission : "*"
			}
		})).toEqual(true)
	})

	it("understands the \".\" local notation", function() {
		expect(module.is_path_allowed_to_access_module({
			path   : "js/path/main",
			module : {
				location   : "js/path/stuff",
				premission : "."
			}
		})).toBe(true)

		expect(module.is_path_allowed_to_access_module({
			path   : "js/stuff/main",
			module : {
				location   : "js/path/stuff",
				premission : "."
			}
		})).toBe(false)
	})

	it("understands the \">\" children only notation", function() {

		expect(module.is_path_allowed_to_access_module({
			path   : "js/path/some/folder/main",
			module : {
				location   : "js/path/stuff",
				premission : ">"
			}
		})).toBe(true)

		expect(module.is_path_allowed_to_access_module({
			path   : "js/path/some/folder/main",
			module : {
				location   : "js/",
				premission : ">"
			}
		})).toBe(true)

		expect(module.is_path_allowed_to_access_module({
			path : "js/node_maker",
			module : { 
				location   : "js/node_maker/morph",
				premission : ">"
			}
		})).toBe(false)

		expect(module.is_path_allowed_to_access_module({
			path   : "js/folder/main",
			module : {
				location   : "js/path/stuff",
				premission : ">"
			}
		})).toBe(false)

		expect(module.is_path_allowed_to_access_module({
			path   : "js/main",
			module : {
				location   : "js/path/stuff",
				premission : ">"
			}
		})).toBe(false)
	})

	it("understands the \"module_name\" notation ", function() {

		expect(module.is_path_allowed_to_access_module({
			path   : "js/path/main",
			module : {
				location   : "js/path/stuff",
				premission : "main"
			}
		})).toBe(true)

		expect(module.is_path_allowed_to_access_module({
			path   : "js/path/some_name",
			module : {
				location   : "js/path/stuff",
				premission : "main"
			}
		})).toBe(false)

		expect(module.is_path_allowed_to_access_module({
			path   : "js/some_name",
			module : {
				location   : "js/path/stuff",
				premission : "main"
			}
		})).toBe(false)
	})
})

describe("get modules which are allowed from library based on location", function() {
	it("it gets the desired modules discards the others", function() {
		expect(module.get_modules_which_are_allowed_from_library_based_on_location({
			path    : "js/node_maker",
			library : {
				"node_maker" : {
					path   : "js/node_maker",
					object : {
						define : {
							allow : "."
						},
						stuff : "ss"
					}
				},
				"morph"      : {
					path   : "js/node_maker/morph",
					object : {
						define : {
							allow : "."
						}
					}
				}
			},
		})).toEqual({
			"node_maker" : {
				define : {
					allow : "."
				},
				stuff : "ss"
			}
		})
	})

	it("it gets all the modules", function() {
		expect(module.get_modules_which_are_allowed_from_library_based_on_location({
			path    : "js/node_maker",
			library : {
				"node_maker" : {
					path   : "js/node_maker",
					object : {
						define : {
							allow : "."
						},
						stuff : "ss"
					}
				},
				"morph"      : {
					path   : "js/node_maker/morph",
					object : {
						define : {
							allow : "*"
						}
					}
				}
			},
		})).toEqual({
			"node_maker" : {
				define : {
					allow : "."
				},
				stuff : "ss"
			},
			"morph" : {
				define : {
					allow : "*"
				}
			}
		})
	})

	it("gets none of the modules for they art invalid", function() {
		expect(module.get_modules_which_are_allowed_from_library_based_on_location({
			path    : "js/node_maker",
			library : {
				"node_maker" : {
					path   : "js/node_maker",
					object : {
						define : {
							allow : "some_name"
						},
						stuff : "ss"
					}
				},
				"morph"      : {
					path   : "js/node_maker/morph",
					object : {
						define : {
							allow : ">"
						}
					}
				}
			},
		})).toEqual({})		
	})
})