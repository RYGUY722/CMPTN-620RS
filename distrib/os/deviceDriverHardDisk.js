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
                        sessionStorage.setItem(x + " " + y + " " + z, "00 00 00 00");
                    }
                }
            }
        }
        create(filename) {
        }
        write(filename, contents) {
        }
        deleteFile(filename) {
        }
        list(perm) {
        }
        findFreeLocation() {
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