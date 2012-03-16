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
		'rendermode'		: 'wrapless',
		'columngutter'		: '15px',
		'rowgutter'			: '7px',
		'columnwidth'		: '300px',
		'alignment'			: 'center',
		'redraw'			: true,
		'onwindowscroll'	: undefined,
		'onscroll'          : undefined,
		'scrolllimit'		: '1080',
		'source'			: undefined,
		'scrollaction'		: function(board) {
								var length = 0;
								
								if(board.data('pinboard').settings.rendermode == 'wrap')
								{
									board.children('#pinboard-ui-widget-alignment-container').children('.pinboard-ui-widget-column').each(function() {
										var $this = $(this);
										
										length += $this.children().length;
									});	
								}
								else
								{
									length = board.children().length
								}
								
								jQuery.ajax({
									'url' : board.data('pinboard').settings.source,
									'dataType' : 'html',
									'type' : 'POST',
									'data' :  {
										'length' : length
									},
									'success' : function(data, textStatus, jqXHR) {
										board.append(decodeURIComponent(data));
										methods.redraw.apply( board );
									},
								});
							  }
	};

	var methods = {
		init : function( options ) {
			return this.each(function() { 
				var $this = $(this),
					settings = $.extend(defaults, options);
					
					
				if(settings.rendermode == 'wrap')
				{
					if(settings.alignment == 'left')
					{
						$this.prepend("<div id='pinboard-ui-widget-alignment-container' class='pinboard-ui-widget pinboard-ui-widget-alignment' style='margin-left: 0px; margin-right: auto;'></div>");
					}
					else if(settings.alignment == 'right')
					{
						$this.prepend("<div id='pinboard-ui-widget-alignment-container' class='pinboard-ui-widget pinboard-ui-widget-alignment' style='margin-left: auto; margin-right: 0px;'></div>");
					}
					else
					{
						$this.prepend("<div id='pinboard-ui-widget-alignment-container' class='pinboard-ui-widget pinboard-ui-widget-alignment' style='margin-left: auto; margin-right: auto;'></div>");
					}	
				}
				else
				{
					$this.css('position', 'relative');
				}

				$this.data('pinboard', {
					'settings' : settings
				});
				
				$(window).on('resize.pinboard', function() {
					if(settings.redraw && settings.rendermode == 'wrap')
					{
						var boardWidth = $this[0].clientWidth,
							numcolumns = parseInt(boardWidth / (parseInt(settings.columnwidth) + parseInt(settings.columngutter)));
							
						if(numcolumns * (parseInt(settings.columnwidth) + parseInt(settings.columngutter)) + parseInt(settings.columnwidth) <= boardWidth)
						{
							numcolumns++;
						}
						else if(numcolumns == 0)
						{
							numcolumns = 1;
						}
							
						if(numcolumns != $this.children('#pinboard-ui-widget-alignment-container').children('.pinboard-ui-widget-column').length)
						{
							methods.redraw.apply( $this );
						}
					}
					else if(settings.redraw)
					{
						methods.redraw.apply( $this );
					}
				});
				
				$(window).on('scroll.pinboard', function() {
					if(settings.onwindowscroll !== undefined)
					{
						settings.onwindowscroll( $this );
					}
					
					if(settings.source !== undefined && $this.css('overflow-y') != 'scroll' && $('body')[0].scrollHeight - $(window).scrollTop() <= parseInt(settings.scrolllimit))
					{
						settings.scrollaction($this);
					}
				});
				
				$this.on('scroll.pinboard', function() {
					if(settings.onscroll !== undefined)
					{
						settings.onscroll( $this );
					}

					if(settings.source !== undefined && $this.css('overflow-y') == 'scroll' && $this[0].scrollHeight - $this.scrollTop() <= parseInt(settings.scrolllimit))
					{
						settings.scrollaction($this);
					}
				});
				
				methods.redraw.apply( $this );
			});
		},
		destroy : function () {
			return this.each(function() {
				var $this = $(this);
				
				$this.off('.pinboard');
				$(window).off('.pinboard');
			});
		},
		redraw : function( ) {
			return this.each(function() { 
				var $this = $(this),
					settings = $this.data('pinboard').settings,
					boardWidth = $this[0].clientWidth,
					numcolumns = parseInt(boardWidth / (parseInt(settings.columnwidth) + parseInt(settings.columngutter)));
					
				yPositions = new Array(numcolumns);
					
				if(numcolumns * (parseInt(settings.columnwidth) + parseInt(settings.columngutter)) + parseInt(settings.columnwidth) <= boardWidth)
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
				
				if(settings.rendermode == 'wrap')
				{
					$this.children('#pinboard-ui-widget-alignment-container').children('.pinboard-ui-widget-column').each(function() {
						var $this = $(this);
						
						$this.replaceWith($this.html());
					});
					
					var orphanpins = $this.children('*:not(#pinboard-ui-widget-alignment-container)');
					
					orphanpins.each(function() {
						var $this = $(this);
						
						$this.parent().children('#pinboard-ui-widget-alignment-container').append($this);
					});
					
					var pins = $this.children('#pinboard-ui-widget-alignment-container').children();
					
					for(var i = 0; i < numcolumns; i++)
					{
						if(i + 1 < numcolumns)
						{
							$this.children('#pinboard-ui-widget-alignment-container').append('<div class="pinboard-ui-widget pinboard-ui-widget-column" style="float: left; margin-right: ' + settings.columngutter + '; width: ' + settings.columnwidth + '"></div>');
						}
						else
						{
							$this.children('#pinboard-ui-widget-alignment-container').append('<div class="pinboard-ui-widget pinboard-ui-widget-column" style="float: left; width: ' + settings.columnwidth + '"></div>');
						}
					}
					
					//Sort Pins
					
					pins.each(function() {
						var $this = $(this),
							shortColumn = 0;
							
						for(var i = 0; i < numcolumns; i++)
						{
							if($this.parent().children('.pinboard-ui-widget-column').eq(shortColumn).height() > $this.parent().children('.pinboard-ui-widget-column').eq(i).height())
							{
								shortColumn = i;
							}
						}
						
						$this.css('margin-bottom', settings.rowgutter);
						$this.parent().children('.pinboard-ui-widget-column').eq(shortColumn).append($this);
					});
					
					$this.children('#pinboard-ui-widget-alignment-container').children('.pinboard-ui-widget-column').children(':last-child').css('margin-bottom','');
					$this.children('#pinboard-ui-widget-alignment-container').css('width', (numcolumns * parseInt(settings.columnwidth) + (numcolumns - 1) * parseInt(settings.columngutter)) + 'px');
				}
				else
				{
					$this.children().each(function() {
						var $this = $(this),
							shortColumn = 0;

						for(var i = 0; i < numcolumns; i++)
						{
							if(yPositions[shortColumn] > yPositions[i])
							{
								shortColumn = i;
							}
						}
						
						var offset = 0;
						
						if(settings.alignment == 'left')
						{
							offset = 0;
						}
						else if(settings.alignment == 'right')
						{
							offset = boardWidth - (numcolumns * parseInt(settings.columnwidth) + (numcolumns - 1) * parseInt(settings.columngutter));
						}
						else
						{
							offset = Math.round((boardWidth - (numcolumns * parseInt(settings.columnwidth) + (numcolumns - 1) * parseInt(settings.columngutter))) / 2);
						}

						$this.css('position', 'absolute');
						$this.css('left', shortColumn * (parseInt(settings.columnwidth) + parseInt(settings.columngutter)) + offset);
						$this.css('top', yPositions[shortColumn]);
						$this.css('width', settings.columnwidth);

						yPositions[shortColumn] += $this.height() + parseInt(settings.rowgutter);
					});
				}
			});
		},
		scrollaction : function( ) {
			return this.each(function () {
				var $this = $(this),
					settings = $this.data('pinboard').settings;
				
				settings.scrollaction($this);
			});
		}
	};

	$.fn.pinboard = function( method ) { 
		if ( methods[method] )
		{
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		}
		else if ( typeof method === 'object' || ! method )
		{
			return methods.init.apply( this, arguments );
		} 
		else
		{
			$.error( 'Method ' +  method + ' does not exist on jquery.Pinboard' );
		}
	};
})( window.jQuery );