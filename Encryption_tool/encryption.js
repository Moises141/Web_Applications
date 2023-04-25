function encrypt() {
  // Get the file and password from the form
  var file = document.getElementById("file").files[0];
  var password = document.getElementById("password").value;

  // Create a new FileReader to read the file
  var reader = new FileReader();
  reader.onload = function(e) {
    // Get the file contents as a Uint8Array
    var data = new Uint8Array(reader.result);

    // Generate a random initialization vector
    var iv = window.crypto.getRandomValues(new Uint8Array(16));

    // Generate a key from the password using PBKDF2
    window.crypto.subtle.importKey("raw", new TextEncoder().encode(password), {name: "PBKDF2"}, false, ["deriveKey"])
      .then(function(baseKey) {
        return window.crypto.subtle.deriveKey(
          {
            "name": "PBKDF2",
            "salt": new TextEncoder().encode("Some arbitrary salt"),
            "iterations": 100000,
            "hash": "SHA-256"
          },
          baseKey,
          { "name": "AES-GCM", "length": 256 },
          true,
          ["encrypt"]
        );
      })
      .then(function(key) {
        // Encrypt the data using AES-GCM
        return window.crypto.subtle.encrypt(
          {
            "name": "AES-GCM",
            "iv": iv,
            "tagLength": 128
          },
          key,
          data
        );
      })
      .then(function(encryptedData) {
        // Create a new blob with the encrypted data
        var encryptedBlob = new Blob([iv, encryptedData], {type: file.type});

        // Create a download link for the encrypted file
        var link = document.createElement("a");
        link.href = URL.createObjectURL(encryptedBlob);
        link.download = file.name + ".enc";
        link.click();
      })
      .catch(function(err) {
        console.error(err);
      });
  };
  reader.readAsArrayBuffer(file);
}
function decrypt() {
  // Get the file and password from the form
  var file = document.getElementById("file").files[0];
  var password = document.getElementById("password").value;

  // Create a new FileReader to read the file
  var reader = new FileReader();
  reader.onload = function(e) {
    // Get the file contents as a Uint8Array
    var data = new Uint8Array(reader.result);

    // Get the initialization vector and encrypted data from the file
    var iv = data.slice(0, 16);
    var encryptedData = data.slice(16);

    // Generate a key from the password using PBKDF2
    window.crypto.subtle.importKey("raw", new TextEncoder().encode(password), {name: "PBKDF2"}, false, ["deriveKey"])
      .then(function(baseKey) {
        return window.crypto.subtle.deriveKey(
          {
            "name": "PBKDF2",
            "salt": new TextEncoder().encode("Some arbitrary salt"),
            "iterations": 100000,
            "hash": "SHA-256"
          },
          baseKey,
          { "name": "AES-GCM", "length": 256 },
          true,
          ["decrypt"]
        );
      })
      .then(function(key) {
        // Decrypt the data using AES-GCM
        return window.crypto.subtle.decrypt(
          {
            "name": "AES-GCM",
            "iv": iv,
            "tagLength": 128
          },
          key,
          encryptedData
        );
      })
      .then(function(decryptedData) {
        // Create a new blob with the decrypted data
        var decryptedBlob = new Blob([decryptedData], {type: file.type});

        // Create a download link for the decrypted file
        var link = document.createElement("a");
        link.href = URL.createObjectURL(decryptedBlob);
        link.download = file.name.replace(/\.enc$/, "");
        link.click();
      })
      .catch(function(err) {
        console.error(err);
      });
  };
  reader.readAsArrayBuffer(file);
}
