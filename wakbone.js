var Wakbone = (function() {
	var wakboneObj = {}; //This is the object we will return to create our module.

	//P R I V A T E   M E T H O D S   (S T A R T).

    //P R I V A T E   M E T H O D S   (E N D).

    wakboneObj.Collection = Backbone.Collection.extend({
    	dataclass: null,
    	top: 10,
    	collectionCount: 0,
    	collectionFirst: 0,
    	collectionSent: 0,
		skip: null,
		filter: null,
		savedfilter: "$all",
		expand: null,
		orderBy: null,
		urlParams: null,

		fetch: function(options) {
            options || (options = {});
            var data = (options.data || {});
            this.skip = data.skip || null;


            if (!(this.skip)) {
            	if (data.orderBy) {
            		this.orderBy = data.orderBy;
            	} else {
            		this.orderBy = null;
            	}

            	if (data.expand) {
            		this.expand = data.expand;
            	} else {
            		this.expand = null;
            	}

            	if (data.filter) {
            		this.filter = data.filter;
            		this.savedfilter = data.filter;
            	} else {
            		this.filter = null;
            		this.savedfilter = "$all";
            	}

            	if (data.urlParams) {
            		this.urlParams = data.urlParams;
            	} else {
            		this.urlParams = null;
            	}
            } //end - (!(this.skip)).
            
            delete options.data; //delete this or Backbone will append it to the end of our url.
            options.reset = true; //Must set this for view to be able to listen when collection has changed.

            return Backbone.Collection.prototype.fetch.call(this, options);
        },

		url: function() {
			var urlString = "/rest/";

			urlString += this.dataclass;
			urlString += "/?";
			urlString += "$top=" + this.top;

			if (this.skip) {
				var skipNumber = this.collectionFirst + this.skip;
				urlString += "&";
				urlString += "$skip=" + skipNumber;
			}

			//params.
			urlString += "&";
			urlString += encodeURI("$params='[");
			if (this.urlParams) {
				var parmsString = "";
				this.urlParams.forEach(function(parm, index, paramsList) {
					if (_.isString(parm)) {
	                    parmsString += "\"" + parm + "\"";

	                } else if (_.isNumber(parm)) {
	                	parmsString += "\"" + parm + "\"";

	                } else if (_.isDate(parm)) {
	                    parmsString += "\"" + moment(parm).format() + "\""; //refactor.
	                }

	                if (index < paramsList.length -1) {
	                   parmsString += ","; 
	                }
				});

				urlString += encodeURIComponent(parmsString);
			}
			urlString += encodeURI("]'");  
			//urlString += "$params='%5B%5D'"; 


			urlString += "&";
			urlString += "$method=entityset";
			urlString += "&";
			urlString += "$timeout=300";
			

			if (this.savedfilter == "$all") {
	            urlString += "&$savedfilter='" + encodeURIComponent(this.savedfilter) + "'";
	        } else {
	            urlString += "&$savedfilter='" + encodeURIComponent(this.filter) + "'";
	            urlString += "&$filter='" + encodeURIComponent(this.filter) + "'";
	        }

	        if (this.expand) {
	        	urlString += "&$expand=" + this.expand;
	        }

	        if (this.orderBy) {
	        	urlString += "&$orderby=" + encodeURIComponent(this.orderBy + " asc");
	        }

			return urlString;
		},

		parse: function(response) {
			this.collectionCount = response.__COUNT || 0;
			this.collectionSent = response.__SENT || 0;
			this.collectionFirst = response.__FIRST || 0;

			if (response.__ENTITIES) {
				return response.__ENTITIES;
			} else {
				return response;
			}
		}, //end - parse.

		selectNext: function() {
			this.fetch({data: {skip: 10}});
		}, //end selectNext().

		selectPrev: function() {
			this.fetch({data: {skip: -10}});
		}, //end selectPrev().

		query: function(optionsObj) {
			var parms = _.rest(arguments);
			this.fetch({data: {urlParams: parms, filter: optionsObj.filter, expand: optionsObj.expand, orderBy: optionsObj.orderBy}});
		},

		all: function(optionsObj) {
			var parms = _.rest(arguments);
			this.fetch({data: {urlParams: parms, filter: "$all", expand: optionsObj.expand, orderBy: optionsObj.orderBy}});
		}

    }); //end - wakboneObj.Collection().

    wakboneObj.CollectionView = Backbone.View.extend({
    	render: function() {
            this.$el.children().remove();

            this.collection.each(function(model) {
                var rowView = new this.rowView({model: model});
                this.$el.append(rowView.render().el); 
            }, this); 
        }
    }); //end - wakboneObj.CollectionView.

return wakboneObj;   
}()); //end - Wakbone.