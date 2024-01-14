/* @file FenrirScan updater
 * @arg 0 {string} - Specify the method to execute. "add" | "addsub" | "del" | "update" | "remove"
 */

import {info, useLanguage} from '@ppmdev/modules/data.ts';
import fso from '@ppmdev/modules/filesystem.ts';
import {entryAttribute} from '@ppmdev/modules/meta.ts';
import {isError} from '@ppmdev/modules/guard.ts';
import {readLines, writeLines} from '@ppmdev/modules/io.ts';
// import debug from '@ppmdev/modules/debug.ts';

type Args = 'add' | 'addsub' | 'remove';

const FILE_ENCODE = 'sjis';
const FILE_LINEFEED = info.nlcode;
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
  if (!fso.FileExists(paths.scanRule)) {
    PPx.Echo(`ScanRule.ini ${lang.notExists}`);
    return;
  }

  const [error, fpath] = readLines({path: actualPath(paths.fpath), enc: FILE_ENCODE});

  if (isError(error, fpath)) {
    PPx.Echo(`PPXFPATH.TXT ${lang.notExists}`);
    return;
  }

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
  writeLines({path: paths.upath, data: fpath.lines, enc: FILE_ENCODE, append: true, linefeed: FILE_LINEFEED});
  PPx.Execute('*completelist -reload');
  PPx.linemessage(lang.update);
};

const lang = {
  en: {
    notExists: 'does not exist',
    update: 'Update PPXUPATH.TXT'
  },
  jp: {
    notExists: 'がありません',
    update: 'PPXUPATH.TXT を更新しました'
  }
}[useLanguage()];

const actualPath = (path: string): string => {
  const fs = fso.GetFile(path);

  return entryAttribute.alias & fs.Attributes ? PPx.Extract(`%*linkedpath(${path})`) : path;
};

const updateRules = (proc: Args): string | void => {
  const [error, data] = readLines({path: actualPath(paths.scanRule), enc: FILE_ENCODE});

  if (isError(error, data)) {
    return data;
  }

  const regPath = PPx.Extract('%*extract("%*edittext()")').toLowerCase();
  const rgx = new RegExp(`^(\\*|\\+|\\-)${regPath.replace(/\\/g, '\\\\')}(,\\\\)?`);
  const rules = data.lines;

  for (let i = rules.length; i >= 0; i--) {
    if (rgx.test(rules[i])) {
      rules.splice(i, 1);
      continue;
    }
  }

  if (proc !== 'remove') {
    const newRule = {
      'add': {pre: '+', suf: ''},
      'del': {pre: '-', suf: ''},
      'addsub': {pre: '*', suf: ',\\'}
    }[proc];
    rules.push(`${newRule.pre}${regPath}${newRule.suf}`);
  }

  writeLines({path: paths.scanRule, data: rules, enc: FILE_ENCODE, overwrite: true, linefeed: FILE_LINEFEED});
};

main();
