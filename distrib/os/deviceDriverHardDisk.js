/* ----------------------------------
   DeviceDriverHardDisk.ts

   The Kernel Hard Disk Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    class DeviceDriverHardDisk extends TSOS.DeviceDriver {
        constructor() {
            super();
            this.driverEntry = this.krnHDDDriverEntry;
        }
        krnHDDDriverEntry() {
            // Initialization routine for this, the kernel-mode HDD Device Driver.
            this.status = "loaded";
            // More?
        }
        format(mode) {
            for (let x = 0; x < HDD_TRACKS; x++) {
                for (let y = 0; y < HDD_SECTORS; y++) {
                    for (let z = 0; z < HDD_BLOCKS; z++) {
                        if (sessionStorage.getItem(x + "" + y + "" + z) && mode == 0) {
                            sessionStorage.setItem(x + "" + y + "" + z, this.generateMessage(0, "000", this.getMessage(sessionStorage.getItem(x + "" + y + "" + z))));
                        }
                        else {
                            sessionStorage.setItem(x + "" + y + "" + z, this.generateMessage(0, "000", ""));
                        }
                    }
                }
            }
            sessionStorage.setItem("000", this.generateMessage(1, "100", (((HDD_TRACKS - 1) * HDD_SECTORS * HDD_BLOCKS) + "F"))); // I use the MBR to store the remaining data blocks. This way, I can easily reference it when adding a file to check if it will fit.
        }
        create(filename) {
            var diskspace = this.getMessage(sessionStorage.getItem("000")); // Get the remaining space on the disk
            diskspace = diskspace.substring(0, diskspace.indexOf("F"));
            var diskspaceint = parseInt(diskspace);
            var filenamehex = this.translateToASCII(filename);
            if (diskspaceint > 0) { // Check that there is space in the file system
                if (!this.isTooLarge(filenamehex)) { // Check that there is ENOUGH space in the file system
                    var fileLoc = this.findFreeLocation(1); // Get a spot for the file
                    if (fileLoc != "-1") { // Assuming there was a spot
                        var dirLoc = this.findFreeLocation(0); // Get a spot in the directory
                        var hexData = this.generateMessage(1, fileLoc, filenamehex); // Generate a message for the directory
                        sessionStorage.setItem(dirLoc, hexData); // Set the directory message
                        sessionStorage.setItem(fileLoc, this.generateMessage(1, "000", "")); // Mark the file location as in use
                        diskspaceint--; // Decrement the disk space tracker by 1
                        sessionStorage.setItem("000", this.generateMessage(1, this.getLink(sessionStorage.getItem("000")), (diskspaceint + "F"))); // Save that disk space value
                    }
                }
            }
        }
        rename(filename, newfilename) {
            var filenamehex = this.translateToASCII(newfilename);
            if (!this.isTooLarge(filenamehex)) { // Check the new filename can fit
                var fileLoc = this.findFile(filename); // Find our file
                if (fileLoc != "-1") { // Assuming we found it,
                    var hexData = this.generateMessage(1, this.getLink(sessionStorage.getItem(fileLoc)), filenamehex); // Generate the message with the new name
                    sessionStorage.setItem(fileLoc, hexData); // Set it
                }
            }
        }
        copy(filename) {
            this.create(filename + "(1)"); // I'm a dirty Windows user, kill me.
            this.write(filename + "(1)", this.read(filename));
        }
        writePlain(filename, contents) {
            this.write(filename, this.translateToASCII(contents));
        }
        write(filename, contents) {
            var diskspace = this.getMessage(sessionStorage.getItem("000")); // First we want to get the remaining disk space from the MBR.
            diskspace = diskspace.substring(0, diskspace.indexOf("F"));
            var diskspaceint = parseInt(diskspace);
            var dirLoc = this.findFile(filename); // Find the file we're writing to.
            if (dirLoc != "-1") { // If it was found, 
                if (diskspaceint > (this.blockSize(contents) - 1)) { // And there's enough space on the disk to write the file (-1 because 1 block was already initialized on file creation).
                    var fileLoc = this.getLink(sessionStorage.getItem(dirLoc)); // Get the file's location from the directory.
                    var contWrite = this.isTooLarge(contents); // This boolean tracks if the file needs more than 1 more block
                    while (contWrite) { // While we need to write at least 2 more blocks of data...
                        var nextLoc = this.getLink(sessionStorage.getItem(fileLoc)); // Jump to the next location,
                        if (nextLoc == "000") { // If there was no next location in the file, then
                            nextLoc = this.findFreeLocation(1); // Find a new space for the next block,
                            diskspaceint--; // And decrement the disk space tracker as we just used a new block. Then,
                        }
                        var chunk = contents.substr(0, (2 * (HDD_BLOCK_SIZE - 4))); // Get the data that will fit in this block,
                        contents = contents.substring((2 * (HDD_BLOCK_SIZE - 4))); // Shred that from the existing string,
                        sessionStorage.setItem(fileLoc, this.generateMessage(1, nextLoc, chunk)); // Set the current location to a newly generated message (This block is in use, nextLoc is the linked location, and chunk is the actual data),
                        fileLoc = nextLoc; // Move our file location to the next location.
                        sessionStorage.setItem(fileLoc, this.generateMessage(1, "000", "")); // Mark the next location as used. Otherwise, we will continually write over the same second block.
                        contWrite = this.isTooLarge(contents); // Check if the remaining data is still too big for 1 block,
                    }
                    var fileCheck = sessionStorage.getItem(fileLoc);
                    if (this.inUse(fileCheck) && this.getLink(fileCheck) != "000") { // When you are rewriting a file, you could be writing a smaller text that takes up fewer blocks. In this scenario, we need to do a modified delete function and set the later blocks as not in use.
                        var nextLoc = this.getLink(fileCheck);
                        var fullData = "";
                        var curLoc;
                        var data = "";
                        while (nextLoc != "000" && this.inUse(sessionStorage.getItem(nextLoc))) { // While the next block is actually in use and there's a next location...
                            fullData = sessionStorage.getItem(nextLoc);
                            curLoc = nextLoc;
                            nextLoc = this.getLink(fullData);
                            data = this.getMessage(fullData);
                            sessionStorage.setItem(curLoc, this.generateMessage(0, nextLoc, data));
                            diskspaceint++; // This space is now free, so increase the disk space tracker
                        }
                    }
                    // If the data will fit in one block (or once it does, if it entered the loop above), it writes one last time. nextLoc is not needed here as this is the last block, nor do we need to break up the data into a smaller chunk.
                    sessionStorage.setItem(fileLoc, this.generateMessage(1, "000", contents));
                }
                sessionStorage.setItem("000", this.generateMessage(1, this.getLink(sessionStorage.getItem("000")), (diskspaceint + "F"))); // We have to save our new remaining disk space to the MBR. This is inside the if block because it won't change if the target file was never found.
            }
        }
        deleteFile(filename) {
            var diskspace = this.getMessage(sessionStorage.getItem("000")); // First we want to get the remaining disk space from the MBR so that we can increase it.
            diskspace = diskspace.substring(0, diskspace.indexOf("F"));
            var diskspaceint = parseInt(diskspace);
            var nextLoc = this.findFile(filename); // Find the file we're deleting.
            if (nextLoc != "-1") { // If it was found, 
                var fullData = "";
                var curLoc;
                var data = "";
                diskspaceint--; // Disk space does not take into account the file directory, however the first iteration of the loop (which adds to this number) will be deactivating the file directory entry. This compensates for that.
                while (nextLoc != "000") {
                    fullData = sessionStorage.getItem(nextLoc);
                    curLoc = nextLoc;
                    nextLoc = this.getLink(fullData);
                    data = this.getMessage(fullData);
                    sessionStorage.setItem(curLoc, this.generateMessage(0, nextLoc, data));
                    diskspaceint++;
                }
                sessionStorage.setItem("000", this.generateMessage(1, curLoc, (diskspaceint + "F"))); // We have to save our new remaining disk space to the MBR. This is inside the if block because it won't change if the target file was never found. The link is set to curLoc as it was the last non-0 file location (the last block that was freed).
            }
        }
        readPlain(filename) {
            return this.translateToPlain(this.read(filename));
        }
        read(filename) {
            var nextLoc = this.findFile(filename); // Find the file we're reading.
            if (nextLoc != "-1") { // If it was found, 
                var fullData = sessionStorage.getItem(nextLoc);
                var data = "";
                nextLoc = this.getLink(fullData);
                while (nextLoc != "000") { // While we have another link, keep reading down the chain.
                    fullData = sessionStorage.getItem(nextLoc);
                    nextLoc = this.getLink(fullData);
                    data = data + this.getMessage(fullData);
                }
                return data;
            }
        }
        list(perm) {
            var diskspace = this.getMessage(sessionStorage.getItem("000")); // I want to show the user how much free space is remaining.
            diskspace = diskspace.substring(0, diskspace.indexOf("F"));
            _StdOut.putText("Current remaining blocks: " + diskspace);
            _StdOut.advanceLine();
            var mbrSkip = 1; // This variable lets us easily skip over the MBR as an entry in the file directory. Set to 1 at first, set to 0 after the first sector.
            for (let y = 0; y < HDD_SECTORS; y++) {
                for (let z = mbrSkip; z < HDD_BLOCKS; z++) {
                    var dirEntry = sessionStorage.getItem(0 + "" + y + "" + z);
                    if (this.inUse(dirEntry)) { // If the location is in use, 
                        dirEntry = this.getMessage(dirEntry);
                        if (!(perm == 0 && (dirEntry.charAt(0) + dirEntry.charAt(1)) == "2E")) { // If the permission is set to 0 and the first character is a "." (2E in ASCII hex), then the file shouldn't be shown.
                            _StdOut.putText(this.translateToPlain(dirEntry)); // Otherwise, print the filename.
                            _StdOut.advanceLine();
                        }
                    }
                }
                mbrSkip = 0; // After the first iteration, we do care about the first block again.
            }
        }
        findFile(filename) {
            var mbrSkip = 1; // This variable lets us easily skip over the MBR as an entry in the file directory. Set to 1 at first, set to 0 after the first sector.
            var filenamehex = this.getMessage(this.generateMessage(0, "000", this.translateToASCII(filename))); // All data is stored in hex ASCII, so we should translate the filename to that for comparison purposes. It also needs the proper padding to exactly match, so I generate it as a full message and shred the first 4 bytes.
            for (let y = 0; y < HDD_SECTORS; y++) {
                for (let z = mbrSkip; z < HDD_BLOCKS; z++) {
                    var dirEntry = sessionStorage.getItem(0 + "" + y + "" + z);
                    if (this.inUse(dirEntry)) { // If the location is in use, 
                        if (this.getMessage(dirEntry) == filenamehex) { // Check the filename. If it's equal to our target,
                            return 0 + "" + y + "" + z; // Return this key.
                        }
                    }
                }
                mbrSkip = 0;
            }
            return "-1"; // File not found
        }
        findFreeLocation(type) {
            if (type == 1) {
                var mbrLink = this.getLink(sessionStorage.getItem("000"));
                if (mbrLink != "000") { // The MBR's link location will sometimes be the 
                    sessionStorage.setItem("000", this.generateMessage(1, "000", this.getMessage(sessionStorage.getItem("000")))); // Reset the MBR's link to 000.
                    return mbrLink; // Return that value
                }
                else { // If we don't have a location saved for quick use in the MBR link, we need to find one ourself.
                    for (let x = 1; x < HDD_TRACKS; x++) {
                        for (let y = 0; y < HDD_SECTORS; y++) {
                            for (let z = 0; z < HDD_BLOCKS; z++) {
                                if (!this.inUse(sessionStorage.getItem(x + "" + y + "" + z))) { // If the location isn't in use, return that key.
                                    return x + "" + y + "" + z;
                                }
                            }
                        }
                    }
                }
            }
            else {
                for (let y = 0; y < HDD_SECTORS; y++) {
                    for (let z = 0; z < HDD_BLOCKS; z++) {
                        if (!this.inUse(sessionStorage.getItem(0 + "" + y + "" + z))) { // If the location isn't in use, return that key.
                            return 0 + "" + y + "" + z;
                        }
                    }
                }
            }
            return "-1"; // We've got to return something.
        }
        canFit(data) {
            var diskspace = this.getMessage(sessionStorage.getItem("000")); // First we want to get the remaining disk space from the MBR to compare against.
            diskspace = diskspace.substring(0, diskspace.indexOf("F"));
            var diskspaceint = parseInt(diskspace);
            return diskspaceint >= this.blockSize(data);
        }
        translateToASCII(data) {
            var newdata = "";
            for (let i = 0; i < data.length; i++) {
                let chunk = data.charCodeAt(i).toString(16);
                if (chunk.length < 2) { // As always, we need to make sure the resulting hex value is 2 characters long.
                    chunk = "0" + chunk;
                }
                newdata += chunk;
            }
            return newdata;
        }
        translateToPlain(data) {
            var newdata = "";
            for (let i = 0; i < data.length; i += 2) {
                let chunk = (data.charAt(i) + data.charAt(i + 1));
                chunk = parseInt(chunk, 16);
                newdata += String.fromCharCode(chunk);
            }
            return newdata;
        }
        generateMessage(inUse, locationLink, data) {
            var finData = data;
            while (finData.length < (2 * (HDD_BLOCK_SIZE - 4))) { // HDD_BLOCK_SIZE is a representation of the block size in bytes. The first 4 bytes are reserved, so I take those off immediately. Hexadecimal bytes take 2 characters, so I multiply the rest by 2.
                finData = finData + "0";
            }
            var finalMsg = inUse + locationLink + finData;
            return finalMsg;
        }
        inUse(data) {
            if (data.charAt(0) == '1') {
                return true;
            }
            return false;
        }
        getLink(data) {
            return data.substr(1, 3); // The link is the 2-4 bytes.
        }
        getMessage(data) {
            return data.substring(4);
        }
        blockSize(data) {
            return Math.floor(data.length / (2 * (HDD_BLOCK_SIZE - 4))) + 1; // HDD_BLOCK_SIZE is a representation of the block size in bytes. The first 4 bytes are reserved, so I take those off immediately. Hexadecimal bytes take 2 characters, so I multiply the rest by 2. We add 1 because all data will take up at least one block. 
        }
        isTooLarge(data) {
            if (data.length > (2 * (HDD_BLOCK_SIZE - 4))) { // HDD_BLOCK_SIZE is a representation of the block size in bytes. The first 4 bytes are reserved, so I take those off immediately. Hexadecimal bytes take 2 characters, so I multiply the rest by 2.
                return true;
            }
            return false;
        }
    }
    TSOS.DeviceDriverHardDisk = DeviceDriverHardDisk;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverHardDisk.js.map