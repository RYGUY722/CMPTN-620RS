module TSOS {

    export class MemoryManager {

		constructor() {}
		
        public init(): void {}
		
		public load(code, segment): void {
			var startByte = this.translateAddress(segment, 0)
			for (let i = 0; i < code.length; i+=2) { // Write the user code into memory, byte by byte (yes, bytes are still 2 characters).
				_MemoryAccessor.writeDirect((startByte + i/2), (code.charAt(i)+code.charAt(i+1)));
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
					_MemoryAccessor.writeDirect(i,"00");
				}
			}
		}
		
		public translateAddress(segment, address): number {
			return (segment*MEM_SEGMENT_SIZE)+address;
		}
	}
}