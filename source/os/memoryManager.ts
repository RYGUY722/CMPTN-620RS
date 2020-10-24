module TSOS {

    export class MemoryManager {

		constructor() {}
		
        public init(): void {}
		
		public load(code): void {
			for (let i = 0; i < code.length; i+=2) { // Write the user code into memory, byte by byte (yes, bytes are still 2 characters).
				_MemoryAccessor.write(i/2, (code.charAt(i)+code.charAt(i+1)));
			}
		}
		
		public clear(): void {
			_Memory.init();
		}
	}
}