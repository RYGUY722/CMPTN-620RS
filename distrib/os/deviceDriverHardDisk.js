/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
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
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }
        format(mode) {
            for (let x = 0; x < HDD_TRACKS; x++) {
                for (let y = 0; y < HDD_SECTORS; y++) {
                    for (let z = 0; z < HDD_BLOCKS; z++) {
                        sessionStorage.setItem(x + "" + y + "" + z, "00000000");
                    }
                }
            }
            sessionStorage.setItem("000", "1100" + ((HDD_TRACKS - 1) * HDD_SECTORS * HDD_BLOCKS)); // I use the MBR to store the remaining data blocks. This way, I can easily reference it when adding a file to check if it will fit.
        }
        create(filename) {
            if (true) { // Check that there is enough space in the file system
                if (!this.isTooLarge(filename)) {
                    var filenamehex = this.translateToASCII(filename);
                    //generateMessage(1,
                }
            }
        }
        write(filename, contents) {
        }
        deleteFile(filename) {
        }
        list(perm) {
            var mbrSkip = 1; // This variable lets us easily skip over the MBR as an entry in the file directory. Set to 1 at first, set to 0 after the first sector.
            for (let y = 0; y < HDD_SECTORS; y++) {
                for (let z = mbrSkip; z < HDD_BLOCKS; z++) {
                    var dirEntry = sessionStorage.getItem(0 + "" + y + "" + z);
                    if (this.inUse(dirEntry)) { // If the location is in use, 
                        if (!(perm == 0 && (dirEntry.charAt(4) + dirEntry.charAt(5)) == "2E")) { // If the permission is set to 0 and the first character is a "." (2E in ASCII hex), then the file shouldn't be shown.
                            _StdOut.putText(this.translateToPlain(dirEntry.substring(3, dirEntry.length))); // Otherwise, print the filename.
                        }
                    }
                }
                mbrSkip = 0;
            }
        }
        findFile(filename) {
            var mbrSkip = 1; // This variable lets us easily skip over the MBR as an entry in the file directory. Set to 1 at first, set to 0 after the first sector.
            var filenamehex = this.translateToASCII(filename); // All data is stored in hex ASCII, so we should translate the filename to that for comparison purposes.
            for (let y = 0; y < HDD_SECTORS; y++) {
                for (let z = mbrSkip; z < HDD_BLOCKS; z++) {
                    var dirEntry = sessionStorage.getItem(0 + "" + y + "" + z);
                    if (this.inUse(dirEntry)) { // If the location is in use, 
                        if (dirEntry.substring(3, dirEntry.length) == filenamehex) { // Check the filename. If it's equal to our target,
                            return 0 + "" + y + "" + z; // Return this key.
                        }
                    }
                }
                mbrSkip = 0;
            }
            return -1; // File not found
        }
        findFreeLocation(type) {
            var mbrLink = this.getLink(sessionStorage.getItem("0 0 0"));
            if (mbrLink != "000") { // The MBR's link location will sometimes be the 
                // Reset the MBR's link to 000.
                return mbrLink; // Return that value
            }
            else { // If we don't have a location saved for quick use in the MBR link, we need to find one ourself.
                if (type == 0) {
                    for (let y = 0; y < HDD_SECTORS; y++) {
                        for (let z = 0; z < HDD_BLOCKS; z++) {
                            if (!this.inUse(sessionStorage.getItem(0 + "" + y + "" + z))) { // If the location isn't in use, return that key.
                                return 0 + "" + y + "" + z;
                            }
                        }
                    }
                }
                else {
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
                return -1; // We've got to return something.
            }
        }
        translateToASCII(data) {
            var newdata = "";
            for (let i = 0; i < data.length; i++) {
                let chunk = data.charCodeAt(i).toString(16);
                if (chunk.length < 2) { // As always, we need to make sure the resulting hex value is 2 characters long.
                    chunk += "0";
                }
                newdata += chunk;
            }
            return newdata;
        }
        translateToPlain(data) {
            var newdata = "";
            for (let i = 0; i < data.length; i += 2) {
                let chunk = (data.charAt(i) + data.charAt(i + 1));
                chunk = chunk.toString(10);
                newdata += String.fromCharCode(chunk);
            }
            return newdata;
        }
        generateMessage(inUse, locationLink, data) {
            var finData = data;
            while (finData.length > (HDD_BLOCK_SIZE - 4)) {
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
            return data.substring(1, 3); // The link is the 2-4 bytes.
        }
        blockSize(data) {
            return Math.floor(data.length / (HDD_BLOCK_SIZE - 4)) + 1; // We add 1 because all data will take up at least one block. 
        }
        isTooLarge(data) {
            if (data.length > (HDD_BLOCK_SIZE - 4)) {
                return true;
            }
            return false;
        }
    }
    TSOS.DeviceDriverHardDisk = DeviceDriverHardDisk;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverHardDisk.js.map