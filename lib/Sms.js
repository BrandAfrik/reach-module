//Require Modules
const crypto = require('crypto');
const axios = require('axios').default;
const randomstring = require("randomstring");

/**
*Reach Class
**/
class Sms {
	
	constructor(key, secret) {
		this.HOST = "api.smsglobal.com";
		this.PORT = 443;
		this.key = key;
		this.secret = secret;
	}
	
	
	//Form the string to be hashed
	formString(ts, nonce, method, uri, host, port, optional) {
		let string = ts + "\n" + nonce + "\n" + method + "\n" + uri + "\n" + host + "\n" + port + "\n" + optional;
		return string;
	}
	
	//Return time, randomString and string to be hashed
	getAuthHeaderObject(method, uri) {
		let ts = Math.round((new Date()).getTime() / 1000);
		let randomString = randomstring.generate({
							  length: 7,
							  charset: 'numeric'
							});
		let macString = this.formString(ts, randomString, method, uri, this.HOST, this.PORT, "\n");
		return {ts, randomString, macString};
	}
	
	//Form the Authentication header
	getAuthHeader(ts, randomString, macString) {
		return `MAC id="${this.key}", ts="${ts}", nonce="${randomString}", mac="${this.computeMac(macString)}"`;
	}
	
	//Compute the Mac
	computeMac(string) {
		//console.log(string);
		let hash = crypto.createHmac('SHA256', this.secret).update(string).digest('base64');
		return hash;
	}
	
	//Method to call the API
	callApi(method, url, header, data) {
		//Make a call to the API
		axios({
			method: method,
			url: url,
			headers: header,
			data: data
		}) 
		.then((response) => {
			console.log(response.data);
		})
		.catch((error) => {
			console.log(error);
		})
	}

	
	//Check SMS Status
	checkSms() {
		let authObject = this.getAuthHeaderObject("GET", "/v2/sms/");
		
		let authHeader = this.getAuthHeader(authObject.ts, authObject.randomString, authObject.macString);
		//console.log(authObject.macString);
		
		let headers = {"Authorization" : authHeader};
		let data = null;
		
		//Call the Api
		this.callApi("get", "https://api.smsglobal.com/v2/sms/", headers, data);
	}
	
	
	//Send SMS
	sendSms(origin, destination, message) {
		let authObject = this.getAuthHeaderObject("POST", "/v2/sms/");
		
		let authHeader = this.getAuthHeader(authObject.ts, authObject.randomString, authObject.macString);
		
		let headers = {"Authorization" : authHeader};
		let data = {
			origin: origin,
			destination: destination,
			message: message
		}
		
		
		//Call the Api
		this.callApi("post", "https://api.smsglobal.com/v2/sms/", headers, data);
	}

	//Top up
	topup() {
		
	}
}

module.exports = Sms;