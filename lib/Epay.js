//Require modules
const axios = require("axios");
const randomstring = require("randomstring");

class Epay {

    constructor(merchant_key, app_id, app_secret) {
        this.merchant_key = merchant_key;
        this.app_id = app_id;
        this.app_secret = app_secret;
        this.BASE_URL = "https://epaygh.com/api/v1/";
    }

    //Method to call the API
	callApi(method, url, header, data) {
		//Make a call to the API and return a Promise
		return axios({
			method: method,
			url: url,
			headers: header,
			data: data
		});
    }
    
    //Authenticate
    authenticate() {
        let headers = {"Content-Type":"application/json"};

		let data = {
			"merchant_key":merchant_key,
			"app_id":app_id,
			"app_secret":app_secret
		};

		return this.callApi("post", this.BASE_URL + "token", headers, data);
    }

    //Charge customer
    charge(amount, currency, 
            customer_name, customer_email, 
            customer_telephone, payment_description,
            mobile_wallet_number, mobile_wallet_network,
            payment_method, voucher
    ) {
        let headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        };

        //Generate a uuid reference for the transaction
        let reference = randomstring.generate({
                            length: 12,
                            charset: 'alphanumeric'
                        });

        //Set up the data to be sent
        let data = {
            reference: reference,
            amount: amount,
            currency: currency,
            customer_name: customer_name,
            customer_email: customer_email,
            customer_telephone: customer_telephone,
            payment_description: payment_description,
            payment_description: payment_method
        };

        //Check for additional details
        if (payment_method.localeCompare("momo")) {
            data.mobile_wallet_number = mobile_wallet_number;
            data.mobile_wallet_network = mobile_wallet_network;

            if (mobile_wallet_network.localeCompare("vodafone")){
                data.voucher = voucher;
            }
        }
        
        authenticate.then((response) => {
            //Add the access token from the response to the headers object
            headers.Authorization = "Bearer " + response.data.access_token;

            this.callApi("post", this.BASE_URL + "charge", headers, data)
            .then((response) => {

            })
            .catch((error) => {
                console.log("Failed to charge");
            })
        }) .catch((error) => {
            console.log("Couldn't authenticate");
        })
        
    }
}