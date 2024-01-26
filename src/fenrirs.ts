/* @file FenrirScan updater
 * @arg 0 {string} - Specify the method to execute. "add" | "addsub" | "del" | "update" | "remove"
 */

import {info, useLanguage} from '@ppmdev/modules/data.ts';
import fso from '@ppmdev/modules/filesystem.ts';
import {entryAttribute} from '@ppmdev/modules/meta.ts';
import {isError} from '@ppmdev/modules/guard.ts';
import {readLines, writeLines} from '@ppmdev/modules/io.ts';
import {langFenrirs} from './mod/language.ts';

type Args = 'add' | 'addsub' | 'del' | 'remove';

const FILE_ENCODE = 'sjis';
const FILE_LINEFEED = info.nlcode;
const lang = langFenrirs[useLanguage()];

const paths = (() => {
  const ppxDir = PPx.Extract('%0%\\');

  return {
    scanExe: `${ppxDir}fenrirScan.exe`,
    scanRule: `${ppxDir}ScanRule.ini`,
    fpath: `${ppxDir}PPXFPATH.TXT`,
    upath: `${ppxDir}PPXUPATH.TXT`
  };
})();

const main = (): void => {
  !fso.FileExists(paths.scanRule) && PPx.Execute(`*makefile ${paths.scanRule}`);

  const [error, fpath] = readLines({path: actualPath(paths.fpath), enc: FILE_ENCODE});

  if (isError(error, fpath)) {
    PPx.Echo(`PPXFPATH.TXT ${lang.notExists}`);
    return;
  }

  fpath.lines.shift();
  fpath.lines.pop();
  const arg = PPx.Arguments.length > 0 ? PPx.Arguments.Item(0) : 'update';

  if (arg !== 'update') {
    const errorMsg = updateRules(arg as Args);

    if (errorMsg) {
      PPx.Echo(errorMsg);
      return;
    }
  }

  PPx.Execute(`%Os ${paths.scanExe}`);
  writeLines({
    path: actualPath(paths.upath),
    data: fpath.lines,
    enc: FILE_ENCODE,
    append: true,
    linefeed: FILE_LINEFEED
  });
  PPx.Execute('*completelist -reload');
  PPx.linemessage(lang.update);
};

const actualPath = (path: string): string => {
  const fs = fso.GetFile(path);

  return entryAttribute.alias & fs.Attributes ? PPx.Extract(`%*linkedpath(${path})`) : path;
};

const updateRules = (proc: Args): string | void => {
  const regPath = PPx.Extract('%*extract("%*edittext()")');
  const newRule = {
    'add': {pre: '+', suf: '', rgx: '\\+'},
    'del': {pre: '-', suf: '', rgx: '\\-'},
    'addsub': {pre: '*', suf: ',\\', rgx: '\\*'},
    'remove': {pre: '', suf: '', rgx: '(\\*|\\+|\\-)'}
  }[proc];
  const rgx = new RegExp(`^${newRule.rgx}${regPath.replace(/\\/g, '\\\\')}(,\\\\)?$`, 'i');
  const [_, data] = readLines({path: actualPath(paths.scanRule), enc: FILE_ENCODE});
  const rules = typeof data === 'string' ? [] : data.lines;

  for (let i = rules.length; i >= 0; i--) {
    if (rgx.test(rules[i])) {
      rules.splice(i, 1);
      continue;
    }
  }

  if (proc !== 'remove') {
    rules.push(`${newRule.pre}${regPath}${newRule.suf}`);
  }

  writeLines({path: paths.scanRule, data: rules, enc: FILE_ENCODE, overwrite: true, linefeed: FILE_LINEFEED});
};

main();
