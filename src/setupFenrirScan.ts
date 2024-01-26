/* @file Setup FenrirScan */

import {tmp} from '@ppmdev/modules/data.ts';
import fso, {copyFile} from '@ppmdev/modules/filesystem.ts';
import {isEmptyStr} from '@ppmdev/modules/guard.ts';
import {expandSource} from '@ppmdev/modules/source.ts';

const ppxDir = PPx.Extract('%0');

const main = (): void => {
  const arcExist: Record<string, boolean> = JSON.parse(PPx.Extract('%*script(%sgu"ppmlib"\\exeExists.js,7za,7z,curl)'));
  const archiver = arcExist['7za.exe'] ? '7za.exe' : arcExist['7z.exe'] ? '7z.exe' : '';

  if (isEmptyStr(archiver)) {
    return;
  }

  const curl = arcExist['curl.exe'] ? 'curl.exe' : getCurlPath();

  if (isEmptyStr(curl)) {
    return;
  }

  if (fso.FileExists('%0fenrirScan.exe')) {
    setFenrirScan(archiver, curl);

    if (fso.FileExists('%0fenrirScan.ini')) {
      setInitialFile();
    }
  }
};

const getCurlPath = (): string => {
  const gitDir = PPx.Extract('%*getcust(S_ppm#global:git)');
  const curl32 = `${gitDir}\\mingw32\\bin\\curl.exe`;
  const curl64 = `${gitDir}\\mingw64\\bin\\curl.exe`;

  if (fso.FileExists(curl32)) {
    return curl32;
  } else if (fso.FileExists(curl64)) {
    return curl64;
  }

  return '';
};

const setFenrirScan = (archiver: string, curl: string): void => {
  const FILE_NAME = 'fenrir075c.zip';
  const URL = `http://hp.vector.co.jp/authors/VA026310/products/${FILE_NAME}`;
  const path = tmp().dir;

  PPx.Execute(`*cd %sgu'ppmarch'%:%Osbd ${curl} -fsO ${URL}`);
  PPx.Execute(`%Obds ${archiver} e -aos -o"${path}" -ir!*omake* "%sgu'ppmarch'\\${FILE_NAME}">nul`);
  PPx.Execute(`%Obds ${archiver} e -aos -o"${path}" -ir!*fenrirscan* "${path}omake.zip">nul`);
  copyFile(`${path}fenrirScan.exe`, ppxDir);
  copyFile(`${path}fenrirScan.txt`, ppxDir);
};

const setInitialFile = (): void => {
  const path = expandSource('ppm-comppath')?.path;
  path && copyFile(`${path}\\ini\\fenrirScan.ini`, ppxDir);
};

main();
