﻿var e,t={ppmName:"ppx-plugin-manager",ppmVersion:.95,language:"ja",encode:"utf16le",nlcode:"\r\n",nltype:"crlf",ppmID:"P",ppmSubID:"Q"},useLanguage=function(){var e=PPx.Extract("%*getcust(S_ppm#global:lang)");return"en"===e||"ja"===e?e:t.language},n=PPx.CreateObject("Scripting.FileSystemObject"),r={normal:0,readonly:1,hidden:2,system:4,volume:8,directory:16,archive:32,temporary:256,sparse:512,alias:1024,compressed:2048,offline:4096,noindex:8192},a={TypeToCode:{crlf:"\r\n",cr:"\r",lf:"\n"},CodeToType:{"\r\n":"crlf","\r":"cr","\n":"lf"},Ppx:{lf:"%%bl",cr:"%%br",crlf:"%%bn",unix:"%%bl",mac:"%%br",dos:"%%bn","\n":"%%bl","\r":"%%br","\r\n":"%%bn"},Ascii:{lf:"10",cr:"13",crlf:"-1",unix:"10",mac:"13",dos:"-1","\n":"10","\r":"13","\r\n":"-1"}},isEmptyStr=function(e){return""===e},expandNlCode=function(e){var t="\n",n=e.indexOf("\r");return~n&&(t="\r\n"===e.substring(n,n+2)?"\r\n":"\r"),t},isCV8=function(){return"ClearScriptV8"===PPx.ScriptEngineName},_exec=function(e,t){try{var n;return[!1,null!=(n=t())?n:""]}catch(r){return[!0,""]}finally{e.Close()}},read=function(e){var t=e.path,r=e.enc,a=void 0===r?"utf8":r;if(!n.FileExists(t))return[!0,t+" not found"];var i=n.GetFile(t);if(0===i.Size)return[!0,t+" has no data"];var u=!1,l="";if("utf8"===a){var o=PPx.CreateObject("ADODB.Stream"),s=_exec(o,(function(){return o.Open(),o.Charset="UTF-8",o.LoadFromFile(t),o.ReadText(-1)}));u=s[0],l=s[1]}else{var c="utf16le"===a?-1:0,f=i.OpenAsTextStream(1,c),p=_exec(f,(function(){return f.ReadAll()}));u=p[0],l=p[1]}return u?[!0,"Unable to read "+t]:[!1,l]},readLines=function(e){var t,n=e.path,r=e.enc,a=void 0===r?"utf8":r,i=e.linefeed,u=read({path:n,enc:a}),l=u[0],o=u[1];if(l)return[!0,o];i=null!=(t=i)?t:expandNlCode(o.slice(0,1e3));var s=o.split(i);return isEmptyStr(s[s.length-1])&&s.pop(),[!1,{lines:s,nl:i}]},writeLines=function(e){var r=e.path,i=e.data,u=e.enc,l=void 0===u?"utf8":u,o=e.append,s=void 0!==o&&o,c=e.overwrite,f=void 0!==c&&c,p=e.linefeed,d=void 0===p?t.nlcode:p;if(!f&&!s&&n.FileExists(r))return[!0,r+" already exists"];var x,P=n.GetParentFolderName(r);if(n.FolderExists(P)||PPx.Execute("*makedir "+P),"utf8"===l){if(isCV8()){var v=i.join(d),m=s?"AppendAllText":"WriteAllText";return[!1,NETAPI.System.IO.File[m](r,v)]}var g=f||s?2:1,h=PPx.CreateObject("ADODB.Stream");x=_exec(h,(function(){h.Open(),h.Charset="UTF-8",h.LineSeparator=Number(a.Ascii[d]),s?(h.LoadFromFile(r),h.Position=h.Size,h.SetEOS):h.Position=0,h.WriteText(i.join(d),1),h.SaveToFile(r,g)}))[0]}else{var T=s?8:f?2:1;n.FileExists(r)||PPx.Execute("%Osq *makefile "+r);var E="utf16le"===l?-1:0,b=n.GetFile(r).OpenAsTextStream(T,E);x=_exec(b,(function(){b.Write(i.join(d)+d)}))[0]}return x?[!0,"Could not write to "+r]:[!1,""]},validArgs=function(){for(var e=[],t=PPx.Arguments;!t.atEnd();t.moveNext())e.push(t.value);return e},safeArgs=function(){for(var e=[],t=validArgs(),n=0,r=arguments.length;n<r;n++)e.push(_valueConverter(n<0||arguments.length<=n?undefined:arguments[n],t[n]));return e},_valueConverter=function(e,t){if(null==t||""===t)return null!=e?e:undefined;switch(typeof e){case"number":var n=Number(t);return isNaN(n)?e:n;case"boolean":return null!=t&&"false"!==t&&"0"!==t;default:return t}},i={en:{notExists:"does not exist",wrongArgument:"Wrong argument",update:"Update PPXUPATH.TXT"},ja:{notExists:"がありません",wrongArgument:"引数が間違っています",update:"PPXUPATH.TXT を更新しました"}},u="sjis",l=t.nlcode,o=i[useLanguage()],s={scanExe:(e=PPx.Extract("%0%\\"))+"fenrirScan.exe",scanRule:e+"ScanRule.ini",fpath:e+"PPXFPATH.TXT",upath:e+"PPXUPATH.TXT"},main=function(){!n.FileExists(s.scanRule)&&PPx.Execute("*makefile "+s.scanRule);var e=readLines({path:actualPath(s.fpath),enc:u}),t=e[0],r=e[1];if(t)PPx.Echo("PPXFPATH.TXT "+o.notExists);else{r.lines.shift(),r.lines.pop();var a=safeArgs("update")[0];if("update"!==a){if(!/^(add|addsub|del|remove)$/.test(a))return void PPx.Echo(o.wrongArgument);var i=updateRules(a);if(i)return void PPx.Echo(i)}PPx.Execute("%Os "+s.scanExe),writeLines({path:actualPath(s.upath),data:r.lines,enc:u,append:!0,linefeed:l}),PPx.Execute("*completelist -reload"),PPx.linemessage(o.update)}},actualPath=function(e){var t=n.GetFile(e);return r.alias&t.Attributes?PPx.Extract("%*linkedpath("+e+")"):e},updateRules=function(e){var t=PPx.Extract('%*extract("%*edittext()")'),n={add:{pre:"+",suf:"",rgx:"\\+"},del:{pre:"-",suf:"",rgx:"\\-"},addsub:{pre:"*",suf:",\\",rgx:"\\*"},remove:{pre:"",suf:"",rgx:"(\\*|\\+|\\-)"}}[e],r=new RegExp("^"+n.rgx+t.replace(/\\/g,"\\\\")+"(,\\\\)?$","i"),a=readLines({path:actualPath(s.scanRule),enc:u}),i=a[0],c=a[1];if(i)return"scanRule.txt "+o.notExists;for(var f="string"==typeof c?[]:c.lines,p=f.length;p>=0;p--)r.test(f[p])&&f.splice(p,1);"remove"!==e&&f.push(""+n.pre+t+n.suf),writeLines({path:s.scanRule,data:f,enc:u,overwrite:!0,linefeed:l})};main();
