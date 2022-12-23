/* Magic Mirror
 * Node Helper: {{MODULE_NAME}}
 *
 * By {{AUTHOR_NAME}}
 * {{LICENSE}} Licensed.
 */


var NodeHelper = require("node_helper");
var spawn = require('child_process').spawn;
var parseString = require('xml2js').parseString;
var Revision = require('./Revision.js');

module.exports = NodeHelper.create({
        start: function() {
                var self = this;
                console.log("Starting node helper for: " + this.name);
                this.started = false;
		this.stationList = [];
                //this.config = null;
        },

    	// --------------------------------------- Schedule a feed update
    	scheduleUpdate: function() {
        	var self = this;
        	this.updatetimer = setInterval(function() { // This timer is saved in uitimer so that we can cancel it
            		self.getData(self);
        	}, self.config.updateInterval);
    	},

	// Override socketNotificationReceived method.

	/* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the noitication.
	 * argument payload mixed - The payload of the notification.
	 */
        socketNotificationReceived: function(notification, payload) {
                var self = this;
                if (notification === "CONFIG" && self.started == false) {
                        self.config = payload;
                        self.sendSocketNotification("STARTED", true);
                        self.started = true;
			self.getData(self);
			self.scheduleUpdate();
                }
		if (notification === "UPDATE" && self.started == true) {
                        self.getData(self);
                }
        },

	// Example function send notification test
	sendNotificationTest: function(payload) {
		this.sendSocketNotification("{{MODULE_NAME}}-NOTIFICATION_TEST", payload);
	},
        /** Load departures for (official Trafikverket) station name. **/
	getLogs: function(self){
	  var args = ['log', '--xml'];
	  if (self.config.limit) {
	    args = args.concat(['-l' + self.config.limit]);
	  }
	  args = args.concat(['-v']);
	  if (self.config.user) {
	    args = args.concat(['--username=' + self.config.user]);
	  }
	  if (self.config.pass) {
	    args = args.concat(['--password=' + self.config.pass]);
	  }
	  if (self.config.repo) {
	    args = args.concat([self.config.repo]);
	  }

//	  console.log('svn ' +  args);

	  var child = spawn('svn', args);
	  var stdout = '';
	  var stderr = '';

	  child.stdout.on('data', function (data) {
	    stdout += data;
	  });

	  child.stderr.on('data', function (data) {
	    stderr += data;
	  });

	  child.on('close', function (code) {
	    if (code !== 0) {
	      console.log("MMM-SVN: " + stderr);
	    } else {
//	      console.log(stdout);
	      parseString(stdout, function(error, result){
	        if(error) {
	          console.log("MMM-SVN: " + stdout);
	        }
	      	else {
	          result = result.log.logentry.map(Revision.from_xml);
		  self.sendSocketNotification('NEW_LOGINFO', result); // Send feed to module
//	          console.log(result);
	        }
	      });
    	    }
  	  });
	},

        getData: function(self) {
//                var key = self.config.key;
//                var name = self.config.name;
//                console.log("MMM-SVN-getdata");
		self.getLogs(self);
        }

});
