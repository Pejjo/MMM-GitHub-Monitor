Module.register('MMM-GitHub-Monitor', {
  defaults: {
    updateInterval: 1000 * 60 * 10,
    renderInterval: 1000 * 5,
    maxPullRequestTitleLength: 100,
    sort: true,
  },

  getStyles: function () {
    return [
      'MMM-GitHub-Monitor.css',
      'font-awesome.css'
    ];
  },

  start: function () {
    Log.log('Starting module: ' + this.name);
    this.initState();
    this.updateCycle();
    this.sendSocketNotification("CONFIG", this.config);
    this.logList=[];
    this.failure=undefined;
    this.loaded=false;

    setInterval(this.updateCycle, this.config.updateInterval);
    setInterval(() => this.updateDom(), this.config.renderInterval);
  },

  initState: function () {
  },

  updateCycle: async function () {
    this.ghData = [];
    await this.updateData();
    this.updateDom();
  },

  updateData: async function () {
    this.sendSocketNotification("UPDATE", this.config);
  },

  getDom: function () {
    let wrapper = document.createElement("div");
    let table = document.createElement('table');
    table.classList.add('gh-monitor');
    table.className = "small";

        this.logList.forEach(commit => {
         const pullRow = document.createElement('tr');
         const pullEntry = document.createElement('td');
//         pullEntry.style.paddingLeft = '1em';
//	 pullEntry.style.verticalAlign = 'top';
         pullEntry.innerText = `${commit.revision} ${commit.message.length}`;
//	 pullEntry.className = "align-left";
         pullRow.append(pullEntry);

         const pullAuthor = document.createElement('td');
 //        pullAuthor.style.paddingLeft = '1em';
//	 pullAuthor.style.verticalAlign = 'top';
//	 pullAuthor.className = "align-left";
         pullAuthor.innerText = `${commit.author}`;
         pullRow.append(pullAuthor);

         const pullDate = document.createElement('td');
//         pullDate.style.paddingLeft = '1em';
// 	 pullDate.style.verticalAlign = 'top';
//	 pullDate.className = "align-left";
         let date = new Date(commit.date);
	 let year=date.getFullYear().toString().substr(-2);
         let month=(date.getMonth()+1).toString().padStart(2,'0');
         let day=date.getDate().toString().padStart(2,'0');
         let hr=date.getHours().toString().padStart(2,'0');
         let min=date.getMinutes().toString().padStart(2,'0');
         pullDate.innerText = `${year}${month}${day} ${hr}:${min}`;
         pullRow.append(pullDate);

         const pullMessage = document.createElement('td');
//         pullMessage.style.paddingLeft = '1em';
//	 pullMessage.style.verticalAlign = 'top';
//	 pullMessage.className = "align-left";
	let msg=commit.message.replace(/(refs #\d*:?\s*-?\s*)/ig,'').split('\n')[0];
	if (msg.length > 77) {
    		msg=msg.slice(0, 77) + '...';
  	}
         pullMessage.innerText = `${msg}`;
         pullRow.append(pullMessage);
         table.append(pullRow);
        });
    wrapper.appendChild(table);
 //     }
    
    return wrapper;
  },
  socketNotificationReceived: function(notification, payload) {
//              Log.info("MMM-SVNLog got: " + notification);

                if (notification === "NEW_LOGINFO") {
//			Log.info("MMM-SVNLog Parse"+payload);
                        this.loaded = true;
                        this.failure = undefined;
                        // Handle payload
                        this.logList = payload;
//                      Log.info("Logs updated: "+ this.logList.length);
//                      console.log(logList);
//                        this.updateDom();
                }
                if (notification == "SERVICE_FAILURE") {
                        this.failure = payload;
                        Log.info("Service failure: "+ this.failure);
                        this.updateDom();
                }
    },

});
