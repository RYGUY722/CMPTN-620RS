var TSOS;
(function (TSOS) {
    class MemoryManager {
        constructor() { }
        init() { }
        load(code, segment) {
            var startByte = this.translateAddress(segment, 0);
            for (let i = 0; i < code.length && i < (MEM_SEGMENT_SIZE * 2); i += 2) { // Write the user code into memory, byte by byte (yes, bytes are still 2 characters).
                _MemoryAccessor.writeDirect((startByte + i / 2), (code.charAt(i) + code.charAt(i + 1)));
            }
        }
        DMA(segment) {
            var startByte = this.translateAddress(segment, 0);
            var mem = "";
            for (let i = 0; i < MEM_SEGMENT_SIZE; i++) { // Dump the contents of the segment into a string
                mem += _MemoryAccessor.readDirect((startByte + i));
            }
            return mem; // Then return it.
        }
        clear() {
            _Memory.init();
        }
        clearSeg(segment) {
            var base = this.translateAddress(segment, 0);
            var limit = (base + MEM_SEGMENT_SIZE);
            if (segment <= MEM_SEGMENTS) {
                for (var i = base; i <= limit; i++) {
                    _MemoryAccessor.writeDirect(i, "00");
                }
            }
        }
        translateAddress(segment, address) {
            return (segment * MEM_SEGMENT_SIZE) + address;
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map