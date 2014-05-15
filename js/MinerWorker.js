importScripts('lib/Utils.js');
importScripts('lib/Sha256.js');

self.addEventListener('message', function(e) {

  var nonce = 0;
  var data = e.data;
  var sha256 = new Sha256();

  switch (data.cmd) {
    case 'start':
    	while(true){
    		var hash2 = sha256.generate(data.hash + nonce);
        if(nonce % 10000 == 0)
          console.log(nonce);
    		
    		if(hash2[0] == "0" && hash2[1] == "0" && hash2[2] == "0" && hash2[3] == "0" && hash2[4] == "0"){
          console.log("FOUND");
    			self.postMessage({success:true, nonce:nonce});
    			self.close(); // Terminates the worker.
      			break;
    		}else{
    			self.postMessage({success:false, nonce:nonce});
    		}
    		nonce++;
    	}
      break;
    case 'stop':
      self.postMessage({success:false, nonce:nonce});
      self.close(); // Terminates the worker.
      break;
    default:
      self.postMessage('Unknown command: ' + data.msg);
  };
}, false);