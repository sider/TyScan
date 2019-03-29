import * as fs from 'fs';

const packageJsonPath = `${__dirname}/../../package.json`;

const packageJsonStr = fs.readFileSync(packageJsonPath).toString();

const packageJson = JSON.parse(packageJsonStr);

export const name: string = packageJson.name;

export const version: string = packageJson.version;

export const description: string = packageJson.description;
