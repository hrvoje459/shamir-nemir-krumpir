
var crypto = require('crypto');
const { exit } = require('process');


//const PRIME = BigInt(10007)
const PRIME = BigInt("340282366920938463463374607431768211297"); //2 ** 128 - 159
//const PRIME = BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639747"); //2**256 - 189

function recover(secret_shards) {


	const shards_set = new Set(secret_shards)

	var shards_status = check_shards(shards_set)
	if (shards_status != "") {
		console.log(shards_status)
		console.log("Secret unrecoverable")
		return ""
	}
	console.log("Reconstructing secret go brrrr")
	var recovered_secret = ""

	var num_of_chunks = secret_shards[0].split("-").length - 2


	for (let i = 0; i < num_of_chunks; i++) {

		var x_coords = []
		var y_coords = []

		secret_shards.forEach(element => {
			var tmp = element.split("-")
			x_coords.push(BigInt(tmp[1]))
			y_coords.push(BigInt(tmp[i + 2]))
		});

		var recovered_chunk = recover_secret(secret_shards, x_coords, y_coords, modulus = PRIME)
		recovered_secret += recovered_chunk
	}
	console.log(recovered_secret)


}

function share(secret, threshold, total_shares) {

	secret = Buffer.from(secret, "utf-8").toString('hex')

	var split_secret = []

	for (let i = 0; i < Math.ceil(secret.length / 32); i++) {

		var begint = BigInt('0x' + secret.slice(i * 32, i * 32 + 32))
		split_secret.push(begint)

	}


	var returning_shards = []


	for (let i = 0; i < split_secret.length; i++) {
		var shards = generate_secret_shares(split_secret[i], threshold, total_shares)


		if (i == 0) {
			for (let j = 0; j < shards.length; j++) {
				returning_shards[j] = ""
			}
		}


		for (let j = 0; j < shards.length; j++) {
			returning_shards[j] += "-" + shards[j]
		}
	}
	for (let j = 0; j < returning_shards.length; j++) {
		returning_shards[j] = threshold + "-" + (j + 1) + returning_shards[j]
	}

	return returning_shards

}


function generate_secret_shares(secret, threshold, total_shares) {

	if (threshold > total_shares) {
		console.error("Secret would be irrecoverable (threshold > total number of shares)")
		return ""
	}
	polynomial = []
	polynomial.push(secret)
	for (let i = 1; i < threshold; i++) {
		var random_poly_coef = BigInt('0x' + crypto.randomBytes(16).toString('hex').toString(10))
		if (random_poly_coef > PRIME) {
			random_poly_coef %= PRIME
		}
		polynomial.push(random_poly_coef)
	}
	generated_shares = []
	for (let i = 1; i < total_shares + 1; i++) {
		//generated_shares.push(threshold + "-" + i + "-" + evaluate_polynomial_at(polynomial, BigInt(i), PRIME))
		generated_shares.push(evaluate_polynomial_at(polynomial, BigInt(i), PRIME))
	}
	return generated_shares
}
function evaluate_polynomial_at(polynomial, x_coord, modulus = PRIME) {

	var y_value = 0n;
	polynomial.slice().reverse().forEach((coef) => {
		y_value *= x_coord
		y_value += coef
		y_value = y_value % modulus
	});
	return y_value
}


function PI(values) {
	product = BigInt(1)
	values.forEach((value) => {
		product *= value
	});
	return product //% PRIME
}

function check_shards(secret_shards) {
	var threshold = ""

	if (secret_shards.size == 0) {
		return "Set je prazan"
	}

	secret_shards.forEach(element => {
		var coord = element.split("-")
		if (threshold == "") {
			threshold = coord[0]
		} else if (threshold != coord[0]) {
			return "Svi shardovi nemaju isti threshold"
		}
	});

	if (secret_shards.size < threshold) {
		return "Nedovoljno shardova"
	}

	console.log("Shardovi se čine oke")
	return ""
}

function recover_secret(secret_shards, x_coords, y_coords, modulus = PRIME) {

	/*const shards_set = new Set(secret_shards)

	var shards_status = check_shards(shards_set)
	if (shards_status != "") {
		console.log(shards_status)
		console.log("Secret unrecoverable")
		return ""
	}*/

	/*var x_coords = []
	var y_coords = []

	secret_shards.forEach(element => {
		var tmp = element.split("-")
		x_coords.push(BigInt(tmp[1]))
		y_coords.push(BigInt(tmp[2]))
	});*/


	var tajna = lagrange_interpolate(x_coords, y_coords)

	return Buffer.from(tajna.toString(16), "hex").toString()
}


function lagrange_interpolate(x_coords, y_coords) {

	var numerators = []
	var denominators = []

	for (let i = 0; i < x_coords.length; i++) {
		var others = x_coords.slice()
		current = others[i]
		others.splice(i, 1)

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

	var sum = BigInt(0);
	for (let i = 0; i < numerators.length; i++) {
		sum += finite_division(numerators[i] * y_coords[i] % PRIME, denominators[i])
	}

	return (sum % PRIME + PRIME) % PRIME
}

function finite_division(numerator, denominator) {
	denominator_inverse = mul_inverse(denominator, PRIME)

	//dividing by denomintor value in finite field aritmetics means, multiplying the numerator by the denominators finite field inverse
	return numerator * denominator_inverse // % PRIME
}




// EXTENDED EUCLIDIAN ALGORITHM or multiplicative inverse: https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm#Modular_integers
// algoritam zahtjeva pozitivan "a" (i "n" ?) pa je prvi korak u algoritmu pretvoriti "a" u pozitivan broj: 
// https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
// python npr. prilikom moduliranja odmah pretvori broj u pozitivnu vrijedost

function mul_inverse(a, n) {
	a = (a % n + n) % n

	let t = 0n
	let new_t = 1n

	let r = n
	let new_r = a

	while (new_r != 0n) {
		let quotient = (r / new_r) >> 0n

		let swap_var = new_t

		new_t = t - quotient * swap_var
		t = swap_var


		swap_var = new_r

		new_r = r - quotient * swap_var
		r = swap_var
	}

	if (r > BigInt(1)) {
		console.log("\"b\" not prime or \"a\" not invertible")
		console.log("Exiting...")
		exit(0)
	}
	if (t < 0) {
		t = (t % n + n) % n
	}
	return t;
}






exports.generate_secret_shares = generate_secret_shares;
exports.recover_secret = recover_secret;
exports.share = share;
exports.recover = recover;