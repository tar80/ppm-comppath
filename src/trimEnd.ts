/* @file Complete the path being edited to the upper level path */

import debug from '@ppmdev/modules/debug.ts';

const DELIM = '@##@';

const main = (): void => {
  const text = PPx.Extract('%*edittext');
  const param = splitString(text);

  // processing string including half-width space
  // cuts all characters after or after a half-width space
  if (typeof param[2] === 'undefined') {
    param[0] = ~param[0].slice(0, -1).indexOf(' ') ? param[0].split(' ')[0] : '';
  }

  const replacedText = param.join('');
  PPx.Execute(`*replace "%(${replacedText}%)"%:%k"@END"`);
};

const splitString = (v: string): string[] => {
  const rgx = /^([^/\\]+\s)?(.+(?:[,/\\ ]))(?!$).*/;
  const v_ = v.replace(rgx, (_, cmd, pwd) => {
    cmd = cmd ?? '';

    return ~pwd.indexOf('"') ? `${cmd}${DELIM}"${DELIM}${pwd.substring(1)}` : `${cmd}${DELIM}${DELIM}${pwd}`;
  });

  return v_.split(DELIM);
};

if (!debug.jestRun()) main();
// export {splitString}
