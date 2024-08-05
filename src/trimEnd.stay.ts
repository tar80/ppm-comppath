/* @file Complete the path being edited to the upper level path
 * @arg 0 {string} - Specify "1" to maintain the running state
 */

import {hasArg} from '@ppmdev/modules/argument.ts';
import {isBottom} from '@ppmdev/modules/guard.ts';
import {atActiveEvent} from '@ppmdev/modules/staymode.ts';
import debug from '@ppmdev/modules/debug.ts';

const DELIM = '@##@';

if (hasArg('1')) {
  PPx.StayMode = 2;
  atActiveEvent.hold('ppm_comppath');
}

const ppx_finally = (): void => PPx.Echo('[WARN] instance remain trimEnd.stay.js');
const ppx_resume = (): void => {
  const text = PPx.Extract('%*edittext');
  const param = splitString(text);

  // processing string including half-width space
  // cuts all characters after or after a half-width space
  if (isBottom(param[2])) {
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

if (!debug.jestRun()) ppx_resume();
// export {splitString}
