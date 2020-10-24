var TSOS;
(function (TSOS) {
    class MemoryManager {
        constructor() { }
        init() { }
        load(code) {
            for (let i = 0; i < code.length; i += 2) { // Write the user code into memory, byte by byte (yes, bytes are still 2 characters).
                _MemoryAccessor.write(i / 2, (code.charAt(i) + code.charAt(i + 1)));
            }
        }
        clear() {
            _Memory.init();
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map