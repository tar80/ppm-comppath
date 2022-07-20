//!*script
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
var divTexts = (function () {
  var text = PPx.Extract('%*edittext');
  var enc = {reg: /[",%]/g, fmt: {'"': '""', ',': '@##@', '%': '@~~@'}};
  var text_ = text.replace(enc.reg, function (chr) {
    return enc.fmt[chr];
  });
  text_ = text_.replace(/^([^\\]+\s)?(.+(?:@##@|\\))(?!$).*/, function (_p0, p1, p2) {
    return ~p2.indexOf('"') ? [p1, '"', p2.slice(1)] : [p1, '', p2];
  });

  return text_.split(',');
})();

if (typeof divTexts[2] === 'undefined') {
  // Processing string including half-width space
  // ? Cut after half-width space : Cut all;
  divTexts[0] = ~divTexts[0].indexOf(' ') ? divTexts[0].split(' ')[0] : '';
}

var dec = {reg: /@##@|@~~@/g, fmt: {'@##@': ',', '@~~@': '%%'}};

PPx.Execute(
  '*replace "' +
    divTexts.join('').replace(dec.reg, function (match) {
      return dec.fmt[match];
    }) +
    '"'
);
PPx.Execute('%k"END SPACE BS"');
