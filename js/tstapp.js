// TradeStation TradingApp WebApp
// ======================
// This javascript library illustrates the ability to host a Web App in a TradingApp using Javascript.
// It is meant as an example that helps Web App developers access portions
// of the EasyLanguage API. With this API you can place orders, access order
// history, reference position informations and more.
// 
// Some things to keep in mind...
//
// * This examples is based on functionality available as of **TradeStation 9.1 Update 24**
// * All `_properties` or methods with underscores should be consider as private and can change over time.
// * The current implementation relies on the URL/URI to communicate via `#` hashtags and `javascript:` to and from EasyLanguage, therefore it is important to be aware of any changes to the URL/URI originating from the web page. Changing the URL can cause your web app to omit event driven data since subsequent changes to a URL will cancel each other out and only process the last change.
// * This library requires jQuery. It is recommended that you use [jQuery 1.10.2](http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js)
//
// ----------------------
var TradingApp = {	
	// `TradingApp` is a singleton object which is the namespace for the library.
	
	init: function() {
		// `init` is required and will setup your Web App with a blank order ticket and `Accounts`, `Orders`, and `Positions` information.

		// This timeout is added in order to work around a delay in receiving events in a TradingApp Web Brower window. (some events are missed)
		setTimeout(function() {  
			var _parent = TradingApp;
			
			_parent._HashtagQueue.init();
			_parent.SymbolLink.request();
			_parent.Accounts.request();
			_parent.Positions.request();			
			_parent.Orders.request();			
			_parent.Orders.Ticket.request();			
		}, 0);
	},

	SymbolLink: {
		request: function() {
			// `request` requests, asynchronously, the current list of accounts. 
			var _parent = this;

			TradingApp._call( function() { window.location.href = _parent._hashes._symbol; } );
		},

		broadcast: function(symbol) {
			// `request` requests, asynchronously, the current list of accounts. 
			var _parent = this;

			TradingApp._call( function() { window.location.href = _parent._hashes._broadcast + symbol + ";"; } );
		},

		_symbol: "",

		_hashes: {
			_broadcast: "#SC:BROADCAST=",
			_symbol: "#SC:AN=SYMBOL;"
		},	

		delegates: function() {
			//  *`delegates` provide a callback mechanism for EasyLanguage. These methods are considered private and should not be called directly.*
			var _parent = this;

			return {

				changed: function(newSymbol) {	

					_parent._symbol = newSymbol;

					setTimeout(function(){ $(TradingApp.SymbolLink).trigger("onChanged", [newSymbol]);}, null);

				},

				next: function()
				{
					TradingApp._next();
				}
			};
		}

	},

	Accounts: {
		// `Accounts` provide a list of accounts that can be accessed as either an array or a map.
		//
		// Events:
		//
		// *e.g. $(TradingApp.Accounts).bind("onUpdate", function( reason, accountID){});*
		//
		// * onUpdate(reason, accountID)
		// * onStatus(newState, oldState)
		request: function() {
			// `request` requests, asynchronously, the current list of accounts. 
			var _parent = this;

			TradingApp._call( function() { window.location.href = _parent._hashes._items; } );
		},

		items: function() {
			// `items` provides an array of accounts.
			var result = [];

			for( var accountID in this._items)
				result.push(this._items[accountID]);
			
			return result;
		},

		item: function(accountID) {	
			// `item` provides a way to lookup accounts by AccountID.
			return this._items[accountID];
		},

		// *private members*

		_items: {},

		_hashes: {
			_items: "#AP:AN=ITEMS;"
		},	

		delegates: function() {
			//  *`delegates` provide a callback mechanism for EasyLanguage. These methods are considered private and should not be called directly.*
			var _parent = this;

			return {

				add: function(accountID, accountItem) {	

					var account = _parent._items[accountID];

					if(account == null) 
						_parent._items[accountID] = accountItem;
					else 
						_parent.delegates().extend(accountID, accountItem);
				},

				extend: function(accountID, accountItem) {

					var account = _parent._items[accountID];

					if(account)
						$.extend(account, accountItem);
					else
						_parent.delegates().add(accountID, accountItem);
				},

				clear: function()
				{
					_parent._items = {};
				},

				next: function()
				{
					TradingApp._next();
				},

				update: function(reason, accountID) {
					$(TradingApp.Accounts).trigger("onUpdate", [reason, accountID]);
				},

				status: function(newState, oldState) {
					$(TradingApp.Accounts).trigger("onStatus", [newState, oldState]);
				}
			};
		}	
	},

	Orders: {
		// `Orders` provide a list of orders placed for the current day.
		//
		// Events:
		//
		// *e.g. $(TradingApp.Orders).bind("onUpdate", function( reason ){});*
		//
		// * onUpdate(reason)
		request: function() {
			// `request` requests, asynchronously, the current list of orders.
			TradingApp._call( function() { window.location.href = TradingApp.Orders._hashes._orders; } );
		},

		cancel: function(orderID){
			// `cancel` cancels the order specified by the OrderID.
			TradingApp._call( function() { window.location.href = TradingApp.Orders._hashes._cancel_order + orderID + ";"; } );
		},

		items: function() {
			// `items` provides an array of orders.
			var result = [];

			for( var orderID in this._items)
				result.push(this._items[orderID]);
			
			return result;
		},

		item: function(orderID){
			// `item` provides a way to lookup accounts by OrderID.
			return this._items[orderID];
		},		

		Ticket: {
			// `Orders.Ticket` provide an order ticket to send orders to TradeStation's order execution system.
			//
			// Events:
			//
			// *e.g. $(TradingApp.Orders.Ticket).bind("onLoad", function( ticket ){});*
			//
			// * onLoad(ticket)	
			// * OnSend(ticket)			
			ticket: {},

			request: function() {
				// `request` requests, asynchronously, the order ticket cached in the TradingApp. Changes to the ticket will be maintained until the EasyLangauge Tradingapp is reloaded.
				var _parent = this;

				TradingApp._call( function() { window.location.href = TradingApp.Orders._hashes._ticket; } );
			},

			send: function() {
				// `send` sends an order, asynchronously, based on the values specified in the order ticket.
				var _parent = this;

				TradingApp._call( function() { 
					var location = TradingApp.Orders._hashes._send_ticket + JSON.stringify(_parent.ticket) + ";";
					window.location.href = location; 
				} );
			},

			// *private members*

			delegates: function() {
				//  *`delegates` provide a callback mechanism for EasyLanguage. These methods are considered private and should not be called directly.*				
				var _parent = this;

				return {

					extend: function(ticket)
					{
						$.extend(_parent.ticket, ticket);
					},

					next: function()
					{
						TradingApp._next();
					},

					load: function() {
						$(TradingApp.Orders.Ticket).trigger("onLoad", [_parent.ticket]);
					},

					send: function() {
						$(TradingApp.Orders.Ticket).trigger("onSend", [_parent.ticket]);
					}
				};
			}			

		},

		// *private members*

		delegates: function() {
			//  *`delegates` provide a callback mechanism for EasyLanguage. These methods are considered private and should not be called directly.*
			var _parent = this;

			return {

				add: function(orderID, orderItem) {	

					_parent._items[orderID] = orderItem;
				},

				extend: function(orderID, orderItem) {

					var order = _parent._items[orderID];

					if(order)
					{
						$.extend(order, orderItem);
					}
				},

				remove: function(orderID) {

					if(_parent._items[orderID] != null)
					{
						delete _parent._items[orderID];
					}
				},

				clear: function() {

					_parent._items = {};
				},

				next: function() {

					TradingApp._next();
				},

				update: function(reason, orderID) {
					$(TradingApp.Orders).trigger("onUpdate", [reason, orderID]);
				},

				state: function(newState, oldState) {
					$(TradingApp.Orders).trigger("onState", [newState, oldState]);
				}				
			};
		},

		_items: {},

		_hashes: {
			_ticket: "#OT:AN=LOAD;",
			_send_ticket: "#OT:AN=SEND;TK=",
			_orders: "#OP:AN=LOAD;",
			_cancel_order: "#OP:AN=CANCEL;ID="
		}
	},

	Positions: {
			// `Positions` provide a list of open positions.
			//
			// Events:
			//
			// *e.g. $(TradingApp.Positions).bind("onUpdate", function( reason ){});*
			//
			// * onUpdate(reason)

		request: function() {
			// `request` requests, asynchronously, the current list of positions.
			TradingApp._call( function() { window.location.href = TradingApp.Positions._hashes._items; } );
		},

		items: function() {
			// `items` provides an array of positions by account and symbol.
			var result = [];

			for( var positionID in this._items)
				result.push(this._items[positionID]);
			
			return result;
		},

		item: function(positionID){
			// `item` provides a way to lookup position by a pseudo PositionID (account_symbol).
			return this._items[positionID];
		},		

		close: function(positionID){
			// `close` places an order to close the position.
			TradingApp._call( function() { window.location.href = TradingApp.Positions._hashes._close + positionID + ";"; } );
		},

		delegates: function() {
			//  *`delegates` provide a callback mechanism for EasyLanguage. These methods are considered private and should not be called directly.*
			var _parent = this;

			return {

				add: function(positionID, positionItem) {	

					var position = _parent._items[positionID];

					if(position == null) 
						_parent._items[positionID] = positionItem;
					else 
						_parent.delegates().extend(positionID, positionItem);
				},

				extend: function(positionID, positionItem) {

					var position = _parent._items[positionID];

					if(position)
						$.extend(position, positionItem);
					else
						_parent.delegates().add(positionID, positionItem);
				},

				remove: function(positionID) {

					if(_parent._items[positionID] != null)
					{
						delete _parent._items[positionID];
					}
				},

				clear: function()
				{
					_parent._items = {};
				},

				next: function()
				{
					TradingApp._next();
				},

				update: function(reason, positionID) {
					$(TradingApp.Positions).trigger("onUpdate", [reason, positionID]);
				}
			};
		},

		_items: {},

		_hashes: {
			_items: "#PP:AN=LOAD;",
			_close: "#PP:AN=CLOSE;ID="
		}
	},


	SymbolList : {

		request: function() {
			// `request` requests, asynchronously, the current list of positions.
			TradingApp._call( function() { window.location.href = TradingApp.SymbolList._hashes._items; } );
		},

		items: function() {
			return this._items;
		},

		item: function(id){
			// `item` provides a way to lookup position by a pseudo PositionID (account_symbol).
			return _items[id];
		},	

		delegates: function() {
			//  *`delegates` provide a callback mechanism for EasyLanguage. These methods are considered private and should not be called directly.*
			var _parent = this;

			return {

				add: function(symbollistitems) {	

					_parent._items = [];

					_parent._items = _parent._items.concat(symbollistitems);

					$(TradingApp.SymbolList).trigger("onAdd", [_parent._items]);
				},

				next: function()
				{
					TradingApp._next();
				}				
			}
		},	

		_items: [],

		_hashes: {
			_items: "#SL:AN=DISPLAY;",
		}
	},


	_HashtagQueue: {
		//  *`_HashtagQueue` is used to ensure that requests do not invalidate each other by only working one request at a time. This is temporary until we implement a native JavaScript callback to EasyLangauge.*
		_queue: [],

		add: function(fn) {
			this._queue.push(fn);
		},

		process: function() {
			var fn = null;

			if(this._queue.length > 0)
				fn = this._queue.shift();

			if(fn != null)
			{
				fn();					
			}				
		},

		next: function() {
			this.process();
		},

		init: function() {
		}
	},

	_call: function(fn) {
		this._HashtagQueue.add(fn);
		this._HashtagQueue.process();
	},

	_next: function() {
		this._HashtagQueue.next();
	}	
};

