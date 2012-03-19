// JavaScript Document

var tabs,

	cs = {
		
		currentId: false,
		
		sendMessage: function(btn) {
			
			var panel		= $(btn).closest('.ui-tabs-panel'),
				text_input 	= panel.find('.input-message-textarea'),
				message 	= $(text_input).val(),
				profile_to	= ($(panel).attr('id')).replace('chat-', '');
			
			now.sendMessage(profile_to, message, function(profile_to, message) {
				
				cs.addLine(profile_to, message, "me");
				
				text_input.val("");
			});
		},
		
		addLine: function (profile_id, message, person) {
			
			$("<div/>").html(message).addClass('chat-line '+person).appendTo("#chat-"+profile_id+" .chat-messages");
		},
		
		closeChat: function(el) {
			
			var tab 		= $( el ).parent(),
				index 		= $( "li", tabs ).index( tab ),
				profileId 	= (tab.find('a').attr('href')).replace("#chat-", "");
				
			now.closeChat(profileId, function(){
				
				tabs.tabs( "remove", index );
			});
		},
		
		addChat: function(profile_id, name) {
		
			var tab_title 	= name || "Chat " + profile_id,
				panel 		= tabs.tabs( "add", "#chat-" + profile_id, tab_title );
			
			$(panel).find('.profile-data').append('<h1>'+ name +'</h1>');
		},
		
		init: function(profile_id) {
			
			var activeChat = $("#chats li.active"),
				selectedIndex = $("#chats li").index(activeChat);
			
			tabs = $( "#chats-wrapper" ).tabs({
							selected: 	selectedIndex,
							select: 	function(event, ui) {
											cs.currentId = (ui.panel.id).replace("chat-", "");
										},

							tabTemplate: "<li id='#{id}'><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close'>Remove Tab</span></li>",
							add: function( event, ui ) {
								
								$( ui.panel ).append( '<div class="chat-wrapper"><div class="chat-left"><div class="profile-data"></div></div><div class="chat-right"><div class="chat-messages"></div></div></div>' );
								tabs.tabs('select', '#' + ui.panel.id);
								
								return ui.panel;
							}
						}).addClass('ui-tabs-vertical ui-helper-clearfix');
			
			$("#chats-wrapper").removeClass("ui-corner-all").css({ border:0, height:"99%" });	
						
			$("#chats li").removeClass('ui-corner-top').addClass('ui-corner-left');
			
			$( "#chats span.ui-icon-close" ).live( "click", function() {
				
				cs.closeChat(this);
			});
			
			
		}
	}
	

	
	
$(function() {
	
	cs.init();
	
	now.addLine = function(profile_from, message, person){
		cs.addLine(profile_from, message, person);
	}
	now.addChat = function(profile_id, name) {
		cs.addChat(profile_id, name);	
	}
	
	now.ready(function() {
		
		now.setUser(profile_id);
	
		$("#send").live('click', function() {
			
			cs.sendMessage(this);
		});
		
		var textBox = $('.input-message-textarea');
		var code = null;
		textBox.keypress(function(e) {
			code= (e.keyCode ? e.keyCode : e.which);
			if (code == 13) {
				
				cs.sendMessage(this);
				
				e.preventDefault();
			}
				
		});
	});
});
