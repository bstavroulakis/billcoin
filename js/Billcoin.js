var Billcoin = function(){

	var self = this;
	self.mainDomain = "api/";

	self.model = {
		wallets:[],
		transactionsPending:[],
		mining:{
			running:false
		},
		totalBalance:0
	};

	self.block = new Block();
	self.blockchain = [];
	self.timestampBlockchain = "";
	self.timestampTransaction = "";

	self.setupDOM = function(){

		$( "#dialog-form" ).dialog({
	      autoOpen: false,
	      height: 270,
	      width: 450,
	      modal: true,
	      buttons: {
	      	"Calculate Balance":function(){
	      		var billcoinTx = new BillcoinTransaction();
				var selectedWallet = "";
				var selectedWalletVal = $("#newTx .wallets").find(":selected").val();				
				for(var key in self.model.wallets()){
					if(self.model.wallets()[key].address() == selectedWalletVal){
						selectedWallet = { 
							address : self.model.wallets()[key].address, 
							wifCompressed : self.model.wallets()[key].wifCompressed,
							publicKey : self.model.wallets()[key].publicKey
						};
					}
				};
				billcoinTx.generate( selectedWallet, $("#newTxToAddress").val(), $("#newTxAmount").val() );
				$("#newTxBalance").html(billcoinTx.balance);				
	      	},
			"Add Transaction to Queue": function() {
				var billcoinTx = new BillcoinTransaction();
				var selectedWallet = "";
				var selectedWalletVal = $("#newTx .wallets").find(":selected").val();
				for(var key in self.model.wallets()){
					if(self.model.wallets()[key].address() == selectedWalletVal){
						selectedWallet = { 
							address : self.model.wallets()[key].address, 
							wifCompressed : self.model.wallets()[key].wifCompressed,
							publicKey : self.model.wallets()[key].publicKey
						};
					}
				};
				billcoinTx.generate( selectedWallet, $("#newTxToAddress").val(),$("#newTxAmount").val() );
				$("#newTxBalance").html(billcoinTx.balance);
				$.post("api/sendNewTx.php",{transaction : billcoinTx.txJson, raw : billcoinTx.txRaw}, function(){});
				$( "#dialog-form" ).dialog( "close" );
	        }
	      }
		});

		$( "#dialog-block" ).dialog({
		  autoOpen: false,
		  height: 270,
		  width: 450,
		  modal: true
		});

		$(".new_transaction_btn").button().click(function() {
			$( "#dialog-form" ).dialog( "open" );
		});

		$("#generate_btn").click(function(){
			self.generateWallet();
		});
		$("#clear_btn").click(function(){
			self.clearWallet();
		});
		$("#import_btn").click(function(){
			$("#import_wallet").trigger("click");
		});
		$("#export_btn").click(function(e){
			e.stopImmediatePropagation();
			self.exportWallet();
		});

		$("#import_wallet").click(function(e){
			e.stopImmediatePropagation();
		})

		$("section").on("click", ".start_mining", function(){
			$(this).removeClass("start_mining");
			$(this).addClass("stop_mining");
			self.startMining();
		});

		$("section").on("click", ".stop_mining", function(){
			$(this).removeClass("stop_mining");
			$(this).addClass("start_mining");
			self.stopMining();
		});

		$("#blockchain").on("click",".block_element",function(){
			$( "#dialog-block" ).html($(this).attr("data-block"));
			$( "#dialog-block" ).dialog( "open" );
		});

		self.importWalletSetup();
	};

	self.setupModel = function(){
		self.model = ko.mapping.fromJS(self.model);
		ko.applyBindings(self.model);
	};

	//MINING EVENTS
	self.startMining = function(){

		var wallet = $('#miner_wallet').find(":selected");
		var previousBlockHash = "0000000000000000000000000000000000000000000000000000000000000000";
		if(self.blockchain.length != 0){
			previousBlockHash = self.blockchain[self.blockchain.length - 1].hash;
		};

		if(wallet == null){
			alert("Create a wallet first before mining.");
		}else{
			self.block.startMining(ko.mapping.toJS(self.model.transactionsPending), 
				{
					address:ko.observable(wallet.val()), 
					wifCompressed:ko.observable(wallet.attr("data-private")), 
					publicKey:ko.observable(wallet.attr("data-publickey"))
				}, previousBlockHash)
		}
	};

	self.stopMining = function(){
		self.block.stopMining();
	};

	//WALLET EVENTS
	self.setupWallets = function(){
		if("wallets" in localStorage && localStorage.getItem("wallets") != "undefined"){
			self.model.wallets = JSON.parse(localStorage.getItem("wallets"));
		}else{
			localStorage.setItem("wallets", JSON.stringify(self.model.wallets));
		}
		self.setupModel();
		self.setupDOM();
	}

	self.generateWallet = function(){
		var wallet = new Wallet();
		wallet.generate();
		self.model.wallets.push({
			address:ko.observable(wallet.address),
			wifCompressed:ko.observable(wallet.wifCompressed),
			publicKey:ko.observable(wallet.publicKeyHex)
		});
		localStorage.setItem("wallets", JSON.stringify(ko.mapping.toJS(self.model.wallets)));
	};

	self.clearWallet = function(){
		self.model.wallets([]);
		localStorage.setItem("wallets", "[]");
	};

	self.exportWallet = function(){
		var exportData = 'data:text/plain;charset=UTF-8,' + JSON.stringify(ko.mapping.toJSON(self.model.wallets));
		$("#export_btn a").attr({
            'download': 'wallets.txt',
            'href': exportData,
            'target': '_blank'
        });
        $("#export_btn a")[0].click();
	};

	self.importWalletSetup = function(){
		$("#import_wallet").change(function (event) {
            var fileReader = new FileReader();
            fileReader.readAsText($('#import_wallet')[0].files[0]);
            fileReader.onload = function (e) {
            	var loadData = JSON.parse(e.target.result);
            	loadData = jQuery.parseJSON(loadData);
            	localStorage.setItem("wallets", JSON.stringify(loadData));
            	self.model.wallets([]);
            	for(var key in loadData){
            		var importWallet = loadData[key];
            		self.model.wallets.push({
						address:ko.observable(importWallet.address),
						wifCompressed:ko.observable(importWallet.wifCompressed),
						publicKey:ko.observable(importWallet.publicKey)
					});
            	}
            };
        });
	};

	self.updateTransactionData = function(){
		$.ajax({
            type: "GET",
            url: "api/getNewData.php?dataType=transactions&timestamp="  + self.timestampTransaction ,
            async: true,
            cache: false,
            timeout:50000,

            success: function(response){ 
                
            	if(response == null || response == ""){
            		self.model.transactionsPending([]);
            		$("#pendingTransactions").html("");
            		return;
            	}

                var json = JSON.parse(response);
                self.timestampTransaction = json.timestamp;
                var data = json.data;
                var dataJson = "[" + data.replace(/}{/g,"}\,{") + "]";
				var transactions = jQuery.parseJSON(dataJson);
				var liTrans = "";
				self.model.transactionsPending([]);
				for(var key in transactions){
					liTrans += "<li>" + JSON.stringify(transactions[key]) + "</li>";
					self.model.transactionsPending.push(transactions[key]);
				};
				$("#pendingTransactions").html(liTrans);
				setTimeout(function(){
            		self.updateTransactionData();
            	},1000);
            },
            complete:function(){
                setTimeout(function(){
            		self.updateTransactionData();
            	},1000);
            }
        });
	};

	self.updateBlockchainData = function(){
		$.ajax({
            type: "GET",
            url: "api/getNewData.php?dataType=blockchain&timestamp=" + self.timestampBlockchain,
            async: true,
            cache: false,
            timeout:50000,

            success: function(response){ 
                
            	if(response == null || response == ""){
            		self.blockchain = [];
            		$("#blockchain").html("");
            		return;
            	}

                var json = JSON.parse(response);
                self.timestampBlockchain = json.timestamp;
                var data = json.data;
				var dataJson = "[" + data + "]";
				var jQueryData = jQuery.parseJSON((dataJson));
				var liTrans = "";
				for(var key in jQueryData){
					liTrans += "<li class='block_element' data-block='" + JSON.stringify(jQueryData[key]) + "'><a href='#'>" + jQueryData[key].hash + "</a></li>";
				};
				self.blockchain = jQueryData;
				$("#blockchain").html(liTrans);
				setTimeout(function(){
            		self.updateBlockchainData();
            	},1000);
            },
            complete:function(){
            	setTimeout(function(){
            		self.updateBlockchainData();
            	},1000);
            }
        });
	};

	self.updateBalance = function(){
		var total = 0;
		var billcoinTx = new BillcoinTransaction();
		for(var key=0; key <= self.model.wallets().length-1;key++){
			billcoinTx.generate(self.model.wallets()[key],"1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN",0);
			total += parseFloat(billcoinTx.balance);
		}
		self.model.totalBalance(total);
		setTimeout(function(){
    		self.updateBalance();
    	},5000);
	};	

	self.setupWallets();
	self.updateTransactionData();
	self.updateBlockchainData();
	self.updateBalance();

};