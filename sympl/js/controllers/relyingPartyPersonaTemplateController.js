'use strict';

privateControllers.controller('RelyingPartyPersonaTemplateController', ['$scope', '$state', 'RelyingParty', 'RelyingPartyPersona', 'AttributeDefinition', 'Property',
    function($scope, $state, RelyingParty, RelyingPartyPersona, AttributeDefinition, Property) {
    	$scope.init = function() {
			// TODO: figure out how RP ID is going to be passed
			$scope.rpId 						= 'b2a761d1-b348-48c5-abee-73886f21f088';
			$scope.relyingParty 				= new RelyingParty($scope.rpId).get();
			$scope.relyingPartyPersonaService 	= new RelyingPartyPersona($scope.rpId);
			$scope.attributeDefService 			= new AttributeDefinition();
			$scope.personaLoaded				= false;
			$scope.attributeDefsLoaded			= false;
			$scope.attributeDataTypes 			= null;
			$scope.attributeInputTypes 			= null;
			$scope.attributeInputByDataType 	= null;
			$scope.inAttrEvent 					= false;
			$scope.attr 						= null;
			$scope.attribute 					= {};
			$scope.models 						= {
				selected						: null,
				origIndex 						: -1,
				sourceList 						: null,
				lists 							: {
					persona 					: [],
					attrdefs 					: []
				}
			};
			$scope.sortableOptions 				= {
				connectWith 					: '.connector'
			};

			$scope.getRequestedAttributes();
			$scope.getAttributeDefinitions();
			$scope.getAttributeInputTypes();
			$scope.getAttributeDataTypes();
			$scope.initCustomAttr();
    	};

		$scope.dataLoaded = function() {
			return $scope.personaLoaded && $scope.attributeDefsLoaded && $scope.attributeDataTypes != null && $scope.attributeInputTypes != null && $scope.attributeInputByDataType != null;
		};

		$scope.initCustomAttr = function() {
			$scope.attribute = {
				field_label: '',
				field_name: '',
				category: 'custom',
				data_type: 'str',
				input_type: 'text',
				rp_uuid: $scope.rpId
			};
		};
		
		$scope.addAttributeClick = function() {
			$state.go('UserInputAllowCancelModal.addCustomAttribute').then(function() { $scope.initCustomAttr(); });
		};
		
		$scope.saveCustomAttribute = function(attribute) {
			$scope.attributeDefService.add(null, attribute, 
				function(data) {
					$scope.itemGrabEvent(data, $scope.models.lists.attrdefs.length, 'attrdefs');
					$scope.models.lists.persona.push(data);
					$state.go('Default');
					alert('Item added successfully');
				},
				function(error) {
					alert(error.data.user_message);
				}
			);
		};
		
		$scope.getRequestedAttributes = function() {
			$scope.relyingPartyPersonaService.get({'fieldName': ''},
				function(data) {
					$scope.models.lists.persona = angular.fromJson(angular.toJson(data)); // make everything "Object" for equality checking
					$scope.createPersonaTemplateModelWatch();
					$scope.personaLoaded = true;
				},
				function(error) {
					alert('Unable to load requested attributes: ' + error.data.user_message);
				}
			);
		};
		
		$scope.getAttributeDefinitions = function() {
			$scope.attributeDefService.get({'rpUuid': $scope.rpId, 'get_zentry': true, 'template_filter': true},
				function(data) {
					$scope.models.lists.attrdefs = data;
					$scope.attributeDefsLoaded = true;
				},
				function(error) {
					alert('Unable to load attribute definitions: ' + error.data.user_message);
				}
			);
		};
		
		$scope.comparePropsBySort = function(a, b) {
			if (a.sort < b.sort) {
				return -1;
			}
			if (a.sort > b.sort) {
				return 1;
			}
			return 0;
		};
		
		$scope.getAttributeDataTypes = function() {
			(new Property()).get({'property': 'ATTRIBUTE_DATA_TYPES'},
				function(data) {
					$scope.attributeDataTypes = [];
					for (var entry in data.value) {
						$scope.attributeDataTypes.push(data.value[entry]);
					}
					$scope.attributeDataTypes.sort($scope.comparePropsBySort);
				},
				function(error) {
					alert('Unable to load attribute data types');
				}
			);
		};
		
		$scope.getAttributeInputTypes = function() {
			(new Property()).get({'property': 'ATTRIBUTE_INPUT_TYPES'},
				function(data) {
					$scope.attributeInputTypes = [];
					for (var entry in data.value) {
						$scope.attributeInputTypes.push(data.value[entry]);
					}
					$scope.attributeInputTypes.sort($scope.comparePropsBySort);
					$scope.getAttributeInputByDataType();
				},
				function(error) {
					alert('Unable to load attribute input types');
				}
			);
		};
		
		$scope.getAttributeInputByDataType = function() {
			(new Property()).get({'property': 'ATTRIBUTE_INPUT_TYPE_BY_DATA_TYPE'},
				function(data) {
					$scope.attributeInputByDataType = {};
					$scope.attributeInputByDataTypeMap = data.value;
					for (var dataType in data.value) {
						var typeList = data.value[dataType];
						var selectOptions = [];
						for (var i = 0; i < $scope.attributeInputTypes.length; i++) {
							if (typeList.indexOf($scope.attributeInputTypes[i].value) >= 0) {
								selectOptions.push($scope.attributeInputTypes[i]);
							}
						}
						$scope.attributeInputByDataType[dataType] = selectOptions;
					}
				},
				function(error) {
					alert('Unable to load attribute input by type data');
				}
			);
		};
		
		$scope.attrChange = function(element) {
			$scope.inAttrEvent = true;
			$scope.attr = element.item;
		};

		$scope.attrChangeReset = function() {
			$scope.inAttrEvent = false;
			$scope.attr = null;
			$scope.itemGrabReset();
		};
		
		$scope.itemGrabEvent = function(item, origIndex, list) {
			$scope.models.selected = item;
			$scope.models.origIndex = origIndex;
			$scope.models.sourceList = list;
		};

		$scope.itemGrabReset = function() {
			$scope.models.selected = null;
			$scope.models.origIndex = -1;
			$scope.models.sourceList = null;
		};
		
		$scope.generateFieldName = function() {
			if ($scope.attribute.field_name == '' || $scope.attribute.field_name == null) {
				var fieldName = $scope.attribute.field_label.toLowerCase();
				fieldName = fieldName.replace(/( |-)/g, '_');
				fieldName = fieldName.replace(/('|")/g, '');
				fieldName = fieldName.replace(/&/g, '');
				fieldName = fieldName.replace(/[_]+/g, '_');
				$scope.attribute.field_name = fieldName;
			}
		};
		
		$scope.validateFieldLabel = function() {
			var patt = /[^a-zA-Z0-9_]/;
			var fieldName = $scope.attribute.field_name;
			if (patt.test(fieldName)) {
				alert('Invalid characters in field name.\n The only allowed characters are a-z, A-Z, 0-9 and _');
			}
			return false;
		};
		
		$scope.setInputOptions = function(element) {
			var lSelItem = $scope.models.selected;
			var lOrigIndex = $scope.models.origIndex;
			var lSourceList = $scope.models.sourceList;
			$scope.itemGrabReset(); // to keep model changed event from firing 2x
			
			var inputList = $scope.attributeInputByDataTypeMap[lSelItem.data_type];
			if (inputList.indexOf(lSelItem.input_type) == -1) {
				lSelItem.input_type = inputList[0];
			}
			$scope.itemGrabEvent(lSelItem, lOrigIndex, lSourceList);
		};
		
		$scope.setNewAttrInputOptions = function() {
			var inputList = $scope.attributeInputByDataTypeMap[$scope.attribute.data_type];
			if (inputList.indexOf($scope.attribute.input_type) == -1) {
				$scope.attribute.input_type = inputList[0];
			}
		};
		
		$scope.createPersonaTemplateModelWatch = function() {
			$scope.$watch('models.lists.persona',
				function(newModel, oldModel) {
					if (newModel !== oldModel && $scope.personaLoaded && ($scope.inAttrEvent || $scope.models.origIndex >= 0)) {
						$scope.oldModel = oldModel;
						if ($scope.inAttrEvent) { // change to property of attribute
							$scope.relyingPartyPersonaService.update({'fieldName': $scope.attr.field_name}, $scope.attr,
								function(data) {
									$scope.attrChangeReset();
								},
								function(error) {
									alert(error.data.user_message);
									$scope.models.lists.persona = $scope.oldModel;
									$scope.attrChangeReset();
								}
							);
						}
						else if ($scope.models.sourceList == 'attrdefs') { // move from defs to persona list
							var sortIndex = -1;							
							for (var i = 0; i < newModel.length && sortIndex < 0; i++) {
								if (newModel[i].field_name == $scope.models.selected.field_name) {
									sortIndex = i;
								}
							}
							
							var postData = angular.fromJson(angular.toJson($scope.models.selected)); // to kill pointer to avoid getting watch called 2x
							postData.sort_order = sortIndex + 1;
							postData.hidden = false;
							postData.user_provided = false;
							postData.required = false;
							$scope.relyingPartyPersonaService.add(null, postData,
								function(data) {
									$scope.itemGrabReset();
								},
								function(error) {
									alert(error.data.user_message);
									$scope.models.lists.attrdefs.splice($scope.models.origIndex, 0, $scope.models.selected);
									$scope.models.selected = null;
									$scope.itemGrabReset(); // needs to be done before resetting model to avoid duplicate call
									$scope.models.lists.persona = $scope.oldModel;
								}
							);
						}
						else if (newModel.length < oldModel.length) { // delete
							$scope.relyingPartyPersonaService.remove({'fieldName': $scope.models.selected.field_name}, null,
								function(data) {
									$scope.itemGrabReset();
								},
								function(error) {
									alert(error.data.user_message);
									$scope.itemGrabReset();
									$scope.models.lists.persona = $scope.oldModel;
									var newIdx = -1;
									for (var i = 0; i < $scope.models.lists.attrdefs.length && newIdx < 0; i++) {
										if ($scope.models.lists.attrdefs[i].field_name == $scope.models.selected.field_name) {
											newIdx = i;
										}
									}
									$scope.models.lists.attrdefs.splice(newIdx, 1);
								}
							);
						}
						else { // change in sort order or change to attribute data/input type
							var newIdx = -1;
							for (var i = 0; i < newModel.length && newIdx < 0; i++) {
								if ($scope.models.selected.field_name == newModel[i].field_name) {
									newIdx = i;
								}
							}
							var putData = angular.fromJson(angular.toJson($scope.models.selected)); // to kill pointer to avoid getting watch called 2x
							putData.sort_order = newIdx + 1;
							
							$scope.relyingPartyPersonaService.update({'fieldName': putData.field_name}, putData,
								function(data) {
									$scope.itemGrabReset();
								},
								function(error) {
									alert(error.data.user_message);
									$scope.itemGrabReset();
									$scope.models.lists.persona = $scope.oldModel;
								}
							);
						}
					}
				},
				true);
		};
		
		// $scope.addrDefsEmpty = function() {
		// 	return $scope.models.lists.attrdefs.length == 0;
		// };
		
		$scope.personaEmpty = function() {
			return $scope.models.lists.persona.length == 0;
		};
		
		$scope.init(); 
	}
]);