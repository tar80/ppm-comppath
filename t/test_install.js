//!*script
/**
 * test install.js
 *
 */

var fso = PPx.CreateObject('Scripting.FileSystemObject');
var wd = fso.getFile(PPx.ScriptName).ParentFolder;
var pwd = wd.ParentFolder;

var result = PPx.Extract('%*script(' + pwd + '\\install.js,1)');
if (result === 'error') {
  PPx.Quit(-1);
}

if (result === '') {
  PPx.Echo('The installation will be successful.');
} else {
  PPx.Echo('The installation will Failed. Cause of abort:\n' + result);
}