// InvokeScript delegates

//Accounts
function TradingAppAccountsDelegateAdd(accountID, accountItem){
	TradingApp.Accounts.delegates().add(accountID, JSON.parse(accountItem));
};

function TradingAppAccountsDelegateExtend(accountID, accountItem){
	TradingApp.Accounts.delegates().extend(accountID, JSON.parse(accountItem));
};

function TradingAppAccountsDelegateClear(){
	TradingApp.Accounts.delegates().clear();
};

function TradingAppAccountsDelegateNext(){
	TradingApp.Accounts.delegates().next();
};

function TradingAppAccountsDelegateUpdate(reason, accountID){
	TradingApp.Accounts.delegates().update(reason, accountID);
};

function TradingAppAccountsDelegateStatus(oldState, oldState){
	TradingApp.Accounts.delegates().status(oldState, oldState);
};

//Orders 
function TradingAppOrdersDelegateAdd(orderID, orderItem){
	TradingApp.Orders.delegates().add(orderID, JSON.parse(orderItem));
};

function TradingAppOrdersDelegateExtend(orderID, orderItem){
	TradingApp.Orders.delegates().extend(orderID, JSON.parse(orderItem));
};

function TradingAppOrdersDelegateRemove(orderID){
	TradingApp.Orders.delegates().remove(orderID);
};

