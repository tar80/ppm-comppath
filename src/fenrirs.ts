/* @file FenrirScan updater
 * @arg 0 {string} - Specify the method to execute. "add" | "addsub" | "del" | "update" | "remove"
 */

import {info, useLanguage} from '@ppmdev/modules/data.ts';
import fso from '@ppmdev/modules/filesystem.ts';
import {entryAttribute} from '@ppmdev/modules/meta.ts';
import {readLines, writeLines} from '@ppmdev/modules/io.ts';
import {safeArgs} from '@ppmdev/modules/argument.ts';
import {langFenrirs} from './mod/language.ts';

type Args = 'add' | 'addsub' | 'del' | 'remove';

const FILE_ENCODE = 'sjis';
const FILE_LINEFEED = info.nlcode;
const lang = langFenrirs[useLanguage()];

const PATHS = (() => {
  const ppxDir = PPx.Extract('%0%\\');

  return {
    scanExe: `${ppxDir}fenrirScan.exe`,
    scanRule: `${ppxDir}ScanRule.ini`,
    fpath: `${ppxDir}PPXFPATH.TXT`,
    upath: `${ppxDir}PPXUPATH.TXT`
  } as const;
})();

const main = (): void => {
  !fso.FileExists(PATHS.scanRule) && PPx.Execute(`*makefile ${PATHS.scanRule}`);

  const [error, fpath] = readLines({path: actualPath(PATHS.fpath), enc: FILE_ENCODE});

  if (error) {
    PPx.Echo(`PPXFPATH.TXT ${lang.notExists}`);
    return;
  }

  fpath.lines.shift();
  fpath.lines.pop();
  const [arg] = safeArgs('update');

  if (arg !== 'update') {
    if (!/^(add|addsub|del|remove)$/.test(arg)) {
      PPx.Echo(lang.wrongArgument);

      return;
    }

    const errorMsg = updateRules(arg as Args);

    if (errorMsg) {
      PPx.Echo(errorMsg);

      return;
    }
  }

  PPx.Execute(`%Os ${PATHS.scanExe}`);
  writeLines({
    path: actualPath(PATHS.upath),
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
  const [error, data] = readLines({path: actualPath(PATHS.scanRule), enc: FILE_ENCODE});

  if (error) {
    return `scanRule.txt ${lang.notExists}`;
  }

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

  writeLines({path: PATHS.scanRule, data: rules, enc: FILE_ENCODE, overwrite: true, linefeed: FILE_LINEFEED});
};

main();
