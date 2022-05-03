﻿//!*script
/**
 * Cut the word of the ending of editing string
 *
 */

'use strict';

/**
 * Separate command and path of editing string
 * NOTE:If the path is a route, separate it to command side
 *
 * @return {array}
 *  0: Substitute if the beginning of the line is a character other than the path
 *  1: Substitute if there is a character between the command and the path
 *  2: Substitute the part corresponding to the parent directory in the string
 * ]
 */
const divTexts = (() => {
  const text = PPx.Extract('%*edittext');
  const enc = {reg: /[",%]/g, fmt: {'"': '""', ',': '@##@', '%': '@~~@'}};
  let text_ = text.replace(enc.reg, (chr) => {
    return enc.fmt[chr];
  });
  text_ = text_.replace(/^([^\\]+\s)?(.+(?:@##@|\\))(?!$).*/, (_p0, p1, p2) => {
    return ~p2.indexOf('"') ? [p1, '"', p2.slice(1)] : [p1, '', p2];
  });

  return text_.split(',');
})();

if (divTexts[2] === undefined) {
  // Processing string including half-width space
  // ? Cut after half-width space : Cut all;
  divTexts[0] = ~divTexts[0].indexOf(' ') ? divTexts[0].split(' ')[0] : '';
}

const dec = {reg: /@##@|@~~@/g, fmt: {'@##@': ',', '@~~@': '%%'}};

PPx.Execute(
  '*replace "' +
    divTexts.join('').replace(dec.reg, (match) => {
      return dec.fmt[match];
    }) +
    '"'
);
PPx.Execute('%k"END SPACE BS"');
