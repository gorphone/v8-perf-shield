## V8-Perf-Shild

V8应用性能守护者，当应用运行状态超过设定的警戒线后会触发救援函数，救援函数主要用于应急处理，比如自动重启进程，在救援函数中也可以获取到性能数据的历史以便输入到日志中。

### 使用方法

```
'use strict';

var perfShield = require('./index');

perfShield({
    logsPath: '', // 分析文件保存路径，默认为当前路径
    samplingTime: 60, // 采样时间，用于CPU Profile的生成
    flushTime: 3, // 检查时间，用于定期检查系统用量
    cacheMaxLimit: 100, // 最大历史缓存条数，超过则滚动
    usageOptions: { keepHistory: true },

    emergencyCondition: function (lastUsage, currentUsage, usageHistoryCache) {
        if (lastUsage.cpu > 5 && currentUsage.cpu > 5) {
            return true;
        }
    },

    emergencyAction: function (usageHistory) {
        console.log(usageHistory);
        process.exit(0);
    }
});
```