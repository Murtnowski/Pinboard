/* =============================================================
 * jquery.pinboard.js wip v1.0.0
 * https://github.com/Murtnowski/Pinboard
 * =============================================================
 * 3-clause BSD license
 * 
 * Copyright (c) 2012, Matthew Urtnowski
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Matthew Urtnowski nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL MATTHEW URTNOWSKI OR CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * ============================================================ */

(function( $ ){
	var defaults = {
		'columngutter'		: '5px',
		'rowgutter'			: '2px',
		'columnwidth'		: '200px'
	};

	var methods = {
		init : function( options ) {
			return this.each(function(){ 
				// Create some defaults, extending them with any options that were provided
				var $this = $(this),
					settings = $.extend(defaults, options);
				
				$this.data('pinboard', {
					'settings'		: settings
				});
				
				$(window).on('resize.pinboard', function() {
					methods.redraw.apply( $this );
				});
				
				methods.redraw.apply( $this );

				//$this.on('resize', function() {
				//	methods.draw.apply( $this );
				//}/);
			});
		},
		destroy : function () {
			return this.each(function() {
				$(window).off('.pinboard');
			});
		},
		redraw : function( ) {
			return this.each(function(){ 
				var $this = $(this),
					data = $this.data('pinboard'),
					settings = data.settings,
					numcolumns = parseInt($this.width() / (parseInt(settings.columnwidth) + parseInt(settings.columngutter)));
					
					yPositions = new Array();
					
					if(numcolumns * (parseInt(settings.columnwidth) + parseInt(settings.columngutter)) + parseInt(settings.columnwidth) <= $this.width())
					{
						numcolumns++;
					}
					else if(numcolumns == 0)
					{
						numcolumns = 1;
					}
					
					for(var i = 0; i < numcolumns; i++)
					{
						yPositions[i] = 0;
					}
					
				
				$this.children().each(function(){
					var $this = $(this),
						shortColumn = 0;
					
					for(var i = 0; i < numcolumns; i++)
					{
						if(yPositions[shortColumn] > yPositions[i])
						{
							shortColumn = i;
						}
					}
					
					$this.css('position', 'absolute');
					$this.css('left', shortColumn * (parseInt(settings.columnwidth) + parseInt(settings.columngutter)));
					$this.css('top', yPositions[shortColumn]);
					$this.css('width', settings.columnwidth);
					
					yPositions[shortColumn] += $this.height() + parseInt(settings.rowgutter);
				});
			});
		}
	};

	$.fn.pinboard = function( method ) { 
		// Method calling logic
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jquery.Pinboard' );
		}
	};

})( window.jQuery );