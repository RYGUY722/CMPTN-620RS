/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverHardDisk extends DeviceDriver {

        constructor() {
            super();
            this.driverEntry = this.krnHDDDriverEntry;
        }

        public krnHDDDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }
		
		public format(mode) { // This sets up or clears the file system. If mode is set to 0, it will quick format. If mode is set to 1, it will fully format the disk, making sure to clear EVERYTHING.
			for(let x = 0; x < HDD_TRACKS; x++){
				for(let y = 0; y < HDD_SECTORS; y++){
					for(let z = 0; z < HDD_BLOCKS; z++){
						sessionStorage.setItem(x+" "+y+" "+z, "00 00 00 00");
					}
				}
			}
		}
		
		public create(filename) { // This sets up a file directory entry with the given filename.
			
		}
		
		public write(filename, contents) { // This writes the value of contents to filename.
			
		}
		
		public deleteFile(filename) { // Removes the file with the given filename from the directory. DOES NOT delete the file contents.
			
		}
		
		public list(perm){ // Lists the files in the directory. If perm is 0, lists files as normal. If perm is 1, shows hidden files as well.
			
		}
		
		public findFreeLocation(){ // Finds the next free location on the disk.
			
		}
		
		private blockSize(data) { // This method returns the size in blocks of the given data, useful to make sure the file can fit on the disk.
			return Math.floor(data.length/(HDD_BLOCK_SIZE-4))+1; // We add 1 because all data will take up at least one block. 
		}
		
		private isTooLarge(data) { // This method shortcuts size checking. Other methods in this class can call this method to quickly return a boolean representing if the data is larger than a single block.
			if(data.length>(HDD_BLOCK_SIZE-4)){
				return true;
			}
			return false;
		}
    }
}
