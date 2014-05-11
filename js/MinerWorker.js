self.addEventListener('message', function(e) {

  var nonce = 0;
  var data = e.data;
  var sha256 = new Sha256();

  switch (data.cmd) {
    case 'start':
    	while(true){
    		var hash2 = sha256.generate(data + nonce);
    		nonce++;
    		if(hash2[0] == "0")
    			return {success:true, nonce};
    	}
      break;
    case 'stop':
      self.postMessage({success:false, nonce});
      self.close(); // Terminates the worker.
      break;
    default:
      self.postMessage('Unknown command: ' + data.msg);
  };
}, false);