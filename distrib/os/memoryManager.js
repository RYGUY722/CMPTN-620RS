var TSOS;
(function (TSOS) {
    class MemoryManager {
        constructor() { }
        init() { }
        load(code, segment) {
            var startByte = (segment * MEM_SEGMENT_SIZE);
            for (let i = 0; i < code.length; i += 2) { // Write the user code into memory, byte by byte (yes, bytes are still 2 characters).
                _MemoryAccessor.write(((segment * MEM_SEGMENT_SIZE) + i / 2), (code.charAt(i) + code.charAt(i + 1)));
            }
        }
        clear() {
            _Memory.init();
        }
        clearSeg(segment) {
            var base = (segment * MEM_SEGMENT_SIZE);
            var limit = (base + MEM_SEGMENT_SIZE);
            if (segment <= MEM_SEGMENTS) {
                for (var i = base; i <= limit; i++) {
                    _MemoryAccessor.write(i, "00");
                }
            }
        }
        read(segment, address) {
            return _MemoryAccessor.read((segment * MEM_SEGMENT_SIZE) + address);
        }
        write(segment, address, value) {
            return _MemoryAccessor.write((segment * MEM_SEGMENT_SIZE) + address, value);
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map