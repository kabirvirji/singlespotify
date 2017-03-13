#!/usr/bin/env node
'use strict';

if(Number(process.version.match(/^v(\d+\.\d+)/)[1]) < 7.60) {
	require('./index_not_es6.js');
}else {
	require('./index_es6.js');
}

