'use strict';

var perfShield = require('./index');

perfShield({
    cacheMaxLimit: 15,
    samplingTime: 15,
    emergencyCondition: function (lastUsage, currentUsage, usageHistory) {
        console.log(lastUsage, currentUsage);

        if (lastUsage.cpu > 5 && currentUsage.cpu > 5) {
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
}, 15000);

setTimeout(function () {
    profiler.stopProfiling();
}, 30000);
