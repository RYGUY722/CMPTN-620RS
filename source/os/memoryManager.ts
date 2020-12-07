module TSOS {

    export class MemoryManager {

		constructor() {}
		
        public init(): void {}
		
		public load(code, segment): void {
			var startByte = this.translateAddress(segment, 0)
			for (let i = 0; i < code.length; i+=2) { // Write the user code into memory, byte by byte (yes, bytes are still 2 characters).
				_MemoryAccessor.write((startByte + i/2), (code.charAt(i)+code.charAt(i+1)));
			}
		}
		
		public clear(): void {
			_Memory.init();
		}
		
		public clearSeg(segment): void {
			var base = this.translateAddress(segment, 0);
			var limit = (base+MEM_SEGMENT_SIZE);
			if(segment<=MEM_SEGMENTS){
				for(var i = base; i <= limit; i++){
					_MemoryAccessor.write(i,"00");
				}
			}
		}
		
		public read(segment, address): string {
			if(address < 0 || address >= MEM_SEGMENT_SIZE) { // If the address is negative or somehow above the segment size, it is in violation of the access policy.
				_Kernel.krnTrace("Memory Access Violation!");
				_Scheduler.endProcess(_CurrentProcess); // Only the currently running process could commit an access violation. As you said, it should be ended immediately.
				_KernelInterruptQueue.enqueue(new Interrupt(SCHEDULER_IRQ, null)); // The scheduler will now need to find another process to run.
				return "00"; // Return a dummy value, since we have to return something.
			}
			return _MemoryAccessor.read(this.translateAddress(segment, address));
		}
		
		public write(segment, address, value): void {
			if(address < 0 || address >= MEM_SEGMENT_SIZE) { // If the address is negative or somehow above the segment size, it is in violation of the access policy.
				_Kernel.krnTrace("Memory Access Violation!");
				_Scheduler.endProcess(_CurrentProcess); // Only the currently running process could commit an access violation. As you said, it should be ended immediately.
				_KernelInterruptQueue.enqueue(new Interrupt(SCHEDULER_IRQ, null)); // The scheduler will now need to find another process to run.
			}
			else { _MemoryAccessor.write(this.translateAddress(segment, address), value); }
		}
		
		public translateAddress(segment, address): number {
			return (segment*MEM_SEGMENT_SIZE)+address;
		}
	}
}