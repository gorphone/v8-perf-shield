'use strict';

var perfShield = require('./index');

perfShield({
    cacheMaxLimit: 5,
    samplingTime: 5,
    emergencyCondition: function (lastCpuUsage, currentCpuUsage, usageHistoryCache) {
        return true;
    },

    emergencyAction: function (usageHistory) {
        console.log(usageHistory);
        process.exit(0);
    }
});

var profiler = require('v8-profiler');
var profile = profiler.startProfiling('1', true);

setTimeout(function () {
    profile = profiler.stopProfiling();
    // console.log(profile);
}, 10000);
