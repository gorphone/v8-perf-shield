'use strict';

var path = require('path');
var os = require('os');
var profiler = require('v8-profiler');
var usage = require('usage');
var writefile = require('writefile');
var objectAssign = require('object-assign');
var log4js = require('log4js');
var logger = log4js.getLogger();
var pid = process.pid;
var logsPath = process.env.V8_PERF_SHIELD_LOG_PATH || process.cwd();
var lastCpuUsage = 0;
var currentCpuUsage = 0;
var profilingPending = false;
var usageHistoryCache = [];

var takeSnapshotAndSave = function (callback) {
    var uuid = os.hostname() + Date.now();
    var snapshot = profiler.takeSnapshot();
    var saveFilePath = path.join(logsPath, uuid + '.snapshot');

    snapshot.export(function (err, result) {
        if (err) {
            return callback(err);
        }

        writefile(saveFilePath, result, function () {
            snapshot.delete();
        });
    });
};

var takeProfilerAndSave = function (callback, samplingTime) {
    var uuid = os.hostname() + Date.now();
    var profile = profiler.startProfiling(uuid, true);
    var saveFilePath = path.join(logsPath, uuid + '.cpuprofile');
    var stopProfilingAndSave = function () {
        profile = profiler.stopProfiling();
        profile.export(function (err, result) {
            if (err) {
                return callback(err);
            }

            writefile(saveFilePath, result, function () {
                profile.delete();
            });
        });
    };

    setTimeout(stopProfilingAndSave, samplingTime * 1000);
};

var emergencyAction = function () {
    logger.warn('emergencyAction done.');
};

var emergencyCondition = function (lastCpuUsage, currentCpuUsage, usageHistoryCache) {
    if (lastCpuUsage > 50 && currentCpuUsage > 50 && !profilingPending) {
        return true;
    }
};

var shieldOptions = {
    logsPath: logsPath,
    samplingTime: 60,
    flushTime: 3,
    cacheMaxLimit: 100,
    cpuUsageOptions: { keepHistory: true },
    emergencyCondition: emergencyCondition,
    emergencyAction: emergencyAction
};

var cpuUsageLook = function () {
    usage.lookup(pid, shieldOptions.cpuUsageOptions, function (err, result) {
        if (err) {
            logger.error('someError(s) occured in usage');
            return;
        }

        lastCpuUsage = currentCpuUsage;
        currentCpuUsage = result.cpu;

        if (usageHistoryCache.length > shieldOptions.cacheMaxLimit) {
            usageHistoryCache.shift();
            usageHistoryCache.push(currentCpuUsage);
        }

        if (shieldOptions.emergencyCondition(lastCpuUsage, currentCpuUsage, usageHistoryCache)) {
            profilingPending = true;
            takeSnapshotAndSave();

            if (Math.round(Math.random()) === 1) {
                shieldOptions.emergencyAction();
                profilingPending = false;
                return;
            }

            takeProfilerAndSave(function () {
                shieldOptions.emergencyAction();
                profilingPending = false;
            }, shieldOptions.samplingTime);
        }
    });
};

var perfShield = function (options) {
    objectAssign(shieldOptions, options);
    setInterval(cpuUsageLook, shieldOptions.flushTime * 1000);
};

module.exports = perfShield;
