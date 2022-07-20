//!*script
/**
 * FenrirScan optimizer
 *
 * @version 1.0
 * @arg 0 Process. add | addsub | del | update | remove
 */

const NL_CHAR = '\r\n';
const ppx_dir = PPx.Extract('%0%\\');
const SCAN_EXE = ppx_dir + 'fenrirscan.exe';
const INI_PATH = ppx_dir + 'scanrule.ini';
const FPATH = ppx_dir + 'ppxfpath.txt';
const UPATH = ppx_dir + 'ppxupath.txt';

const quitLinemsg = (msg) => {
  PPx.SetPopLineMessage('fenrirs.js: ' + msg);
  PPx.Quit(1);
};

const fso = PPx.CreateObject('Scripting.FileSystemObject');

if (!fso.FileExists(INI_PATH)) {
  quitLinemsg('ScanRule.ini not exists.');
}

const g_process = ((arg) => {
  const len = arg.length;

  if (len < 1) {
    quitLinemsg('Not enough arguments.');
  }

  return arg.Item(0);
})(PPx.Arguments);

const proc = {};

proc['update'] = () => {
  PPx.Execute(`%Os ${SCAN_EXE}`);
  const fpath = fso.OpenTextFile(FPATH, 1, -2).readAll().split(NL_CHAR);
  const appendWrite = fso.GetFile(UPATH).OpenAsTextStream(8, -2);

  for (let i = 1, l = fpath.length - 1; i < l; i++) {
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

const send_path = PPx.Extract('%*name(DC,"%*edittext()")').toLowerCase();

if (!fso.FolderExists(send_path)) {
  quitLinemsg(`[ ${send_path} ] is not exists.`);
}

proc['addsub'] = () => create(`*${send_path},\\`);

proc['add'] = () => create('+' + send_path);

proc['del'] = () => create('-' + send_path);

proc['remove'] = () => {
  const reg = new RegExp('^(\\*|\\+|\\-)' + send_path.replace(/\\/g, '\\\\') + '(,\\\\)?');

  return (rule) => {
    if (reg.test(rule)) {
      return;
    }

    new_lines.push(rule);
  };
};

const create = (newrule) => {
  append_flag = true;
  append_line = newrule;

  return (rule) => {
    if (rule === newrule) {
      dup_count++;
      return dup_count === 1 ? new_lines.push(rule) : null;
    }

    new_lines.push(rule);
  };
};

/* main loop */
const new_lines = [];
let dup_count = 0;
let append_flag = false;
let append_line;
const main = proc[g_process]();
const rules = fso.OpenTextFile(INI_PATH, 1, -2).readAll().split(NL_CHAR);

(() => {
  for (let i = 0, l = rules.length; i < l; i++) {
    const thisRule = rules[i];

    if (thisRule.length === 0) {
      continue;
    }

    main(rules[i].toLowerCase());
  }

  if (append_flag && dup_count === 0) {
    new_lines.splice(0, 0, append_line);
  }
})();

const overWrite = fso.OpenTextFile(INI_PATH, 2, -2);

for (let i = 0, l = new_lines.length; i < l; i++) {
  overWrite.WriteLine(new_lines[i]);
}

overWrite.Close();
