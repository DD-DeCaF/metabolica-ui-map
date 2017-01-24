SystemJS.config({
	paths: {
		"github:": "jspm_packages/github/",
		"npm:": "jspm_packages/npm/"
	},
	browserConfig: {
		"baseURL": "/",
		"paths": {
			"src": "./"
		}
	},
	devConfig: {
		"map": {
			"core-js": "npm:core-js@1.2.7",
			"babel-runtime": "npm:babel-runtime@5.8.38",
			"babel": "npm:babel-core@5.8.38"
		}
	},
	packages: {
		"src": {
			"defaultExtension": "js",
			"main": "./index.js"
		}
	}
});

SystemJS.config({
	packageConfigPaths: [
		"github:*/*.json",
		"npm:@*/*.json",
		"npm:*.json"
	],
	map: {
		"angular": "github:angular/bower-angular@1.5.7",
		"angular-material": "github:angular/bower-material@1.0.9",
		"angular-toastr": "github:Foxandxss/angular-toastr@2.1.1",
		"angular-ui-router": "github:angular-ui/angular-ui-router-bower@0.3.1",
		"assert": "npm:jspm-nodelibs-assert@0.2.0",
		"buffer": "npm:jspm-nodelibs-buffer@0.2.1",
		"child_process": "npm:jspm-nodelibs-child_process@0.2.0",
		"constants": "npm:jspm-nodelibs-constants@0.2.0",
		"crypto": "npm:jspm-nodelibs-crypto@0.2.0",
		"css": "github:systemjs/plugin-css@0.1.23",
		"d3": "npm:d3@3.5.17",
		"decaf-common": "github:biosustain/decaf-frontend-common@master",
		"escher": "github:nkran/escher@master",
		"events": "npm:jspm-nodelibs-events@0.2.0",
		"fs": "npm:jspm-nodelibs-fs@0.2.0",
		"http": "npm:jspm-nodelibs-http@0.2.0",
		"https": "npm:jspm-nodelibs-https@0.2.1",
		"jquery": "npm:jquery@3.1.1",
		"lodash": "npm:lodash@4.16.4",
		"os": "npm:jspm-nodelibs-os@0.2.0",
		"path": "npm:jspm-nodelibs-path@0.2.1",
		"process": "npm:jspm-nodelibs-process@0.2.0",
		"resolwe": "github:genialis/resolwe-js@0.1.0",
		"rx": "npm:rx@4.1.0",
		"stream": "npm:jspm-nodelibs-stream@0.2.0",
		"string_decoder": "npm:jspm-nodelibs-string_decoder@0.2.0",
		"url": "npm:jspm-nodelibs-url@0.2.0",
		"util": "npm:jspm-nodelibs-util@0.2.1",
		"vm": "npm:jspm-nodelibs-vm@0.2.0"
	},
	packages: {
		"github:angular/bower-material@1.0.9": {
			"map": {
				"css": "github:systemjs/plugin-css@0.1.23",
				"angular-aria": "github:angular/bower-angular-aria@1.5.7",
				"angular-animate": "github:angular/bower-angular-animate@1.5.7",
				"angular": "github:angular/bower-angular@1.5.7"
			}
		},
		"github:angular/bower-angular-aria@1.5.7": {
			"map": {
				"angular": "github:angular/bower-angular@1.5.7"
			}
		},
		"github:angular/bower-angular-animate@1.5.7": {
			"map": {
				"angular": "github:angular/bower-angular@1.5.7"
			}
		},
		"github:angular-ui/angular-ui-router-bower@0.3.1": {
			"map": {
				"angular": "github:angular/bower-angular@1.5.7"
			}
		},
		"npm:crypto-browserify@3.11.0": {
			"map": {
				"browserify-sign": "npm:browserify-sign@4.0.0",
				"diffie-hellman": "npm:diffie-hellman@5.0.2",
				"create-hmac": "npm:create-hmac@1.1.4",
				"create-hash": "npm:create-hash@1.1.2",
				"create-ecdh": "npm:create-ecdh@4.0.0",
				"randombytes": "npm:randombytes@2.0.3",
				"public-encrypt": "npm:public-encrypt@4.0.0",
				"pbkdf2": "npm:pbkdf2@3.0.9",
				"browserify-cipher": "npm:browserify-cipher@1.0.0",
				"inherits": "npm:inherits@2.0.3"
			}
		},
		"npm:buffer@4.9.1": {
			"map": {
				"isarray": "npm:isarray@1.0.0",
				"ieee754": "npm:ieee754@1.1.8",
				"base64-js": "npm:base64-js@1.2.0"
			}
		},
		"npm:create-hash@1.1.2": {
			"map": {
				"inherits": "npm:inherits@2.0.3",
				"cipher-base": "npm:cipher-base@1.0.3",
				"ripemd160": "npm:ripemd160@1.0.1",
				"sha.js": "npm:sha.js@2.4.5"
			}
		},
		"npm:create-hmac@1.1.4": {
			"map": {
				"create-hash": "npm:create-hash@1.1.2",
				"inherits": "npm:inherits@2.0.3"
			}
		},
		"npm:diffie-hellman@5.0.2": {
			"map": {
				"randombytes": "npm:randombytes@2.0.3",
				"bn.js": "npm:bn.js@4.11.6",
				"miller-rabin": "npm:miller-rabin@4.0.0"
			}
		},
		"npm:browserify-sign@4.0.0": {
			"map": {
				"create-hash": "npm:create-hash@1.1.2",
				"create-hmac": "npm:create-hmac@1.1.4",
				"inherits": "npm:inherits@2.0.3",
				"browserify-rsa": "npm:browserify-rsa@4.0.1",
				"bn.js": "npm:bn.js@4.11.6",
				"elliptic": "npm:elliptic@6.3.2",
				"parse-asn1": "npm:parse-asn1@5.0.0"
			}
		},
		"npm:pbkdf2@3.0.9": {
			"map": {
				"create-hmac": "npm:create-hmac@1.1.4"
			}
		},
		"npm:public-encrypt@4.0.0": {
			"map": {
				"create-hash": "npm:create-hash@1.1.2",
				"randombytes": "npm:randombytes@2.0.3",
				"browserify-rsa": "npm:browserify-rsa@4.0.1",
				"bn.js": "npm:bn.js@4.11.6",
				"parse-asn1": "npm:parse-asn1@5.0.0"
			}
		},
		"npm:browserify-rsa@4.0.1": {
			"map": {
				"randombytes": "npm:randombytes@2.0.3",
				"bn.js": "npm:bn.js@4.11.6"
			}
		},
		"npm:create-ecdh@4.0.0": {
			"map": {
				"bn.js": "npm:bn.js@4.11.6",
				"elliptic": "npm:elliptic@6.3.2"
			}
		},
		"npm:browserify-cipher@1.0.0": {
			"map": {
				"evp_bytestokey": "npm:evp_bytestokey@1.0.0",
				"browserify-des": "npm:browserify-des@1.0.0",
				"browserify-aes": "npm:browserify-aes@1.0.6"
			}
		},
		"npm:miller-rabin@4.0.0": {
			"map": {
				"bn.js": "npm:bn.js@4.11.6",
				"brorand": "npm:brorand@1.0.6"
			}
		},
		"npm:elliptic@6.3.2": {
			"map": {
				"bn.js": "npm:bn.js@4.11.6",
				"inherits": "npm:inherits@2.0.3",
				"brorand": "npm:brorand@1.0.6",
				"hash.js": "npm:hash.js@1.0.3"
			}
		},
		"npm:cipher-base@1.0.3": {
			"map": {
				"inherits": "npm:inherits@2.0.3"
			}
		},
		"npm:evp_bytestokey@1.0.0": {
			"map": {
				"create-hash": "npm:create-hash@1.1.2"
			}
		},
		"npm:sha.js@2.4.5": {
			"map": {
				"inherits": "npm:inherits@2.0.3"
			}
		},
		"npm:parse-asn1@5.0.0": {
			"map": {
				"create-hash": "npm:create-hash@1.1.2",
				"evp_bytestokey": "npm:evp_bytestokey@1.0.0",
				"pbkdf2": "npm:pbkdf2@3.0.9",
				"asn1.js": "npm:asn1.js@4.8.1",
				"browserify-aes": "npm:browserify-aes@1.0.6"
			}
		},
		"npm:hash.js@1.0.3": {
			"map": {
				"inherits": "npm:inherits@2.0.3"
			}
		},
		"npm:asn1.js@4.8.1": {
			"map": {
				"bn.js": "npm:bn.js@4.11.6",
				"inherits": "npm:inherits@2.0.3",
				"minimalistic-assert": "npm:minimalistic-assert@1.0.0"
			}
		},
		"npm:browserify-des@1.0.0": {
			"map": {
				"cipher-base": "npm:cipher-base@1.0.3",
				"inherits": "npm:inherits@2.0.3",
				"des.js": "npm:des.js@1.0.0"
			}
		},
		"npm:browserify-aes@1.0.6": {
			"map": {
				"cipher-base": "npm:cipher-base@1.0.3",
				"evp_bytestokey": "npm:evp_bytestokey@1.0.0",
				"inherits": "npm:inherits@2.0.3",
				"create-hash": "npm:create-hash@1.1.2",
				"buffer-xor": "npm:buffer-xor@1.0.3"
			}
		},
		"npm:des.js@1.0.0": {
			"map": {
				"inherits": "npm:inherits@2.0.3",
				"minimalistic-assert": "npm:minimalistic-assert@1.0.0"
			}
		},
		"npm:stream-browserify@2.0.1": {
			"map": {
				"inherits": "npm:inherits@2.0.3",
				"readable-stream": "npm:readable-stream@2.1.5"
			}
		},
		"npm:readable-stream@2.1.5": {
			"map": {
				"inherits": "npm:inherits@2.0.3",
				"isarray": "npm:isarray@1.0.0",
				"string_decoder": "npm:string_decoder@0.10.31",
				"core-util-is": "npm:core-util-is@1.0.2",
				"buffer-shims": "npm:buffer-shims@1.0.0",
				"process-nextick-args": "npm:process-nextick-args@1.0.7",
				"util-deprecate": "npm:util-deprecate@1.0.2"
			}
		},
		"github:nkran/escher@master": {
			"map": {
				"mousetrap": "npm:mousetrap@1.6.0",
				"underscore": "npm:underscore@1.8.3",
				"d3": "npm:d3@3.5.17",
				"baconjs": "npm:baconjs@0.7.88",
				"vkbeautify": "npm:vkbeautify@0.99.1",
				"filesaverjs": "npm:filesaverjs@0.2.2"
			}
		},
		"npm:url@0.11.0": {
			"map": {
				"querystring": "npm:querystring@0.2.0",
				"punycode": "npm:punycode@1.3.2"
			}
		},
		"npm:stream-http@2.4.0": {
			"map": {
				"xtend": "npm:xtend@4.0.1",
				"builtin-status-codes": "npm:builtin-status-codes@2.0.0",
				"to-arraybuffer": "npm:to-arraybuffer@1.0.1",
				"inherits": "npm:inherits@2.0.3",
				"readable-stream": "npm:readable-stream@2.1.5"
			}
		},
		"npm:jspm-nodelibs-crypto@0.2.0": {
			"map": {
				"crypto-browserify": "npm:crypto-browserify@3.11.0"
			}
		},
		"npm:jspm-nodelibs-http@0.2.0": {
			"map": {
				"http-browserify": "npm:stream-http@2.4.0"
			}
		},
		"npm:jspm-nodelibs-os@0.2.0": {
			"map": {
				"os-browserify": "npm:os-browserify@0.2.1"
			}
		},
		"npm:jspm-nodelibs-stream@0.2.0": {
			"map": {
				"stream-browserify": "npm:stream-browserify@2.0.1"
			}
		},
		"npm:jspm-nodelibs-string_decoder@0.2.0": {
			"map": {
				"string_decoder-browserify": "npm:string_decoder@0.10.31"
			}
		},
		"npm:jspm-nodelibs-url@0.2.0": {
			"map": {
				"url-browserify": "npm:url@0.11.0"
			}
		},
		"npm:jspm-nodelibs-buffer@0.2.1": {
			"map": {
				"buffer": "npm:buffer@4.9.1"
			}
		},
		"github:genialis/resolwe-js@0.1.0": {
			"map": {
				"lodash": "npm:lodash@3.10.1",
				"jquery": "npm:jquery@2.1.4",
				"rx": "npm:rx@4.1.0",
				"ng-file-upload": "npm:ng-file-upload@12.2.13",
				"angular-mocks": "npm:angular-mocks@1.5.5",
				"jquery.cookie": "npm:jquery.cookie@1.4.1",
				"immutable": "npm:immutable@3.8.1",
				"angular": "npm:angular@1.5.6"
			}
		}
	}
});
