/* @file Get a list of optimized directory browsing history
 * @arg 0 {number} - Specifies the directoin. Specify 1 to forward reference
 */

import '@ppmdev/polyfills/arrayIncludes.ts';
import {safeArgs} from '@ppmdev/modules/argument.ts';
import {tmp, uniqID} from '@ppmdev/modules/data.ts';
import debug from '@ppmdev/modules/debug.ts';
import {isEmptyStr} from '@ppmdev/modules/guard.ts';
import {writeLines} from '@ppmdev/modules/io.ts';

const main = (): void => {
  const [dirSpec, keys] = safeArgs('0', '1234567890');
  const menuName = uniqID.tempMenu;
  const menuPath = tmp().file;
  const key = keys.split('');
  const focusKey = key[0];
  const histories: string[] = [];
  const data = [`${menuName}\t= {`];
  const idx = getDirection(dirSpec);

  do {
    const dirPath = PPx.Extract(`%*dirhistory(${idx()})`);

    if (isEmptyStr(dirPath)) {
      break;
    }

    if (!histories.includes(dirPath)) {
      const subid = getSubid(key.splice(0, 1), dirPath);
      data.push(`${subid}\t= ${dirPath}`);
      histories.push(dirPath);
    }
  } while (true);

  data.push('}');
  writeLines({path: menuPath, data, overwrite: true});
  PPx.Execute(`*setcust @${menuPath}`);
  const path = PPx.Extract(`%*menu(${menuName},${focusKey})`);

  if (!isEmptyStr(path)) {
    PPx.Execute(`*jumppath ${path}`);
  }

  PPx.Execute(`*deletecust "${menuName}"%:%K"@LOADCUST"`);
};

const getDirection = (dirSpec: string): (() => number) => {
  const isForward = dirSpec === '1';
  let i = isForward ? -1 : 0;

  return isForward ? () => i-- : () => i++;
};

const getSubid = (key: string[], dirPath: string): string => {
  const subid = _getShortenSubid(dirPath);

  return key[0] ? `&${key[0]} ${subid}` : `   ${subid}`;
};

const _getShortenSubid = (dirPath: string): string => {
  if (dirPath === ':') {
    return '<Drives>';
  }

  const directories = dirPath.split('\\');
  const tailDir = directories.splice(directories.length - 1, 1)[0];
  let i = 1;

  while (dirPath.length > 37) {
    if (!directories[i]) {
      break;
    }

    directories[i] = directories[i].slice(0, 1);
    dirPath = `${directories.join('\\')}\\${tailDir}`
    i++
  }

  return dirPath;
};

main();
