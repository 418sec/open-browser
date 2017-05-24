/**
 * @file
 * @author zdying
 */
'use strict';

var fs = require('fs');
var path = require('path');
var urlParser = require('url');
var childProcess = require('child_process');

module.exports = {
  chrome: function (dataDir, url, chromePath, proxyURL, pacFileURL) {
    var proxyOption = pacFileURL
      ? '--proxy-pac-url="' + pacFileURL + '"'
      : '--proxy-server="' + proxyURL + '"';

    return [
      // '--proxy-pac-url="' + proxy + '"',
      // '--proxy-server="' + proxy + '"',
      proxyOption,
      '--user-data-dir="' + dataDir + '/chrome-cache' + '"',
      '--lang=local',
      url
    ].join(' ');
  },

  opera: function (dataDir, url, operaPath, proxyURL, pacFileURL) {
    var proxyOption = pacFileURL
      ? '--proxy-pac-url="' + pacFileURL + '"'
      : '--proxy-server="' + proxyURL + '"';

    return [
      proxyOption,
      '--user-data-dir="' + dataDir + '/opera-cache' + '"',
      '--lang=local',
      url
    ].join(' ');
  },

  safari: function (dataDir, url, safariPath, proxy) {
    return '';
  },

  firefox: function (dataDir, url, firefoxPath, proxyURL, pacFileURL) {
    // Firefox pac set
    // http://www.indexdata.com/connector-platform/enginedoc/proxy-auto.html
    // http://kb.mozillazine.org/Network.proxy.autoconfig_url
    // user_pref("network.proxy.autoconfig_url", "http://us2.indexdata.com:9005/id/cf.pac");
    // user_pref("network.proxy.type", 2);

    var dir = path.join(dataDir, 'firefox_cache');
    var prefsPath = path.join(dir, 'prefs.js');
    var prefs = [];

    if (!fs.existsSync(prefsPath)) {
      if (pacFileURL) {
        // 自动代理
        prefs = [
          'user_pref("network.proxy.autoconfig_url", "' + pacFileURL + '");',
          'user_pref("network.proxy.type", 2);'
        ];
      } else {
        // 直接代理
        var urlObj = urlParser.parse(proxyURL);
        prefs = [
          'user_pref("network.proxy.http", "' + urlObj.hostname + '");',
          'user_pref("network.proxy.http_port", ' + urlObj.port + ');',
          'user_pref("network.proxy.type", 1);'
        ];
      }

      // https://developer.mozilla.org/en-US/docs/Mozilla/Command_Line_Options
      childProcess.execSync(firefoxPath + ' -CreateProfile "firefox_hii_pref ' + dir + '"');
      fs.writeFileSync(prefsPath, prefs.join('\n'));
    }

    return [
      '-P firefox_hii_pref',
      '-no-remote',
      url
    ].join(' ');
  }
};