//!*script
// deno-lint-ignore-file no-var
/**
 * FenrirScan optimizer
 *
 * @version 1.0
 * @arg 0 Process. add | addsub | del | update | remove
 */

var NL_CHAR = '\r\n';
var ppx_dir = PPx.Extract('%0%\\');
var SCAN_EXE = ppx_dir + 'fenrirscan.exe';
var INI_PATH = ppx_dir + 'scanrule.ini';
var FPATH = ppx_dir + 'ppxfpath.txt';
var UPATH = ppx_dir + 'ppxupath.txt';

var quitLinemsg = function (msg) {
  PPx.SetPopLineMessage('fenrirs.js: ' + msg);
  PPx.Quit(1);
};

var fso = PPx.CreateObject('Scripting.FileSystemObject');

if (!fso.FileExists(INI_PATH)) {
  quitLinemsg('ScanRule.ini not exists.');
}

var g_process = (function (arg) {
  var len = arg.length;

  if (len < 1) {
    quitLinemsg('Not enough arguments.');
  }

  return arg.Item(0);
})(PPx.Arguments);

var proc = {};

proc['update'] = function () {
  PPx.Execute('%Os ' + SCAN_EXE);
  var fpath = fso.OpenTextFile(FPATH, 1, -2).readAll().split(NL_CHAR);
  var appendWrite = fso.GetFile(UPATH).OpenAsTextStream(8, -2);

  for (var i = 1, l = fpath.length - 1; i < l; i++) {
    appendWrite.WriteLine(fpath[i]);
  }

  appendWrite.Close();

  PPx.linemessage('Update PPXUPATH.TXT');
  PPx.Execute('*completelist -reload');
  PPx.Quit(1);
};

if (g_process === 'update') {
  proc.update();
}

var send_path = PPx.Extract('%*name(DC,"%*edittext()")').toLowerCase();

if (!fso.FolderExists(send_path)) {
  quitLinemsg('[ ' + send_path + ' ] is not exists.');
}

proc['addsub'] = function () {
  return create('*' + send_path + ',\\');
};

proc['add'] = function () {
  return create('+' + send_path);
};

proc['del'] = function () {
  return create('-' + send_path);
};

proc['remove'] = function () {
  var reg = new RegExp('^(\\*|\\+|\\-)' + send_path.replace(/\\/g, '\\\\') + '(,\\\\)?');

  return function (rule) {
    if (reg.test(rule)) {
      return;
    }

    new_lines.push(rule);
  };
};

var create = function (newrule) {
  append_flag = true;
  append_line = newrule;

  return function (rule) {
    if (rule === newrule) {
      dup_count++;
      return dup_count === 1 ? new_lines.push(rule) : null;
    }

    new_lines.push(rule);
  };
};

/* main loop */
var new_lines = [];
var dup_count = 0;
var append_flag = false;
var append_line;
var main = proc[g_process]();
var rules = fso.OpenTextFile(INI_PATH, 1, -2).readAll().split(NL_CHAR);

(function () {
  for (var i = 0, l = rules.length; i < l; i++) {
    var thisRule = rules[i];

    if (thisRule.length === 0) {
      continue;
    }

    main(rules[i].toLowerCase());
  }

  if (append_flag && dup_count === 0) {
    new_lines.splice(0, 0, append_line);
  }
})();

var overWrite = fso.OpenTextFile(INI_PATH, 2, -2);

for (var i = 0, l = new_lines.length; i < l; i++) {
  overWrite.WriteLine(new_lines[i]);
}

proc.update();
