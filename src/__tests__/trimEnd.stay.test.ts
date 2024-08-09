import PPx from '@ppmdev/modules/ppx.ts';
global.PPx = Object.create(PPx);
import {splitString} from '../trimEnd.stay.ts';

describe('splitString()', function () {
  it('pass the path. the end of the string must be trimmed', () => {
    const filesystem = 'c:\\a\\b\\trim';
    expect(splitString(filesystem)).toEqual(['', '', 'c:\\a\\b\\']);
    const namespace = '#:\\a\\b\\trim'
    expect(splitString(namespace)).toEqual(['', '', '#:\\a\\b\\']);
    const uri = 'https:/domain/host/trim';
    expect(splitString(uri)).toEqual(['', '', 'https:/domain/host/']);
  });
  it('pass the command line. string after the final comma, slash, backslash, or space must be trimmed', () => {
    let cmdline = '*linemessage remain\\trim'
    expect(splitString(cmdline)).toEqual(['*linemessage ', '', 'remain\\']);
    cmdline = '*linemessage remain/trim'
    expect(splitString(cmdline)).toEqual(['*linemessage ', '', 'remain/']);
    cmdline = '*linemessage remain,trim'
    expect(splitString(cmdline)).toEqual(['*linemessage ', '', 'remain,']);
    cmdline = '*linemessage remain trim'
    expect(splitString(cmdline)).toEqual(['*linemessage ', '', 'remain ']);
  });
  it('pass the command line. string ending with a comma, slash, backslash, or space must be trimmed', () => {
    let cmdline = '*linemessage trim\\'
    expect(splitString(cmdline)).toEqual(['', '', '*linemessage ']);
    cmdline = '*linemessage trim,'
    expect(splitString(cmdline)).toEqual(['', '', '*linemessage ']);
    cmdline = '*linemessage trim/'
    expect(splitString(cmdline)).toEqual(['', '', '*linemessage ']);
    cmdline = '*linemessage trim '
    expect(splitString(cmdline)).toEqual(['', '', '*linemessage ']);
  });
  it('pass the command line. if there are consecutive characters to be trimmed at the end, only one character will be trimmed', () => {
    let cmdline = '*linemessage remain\\/, '
    expect(splitString(cmdline)).toEqual(['*linemessage ', '', 'remain\\/,']);
    cmdline = '*linemessage remain\\/,'
    expect(splitString(cmdline)).toEqual(['*linemessage ', '', 'remain\\/']);
    cmdline = '*linemessage remain\\/'
    expect(splitString(cmdline)).toEqual(['*linemessage ', '', 'remain\\']);
  });
  it('pass the command line containing double quotes. double quotes between command and parameters must be separated', () => {
    let cmdline = '*linemessage "remain\\trim"'
    expect(splitString(cmdline)).toEqual(['*linemessage ', '"', 'remain\\']);
    cmdline = '*linemessage "remain" "trim"'
    expect(splitString(cmdline)).toEqual(['*linemessage ', '"', 'remain" ']);
    cmdline = '*linemessage "trim"'
    expect(splitString(cmdline)).toEqual(['', '', '*linemessage ']);
  });
});
