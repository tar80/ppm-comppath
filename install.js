//!*script
/**
 * ppm-comppath
 *
 * @version 1.2
 * @return Error message
 * @arg 0 If nonzero dry run
 */

var g_dryrun = PPx.Arguments.length ? PPx.Arguments.Item(0) | 0 : 0;

if (g_dryrun === 0 && PPx.Extract("%'ppm_running'") !== '1') {
  PPx.Echo('This script is executable from ppx-plugin-manager');
  PPx.Quit(-1);
}

/* Requires version */
var PPX_VERSION = 18403;
var SCRIPT_VERSION = 18;
var PPM_VERSION = 0.1;

// Requires external executables
var EXECUTABLES = [];

// Requires PPx-modules
var MODULES = [];

// CodeType permisson, 0:No restriction | 1:Not use multiByte | 2:Not use unicode
var CODETYPE_PERMISSION = 1;

// ScriptType permisson, 0:No restriction | 1:JS9(5.7) | 2:JS9(5.8) | 3:JS9(ES5) | 4:Chakra(ES6)
var SCRIPTTYPE_PERMISSION = 0;

// To copy files in the sheet directory, true | false
var COPY_FLAG = false;

var fso = PPx.CreateObject('Scripting.FileSystemObject');
var wd = fso.getFile(PPx.ScriptName).ParentFolder;
var reply = function () {
  var args = [].slice.call(arguments);
  var path = PPx.Extract('%*getcust(S_ppm#global:ppm)\\lib\\jscript\\' + this.name + '.js');

  if (!fso.FileExists(path)) {
    PPx.Result = '[Not found] ' + path + ',';
    PPx.Quit(1);
  }

  return PPx.Extract('%*script("' + path + '",' + args + ')');
};

/* Check versions */
var versions = reply.call({name: 'version'}, [
  PPX_VERSION +
    ',' +
    SCRIPT_VERSION +
    ',' +
    CODETYPE_PERMISSION +
    ',' +
    SCRIPTTYPE_PERMISSION +
    ',' +
    PPM_VERSION
]);

/* Check executables */
var exeNames = (function () {
  var result = EXECUTABLES.length > 0 ? reply.call({name: 'exe_exists'}, 2, 0, EXECUTABLES) : '';

  if (result !== '') {
    result = 'Not exist executables: ' + result + ',';
  }

  return result;
})();

/* Check modules */
var moduleNames = (function () {
  var result = MODULES.length > 0 ? reply.call({name: 'module_exists'}, 2, 0, MODULES) : '';

  if (result !== '') {
    result = 'Not exist modules: ' + result + ',';
  }

  return result;
})();

if (g_dryrun === 0 && COPY_FLAG) {
  try {
    var config_dir = PPx.Extract('%*getcust(S_ppm#global:cache)') + '\\list\\';
    fso.CopyFile(wd + '\\sheet\\*', config_dir, false);
  } catch (_err) {
    null;
  }
}

PPx.Result = versions + exeNames + moduleNames;
