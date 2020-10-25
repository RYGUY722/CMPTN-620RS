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
		
		public clearSeg(segment): void {
			if(segment<=MEM_SEGMENTS){
				for(var i = (segment*MEM_SEGMENT_SIZE); i < (i+MEM_SEGMENT_SIZE); i++){
					_MemoryAccessor.write(i,"00");
				}
			}
		}
		
		public read(segment, address): string {
			return _MemoryAccessor.read((segment*MEM_SEGMENT_SIZE)+address);
		}
	}
}