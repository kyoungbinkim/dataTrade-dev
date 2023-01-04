// 중괄호의 의미 : 특정 오브젝트 불러온다. 중괄호 없으면 default
import server from './src/server';
import process from 'process';
import { ganacheDeploy } from './src/core/contracts/deploy';
import Config, { initConfig } from './src/core/utils/config';

Config.homePath = process.cwd() + '/';

initConfig();
ganacheDeploy(); // deploy smart contracts to ganache 
server();
