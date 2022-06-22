

var crypto = require('crypto');
const { type } = require('os');
const { exit } = require('process');


//const PRIME = BigInt(10007)
const PRIME = BigInt("340282366920938463463374607431768211297"); //2 ** 128 - 159
//const PRIME = BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639747"); //2**256 - 189


const secret = BigInt('0x' + crypto.randomBytes(16).toString('hex').toString(10))
//const secret = BigInt(1234)
console.log(secret)
//console.log(typeof secret)

var my_shares = generate_secret_shares(secret, threshold = 7, shares = 10)
console.log(my_shares)

//const setic = new Set(my_shares)
//console.log(setic)

function generate_secret_shares (secret, threshold, total_shares){
	console.log("Secret: " + secret)
	console.log("Threshold: " + threshold)
	console.log("Total_shares: " + total_shares)
	if (threshold > total_shares){
		console.error("Secret would be irrecoverable")
	}
	polynomial = []
	polynomial.push(secret)
	for (let i = 1; i < threshold; i++) {
		var random_poly_coef = BigInt('0x' + crypto.randomBytes(16).toString('hex').toString(10))
		if(random_poly_coef > PRIME){
			random_poly_coef %= PRIME
		}
		polynomial.push(random_poly_coef)
	}
	/*
	polynomial.push(secret)
	polynomial.push(BigInt(8666))
	polynomial.push(BigInt(4762))
	*/
	/*polynomial.push(secret)
	polynomial.push(BigInt(2879))
	polynomial.push(BigInt(315))
	polynomial.push(BigInt(2077))*/

	console.log( polynomial)
	//console.log( polynomial.reverse())
	generated_shares = []
	for (let i = 1; i < total_shares + 1; i++) {
		//generated_shares.push([i, evaluate_polynomial_at(polynomial, BigInt(i), PRIME)])
		generated_shares.push(threshold + "-" + BigInt(i) + "-" + evaluate_polynomial_at(polynomial, BigInt(i), PRIME))
	}
	return generated_shares
}
function evaluate_polynomial_at(polynomial, x_coord, modulus = PRIME){
	/*console.log("Polinom: " + polynomial)
	console.log("Xcoord: " + x_coord)
	console.log("Modulus: " + modulus)*/

	var y_value = 0n;
	polynomial.slice().reverse().forEach((coef) => {
		y_value *= x_coord
		y_value += coef
		y_value = y_value %  modulus
	});
	return y_value 
	//return x_coord + "_" + y_value 
}

var secret_shards = my_shares.slice(0, 7)
//var secret_shards = new Set(my_shares.slice(0, 3))
//var secret_shards = new Set()
//secret_shards.add("4-1-4655")

console.log("Secret sharts: ", secret_shards)

var reconstructed_secret = recover_secret (secret_shards, PRIME)

function PI(values){
	product = BigInt(1)
	values.forEach((value) => {
		product *= value
	});
	return product //% PRIME
}

function check_shards(secret_shards){
	var threshold = ""

	if(secret_shards.size == 0){
		return "Set je prazan"
	}

	secret_shards.forEach(element => {
		console.log(element.split("-"))
		var coord = element.split("-")
		if(threshold == ""){
			threshold = coord[0]
		}else if(threshold != coord[0]){
			return "Svi shardovi nemaju isti threshold"
		}
	});

	if(secret_shards.size < threshold){
		return "Nedovoljno shardova"
	}

	console.log("Shardovi se čine oke")
	return ""
}

function recover_secret(secret_shards, modulus = PRIME){
	console.log(secret_shards)

	const shards_set = new Set(secret_shards)

	var shards_status = check_shards(shards_set)
	if(shards_status != ""){
		console.log(shards_status)
		console.log("Secret unrecoverable")
		exit(0);
	}
	//secret_shards = Array.from(shards_set)


	var x_coords = []
	var y_coords = []


	secret_shards.forEach(element => {
		var tmp = element.split("-")
		x_coords.push(BigInt(tmp[1]))
		y_coords.push(BigInt(tmp[2]))
	});

	console.log("1", x_coords)
	console.log("2", y_coords)


	console.log("Reconstructing secret go brrrr")

	lagrange_interpolate(x_coords, y_coords)
/*
	secret_shards.forEach((elem) => {var coord = elem.split("-")
		console.log("x:", coord[1]," y:", coord[2])
	})*/

	return "Secret"
}


function lagrange_interpolate(x_coords, y_coords){
	
	var numerators = []
	var denominators = []

	for (let i = 0; i < x_coords.length; i++) {
		var others = x_coords.slice()
		current = others[i]
		others.splice(i, 1)

		console.log("trenutni", current)
		console.log("ostali", others)

		var helper_array = []
		for (let index = 0; index < others.length; index++) {
			helper_array.push(BigInt(0) - others[index])
		}
		numerators.push(PI(helper_array))

		helper_array = []
		for (let index = 0; index < others.length; index++) {
			helper_array.push(current - others[index])
		}
		denominators.push(PI(helper_array))
	}
	console.log(numerators)
	console.log(denominators)

	var sum = BigInt(0);
	for (let i = 0; i < numerators.length; i++) {
		sum += finite_division(numerators[i] * y_coords[i] % PRIME, denominators[i])
	}

	console.log("Suma:", sum)

	console.log("Reducirana suma:", (sum % PRIME + PRIME) % PRIME  )

}

function finite_division(numerator, denominator){
	denominator_inverse = extended_greatest_common_divisior(denominator, PRIME)
	
	//dividing by denomintor value in finite field aritmetics means, multiplying the numerator by the denominators finite field inverse
	return numerator * denominator_inverse // % PRIME
}


//algoritam kopiran s wikipedije, no izmjenjen prema primjeru sa shamirove wikipedije, inače ne radi ispravno
function extended_greatest_common_divisior(a, b){

	let s = 0n 
	let old_s = 1n

	let old_r = a
	let r = b

	while (r != 0n){
		let quotient = (old_r / r) >> 0n

		let swap = r

		//r = old_r - quotient * swap
		r = (old_r + r) % r
		old_r = swap

		swap = s

		s = old_s - quotient * swap
		old_s = swap
	}
	
	
	console.log("a:", a)
	console.log("inverse:", old_s)
	return old_s;
}

/*function extended_greatest_common_divisior(a, b){

	let s = 0n 
	let old_s = 1n

	let r = b
	let old_r = a

	while (r != 0n){
		let quotient = (old_r / r ) >> 0n

		let swap = r

		r = old_r - quotient * swap
		//r = old_r % swap
		old_r = swap

		swap = s

		s = old_s - quotient * swap
		old_s = swap

	}
	
	//console.log("a:", a)

	//console.log("gcd:", r)
	//console.log("gcd quotients:", t, s)
	
	/*if(a < BigInt(0)){
		console.log("a je negativan:", a)
		console.log("stari ostatak s:", old_s)
		old_s *= -1n
		console.log("novi ostatak s:", old_s)

	}
	console.log("a:", a)
	console.log("inverse:", old_s)
	return old_s;
}
*/


console.log(reconstructed_secret)




function printMessage2() {
	console.log("Project initialized");
}

//printMessage2();

exports.printMessage = printMessage2;