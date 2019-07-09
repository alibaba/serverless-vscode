import { isPathExists } from './file';
import * as fs from 'fs';

const runtimes = ["nodejs6", "nodejs8", "python2.7", "python3", "php7.2"];
const types = ["NORMAL", "HTTP"];

export function getHandlerFileByRuntime(runtime: string): string {
  if (runtime.indexOf("nodejs") > -1) {
    return "index.js";
  }
  if (runtime.indexOf("python") > -1) {
    return "index.py";
  }
  if (runtime.indexOf("java") > -1) {
    return ""; // TODO: support java
  }
  if (runtime.indexOf("php") > -1) {
    return "index.php";
  }
  return "";
}

export function getSuffix(runtime: string): string | undefined {
  if (!runtimes.includes(runtime)) {
    return;
  }
  if (runtime.includes("nodejs")) {
    return ".js";
  }
  if (runtime.includes("python")) {
    return ".py";
  }
  if (runtime.includes("php")) {
    return ".php";
  }
  return;
}

export function createIndexFile(type: string, runtime: string, ph: string): boolean {
  if (!runtimes.includes(runtime)) {
    return false;
  }
  if (!types.includes(type)) {
    return false;
  }
  if (isPathExists(ph)) {
    return false;
  }
  if (runtime.includes("nodejs")) {
      return type === "NORMAL" ? createNodejsHelloWorldIndexFile(ph) : createNodejsHttpIndexFile(ph);
  }
  if (runtime.includes("python")) {
    return type === "NORMAL" ? createPythonHelloWorldIndexFile(ph) : createPythonHttpIndexFile(ph);
  }
  if (runtime.includes("php")) {
    return type === "NORMAL" ? createPhpHelloWorldIndexFile(ph) : createPhpHttpIndexFile(ph);
  }
  return false;
}

export function createNodejsHelloWorldIndexFile(ph: string): boolean {
  try {
    fs.writeFileSync(ph, `
'use strict';
/*
if you open the initializer feature, please implement the initializer function, as below:
module.exports.initializer = function(context, callback) {
  console.log('initializing');
  callback(null, ''); 
};
*/
module.exports.handler = function(event, context, callback) {
  console.log(new String(event));
  callback(null, 'hello world');
}
`);
    return true;
  } catch (err) {
    return false;
  }
}

export function createNodejsHttpIndexFile(ph: string): boolean {
  try {
    fs.writeFileSync(ph, `
var getRawBody = require('raw-body');
var getFormBody = require('body/form');
var body = require('body');


/*
if you open the initializer feature, please implement the initializer function, as below:
module.exports.initializer = function(context, callback) {
    console.log('initializing');
    callback(null, '');
};
*/

module.exports.handler = function(req, resp, context) {
    console.log('hello world');

    var params = {
        path: req.path,
        queries: req.queries,
        headers: req.headers,
        method : req.method,
        requestURI : req.url,
        clientIP : req.clientIP,
    }
        
    getRawBody(req, function(err, body) {
        for (var key in req.queries) {
          var value = req.queries[key];
          resp.setHeader(key, value);
        }
        params.body = body.toString();
        resp.send(JSON.stringify(params, null, '    '));
    }); 
      
    /*
    getFormBody(req, function(err, formBody) {
        for (var key in req.queries) {
          var value = req.queries[key];
          resp.setHeader(key, value);
        }
        params.body = formBody;
        console.log(formBody);
        resp.send(JSON.stringify(params));
    }); 
    */
}
`);
    return true;
  } catch (err) {
    return false;
  }
}


export function createPythonHelloWorldIndexFile(ph: string): boolean {
  try {
    fs.writeFileSync(ph, `
# -*- coding: utf-8 -*-
import logging

# if you open the initializer feature, please implement the initializer function, as below:
# def initializer(context):
#   logger = logging.getLogger()
#   logger.info('initializing')

def handler(event, context):
  logger = logging.getLogger()
  logger.info('hello world')
  return 'hello world'
`);
    return true;
  } catch(err) {
    return false;
  }
}

export function createPythonHttpIndexFile(ph: string): boolean {
  try {
    fs.writeFileSync(ph, `
# -*- coding: utf-8 -*-

import logging
HELLO_WORLD = b'Hello world!\\n'

# if you open the initializer feature, please implement the initializer function, as below:
# def initializer(context):
#    logger = logging.getLogger()  
#    logger.info('initializing')


def handler(environ, start_response):
    context = environ['fc.context']
    request_uri = environ['fc.request_uri']
    for k, v in environ.items():
      if k.startswith('HTTP_'):
        # process custom request headers
        pass
    # do something here
    status = '200 OK'
    response_headers = [('Content-type', 'text/plain')]
    start_response(status, response_headers)
    return [HELLO_WORLD]
`);
    return true;
  } catch(err) {
    return false;
  }
}

export function createPhpHelloWorldIndexFile(ph: string): boolean {
  try {
    fs.writeFileSync(ph, `
<?php

/*
if you open the initializer feature, please implement the initializer function, as below:
function initializer($context) {
  $logger = $GLOBALS['fcLogger'];
  $logger->info('initializing');
}
*/

function handler($event, $context) {
  $logger = $GLOBALS['fcLogger'];
  $logger->info('hello world');
  return 'hello world';
}
`);
    return true;
  } catch(err) {
    return false;
  }
}

export function createPhpHttpIndexFile(ph: string): boolean {
  try {
    fs.writeFileSync(ph, `
<?php
use RingCentral\Psr7\Response;

/*
if you open the initializer feature, please implement the initializer function, as below:
function initializer($context) {
    echo 'initializing' . PHP_EOL;
}
*/

function handler($request, $context): Response{
    /*
    $body       = $request->getBody()->getContents();
    $queries    = $request->getQueryParams();
    $method     = $request->getMethod();
    $headers    = $request->getHeaders();
    $path       = $request->getAttribute('path');
    $requestURI = $request->getAttribute('requestURI');
    $clientIP   = $request->getAttribute('clientIP');
    */

    return new Response(
        200,
        array(
            'custom_header1' => 'v1',
            'custom_header2' => ['v2', 'v3'],
        ),
        'hello world'
    );
}
`);
    return true;
  } catch(err) {
    return false;
  }
}