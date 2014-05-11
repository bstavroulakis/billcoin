var Block = function(){

	var self = this;
	
	self.hash = "";
	self.transactions = [];
	self.previousBlock = "";
	self.timestamp = "";
	self.merkleRoot = "";
	self.nonce = "";

	self.miningWorker = {};

	self.init = function(transactions, selectedWallet, previousBlock){

		console.log(selectedWallet);
		var billcoinTx = new BillcoinTransaction();
		billcoinTx.generate( "Generate", selectedWallet, 50 );

		if(transactions.length > 0){
			var rev = self.transactions.reverse();
			rev.push(billcoinTx.txJson);
			transactions = rev.reverse();

			var hashes = [];
			for(var key in transactions){
				hashes.push(transactions[key].key);
			}

			self.merkleRoot = self.merkleHash(hashes);
		}
		self.transactions = transactions;
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
	    	newHash.push(hashAb(hashes[key], hashes[key + 1]));
	    	//return;
	    }
	    if(hashes.length % 2 == 1){
	    	var last = hashes[hashes.length-1];
			newHash.push(hashAb(last, last))
		}
	    return merkleHash(newHash);
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

		billcoin.model.mining.running(true);
		self.init(transactions, selectedWallet, previousBlock);

		if(typeof(Worker) !== "undefined")
		{
			self.miningWorker = new Worker("MinerWorker.js");
			self.miningWorker.postMessage(
				{
					'cmd': 'start', 
					'hash': sha256.generate(self.previousBlock + self.merkleRoot + self.timestamp)
				}					
			);
			self.miningWorker.onmessage = function (event){
				console.log(event);
				if(event.data.success){
					
					$("#mining_nonce").html("Found nonce! Sending request");

					$.post("api/sendNewBlock.php",{
						block:{
							hash : self.hash,
							transactions : self.transactions,
							previousBlock : self.previousBlock,
							timestamp : self.timestamp,
							merkleRoot : self.merkleRoot,
							nonce : self.nonce
						}
					},function(response){

						if(response.success){

						}else{
							alert("");
						}

					})

				}else{

					$("#mining_nonce").html(event.data.nonce);

				}
			};
		}

	};

	self.stopMining = function(){

		billcoin.model.mining.running(false);
		self.miningWorker.postMessage(
			{ 
				"cmd" : "stop" 
			}
		);

	};

};