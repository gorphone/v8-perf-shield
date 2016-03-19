'use strict';

var perfShield = require('./index');

perfShield({
    cacheMaxLimit: 15,
    samplingTime: 15,
    emergencyCondition: function (lastCpuUsage, currentCpuUsage, usageHistoryCache) {
        console.log(lastCpuUsage, currentCpuUsage);

        if (lastCpuUsage > 5 && currentCpuUsage > 5) {
            return true;
        }
    },

    emergencyAction: function (usageHistory) {
        console.log(usageHistory);
        process.exit(0);
    }
});

var profiler = require('v8-profiler');

setTimeout(function () {
    profiler.startProfiling('1', true);
}, 5000);

setTimeout(function () {
    profiler.stopProfiling();
}, 15000);
