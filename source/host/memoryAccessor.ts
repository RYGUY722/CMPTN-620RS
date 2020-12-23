// This file is responsible for the MemoryAccessor actor, which handles the direct editing of the memory array created and held by the Memory object.

module TSOS {

    export class MemoryAccessor {

		constructor() {}
		
        public init(): void {}
		
		public readDirect(address): string { // This method reads a single byte from memory at the given address, returning it as a string.
			if(address<MEM_MAXIMUM_SIZE){ // First, check the given address is valid before attempting to retrieve the value.
				return _Memory.memory[address].toString();
			}
			else{ // If not valid, return a null.
				return "";
			}
		}
		
		public writeDirect(address, value): void { // This method takes an address and desired value to write a single byte to memory. 
			if(address<MEM_MAXIMUM_SIZE){ // It will only write if the given address is valid, of course.
				_Memory.memory[address] = value;
			}
		}
		
		public read(segment, address): string {
			if(address < 0 || address >= MEM_SEGMENT_SIZE) { // If the address is negative or somehow above the segment size, it is in violation of the access policy.
				_Kernel.krnTrace("Memory Access Violation!");
				_Scheduler.endProcess(_CurrentProcess); // Only the currently running process could commit an access violation. As you said, it should be ended immediately.
				_KernelInterruptQueue.enqueue(new Interrupt(SCHEDULER_IRQ, null)); // The scheduler will now need to find another process to run.
				return "00"; // Return a dummy value, since we have to return something.
			}
			return this.readDirect(this.translateAddress(segment, address));
		}
		
		public write(segment, address, value): void {
			if(address < 0 || address >= MEM_SEGMENT_SIZE) { // If the address is negative or somehow above the segment size, it is in violation of the access policy.
				_Kernel.krnTrace("Memory Access Violation!");
				_Scheduler.endProcess(_CurrentProcess); // Only the currently running process could commit an access violation. As you said, it should be ended immediately.
				_KernelInterruptQueue.enqueue(new Interrupt(SCHEDULER_IRQ, null)); // The scheduler will now need to find another process to run.
			}
			else { this.writeDirect(this.translateAddress(segment, address), value); }
		}
		
		public translateAddress(segment, address): number {
			return (segment*MEM_SEGMENT_SIZE)+address;
		}
		
	}
}