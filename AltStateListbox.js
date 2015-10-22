define( ["jquery", "text!./style.css", "qlik"], function ( $, cssContent, qlik ) {
	'use strict';
	$( "<style>" ).html( cssContent ).appendTo( "head" );
	return {
		initialProperties: {
			qListObjectDef: {
				qShowAlternatives: true,
				qFrequencyMode: "V",
				qInitialDataFetch: [{
					qWidth: 2,
					qHeight: 50
				}]
			}
		},
		definition: {
			type: "items",
			component: "accordion",
			items: {
				dimension: {
					type: "items",
					label: "Dimensions",
					ref: "qListObjectDef",
					min: 1,
					max: 1,
					items: {
						label: {
							type: "string",
							ref: "qListObjectDef.qDef.qFieldLabels.0",
							label: "Label",
							show: true
						},
						libraryId: {
							type: "string",
							component: "library-item",
							libraryItemType: "dimension",
							ref: "qListObjectDef.qLibraryId",
							label: "Dimension",
							show: function ( data ) {
								return data.qListObjectDef && data.qListObjectDef.qLibraryId;
							}
						},
						field: {
							type: "string",
							expression: "always",
							expressionType: "dimension",
							ref: "qListObjectDef.qDef.qFieldDefs.0",
							label: "Field",
							show: function ( data ) {
								return data.qListObjectDef && !data.qListObjectDef.qLibraryId;
							}
						},
						frequency: {
							type: "string",
							component: "dropdown",
							label: "Frequency mode",
							ref: "qListObjectDef.qFrequencyMode",
							options: [{
								value: "N",
								label: "No frequency"
							}, {
								value: "V",
								label: "Absolute value"
							}, {
								value: "P",
								label: "Percent"
							}, {
								value: "R",
								label: "Relative"
							}],
							defaultValue: "V"
						}
					}
				},
				settings: {
					uses: "settings"
				},
				customProperties : {
						component: "expandable-items",
						label: "Custom Properties",
						type : "items",
						items : {
							state : {
								ref : "qListObjectDef.qStateName",
								label : "State",
								type : "string",
								component : "dropdown",
								defaultValue : "$",		
								options: function() {
								  return qlik.currApp(this).getAppLayout().then(function (layout){
										return [{value : "$", label : "Default"}].concat(layout.qStateNames.map(function (state){
											  return {value : state, label : state}
										}));
									  });
								}
							}
						}
					}
			  }
		},
		snapshot: {
			canTakeSnapshot: true
		},
		paint: function ( $element ) {
			var self = this, html = "<ul>";
			this.backendApi.eachDataRow( function ( rownum, row ) {
				html += '<li class="data state' + row[0].qState + '" data-value="' + row[0].qElemNumber + '">' + row[0].qText;
				if ( row[0].qFrequency ) {
					html += '<span>' + row[0].qFrequency + '</span>';
				}
				html += '</li>';
			} );
			html += "</ul>";
			$element.html( html );
			if ( this.selectionsEnabled ) {
				$element.find( 'li' ).on( 'qv-activate', function () {
					if ( this.hasAttribute( "data-value" ) ) {
						var value = parseInt( this.getAttribute( "data-value" ), 10 ), dim = 0;
						self.selectValues( dim, [value], true );
						$( this ).toggleClass( "selected" );
					}
				} );
			}
		}
	};
} );
