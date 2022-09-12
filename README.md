
![npm bundle size](https://img.shields.io/bundlephobia/min/shamir-nemir-krumpir?style=flat-square)
![NPM](https://img.shields.io/npm/l/shamir-nemir-krumpir?style=flat-square)

<br />
<p align="center">
  <a href="https://imgbox.com/mb3lxRKr" target="_blank"><img src="https://thumbs2.imgbox.com/9e/ad/mb3lxRKr_t.png" alt="shamir-nemir-krumpir-logo"/></a>
</p>
  <h1 align="center">shamir-nemir-krumpir</h1>

  <p align="center">
    Implementation of Shamir's Secret Sharing
    <br />
    <a href="https://github.com/hrvoje459/shamir-nemir-krumpir"><strong>Explore the documentation</strong></a>
    <br />
    <br />
    <a href="https://shamir.hrvojeneedsadomain.tk/">View the demo</a>
    ·
    <a href="https://github.com/hrvoje459/shamir-nemir-krumpir/issues">Report a bug</a>
    ·
    <a href="https://github.com/hrvoje459/shamir-nemir-krumpir/issues">Ask questions</a>
  </p>


- [About](#about)
- [Purpose](#purpose)
- [Features](#features)
- [Getting Started](#getting-started)
- [License](#license)


## About


Shamir's secret sharing is cryptographic algorithm designed for secure sharing of secrets between multiple entites. With this algorithm you can define how many shares of secret to generate and how many of those shares are required to recover secret. Algorithm is mathematically based on polynomial interpolation over finite field and is considered perfectly secure secret sharing, meaning that having access to any number of shares less than defined threshold leaks no information about the secret.

This repository contains code for algorithms implementation in vanilla javascript. 


## Purpose


This package and implementation was made as an exercise in programming and for better understanding of Shamir's secret sharing algorithm. 
<br/><br/>
<a href="https://www.vaultproject.io/" target="_blank"><img src="https://www.datocms-assets.com/2885/1620155126-brandhcvaultprimaryattributedcolorwhite.svg"/></a>
Apart from sharing secrets, Shamir's secret sharing can also be used for securing apps and services, notable example is Hashicorp Vault  which has Seal/Unseal functionality (something like a lockdown for applications which triggers when host is restarted or Vault initialises it), when Vault is in its "sealed" state it requires that threshold of key shares is provided for it to unseal, key shares are initially generated using Shamir's secret sharing algorithm. More on that in official [documentation](https://www.vaultproject.io/docs/concepts/seal).


## Features

Package has 2 features (functions):
 
 - converting secret into secret shares based on set parameters for total number of shares and threshold
	```javascript
		let secret = "secret password"
		
		// generate 5 secret shares with threshold of 3 (any 3 unique secret shares are enough to recover original secret)
		let secret_shares = shamir.share(secret, 3, 5)

		console.log(secret_shares)
		/* [
  			'3-1-252475164883435633949147032661227482573',
  			'3-2-13825082332072541419477223100430137800',
  			'3-3-305496023649819616729597760287575774328',
  			'3-4-106640888073861469489384821927359758266',
  			'3-5-97824409446075026625587622883318512208'
		] */
	```
 - recovering original secret from secret shares
 	```javascript
		// provide subset of 3 secret shares for recovery process
		let secret_shares_subset = secret_shares.slice(0,3) 

		// recover original secret
		var original_secret = shamir.recover(secret_shares_subset)

		console.log(original_secret)
		/*
		 secret password
		*/
	```

	~~Since this is unpolished implementation, secret can only be of type string and no longer than 16 characters~~
	
	Secret is still of type string, but now it can be of arbitrary length and you can use utf-8 characters (tested on Croatian diacritics) 
	
	


## Getting Started

To use this package, install it using npm:
	
```bash
	npm install shamir-nemir-krumpir
```
and require it in your Node.js application:
```javascript
	shamir = require('./shamir-nemir-krumpir.js');
```

Then you just use exported functions as described in [Features](#features)


1. There is a [demo site](https://shamir.hrvojeneedsadomain.tk/) that you can use to test out secret sharing





## License

This work [is licensed](https://github.com/hrvoje459/shamir-nemir-krumpir/blob/main/LICENSE.md) under the [MIT License](https://choosealicense.com/licenses/mit/).

