var Billcoin = function(){

	var self = this;
	self.mainDomain = "api/";

	self.model = {
		wallets:[],
		blockchain:[],
		transactionsPending:[],
		mining:{
			running:false
		},
		totalBalance:0
	};

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
						selectedWallet = { address : self.model.wallets()[key].address, wifCompressed : self.model.wallets()[key].wifCompressed };
					}
				};
				billcoinTx.generate( selectedWallet, $("#newTxToAddress").val(), $("#newTxAmount").val() );
				setTimeout(function(){
					$("#newTxBalance").html(billcoinTx.balance);
				},2000);
				
	      	},
			"Add Transaction to Queue": function() {
				var billcoinTx = new BillcoinTransaction();
				var selectedWallet = "";
				var selectedWalletVal = $("#newTx .wallets").find(":selected").val();
				for(var key in self.model.wallets()){
					if(self.model.wallets()[key].address() == selectedWalletVal){
						selectedWallet = { address : self.model.wallets()[key].address, wifCompressed : self.model.wallets()[key].wifCompressed };
					}
				};
				billcoinTx.generate( selectedWallet, $("#newTxToAddress").val(),$("#newTxAmount").val() );
				setTimeout(function(){
					$("#newTxBalance").html(billcoinTx.balance);
					$.post("api/sendNewTx.php",{transaction : billcoinTx.txJson, raw : billcoinTx.txRaw}, function(){

					});
					$( "#dialog-form" ).dialog( "close" );
				},2000);
	        }
	      }
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

		self.importWalletSetup();
	};

	self.setupModel = function(){
		self.model = ko.mapping.fromJS(self.model);
		ko.applyBindings(self.model);
	};

	//MINING EVENTS
	self.startMining = function(){
		self.model.mining.running(true);
	};

	self.stopMining = function(){
		self.model.mining.running(false);
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
			wifCompressed:ko.observable(wallet.wifCompressed)
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
						wifCompressed:ko.observable(importWallet.wifCompressed)
					});
            	}
            };
        });
	};

	self.setupWallets();

	self.updateTransactionDataTimer = function(){
		setInterval(function(){
			self.updateTransactionData();
		}, 3000);
	};

	self.updateBlockchainDataTimer = function(){
		setInterval(function(){
			self.updateBlockchainData();
		}, 3000);
	};

	self.updateTransactionData = function(){
		$.get("api/transactions.txt", function(data){
			var dataJson = "[" + data.replace(/}{/g,"}\,{") + "]";
			var transactions = jQuery.parseJSON(dataJson);
			var liTrans = "";
			for(var key in transactions){
				liTrans += "<li>" + JSON.stringify(transactions[key]) + "</li>";
				self.model.transactionsPending.push(transactions[key]);
			};
			$("#pendingTransactions").html(liTrans);
		});
	};

	self.updateBlockchainData = function(){
		$.get("api/blockchain.txt", function(data){
			if(data == null || data == "")
				return;

			var jQueryData = jQuery.parseJSON(JSON.parse("[" + data + "]"));
			var liTrans = "";
			for(var key in jQueryData){
				liTrans += "<li>" + jQueryData[key] + "</li>";
			};
			$("#blockchain").html(liTrans);
		});
	};

	self.updateTransactionDataTimer();
	self.updateBlockchainDataTimer();
	self.updateTransactionData();
	self.updateBlockchainData();

};