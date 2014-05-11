var Block = function(){

	var self = this;
	
	self.hash = "";
	self.transactions = [];
	self.previousBlock = "";
	self.timestamp = "";
	self.merkleRoot = "";
	self.nonce = "";
	self.hashCore = "";
	self.coinbase = "";
	self.transactionsAll = [];	

	self.init = function(transactions, selectedWallet, previousBlock){

		self.transactionsAll = [];
		self.transactions = transactions;
		self.coinbase = new BillcoinTransaction();
		self.coinbase.generate( "Generate", selectedWallet, 50 );

		if(transactions.length > 0){
			var rev = transactions.reverse();
			rev.push(JSON.parse(self.coinbase.txJson));
			transactions = rev.reverse();

			var hashes = [];
			for(var key in transactions){
				hashes.push(transactions[key].hash);
			}
			self.merkleRoot = self.merkleHash(hashes);
		}

		self.transactionsAll = transactions;
		self.timestamp = new Date().getTime();
		self.previousBlock = previousBlock;
	};

	self.merkleHash = function(hashes){

		if(hashes.length == 1)
			return hashes[0];

		var newHash = [];
	    for (var key=0;key<=hashes.length-1;key+=2){
	    	if((key + 1) == hashes.length){
	    		break;
	    	}
	    	newHash.push(self.hashAb(hashes[key], hashes[key + 1]));
	    	//return;
	    }
	    if(hashes.length % 2 == 1){
	    	var last = hashes[hashes.length-1];
			newHash.push(self.hashAb(last, last))
		}
	    return self.merkleHash(newHash);
	}

	self.hashAb = function(hashA, hashB){
		var sha256 = new Sha256();
		var a = (hashA);
		var b = (hashB);
		var c = a + b;
		var hash1 = sha256.generate(c, {asBytes:false});
		var hashed = sha256.generate(hash1, {asBytes:false});
		var ret = (hashed);
		return ret;
	}

	self.startMining = function(transactions, selectedWallet, previousBlock){

		var sha256 = new Sha256();

		self.miningWorker = new Worker("js/MinerWorker.js");

		self.miningWorker.addEventListener('message', function(e) {
			self.stopMining();
			var sha256 = new Sha256();
			if(e.data.success){

				self.nonce = e.data.nonce;
				console.log(self.hashCore + self.nonce);
				self.hash = sha256.generate(self.hashCore + self.nonce);
				
				$("#mining_nonce").html("Found nonce! Sending request");

				var postObj = {
						hash : self.hash,
						transactions : self.transactionsAll,
						previousBlock : self.previousBlock,
						timestamp : self.timestamp,
						merkleRoot : self.merkleRoot,
						nonce : self.nonce
					};

				$.post("api/sendNewBlock.php",{
					block:postObj,
					blockStr:JSON.stringify(postObj)
				},function(response){

					if(response.success){

					}else{
						alert("Error while sending block");
					}

				})

			}else{

				$("#mining_nonce").html(event.nonce);

			}
		}, false);

		billcoin.model.mining.running(true);
		self.init(transactions, selectedWallet, previousBlock);
		self.hashCore = self.previousBlock + self.merkleRoot + self.timestamp;
		self.miningWorker.postMessage(
			{
				'cmd': 'start', 
				'hash': self.hashCore
			}					
		);
	};

	self.stopMining = function(){

		billcoin.model.mining.running(false);
		/*self.miningWorker.postMessage(
			{ 
				"cmd" : "stop" 
			}
		);*/

	};

};