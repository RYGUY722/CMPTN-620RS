// This file is responsible for the MemoryAccessor actor, which handles the direct editing of the memory array created and held by the Memory object.

module TSOS {

    export class MemoryAccessor {

		constructor() {}
		
        public init(): void {}
		
		public read(address): string { // This method reads a single byte from memory at the given address, returning it as a string.
			if(address<MEM_MAXIMUM_SIZE){ // First, check the given address is valid before attempting to retrieve the value.
				return _Memory.memory[address].toString();
			}
			else{ // If not valid, return a null.
				return "";
			}
		}
		
		public write(address, value): void { // This method takes an address and desired value to write a single byte to memory. 
			if(address<MEM_MAXIMUM_SIZE){ // It will only write if the given address is valid, of course.
				_Memory.memory[address] = value;
			}
		}
		
	}
}