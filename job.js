module.exports.Employer = class Employer {
    constructor(){
        this.jobs = [];
        this.working = false;
    }

    assignJob(job){
        this.jobs.push(job);
    }

    start(){
        this.working = true;
    }

    stop(){
        this.working = false;
    }
}

class Job {
    constructor(startTime, endTime, every, hit){
        this.startTime = startTime; // When in the day to start - 0 for no stop
        this.endTime = endTime; // When in the day to end - 0 for no stop
        // If both above = 0 then no start/end times

        this.every = every; // Call every x seconds

        // Get time to call the function
        let timeTo = Date.now();

        // Functions
        this.hit = hit; // the function to execute 

        // Schedule
        this.timeout = setInterval(() => {

        }, timeTo);
    }
}

module.exports.initTimers = function(scrapables){
    let employer = new Employer();

    scrapables.forEach((element) => {
        const every = element.every || 3600;
        
    });
}