/* @file Setup FenrirScan */

import {tmp} from '@ppmdev/modules/data.ts';
import {copyFile} from '@ppmdev/modules/filesystem.ts';
import {isEmptyStr} from '@ppmdev/modules/guard.ts';
import {expandSource} from '@ppmdev/modules/source.ts';

const ppxDir = PPx.Extract('%0');

const main = (): void => {
  const arcExist: Record<string, boolean> = JSON.parse(PPx.Extract('%*script(%sgu"ppmlib"\\exeExists.js,7za,7z)'));
  const archiver = arcExist['7za.exe'] ? '7za.exe' : arcExist['7z.exe'] ? '7z.exe' : '';

  if (isEmptyStr(archiver)) {
    return;
  }

  const exeExist = PPx.Extract('*ifmatch "o:e,a:d-","%0fenrirScan.exe"%:1');

  if (exeExist !== '1') {
    setFenrirScan(archiver);

    const iniExist = PPx.Extract('*ifmatch "o:e,a:d-","%0fenrirScan.ini"%:1');

    if (iniExist !== '1') {
      setInitialFile();
    }
  }
};

const setFenrirScan = (archiver: string): void => {
  const FILE_NAME = 'fenrir075c.zip';
  const URL = `http://hp.vector.co.jp/authors/VA026310/products/${FILE_NAME}`;
  const path = tmp().dir;
  PPx.Execute(`*cd %sgu'ppmarch'%:%Osbd curl -fsO ${URL}`);
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
