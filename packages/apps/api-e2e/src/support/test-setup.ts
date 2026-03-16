/* eslint-disable */
import axios from 'axios';

import { readRuntimeMetadata } from './runtime-file';

module.exports = async function () {
  const runtimeMetadata = readRuntimeMetadata();
  const host = runtimeMetadata?.host ?? process.env.HOST ?? 'localhost';
  const port = runtimeMetadata?.port.toString() ?? process.env.PORT ?? '3000';
  axios.defaults.baseURL = `http://${host}:${port}`;
};