function TradingAppOrdersDelegateClear(){
	TradingApp.Orders.delegates().clear();
};

function TradingAppOrdersDelegateNext(){
	TradingApp.Orders.delegates().next();
};

function TradingAppOrdersDelegateUpdate(reason, orderID){
	TradingApp.Orders.delegates().update(reason, orderID);
};

function TradingAppOrdersDelegateState(newState, oldState){
	TradingApp.Orders.delegates().status(oldState, oldState);
};

//Ticket
function TradingAppOrdersTicketDelegateExtend(ticket){
	TradingApp.Orders.Ticket.delegates().extend(JSON.parse(ticket));
};

function TradingAppOrdersTicketDelegateNext(){
	TradingApp.Orders.Ticket.delegates().next();
};

function TradingAppOrdersTicketDelegateLoad(){
	TradingApp.Orders.Ticket.delegates().load();
};

function TradingAppOrdersTicketDelegateSend(){
	TradingApp.Orders.Ticket.delegates().send();
};

//Positions
function TradingAppPositionsDelegateAdd(positionID, positionItem){
	TradingApp.Positions.delegates().add(positionID, JSON.parse(positionItem));
};

function TradingAppPositionsDelegateExtend(positionID, positionItem){
	TradingApp.Positions.delegates().extend(positionID, JSON.parse(positionItem));
};

function TradingAppPositionsDelegateRemove(positionID){
	TradingApp.Positions.delegates().remove(positionID);
};

function TradingAppPositionsDelegateClear(){
	TradingApp.Positions.delegates().clear();
};

function TradingAppPositionsDelegateNext(){
	TradingApp.Positions.delegates().next();
};

function TradingAppPositionsDelegateUpdate(reason, positionID){
	TradingApp.Positions.delegates().update(reason, positionID);
};

function TradingAppSymbolListDelegateAdd(symbollistitems){
	TradingApp.SymbolList.delegates().add(JSON.parse(symbollistitems));
};

function TradingAppSymbolListDelegateNext(){
	TradingApp.SymbolList.delegates().next();
};

function TradingAppSymbolLinkDelegateChanged(newSymbol){
	TradingApp.SymbolLink.delegates().changed(newSymbol);
};

function TradingAppSymbolLinkDelegateNext(){
	TradingApp.SymbolLink.delegates().next();
};

// The MIT License (MIT)

// Copyright (c) 2013 TradeStation Technologies, Inc.

// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

        
          