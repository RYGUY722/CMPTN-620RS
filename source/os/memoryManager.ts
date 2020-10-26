module TSOS {

    export class MemoryManager {

		constructor() {}
		
        public init(): void {}
		
		public load(code, segment): void {
			var startByte = (segment*MEM_SEGMENT_SIZE)
			for (let i = 0; i < code.length; i+=2) { // Write the user code into memory, byte by byte (yes, bytes are still 2 characters).
				_MemoryAccessor.write(((segment*MEM_SEGMENT_SIZE) + i/2), (code.charAt(i)+code.charAt(i+1)));
			}
		}
		
		public clear(): void {
			_Memory.init();
		}
		
		public clearSeg(segment): void {
			var base = (segment*MEM_SEGMENT_SIZE);
			var limit = (base+MEM_SEGMENT_SIZE);
			if(segment<=MEM_SEGMENTS){
				for(var i = base; i <= limit; i++){
					_MemoryAccessor.write(i,"00");
				}
			}
		}
		
		public read(segment, address): string {
			return _MemoryAccessor.read((segment*MEM_SEGMENT_SIZE)+address);
		}
		
		public write(segment, address, value): void {
			return _MemoryAccessor.write((segment*MEM_SEGMENT_SIZE)+address, value);
		}
	}
}